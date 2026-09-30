import { Request, Response, NextFunction } from 'express';
import { config } from '../config/env.js';

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  // Log internal error safely on server side
  console.error('[API Error]', {
    message: err.message,
    statusCode: err.statusCode,
    path: req.path,
    method: req.method,
    stack: config.nodeEnv === 'development' ? err.stack : undefined,
  });

  const statusCode = err.statusCode || 500;
  
  // Clean user-safe error response (never expose raw SQL or internal node stack traces)
  let safeMessage = err.message || 'An unexpected error occurred. Please try again later.';
  if (statusCode === 500 && config.nodeEnv !== 'development') {
    safeMessage = 'A server error occurred. Our team has been notified.';
  }

  res.status(statusCode).json({
    success: false,
    error: safeMessage,
    field: err.field,
    errors: err.errors,
  });
}
