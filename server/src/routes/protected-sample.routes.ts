import { Router, Request, Response } from 'express';
import { authenticateToken, requireRole } from '../middleware/auth.middleware.js';
import { UserRole } from '../types/index.js';
import { db } from '../db/database.js';

const router = Router();

// Apply authentication to all portal test endpoints
router.use(authenticateToken);

/**
 * Endpoint accessible only by ADMIN
 */
router.get('/admin-only', requireRole(UserRole.ADMIN), async (req: Request, res: Response) => {
  const usersCount = await db.get<{ count: number }>('SELECT COUNT(*) as count FROM users');
  const auditLogsCount = await db.get<{ count: number }>('SELECT COUNT(*) as count FROM audit_logs');

  res.json({
    success: true,
    message: 'Welcome Alexander Wright. You have full Administrator access to SKYLINE CRM.',
    role: UserRole.ADMIN,
    stats: {
      totalRegisteredUsers: usersCount?.count || 0,
      totalAuditLogs: auditLogsCount?.count || 0,
      systemStatus: 'Operational',
      securityLevel: 'Enterprise Max',
    },
  });
});

/**
 * Endpoint accessible by ADMIN and EMPLOYEE
 */
router.get('/employee-access', requireRole(UserRole.ADMIN, UserRole.EMPLOYEE), async (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'Authorized for Operations & Employee management workflows.',
    role: req.user?.roles,
    accessibleModules: [
      'Lead Qualification',
      'Site Visit Dispatcher',
      'Customer Support Escalations',
      'Document KYC Verification',
    ],
  });
});

/**
 * Endpoint accessible by ADMIN and AGENT
 */
router.get('/agent-access', requireRole(UserRole.ADMIN, UserRole.AGENT), async (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'Authorized for Real Estate Sales & Agent tools.',
    role: req.user?.roles,
    accessibleModules: [
      'My Active Leads',
      'Property Portfolio Catalog',
      'Site Visit Booking',
      'Commission Statements',
    ],
  });
});

/**
 * General authenticated session verification
 */
router.get('/session-check', async (req: Request, res: Response) => {
  res.json({
    success: true,
    authenticated: true,
    user: req.user,
    timestamp: new Date().toISOString(),
  });
});

export default router;
