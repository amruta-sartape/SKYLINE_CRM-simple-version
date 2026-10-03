import mongoose, { Schema } from 'mongoose';
import crypto from 'crypto';
import { PropertyConfiguration, LeadSource, EnquiryStatus } from '../types/index.js';

export interface IEnquiry {
  _id: string;
  id: string;
  customer_name: string;
  phone: string;
  email?: string | null;
  city?: string | null;
  budget: number;
  interested_property: string;
  configuration: PropertyConfiguration;
  lead_source: LeadSource;
  assigned_to?: string | null;
  project_id?: string | null;
  unit_id?: string | null;
  property_id?: string | null;
  status: EnquiryStatus;
  enquiry_date: Date | string;
  converted_lead_id?: string | null;
  created_by?: string | null;
  created_at: Date | string;
  updated_at: Date | string;
}

const EnquirySchema = new Schema<IEnquiry>(
  {
    _id: {
      type: String,
      default: () => `enq_${crypto.randomUUID()}`,
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
    interested_property: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    configuration: {
      type: String,
      required: true,
      index: true,
    },
    lead_source: {
      type: String,
      required: true,
      index: true,
    },
    assigned_to: {
      type: String,
      ref: 'User',
      default: null,
      index: true,
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
    status: {
      type: String,
      default: 'New Lead',
      index: true,
    },
    enquiry_date: {
      type: String,
      default: () => new Date().toISOString(),
      index: true,
    },
    converted_lead_id: {
      type: String,
      ref: 'Lead',
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

export const EnquiryModel = mongoose.model<IEnquiry>('Enquiry', EnquirySchema, 'enquiries');
