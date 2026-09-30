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

// ============================================================================
// PHASE 2 VALIDATION SCHEMAS
// ============================================================================

export const createEnquirySchema = z.object({
  customer_name: z
    .string({ required_error: 'Customer name is required' })
    .min(2, 'Customer name must be at least 2 characters')
    .max(100, 'Customer name cannot exceed 100 characters'),
  phone: z
    .string({ required_error: 'Mobile phone number is required' })
    .min(7, 'Phone number must be at least 7 digits')
    .max(20, 'Phone number cannot exceed 20 digits'),
  email: z
    .string()
    .email('Please enter a valid email address')
    .optional()
    .or(z.literal('')),
  city: z.string().max(100).optional().or(z.literal('')),
  budget: z.coerce
    .number({ required_error: 'Budget is required' })
    .positive('Budget must be greater than 0'),
  interested_property: z
    .string({ required_error: 'Interested property is required' })
    .min(2, 'Interested property is required')
    .max(200, 'Property title cannot exceed 200 characters'),
  configuration: z.enum(['1 BHK', '2 BHK', '3 BHK', '4 BHK'], {
    required_error: 'Configuration flat type is required',
  }),
  lead_source: z.enum([
    'Website',
    'Facebook / Instagram',
    'Google Ads',
    'WhatsApp',
    'Phone Call',
    'Walk-in',
    'Referral',
    'Property Portal',
  ], {
    required_error: 'Lead source is required',
  }),
  assigned_to: z.string().optional().nullable().or(z.literal('')),
  project_id: z.string().optional().nullable().or(z.literal('')),
  unit_id: z.string().optional().nullable().or(z.literal('')),
  status: z.enum(['New Lead', 'In Progress', 'Converted', 'Dropped']).optional(),
  enquiry_date: z.string().optional(),
});

export const updateEnquirySchema = createEnquirySchema.partial();

export const convertEnquirySchema = z.object({
  preferred_location: z.string().optional().or(z.literal('')),
  loan_required: z.coerce.number().optional().default(0),
  purchase_timeline: z.enum(['Immediate', '1-3 Months', '3-6 Months', '6+ Months']).optional(),
  purpose: z.enum(['Self Use', 'Investment']).optional(),
  assigned_to: z.string().optional().nullable().or(z.literal('')),
  project_id: z.string().optional().nullable().or(z.literal('')),
  unit_id: z.string().optional().nullable().or(z.literal('')),
  priority: z.enum(['Low', 'Medium', 'High', 'Urgent']).optional().default('Medium'),
  notes: z.string().optional().or(z.literal('')),
});

export const createLeadSchema = z.object({
  customer_name: z
    .string({ required_error: 'Customer name is required' })
    .min(2, 'Customer name must be at least 2 characters'),
  phone: z
    .string({ required_error: 'Mobile phone number is required' })
    .min(7, 'Phone number must be at least 7 digits'),
  email: z
    .string()
    .email('Please enter a valid email address')
    .optional()
    .or(z.literal('')),
  city: z.string().optional().or(z.literal('')),
  budget: z.coerce
    .number({ required_error: 'Budget is required' })
    .positive('Budget must be greater than 0'),
  preferred_location: z.string().optional().or(z.literal('')),
  flat_type: z.enum(['1 BHK', '2 BHK', '3 BHK', '4 BHK'], {
    required_error: 'Flat type configuration is required',
  }),
  interested_property: z.string().optional().or(z.literal('')),
  project_id: z.string().optional().nullable().or(z.literal('')),
  unit_id: z.string().optional().nullable().or(z.literal('')),
  loan_required: z.coerce.number().optional().default(0),
  purchase_timeline: z.enum(['Immediate', '1-3 Months', '3-6 Months', '6+ Months']).optional(),
  purpose: z.enum(['Self Use', 'Investment']).optional(),
  assigned_to: z.string().optional().nullable().or(z.literal('')),
  pipeline_stage: z.enum([
    'New',
    'Contacted',
    'Follow-up',
    'Site Visit',
    'Negotiation',
    'Converted',
    'Lost',
  ]).optional().default('New'),
  qualification_status: z.enum([
    'Qualified',
    'Not Interested',
    'Future Prospect',
    'Wrong Number',
    'Duplicate',
  ]).optional().default('Future Prospect'),
  priority: z.enum(['Low', 'Medium', 'High', 'Urgent']).optional().default('Medium'),
  next_followup_date: z.string().optional().nullable().or(z.literal('')),
  notes: z.string().optional().or(z.literal('')),
});

export const updateLeadSchema = createLeadSchema.partial();

export const qualifyLeadSchema = z.object({
  qualification_status: z.enum([
    'Qualified',
    'Not Interested',
    'Future Prospect',
    'Wrong Number',
    'Duplicate',
  ], {
    required_error: 'Qualification status is required',
  }),
  budget: z.coerce.number().positive().optional(),
  loan_required: z.coerce.number().optional(),
  preferred_location: z.string().optional(),
  flat_type: z.enum(['1 BHK', '2 BHK', '3 BHK', '4 BHK']).optional(),
  purchase_timeline: z.enum(['Immediate', '1-3 Months', '3-6 Months', '6+ Months']).optional(),
  purpose: z.enum(['Self Use', 'Investment']).optional(),
  remarks: z.string().optional(),
});

export const updateLeadStageSchema = z.object({
  pipeline_stage: z.enum([
    'New',
    'Contacted',
    'Follow-up',
    'Site Visit',
    'Negotiation',
    'Converted',
    'Lost',
  ], {
    required_error: 'Target pipeline stage is required',
  }),
  remarks: z.string().optional(),
});

export const createFollowUpSchema = z.object({
  type: z.enum(['Phone Call', 'WhatsApp', 'Email', 'SMS', 'Meeting', 'Video Call'], {
    required_error: 'Follow-up type is required',
  }),
  followup_date: z.string({ required_error: 'Follow-up date is required' }).min(1),
  followup_time: z.string().optional().or(z.literal('')),
  remarks: z.string({ required_error: 'Remarks are required' }).min(2, 'Please provide follow-up remarks'),
  next_followup_date: z.string().optional().nullable().or(z.literal('')),
  executive_id: z.string().optional().nullable().or(z.literal('')),
});

// ============================================================================
// PHASE 3 PROPERTY CATALOG & INVENTORY VALIDATION SCHEMAS
// ============================================================================

export const createWingItemSchema = z.object({
  name: z.string({ required_error: 'Wing name is required' }).min(1, 'Wing name is required'),
  total_floors: z.coerce.number().int().min(1, 'Total floors must be at least 1').default(10),
  units_per_floor: z.coerce.number().int().min(1, 'Units per floor must be at least 1').default(4),
});

export const createProjectSchema = z.object({
  name: z
    .string({ required_error: 'Project name is required' })
    .min(2, 'Project name must be at least 2 characters')
    .max(150, 'Project name cannot exceed 150 characters'),
  code: z
    .string({ required_error: 'Project code is required' })
    .min(2, 'Project code must be at least 2 characters')
    .max(10, 'Project code cannot exceed 10 characters')
    .regex(/^[A-Za-z0-9_-]+$/, 'Project code must contain only alphanumeric characters, dashes, or underscores')
    .transform((val) => val.toUpperCase()),
  location: z
    .string({ required_error: 'Project location is required' })
    .min(2, 'Location must be at least 2 characters'),
  city: z
    .string({ required_error: 'City is required' })
    .min(2, 'City must be at least 2 characters'),
  state: z
    .string({ required_error: 'State is required' })
    .min(2, 'State must be at least 2 characters'),
  description: z.string().optional().or(z.literal('')),
  developer: z.string().default('Skyline Realty Group'),
  status: z.enum(['Upcoming', 'Active', 'Completed', 'On Hold']).default('Active'),
  wings: z.array(createWingItemSchema).optional(),
});

export const updateProjectSchema = z.object({
  name: z.string().min(2).max(150).optional(),
  location: z.string().min(2).optional(),
  city: z.string().min(2).optional(),
  state: z.string().min(2).optional(),
  description: z.string().optional().or(z.literal('')),
  developer: z.string().optional(),
  status: z.enum(['Upcoming', 'Active', 'Completed', 'On Hold']).optional(),
  is_active: z.coerce.number().int().min(0).max(1).optional(),
});

export const createWingSchema = z.object({
  name: z.string({ required_error: 'Wing name is required' }).min(1, 'Wing name is required'),
  total_floors: z.coerce.number().int().min(1, 'Total floors must be at least 1').default(10),
  units_per_floor: z.coerce.number().int().min(1, 'Units per floor must be at least 1').default(4),
});

export const createUnitSchema = z.object({
  project_id: z.string({ required_error: 'Project is required' }).min(1, 'Project is required'),
  wing_id: z.string({ required_error: 'Wing is required' }).min(1, 'Wing is required'),
  unit_number: z
    .string({ required_error: 'Unit number is required' })
    .min(1, 'Unit number is required')
    .max(20, 'Unit number cannot exceed 20 characters'),
  floor: z.coerce.number({ required_error: 'Floor is required' }).int(),
  configuration: z.string({ required_error: 'Flat configuration is required' }).min(1),
  carpet_area: z.coerce
    .number({ required_error: 'Carpet area is required' })
    .positive('Carpet area must be greater than 0'),
  built_up_area: z.coerce
    .number({ required_error: 'Built-up area is required' })
    .positive('Built-up area must be greater than 0'),
  price: z.coerce
    .number({ required_error: 'Price is required' })
    .positive('Price must be greater than 0'),
  parking_type: z.enum(['Included', 'Not Included']).default('Included'),
  parking_slot: z.string().optional().nullable().or(z.literal('')),
  availability_status: z.enum(['Available', 'Reserved', 'Sold']).default('Available'),
  facing: z.string().optional().nullable().or(z.literal('')),
  description: z.string().optional().nullable().or(z.literal('')),
  amenity_ids: z.array(z.string()).optional(),
}).refine((data) => data.built_up_area >= data.carpet_area, {
  message: 'Built-up area must be greater than or equal to carpet area',
  path: ['built_up_area'],
});

export const updateUnitSchema = z.object({
  unit_number: z.string().min(1).max(20).optional(),
  floor: z.coerce.number().int().optional(),
  configuration: z.string().min(1).optional(),
  carpet_area: z.coerce.number().positive().optional(),
  built_up_area: z.coerce.number().positive().optional(),
  price: z.coerce.number().positive().optional(),
  parking_type: z.enum(['Included', 'Not Included']).optional(),
  parking_slot: z.string().optional().nullable().or(z.literal('')),
  availability_status: z.enum(['Available', 'Reserved', 'Sold']).optional(),
  facing: z.string().optional().nullable().or(z.literal('')),
  description: z.string().optional().nullable().or(z.literal('')),
  amenity_ids: z.array(z.string()).optional(),
});

export const updateAvailabilitySchema = z.object({
  availability_status: z.enum(['Available', 'Reserved', 'Sold'], {
    required_error: 'New availability status is required',
  }),
  remarks: z.string().optional().or(z.literal('')),
  customer_lead_id: z.string().optional().nullable().or(z.literal('')),
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
