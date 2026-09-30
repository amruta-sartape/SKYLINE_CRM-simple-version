import { Request, Response, NextFunction } from 'express';
import { z, ZodError } from 'zod';

/**
 * Validation schemas for authentication endpoints
 */
export const registerSchema = z.object({
  name: z
    .string({ required_error: 'Full name is required' })
    .min(2, 'Full name must be at least 2 characters')
    .max(100, 'Full name cannot exceed 100 characters'),
  email: z
    .string({ required_error: 'Email address is required' })
    .email('Please enter a valid email address')
    .max(255, 'Email cannot exceed 255 characters'),
  phone: z
    .string({ required_error: 'Phone number is required' })
    .min(7, 'Phone number must be at least 7 digits')
    .max(20, 'Phone number cannot exceed 20 digits'),
  password: z
    .string({ required_error: 'Password is required' })
    .min(8, 'Password must be at least 8 characters long')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
  confirmPassword: z.string({ required_error: 'Please confirm your password' }),
  termsAccepted: z
    .boolean({ required_error: 'You must accept the terms of service' })
    .refine((val) => val === true, 'You must agree to the Terms of Service and Privacy Policy'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export const loginSchema = z.object({
  email: z
    .string({ required_error: 'Email address is required' })
    .email('Please enter a valid email address'),
  password: z
    .string({ required_error: 'Password is required' })
    .min(1, 'Password is required'),
  rememberMe: z.boolean().optional(),
});

export const forgotPasswordSchema = z.object({
  email: z
    .string({ required_error: 'Email address is required' })
    .email('Please enter a valid email address'),
});

export const resetPasswordSchema = z.object({
  token: z.string({ required_error: 'Reset token is required' }).min(10, 'Invalid reset token'),
  password: z
    .string({ required_error: 'Password is required' })
    .min(8, 'Password must be at least 8 characters long')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
  confirmPassword: z.string({ required_error: 'Please confirm your new password' }),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

/**
 * Express middleware helper to validate request bodies against a Zod schema
 */
export function validateBody(schema: z.ZodSchema<any>) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      req.body = await schema.parseAsync(req.body);
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        const errors: Record<string, string> = {};
        for (const issue of err.issues) {
          const path = issue.path.join('.') || 'general';
          if (!errors[path]) {
            errors[path] = issue.message;
          }
        }
        res.status(400).json({
          success: false,
          error: 'Validation failed. Please correct the highlighted errors.',
          errors,
        });
        return;
      }
      next(err);
    }
  };
}
