import mongoose from 'mongoose';
import { config } from '../config/env.js';

class DatabaseService {
  private isConnected: boolean = false;

  public async connect(): Promise<typeof mongoose> {
    if (this.isConnected && mongoose.connection.readyState === 1) {
      return mongoose;
    }

    try {
      const uri = config.mongodbUri;
      console.log(`[MongoDB] Connecting to database: ${config.mongodbDbName}...`);
      
      await mongoose.connect(uri, {
        dbName: config.mongodbDbName,
        autoIndex: true,
      });

      this.isConnected = true;
      console.log(`[MongoDB] Successfully connected to MongoDB at ${uri} [db: ${config.mongodbDbName}]`);

      mongoose.connection.on('error', (err) => {
        console.error('[MongoDB] Runtime error:', err);
      });

      mongoose.connection.on('disconnected', () => {
        console.warn('[MongoDB] Connection lost. Attempting reconnection...');
        this.isConnected = false;
      });

      return mongoose;
    } catch (err: any) {
      console.error('[MongoDB] Connection failed:', err?.message || err);
      throw err;
    }
  }

  public async disconnect(): Promise<void> {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
      this.isConnected = false;
      console.log('[MongoDB] Disconnected successfully.');
    }
  }

  public async initSchema(): Promise<void> {
    await this.connect();
    console.log('[MongoDB] Models and indexes initialized.');
  }
}

export const db = new DatabaseService();
