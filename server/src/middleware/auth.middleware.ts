import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';
import { JWTPayload, UserRole } from '../types/index.js';

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
    }
  }
}

/**
 * Middleware to authenticate requests using JWT Bearer token
 */
export function authenticateToken(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.substring(7) : null;

  if (!token) {
    res.status(401).json({
      success: false,
      error: 'Authentication token required.',
      code: 'AUTH_TOKEN_MISSING',
    });
    return;
  }

  try {
    const decoded = jwt.verify(token, config.jwtSecret) as JWTPayload;
    req.user = decoded;
    next();
  } catch (err: any) {
    if (err.name === 'TokenExpiredError') {
      res.status(401).json({
        success: false,
        error: 'Authentication session expired. Please log in again.',
        code: 'AUTH_TOKEN_EXPIRED',
      });
      return;
    }
    res.status(403).json({
      success: false,
      error: 'Invalid or corrupted authentication token.',
      code: 'AUTH_TOKEN_INVALID',
    });
    return;
  }
}

/**
 * Role authorization guard middleware.
 * Ensures the authenticated user has at least one of the specified roles.
 */
export function requireRole(...allowedRoles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required before verifying role access.',
        code: 'UNAUTHENTICATED',
      });
      return;
    }

    const hasRole = req.user.roles.some((role) => allowedRoles.includes(role));
    if (!hasRole) {
      res.status(403).json({
        success: false,
        error: `Access denied. Requires one of the following roles: [${allowedRoles.join(', ')}]`,
        code: 'FORBIDDEN_ROLE',
      });
      return;
    }

    next();
  };
}

// Aliases for alternate naming conventions
export const requireAuth = authenticateToken;
export const requireRoles = requireRole;
