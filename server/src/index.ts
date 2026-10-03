import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { config } from './config/env.js';
import { db } from './db/database.js';
import { seedDatabase } from './db/seed.js';
import authRoutes from './routes/auth.routes.js';
import portalRoutes from './routes/protected-sample.routes.js';
import enquiryRoutes from './routes/enquiry.routes.js';
import leadRoutes from './routes/lead.routes.js';
import userRoutes from './routes/user.routes.js';
import { projectRoutes } from './routes/project.routes.js';
import { unitRoutes } from './routes/unit.routes.js';
import { amenityRoutes } from './routes/amenity.routes.js';
import siteVisitRoutes from './routes/siteVisit.routes.js';
import followUpRoutes from './routes/followUp.routes.js';
import propertyListingRoutes from './routes/propertyListing.routes.js';
import wishlistRoutes from './routes/wishlist.routes.js';
import { errorHandler } from './middleware/error.middleware.js';

const app = express();

// Trust proxy for accurate client IP in audit logs
app.set('trust proxy', 1);

// Middleware
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (such as mobile apps, server-to-server, or curl)
      if (!origin) return callback(null, true);

      // Allow any localhost / 127.0.0.1 port for flexible local development
      if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
        return callback(null, true);
      }

      if (config.clientUrl && (origin === config.clientUrl || origin.startsWith(config.clientUrl))) {
        return callback(null, true);
      }

      // Default allow for development
      return callback(null, true);
    },
    credentials: true,
  })
);
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

if (config.nodeEnv === 'development') {
  app.use(morgan('dev'));
}

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    app: 'SKYLINE CRM API',
    version: '1.0.0',
    phase: 'Phase 5 - Admin Property Management & Image Uploads',
    timestamp: new Date().toISOString(),
  });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/portal', portalRoutes);
app.use('/api/enquiries', enquiryRoutes);
app.use('/api/leads', leadRoutes);
app.use('/api/users', userRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/units', unitRoutes);
app.use('/api/amenities', amenityRoutes);
app.use('/api/site-visits', siteVisitRoutes);
app.use('/api/follow-ups', followUpRoutes);
app.use('/api/property-listings', propertyListingRoutes);
app.use('/api/wishlist', wishlistRoutes);


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
