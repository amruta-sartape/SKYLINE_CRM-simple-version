import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  jwtSecret: process.env.JWT_SECRET || 'skyline_crm_default_secure_secret_2026',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  mongodbUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/skyline_crm',
  mongodbDbName: process.env.MONGODB_DB_NAME || 'skyline_crm',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
};
