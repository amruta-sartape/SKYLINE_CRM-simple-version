import mongoose, { Schema } from 'mongoose';
import crypto from 'crypto';
import {
  PropertyConfiguration,
  PipelineStage,
  QualificationStatus,
  LeadPriority,
  PurchaseTimeline,
  PurchasePurpose,
} from '../types/index.js';

export interface ILead {
  _id: string;
  id: string;
  enquiry_id?: string | null;
  customer_name: string;
  phone: string;
  email?: string | null;
  city?: string | null;
  budget: number;
  preferred_location?: string | null;
  flat_type: PropertyConfiguration;
  interested_property?: string | null;
  project_id?: string | null;
  unit_id?: string | null;
  property_id?: string | null;
  loan_required: number;
  purchase_timeline?: PurchaseTimeline | null;
  purpose?: PurchasePurpose | null;
  assigned_to?: string | null;
  pipeline_stage: PipelineStage;
  qualification_status: QualificationStatus;
  priority: LeadPriority;
  next_followup_date?: string | null;
  notes?: string | null;
  created_by?: string | null;
  created_at: Date | string;
  updated_at: Date | string;
}

const LeadSchema = new Schema<ILead>(
  {
    _id: {
      type: String,
      default: () => `lead_${crypto.randomUUID()}`,
    },
    enquiry_id: {
      type: String,
      ref: 'Enquiry',
      default: null,
      index: true,
    },
    customer_name: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    email: {
      type: String,
      default: null,
      trim: true,
      lowercase: true,
      index: true,
    },
    city: {
      type: String,
      default: null,
      trim: true,
      index: true,
    },
    budget: {
      type: Number,
      required: true,
      index: true,
    },
    preferred_location: {
      type: String,
      default: null,
      trim: true,
    },
    flat_type: {
      type: String,
      required: true,
      index: true,
    },
    interested_property: {
      type: String,
      default: null,
      trim: true,
    },
    project_id: {
      type: String,
      ref: 'PropertyProject',
      default: null,
      index: true,
    },
    unit_id: {
      type: String,
      ref: 'PropertyUnit',
      default: null,
    },
    property_id: {
      type: String,
      ref: 'PropertyListing',
      default: null,
      index: true,
    },
    loan_required: {
      type: Number,
      default: 0,
    },
    purchase_timeline: {
      type: String,
      default: '1-3 Months',
    },
    purpose: {
      type: String,
      default: 'Self Use',
    },
    assigned_to: {
      type: String,
      ref: 'User',
      default: null,
      index: true,
    },
    pipeline_stage: {
      type: String,
      default: 'New',
      index: true,
    },
    qualification_status: {
      type: String,
      default: 'Future Prospect',
      index: true,
    },
    priority: {
      type: String,
      default: 'Medium',
      index: true,
    },
    next_followup_date: {
      type: String,
      default: null,
      index: true,
    },
    notes: {
      type: String,
      default: null,
    },
    created_by: {
      type: String,
      ref: 'User',
      default: null,
      index: true,
    },
  },
  {
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
    toJSON: {
      virtuals: true,
      transform: (_, ret: any) => {
        ret.id = ret._id;
        delete ret.__v;
        return ret;
      },
    },
    toObject: {
      virtuals: true,
      transform: (_, ret: any) => {
        ret.id = ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

export const LeadModel = mongoose.model<ILead>('Lead', LeadSchema, 'leads');
