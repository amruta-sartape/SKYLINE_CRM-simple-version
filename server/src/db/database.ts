import sqlite3 from 'sqlite3';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from '../config/env.js';

// Resolve directory path in ESM/CJS compatibility
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Enable verbose mode in development
const sqlite = config.nodeEnv === 'development' ? sqlite3.verbose() : sqlite3;

class DatabaseService {
  private db: sqlite3.Database | null = null;

  public connect(): Promise<sqlite3.Database> {
    return new Promise((resolve, reject) => {
      if (this.db) {
        return resolve(this.db);
      }

      const dbDir = path.dirname(config.databasePath);
      if (!fs.existsSync(dbDir) && dbDir !== '.') {
        fs.mkdirSync(dbDir, { recursive: true });
      }

      this.db = new sqlite.Database(config.databasePath, (err) => {
        if (err) {
          console.error('[DB] Failed to connect to SQLite:', err.message);
          return reject(err);
        }
        console.log(`[DB] Connected to SQLite database at ${config.databasePath}`);
        
        // Enable foreign key support in SQLite
        this.db?.run('PRAGMA foreign_keys = ON;', (pragmaErr) => {
          if (pragmaErr) {
            console.error('[DB] Failed to enable foreign keys:', pragmaErr);
          }
          resolve(this.db!);
        });
      });
    });
  }

  public async initSchema(): Promise<void> {
    const db = await this.connect();
    
    // Check multiple potential locations for schema.sql (dist, src, root)
    const possiblePaths = [
      path.resolve(__dirname, 'schema.sql'),
      path.resolve(__dirname, '../../src/db/schema.sql'),
      path.resolve(__dirname, '../src/db/schema.sql'),
      path.resolve(process.cwd(), 'src/db/schema.sql'),
      path.resolve(process.cwd(), 'server/src/db/schema.sql'),
    ];

    let schemaPath: string | null = null;
    for (const p of possiblePaths) {
      if (fs.existsSync(p)) {
        schemaPath = p;
        break;
      }
    }
    
    if (schemaPath) {
      const sql = fs.readFileSync(schemaPath, 'utf8');
      await this.exec(sql);
      console.log(`[DB] Schema initialized successfully from ${schemaPath}`);
    } else {
      console.warn('[DB] Schema file not found in search paths:', possiblePaths);
    }
  }

  public async run(sql: string, params: any[] = []): Promise<{ lastID: number; changes: number }> {
    const db = await this.connect();
    return new Promise((resolve, reject) => {
      db.run(sql, params, function (this: sqlite3.RunResult, err: Error | null) {
        if (err) return reject(err);
        resolve({ lastID: this.lastID, changes: this.changes });
      });
    });
  }

  public async get<T = any>(sql: string, params: any[] = []): Promise<T | undefined> {
    const db = await this.connect();
    return new Promise((resolve, reject) => {
      db.get(sql, params, (err: Error | null, row: T) => {
        if (err) return reject(err);
        resolve(row);
      });
    });
  }

  public async all<T = any>(sql: string, params: any[] = []): Promise<T[]> {
    const db = await this.connect();
    return new Promise((resolve, reject) => {
      db.all(sql, params, (err: Error | null, rows: T[]) => {
        if (err) return reject(err);
        resolve(rows || []);
      });
    });
  }

  public async exec(sql: string): Promise<void> {
    const db = await this.connect();
    return new Promise((resolve, reject) => {
      db.exec(sql, (err: Error | null) => {
        if (err) return reject(err);
        resolve();
      });
    });
  }
}

export const db = new DatabaseService();
