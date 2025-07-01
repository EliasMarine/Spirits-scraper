/**
 * V3.1.6 Real-time Quality Monitor
 * Prevents catastrophic quality failures by monitoring scraping quality in real-time
 * Based on audit findings showing 0% acceptable data quality
 */

import { SpiritData } from '../types/index.js';
import { logger } from '../utils/logger.js';
import { comprehensiveDataQualityValidator } from './comprehensive-data-quality-rules.js';

export interface QualityMetrics {
  totalProcessed: number;
  validUrls: number;
  properCategories: number;
  averageQualityScore: number;
  validProductNames: number;
  criticalErrors: number;
  warnings: number;
  
  // Percentages
  urlSuccessRate: number;
  categorySuccessRate: number;
  nameValidityRate: number;
  overallSuccessRate: number;
}

export interface QualityAlert {
  level: 'WARNING' | 'CRITICAL' | 'EMERGENCY';
  message: string;
  metric: string;
  currentValue: number;
  threshold: number;
  timestamp: Date;
}

/**
 * Quality thresholds based on audit findings
 * These prevent the catastrophic failures we discovered
 */
const QUALITY_THRESHOLDS = {
  // CRITICAL: Must prevent 100% URL failure
  minimumUrlSuccessRate: 0.95,      // 95% must have URLs
  
  // CRITICAL: Must prevent 98.4% "Other" classification
  minimumCategorySuccessRate: 0.70,  // 70% must have proper categories
  
  // CRITICAL: Must prevent article titles as product names
  minimumNameValidityRate: 0.85,     // 85% must be valid product names
  
  // HIGH: Must maintain reasonable quality scores
  minimumAverageQualityScore: 60,    // Average score must be > 60
  
  // HIGH: Must not have too many critical errors
  maximumCriticalErrorRate: 0.10,   // < 10% can have critical errors
  
  // EMERGENCY: If quality drops below this, stop scraping immediately
  emergencyQualityThreshold: 0.30    // If < 30% overall success, emergency stop
};

export class RealTimeQualityMonitor {
  private metrics: QualityMetrics;
  private spiritBuffer: Partial<SpiritData>[] = [];
  private alerts: QualityAlert[] = [];
  private isMonitoring = false;
  
  // Buffer size for real-time analysis
  private readonly BUFFER_SIZE = 20;
  
  constructor() {
    this.metrics = this.initializeMetrics();
  }
  
  private initializeMetrics(): QualityMetrics {
    return {
      totalProcessed: 0,
      validUrls: 0,
      properCategories: 0,
      averageQualityScore: 0,
      validProductNames: 0,
      criticalErrors: 0,
      warnings: 0,
      urlSuccessRate: 0,
      categorySuccessRate: 0,
      nameValidityRate: 0,
      overallSuccessRate: 0
    };
  }
  
  /**
   * Start monitoring scraping quality
   */
  startMonitoring(): void {
    this.isMonitoring = true;
    this.metrics = this.initializeMetrics();
    this.spiritBuffer = [];
    this.alerts = [];
    
    logger.info('🔍 Real-time quality monitoring started');
    logger.info('Quality thresholds:');
    logger.info(`  - URL success rate: ≥${(QUALITY_THRESHOLDS.minimumUrlSuccessRate * 100).toFixed(0)}%`);
    logger.info(`  - Category success rate: ≥${(QUALITY_THRESHOLDS.minimumCategorySuccessRate * 100).toFixed(0)}%`);
    logger.info(`  - Name validity rate: ≥${(QUALITY_THRESHOLDS.minimumNameValidityRate * 100).toFixed(0)}%`);
    logger.info(`  - Average quality score: ≥${QUALITY_THRESHOLDS.minimumAverageQualityScore}`);
  }
  
  /**
   * Stop monitoring and return final report
   */
  stopMonitoring(): QualityMetrics {
    this.isMonitoring = false;
    logger.info('🔍 Quality monitoring stopped');
    return this.metrics;
  }
  
  /**
   * Process a spirit and update quality metrics
   */
  procesSpirit(spirit: Partial<SpiritData>): QualityAlert[] {
    if (!this.isMonitoring) {
      return [];
    }
    
    // Add to buffer
    this.spiritBuffer.push(spirit);
    
    // Keep buffer at fixed size for rolling analysis
    if (this.spiritBuffer.length > this.BUFFER_SIZE) {
      this.spiritBuffer.shift();
    }
    
    // Update metrics
    this.updateMetrics();
    
    // Check for quality issues
    const newAlerts = this.checkQualityThresholds();
    this.alerts.push(...newAlerts);
    
    return newAlerts;
  }
  
  /**
   * Update quality metrics based on current buffer
   */
  private updateMetrics(): void {
    const spirits = this.spiritBuffer;
    const total = spirits.length;
    
    if (total === 0) return;
    
    let validUrls = 0;
    let properCategories = 0;
    let validNames = 0;
    let totalQualityScore = 0;
    let criticalErrors = 0;
    let totalWarnings = 0;
    
    spirits.forEach(spirit => {
      // Validate with comprehensive validator
      const validation = comprehensiveDataQualityValidator.validate(spirit);
      
      // Count valid URLs
      if (spirit.source_url && spirit.source_url.trim() !== '') {
        validUrls++;
      }
      
      // Count proper categories (not "Other")
      if (spirit.category && spirit.category !== 'Other') {
        properCategories++;
      }
      
      // Count valid product names (no critical name errors)
      const nameErrors = validation.errors.filter(e => 
        e.field === 'name' && e.severity === 'CRITICAL'
      );
      if (nameErrors.length === 0) {
        validNames++;
      }
      
      // Sum quality scores
      totalQualityScore += validation.score;
      
      // Count critical errors
      const criticalCount = validation.errors.filter(e => e.severity === 'CRITICAL').length;
      if (criticalCount > 0) {
        criticalErrors++;
      }
      
      // Count warnings
      totalWarnings += validation.warnings.length;
    });
    
    // Update metrics
    this.metrics = {
      totalProcessed: total,
      validUrls,
      properCategories,
      averageQualityScore: totalQualityScore / total,
      validProductNames: validNames,
      criticalErrors,
      warnings: totalWarnings,
      urlSuccessRate: validUrls / total,
      categorySuccessRate: properCategories / total,
      nameValidityRate: validNames / total,
      overallSuccessRate: this.calculateOverallSuccessRate(validUrls, properCategories, validNames, total)
    };
  }
  
  /**
   * Calculate overall success rate based on multiple factors
   */
  private calculateOverallSuccessRate(validUrls: number, properCategories: number, validNames: number, total: number): number {
    if (total === 0) return 0;
    
    // Weight different factors
    const urlWeight = 0.4;      // URLs are critical
    const categoryWeight = 0.3;  // Categories are important
    const nameWeight = 0.3;     // Names are important
    
    const urlScore = validUrls / total;
    const categoryScore = properCategories / total;
    const nameScore = validNames / total;
    
    return (urlScore * urlWeight) + (categoryScore * categoryWeight) + (nameScore * nameWeight);
  }
  
  /**
   * Check if quality metrics violate thresholds
   */
  private checkQualityThresholds(): QualityAlert[] {
    const alerts: QualityAlert[] = [];
    const m = this.metrics;
    
    // CRITICAL: URL success rate
    if (m.urlSuccessRate < QUALITY_THRESHOLDS.minimumUrlSuccessRate) {
      alerts.push({
        level: 'CRITICAL',
        message: `URL success rate critically low: ${(m.urlSuccessRate * 100).toFixed(1)}%`,
        metric: 'urlSuccessRate',
        currentValue: m.urlSuccessRate,
        threshold: QUALITY_THRESHOLDS.minimumUrlSuccessRate,
        timestamp: new Date()
      });
    }
    
    // CRITICAL: Category detection
    if (m.categorySuccessRate < QUALITY_THRESHOLDS.minimumCategorySuccessRate) {
      alerts.push({
        level: 'CRITICAL',
        message: `Category detection failing: ${(m.categorySuccessRate * 100).toFixed(1)}% proper classifications`,
        metric: 'categorySuccessRate',
        currentValue: m.categorySuccessRate,
        threshold: QUALITY_THRESHOLDS.minimumCategorySuccessRate,
        timestamp: new Date()
      });
    }
    
    // CRITICAL: Product name validity
    if (m.nameValidityRate < QUALITY_THRESHOLDS.minimumNameValidityRate) {
      alerts.push({
        level: 'CRITICAL',
        message: `Product name validity low: ${(m.nameValidityRate * 100).toFixed(1)}% valid names`,
        metric: 'nameValidityRate',
        currentValue: m.nameValidityRate,
        threshold: QUALITY_THRESHOLDS.minimumNameValidityRate,
        timestamp: new Date()
      });
    }
    
    // HIGH: Average quality score
    if (m.averageQualityScore < QUALITY_THRESHOLDS.minimumAverageQualityScore) {
      alerts.push({
        level: 'WARNING',
        message: `Average quality score low: ${m.averageQualityScore.toFixed(1)}`,
        metric: 'averageQualityScore',
        currentValue: m.averageQualityScore,
        threshold: QUALITY_THRESHOLDS.minimumAverageQualityScore,
        timestamp: new Date()
      });
    }
    
    // EMERGENCY: Overall success rate
    if (m.overallSuccessRate < QUALITY_THRESHOLDS.emergencyQualityThreshold) {
      alerts.push({
        level: 'EMERGENCY',
        message: `EMERGENCY: Overall quality critically low: ${(m.overallSuccessRate * 100).toFixed(1)}% - STOP SCRAPING`,
        metric: 'overallSuccessRate',
        currentValue: m.overallSuccessRate,
        threshold: QUALITY_THRESHOLDS.emergencyQualityThreshold,
        timestamp: new Date()
      });
    }
    
    return alerts;
  }
  
  /**
   * Get current quality metrics
   */
  getCurrentMetrics(): QualityMetrics {
    return { ...this.metrics };
  }
  
  /**
   * Get all alerts generated so far
   */
  getAllAlerts(): QualityAlert[] {
    return [...this.alerts];
  }
  
  /**
   * Check if there are any critical or emergency alerts
   */
  hasCriticalAlerts(): boolean {
    return this.alerts.some(alert => alert.level === 'CRITICAL' || alert.level === 'EMERGENCY');
  }
  
  /**
   * Check if scraping should be stopped due to quality issues
   */
  shouldStopScraping(): boolean {
    return this.alerts.some(alert => alert.level === 'EMERGENCY');
  }
  
  /**
   * Generate a quality report
   */
  generateReport(): string {
    const m = this.metrics;
    const criticalAlerts = this.alerts.filter(a => a.level === 'CRITICAL' || a.level === 'EMERGENCY');
    
    let report = '\n🔍 QUALITY MONITORING REPORT\n';
    report += '================================\n';
    report += `Spirits Processed: ${m.totalProcessed}\n`;
    report += `URL Success Rate: ${(m.urlSuccessRate * 100).toFixed(1)}% (${m.validUrls}/${m.totalProcessed})\n`;
    report += `Category Success Rate: ${(m.categorySuccessRate * 100).toFixed(1)}% (${m.properCategories}/${m.totalProcessed})\n`;
    report += `Name Validity Rate: ${(m.nameValidityRate * 100).toFixed(1)}% (${m.validProductNames}/${m.totalProcessed})\n`;
    report += `Average Quality Score: ${m.averageQualityScore.toFixed(1)}/100\n`;
    report += `Overall Success Rate: ${(m.overallSuccessRate * 100).toFixed(1)}%\n`;
    report += `Critical Errors: ${m.criticalErrors}\n`;
    report += `Warnings: ${m.warnings}\n`;
    
    if (criticalAlerts.length > 0) {
      report += '\n🚨 CRITICAL ALERTS:\n';
      criticalAlerts.forEach(alert => {
        report += `  - ${alert.level}: ${alert.message}\n`;
      });
    }
    
    return report;
  }
}

// Export singleton instance
export const qualityMonitor = new RealTimeQualityMonitor();