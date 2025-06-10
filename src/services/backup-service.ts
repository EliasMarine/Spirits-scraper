import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { promises as fs } from 'fs';
import path from 'path';
import { config } from '../config/index.js';
import { logger } from '../utils/logger.js';

export interface BackupMetadata {
  id: string;
  timestamp: number;
  type: 'manual' | 'pre_scrape' | 'scheduled';
  description: string;
  tables: string[];
  rowCounts: Record<string, number>;
  sizeBytes: number;
}

export interface RestoreOptions {
  backupId: string;
  tables?: string[];
  dryRun?: boolean;
  clearBefore?: boolean;
}

export interface RestoreResult {
  success: boolean;
  tablesRestored: string[];
  rowsRestored: Record<string, number>;
  errors: string[];
}

export interface BackupStats {
  totalBackups: number;
  totalSizeBytes: number;
  oldestBackup: number;
  newestBackup: number;
  byType: Record<string, number>;
}

export class BackupService {
  private client: SupabaseClient;
  private backupDir: string;
  private initialized = false;

  constructor(backupDir = './backups') {
    this.client = createClient(
      config.supabaseUrl,
      config.supabaseServiceKey,
      {
        auth: { persistSession: false },
      }
    );
    this.backupDir = backupDir;
  }

  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      await fs.mkdir(this.backupDir, { recursive: true });
      this.initialized = true;
      logger.info('Backup service initialized');
    } catch (error) {
      logger.error('Failed to initialize backup service:', error);
      throw error;
    }
  }

  private generateBackupId(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `backup_${timestamp}_${random}`;
  }

  async createBackup(type: 'manual' | 'pre_scrape' | 'scheduled' = 'manual', description: string): Promise<BackupMetadata> {
    await this.initialize();
    
    const backupId = this.generateBackupId();
    const backupPath = path.join(this.backupDir, backupId);
    await fs.mkdir(backupPath, { recursive: true });

    const tables = ['spirits', 'brands', 'categories', 'spirit_categories', 'scraping_jobs', 'user_profiles', 'usage_tracking'];
    const rowCounts: Record<string, number> = {};
    let totalSize = 0;

    logger.info(`Creating backup ${backupId}...`);

    for (const table of tables) {
      try {
        const { data, error, count } = await this.client
          .from(table)
          .select('*', { count: 'exact' });

        if (error) {
          logger.warn(`Error backing up table ${table}:`, error);
          continue;
        }

        const tableData = data || [];
        rowCounts[table] = count || tableData.length;

        const filePath = path.join(backupPath, `${table}.json`);
        const content = JSON.stringify(tableData, null, 2);
        await fs.writeFile(filePath, content);
        
        totalSize += Buffer.byteLength(content, 'utf8');
        logger.info(`Backed up ${table}: ${rowCounts[table]} rows`);
      } catch (error) {
        logger.error(`Failed to backup table ${table}:`, error);
        throw error;
      }
    }

    const metadata: BackupMetadata = {
      id: backupId,
      timestamp: Date.now(),
      type,
      description,
      tables,
      rowCounts,
      sizeBytes: totalSize
    };

    // Save metadata
    const metadataPath = path.join(backupPath, 'metadata.json');
    await fs.writeFile(metadataPath, JSON.stringify(metadata, null, 2));

    logger.info(`Backup completed: ${backupId} (${(totalSize / 1024 / 1024).toFixed(2)} MB)`);
    return metadata;
  }

  async createPreScrapeBackup(description: string): Promise<BackupMetadata> {
    return this.createBackup('pre_scrape', description);
  }

  async createQuickBackup(description: string): Promise<BackupMetadata> {
    await this.initialize();
    
    const backupId = this.generateBackupId();
    const backupPath = path.join(this.backupDir, backupId);
    await fs.mkdir(backupPath, { recursive: true });

    // Only backup spirits table for quick backups
    const tables = ['spirits'];
    const rowCounts: Record<string, number> = {};
    let totalSize = 0;

    logger.info(`Creating quick backup ${backupId}...`);

    const { data, error, count } = await this.client
      .from('spirits')
      .select('*', { count: 'exact' });

    if (error) {
      throw new Error(`Failed to backup spirits table: ${error.message}`);
    }

    const tableData = data || [];
    rowCounts['spirits'] = count || tableData.length;

    const filePath = path.join(backupPath, 'spirits.json');
    const content = JSON.stringify(tableData, null, 2);
    await fs.writeFile(filePath, content);
    totalSize += Buffer.byteLength(content, 'utf8');

    const metadata: BackupMetadata = {
      id: backupId,
      timestamp: Date.now(),
      type: 'manual',
      description: `Quick backup: ${description}`,
      tables,
      rowCounts,
      sizeBytes: totalSize
    };

    const metadataPath = path.join(backupPath, 'metadata.json');
    await fs.writeFile(metadataPath, JSON.stringify(metadata, null, 2));

    logger.info(`Quick backup completed: ${backupId}`);
    return metadata;
  }

  async listBackups(): Promise<BackupMetadata[]> {
    await this.initialize();
    
    try {
      const entries = await fs.readdir(this.backupDir);
      const backups: BackupMetadata[] = [];

      for (const entry of entries) {
        try {
          const metadataPath = path.join(this.backupDir, entry, 'metadata.json');
          const content = await fs.readFile(metadataPath, 'utf-8');
          const metadata = JSON.parse(content) as BackupMetadata;
          backups.push(metadata);
        } catch {
          // Skip invalid backup directories
        }
      }

      return backups.sort((a, b) => b.timestamp - a.timestamp);
    } catch {
      return [];
    }
  }

  async restore(options: RestoreOptions): Promise<RestoreResult> {
    await this.initialize();
    
    const { backupId, tables, dryRun = false, clearBefore = false } = options;
    const backupPath = path.join(this.backupDir, backupId);
    
    // Load metadata
    const metadataPath = path.join(backupPath, 'metadata.json');
    let metadata: BackupMetadata;
    
    try {
      const content = await fs.readFile(metadataPath, 'utf-8');
      metadata = JSON.parse(content);
    } catch {
      return {
        success: false,
        tablesRestored: [],
        rowsRestored: {},
        errors: [`Backup ${backupId} not found`]
      };
    }

    const tablesToRestore = tables || metadata.tables;
    const result: RestoreResult = {
      success: true,
      tablesRestored: [],
      rowsRestored: {},
      errors: []
    };

    if (dryRun) {
      logger.info(`DRY RUN: Would restore ${tablesToRestore.length} tables from backup ${backupId}`);
      result.tablesRestored = tablesToRestore;
      for (const table of tablesToRestore) {
        result.rowsRestored[table] = metadata.rowCounts[table] || 0;
      }
      return result;
    }

    logger.info(`Restoring from backup ${backupId}...`);

    for (const table of tablesToRestore) {
      try {
        const filePath = path.join(backupPath, `${table}.json`);
        const content = await fs.readFile(filePath, 'utf-8');
        const tableData = JSON.parse(content);

        if (clearBefore) {
          const { error: deleteError } = await this.client
            .from(table)
            .delete()
            .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all rows

          if (deleteError) {
            result.errors.push(`Failed to clear table ${table}: ${deleteError.message}`);
            continue;
          }
        }

        if (tableData.length > 0) {
          const { error: insertError } = await this.client
            .from(table)
            .insert(tableData);

          if (insertError) {
            result.errors.push(`Failed to restore table ${table}: ${insertError.message}`);
            continue;
          }
        }

        result.tablesRestored.push(table);
        result.rowsRestored[table] = tableData.length;
        logger.info(`Restored ${table}: ${tableData.length} rows`);
      } catch (error) {
        result.errors.push(`Error restoring table ${table}: ${String(error)}`);
      }
    }

    if (result.errors.length > 0) {
      result.success = false;
    }

    logger.info(`Restore completed: ${result.tablesRestored.length} tables restored`);
    return result;
  }

  async deleteBackup(backupId: string): Promise<boolean> {
    try {
      const backupPath = path.join(this.backupDir, backupId);
      await fs.rm(backupPath, { recursive: true, force: true });
      return true;
    } catch {
      return false;
    }
  }

  async getStats(): Promise<BackupStats> {
    const backups = await this.listBackups();
    
    if (backups.length === 0) {
      return {
        totalBackups: 0,
        totalSizeBytes: 0,
        oldestBackup: Date.now(),
        newestBackup: Date.now(),
        byType: {}
      };
    }

    const totalSizeBytes = backups.reduce((sum, backup) => sum + backup.sizeBytes, 0);
    const oldestBackup = Math.min(...backups.map(b => b.timestamp));
    const newestBackup = Math.max(...backups.map(b => b.timestamp));
    
    const byType: Record<string, number> = {};
    for (const backup of backups) {
      byType[backup.type] = (byType[backup.type] || 0) + 1;
    }

    return {
      totalBackups: backups.length,
      totalSizeBytes,
      oldestBackup,
      newestBackup,
      byType
    };
  }

  async cleanupOldBackups(retentionDays: number = 30): Promise<{ deleted: number; kept: number }> {
    const backups = await this.listBackups();
    const cutoffTime = Date.now() - (retentionDays * 24 * 60 * 60 * 1000);
    
    let deleted = 0;
    let kept = 0;

    for (const backup of backups) {
      if (backup.timestamp < cutoffTime && backup.type !== 'manual') {
        const success = await this.deleteBackup(backup.id);
        if (success) {
          deleted++;
          logger.info(`Deleted old backup: ${backup.id}`);
        }
      } else {
        kept++;
      }
    }

    return { deleted, kept };
  }
}

// Singleton instance
export const backupService = new BackupService();