import { logger } from '../utils/logger.js';

export interface APICallStats {
  totalCalls: number;
  spiritsFound: number;
  efficiency: number; // spirits per API call
  callsRemaining: number;
  percentageUsed: number;
  dailyLimit: number;
}

export interface APICallEntry {
  timestamp: number;
  spiritsFound: number;
  query?: string;
  success: boolean;
}

export class APICallTracker {
  private calls: APICallEntry[] = [];
  private dailyLimit: number;
  private resetTime: number; // Daily reset timestamp

  constructor(dailyLimit = 100) {
    this.dailyLimit = dailyLimit;
    this.resetTime = this.getNextResetTime();
  }

  private getNextResetTime(): number {
    // Reset at midnight UTC
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
    tomorrow.setUTCHours(0, 0, 0, 0);
    return tomorrow.getTime();
  }

  private checkDailyReset(): void {
    const now = Date.now();
    if (now >= this.resetTime) {
      this.calls = [];
      this.resetTime = this.getNextResetTime();
      logger.info('🔄 API call tracker reset for new day');
    }
  }

  recordAPICall(spiritsFound: number, query?: string, success = true): void {
    this.checkDailyReset();
    
    this.calls.push({
      timestamp: Date.now(),
      spiritsFound,
      query,
      success
    });

    const stats = this.getStats();
    logger.info(`📊 API Call ${stats.totalCalls}/${stats.dailyLimit} | Spirits: ${stats.spiritsFound} | Efficiency: ${stats.efficiency.toFixed(2)}`);
    
    // Real-time efficiency warnings
    if (stats.totalCalls >= 5 && stats.efficiency < 1.0) {
      logger.warn(`⚠️  Low API efficiency detected: ${stats.efficiency.toFixed(2)} spirits/call. Consider using --force-refresh.`);
    } else if (stats.totalCalls >= 10 && stats.efficiency < 0.5) {
      logger.warn(`🚨 Very low API efficiency: ${stats.efficiency.toFixed(2)} spirits/call. Cache may be returning stale results.`);
    }
  }

  getStats(): APICallStats {
    this.checkDailyReset();
    
    const totalCalls = this.calls.length;
    const spiritsFound = this.calls.reduce((sum, call) => sum + call.spiritsFound, 0);
    const efficiency = totalCalls > 0 ? spiritsFound / totalCalls : 0;
    const callsRemaining = Math.max(0, this.dailyLimit - totalCalls);
    const percentageUsed = (totalCalls / this.dailyLimit) * 100;

    return {
      totalCalls,
      spiritsFound,
      efficiency,
      callsRemaining,
      percentageUsed,
      dailyLimit: this.dailyLimit
    };
  }

  displayCurrentStats(): void {
    const stats = this.getStats();
    
    console.log('\n📊 API CALL EFFICIENCY');
    console.log('─'.repeat(40));
    console.log(`🔄 API Calls Used: ${stats.totalCalls}/${stats.dailyLimit} (${stats.percentageUsed.toFixed(1)}%)`);
    console.log(`🥃 Spirits Found: ${stats.spiritsFound}`);
    console.log(`⚡ Efficiency: ${stats.efficiency.toFixed(2)} spirits per API call`);
    console.log(`🎯 Target Efficiency: 2.0+ (${stats.efficiency >= 2.0 ? '✅' : '❌'})`);
    console.log(`⏰ Calls Remaining: ${stats.callsRemaining}`);
    
    if (stats.efficiency < 1.0 && stats.totalCalls > 5) {
      console.log(`⚠️  Low efficiency detected - consider using --force-refresh or adjusting queries`);
    } else if (stats.efficiency >= 2.0) {
      console.log(`🌟 Excellent efficiency! Getting maximum value from API calls`);
    }
  }

  isEfficiencyGood(): boolean {
    const stats = this.getStats();
    return stats.efficiency >= 2.0 || stats.totalCalls < 5; // Give initial calls some leeway
  }

  shouldContinue(): boolean {
    const stats = this.getStats();
    return stats.callsRemaining > 0;
  }

  getRecentCalls(count = 10): APICallEntry[] {
    this.checkDailyReset();
    return this.calls.slice(-count);
  }

  estimateSpiritsFromRemainingCalls(): number {
    const stats = this.getStats();
    if (stats.totalCalls === 0) return 0;
    
    return Math.round(stats.efficiency * stats.callsRemaining);
  }

  getEfficiencyRecommendations(): string[] {
    const stats = this.getStats();
    const recommendations: string[] = [];
    
    if (stats.totalCalls < 3) {
      return ['Gathering efficiency data... Continue scraping to get recommendations.'];
    }
    
    if (stats.efficiency < 0.5) {
      recommendations.push('🚨 Very poor efficiency. Try --force-refresh to bypass cache.');
      recommendations.push('💡 Consider using more specific search queries.');
      recommendations.push('🧹 Run --clear-cache to remove stale cached results.');
    } else if (stats.efficiency < 1.0) {
      recommendations.push('⚠️  Below target efficiency. Cache may be returning many empty results.');
      recommendations.push('💡 Try --force-refresh for fresh API calls.');
    } else if (stats.efficiency >= 2.0) {
      recommendations.push('🌟 Excellent efficiency! Your queries are well-optimized.');
      recommendations.push('✅ Continue with current strategy.');
    } else {
      recommendations.push('✅ Good efficiency. Consider optimizing queries for even better results.');
    }
    
    const recentFailures = this.calls.slice(-10).filter(c => !c.success).length;
    if (recentFailures > 3) {
      recommendations.push('❌ High failure rate detected. Check API limits and network connection.');
    }
    
    return recommendations;
  }

  getCacheAnalysis(): { cacheHitRate: number; recommendation: string } {
    const recentCalls = this.getRecentCalls(20);
    if (recentCalls.length === 0) {
      return { cacheHitRate: 0, recommendation: 'No recent API calls to analyze.' };
    }
    
    // Calculate average spirits per call for recent calls
    const avgSpiritsRecent = recentCalls.reduce((sum, call) => sum + call.spiritsFound, 0) / recentCalls.length;
    
    let recommendation = '';
    if (avgSpiritsRecent < 0.3) {
      recommendation = 'High cache hit rate with poor results. Consider --force-refresh.';
    } else if (avgSpiritsRecent > 1.5) {
      recommendation = 'Good fresh API call efficiency. Cache is working well.';
    } else {
      recommendation = 'Balanced cache/API usage. Monitor efficiency trends.';
    }
    
    return { 
      cacheHitRate: avgSpiritsRecent, 
      recommendation 
    };
  }
}

// Singleton instance
export const apiCallTracker = new APICallTracker();