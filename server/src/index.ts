import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { config } from './config/env.js';
import { db } from './db/database.js';
import { seedDatabase } from './db/seed.js';
import authRoutes from './routes/auth.routes.js';
import portalRoutes from './routes/protected-sample.routes.js';
import { errorHandler } from './middleware/error.middleware.js';

const app = express();

// Trust proxy for accurate client IP in audit logs
app.set('trust proxy', 1);

// Middleware
app.use(
  cors({
    origin: [config.clientUrl, 'http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (config.nodeEnv === 'development') {
  app.use(morgan('dev'));
}

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    app: 'SKYLINE CRM API',
    version: '1.0.0',
    phase: 'Phase 1 - Foundation & Authentication',
    timestamp: new Date().toISOString(),
  });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/portal', portalRoutes);

// Catch 404
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    error: `API Route ${req.method} ${req.originalUrl} not found.`,
  });
});

// Central Error Handler
app.use(errorHandler);

// Bootstrap
async function startServer() {
  try {
    // Initialize DB schema & seed demo users
    await seedDatabase();

    app.listen(config.port, () => {
      console.log(`=========================================`);
      console.log(`  SKYLINE CRM Backend Server Running     `);
      console.log(`  Port: http://localhost:${config.port}         `);
      console.log(`  Environment: ${config.nodeEnv}             `);
      console.log(`=========================================`);
    });
  } catch (err) {
    console.error('Fatal: Failed to start SKYLINE CRM server:', err);
    process.exit(1);
  }
}

startServer();
