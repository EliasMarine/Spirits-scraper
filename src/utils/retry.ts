import { config } from '../config/index.js';
import { logger } from './logger.js';

export interface RetryOptions {
  maxAttempts?: number;
  delayMs?: number;
  backoffMultiplier?: number;
  maxDelayMs?: number;
  shouldRetry?: (error: any) => boolean;
  onRetry?: (error: any, attempt: number) => void;
}

const defaultOptions: Required<RetryOptions> = {
  maxAttempts: config.retryAttempts,
  delayMs: config.retryDelayMs,
  backoffMultiplier: 2,
  maxDelayMs: 30000,
  shouldRetry: (error) => {
    // Retry on network errors and rate limits
    if (error.code === 'ECONNRESET' || error.code === 'ETIMEDOUT') {
      return true;
    }
    if (error.response?.status === 429 || error.response?.status === 503) {
      return true;
    }
    // Don't retry on client errors (except rate limit)
    if (error.response?.status >= 400 && error.response?.status < 500) {
      return false;
    }
    return true;
  },
  onRetry: (error, attempt) => {
    logger.warn(`Retry attempt ${attempt}`, {
      error: error.message || String(error),
      code: error.code,
      status: error.response?.status,
    });
  },
};

/**
 * Retry a function with exponential backoff
 */
export async function retry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {},
): Promise<T> {
  const opts = { ...defaultOptions, ...options };
  let lastError: any;
  let delay = opts.delayMs;

  for (let attempt = 1; attempt <= opts.maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      // Check if we should retry
      if (!opts.shouldRetry(error)) {
        throw error;
      }

      // Check if we've exhausted attempts
      if (attempt === opts.maxAttempts) {
        break;
      }

      // Call retry callback
      opts.onRetry(error, attempt);

      // Wait before retrying
      await sleep(delay);

      // Calculate next delay with exponential backoff
      delay = Math.min(delay * opts.backoffMultiplier, opts.maxDelayMs);
    }
  }

  // All attempts failed
  const retryError = new Error(
    `Failed after ${opts.maxAttempts} attempts: ${lastError?.message || String(lastError)}`,
  );
  (retryError as any).originalError = lastError;
  (retryError as any).attempts = opts.maxAttempts;
  throw retryError;
}

/**
 * Retry with custom delay based on rate limit headers
 */
export async function retryWithRateLimit<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {},
): Promise<T> {
  return retry(fn, {
    ...options,
    onRetry: (error, attempt) => {
      // Check for rate limit headers
      if (error.response?.headers) {
        const retryAfter = error.response.headers['retry-after'];
        const rateLimitReset = error.response.headers['x-ratelimit-reset'];

        if (retryAfter) {
          const delaySeconds = parseInt(retryAfter, 10);
          if (!isNaN(delaySeconds)) {
            logger.info(`Rate limit: waiting ${delaySeconds} seconds as requested`);
            return sleep(delaySeconds * 1000);
          }
        }

        if (rateLimitReset) {
          const resetTime = parseInt(rateLimitReset, 10) * 1000;
          const now = Date.now();
          const delayMs = Math.max(0, resetTime - now + 1000); // Add 1s buffer
          logger.info(`Rate limit: waiting until reset time (${delayMs}ms)`);
          return sleep(delayMs);
        }
      }

      // Default retry behavior
      options.onRetry?.(error, attempt) || defaultOptions.onRetry(error, attempt);
    },
  });
}

/**
 * Create a retry wrapper for a class method
 */
export function retryable(options: RetryOptions = {}) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      return retry(() => originalMethod.apply(this, args), options);
    };

    return descriptor;
  };
}

/**
 * Sleep for a given number of milliseconds
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Retry with circuit breaker pattern
 */
export class CircuitBreaker {
  private failures = 0;
  private lastFailureTime = 0;
  private state: 'closed' | 'open' | 'half-open' = 'closed';

  constructor(
    private readonly threshold: number = 5,
    private readonly timeout: number = 60000, // 1 minute
    private readonly resetTimeout: number = 30000, // 30 seconds
  ) {}

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    // Check if circuit is open
    if (this.state === 'open') {
      const timeSinceLastFailure = Date.now() - this.lastFailureTime;

      if (timeSinceLastFailure < this.timeout) {
        throw new Error('Circuit breaker is open - service unavailable');
      }

      // Try half-open state
      this.state = 'half-open';
    }

    try {
      const result = await fn();

      // Success - reset circuit
      if (this.state === 'half-open') {
        this.reset();
      }

      return result;
    } catch (error) {
      this.recordFailure();
      throw error;
    }
  }

  private recordFailure(): void {
    this.failures++;
    this.lastFailureTime = Date.now();

    if (this.failures >= this.threshold) {
      this.state = 'open';
      logger.error('Circuit breaker opened due to excessive failures', {
        failures: this.failures,
        threshold: this.threshold,
      });

      // Schedule reset
      setTimeout(() => {
        if (this.state === 'open') {
          this.state = 'half-open';
          logger.info('Circuit breaker entering half-open state');
        }
      }, this.resetTimeout);
    }
  }

  private reset(): void {
    this.failures = 0;
    this.state = 'closed';
    logger.info('Circuit breaker reset to closed state');
  }

  getState(): string {
    return this.state;
  }
}