import mongoose, { Schema } from 'mongoose';
import crypto from 'crypto';
import { ActivityType } from '../types/index.js';

export interface ILeadActivity {
  _id: string;
  id: string;
  lead_id: string;
  activity_type: ActivityType;
  title: string;
  description?: string | null;
  performed_by?: string | null;
  metadata?: string | null;
  created_at: Date | string;
}

const LeadActivitySchema = new Schema<ILeadActivity>(
  {
    _id: {
      type: String,
      default: () => `act_${crypto.randomUUID()}`,
    },
    lead_id: {
      type: String,
      ref: 'Lead',
      required: true,
      index: true,
    },
    activity_type: {
      type: String,
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: null,
    },
    performed_by: {
      type: String,
      ref: 'User',
      default: null,
    },
    metadata: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: {
      createdAt: 'created_at',
      updatedAt: false,
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

export const LeadActivityModel = mongoose.model<ILeadActivity>('LeadActivity', LeadActivitySchema, 'lead_activities');
