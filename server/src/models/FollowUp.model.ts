import mongoose, { Schema } from 'mongoose';
import crypto from 'crypto';
import { FollowUpType, FollowUpStatus } from '../types/index.js';

export interface IFollowUp {
  _id: string;
  id: string;
  lead_id: string;
  site_visit_id?: string | null;
  assigned_user_id?: string | null;
  follow_up_type: FollowUpType;
  scheduled_date: string;
  scheduled_time?: string | null;
  remarks: string;
  status: FollowUpStatus;
  outcome?: string | null;
  next_follow_up_date?: string | null;
  created_by?: string | null;
  created_at: Date | string;
  updated_at: Date | string;
}

const FollowUpSchema = new Schema<IFollowUp>(
  {
    _id: {
      type: String,
      default: () => `fol_${crypto.randomUUID()}`,
    },
    lead_id: {
      type: String,
      ref: 'Lead',
      required: true,
      index: true,
    },
    site_visit_id: {
      type: String,
      ref: 'SiteVisit',
      default: null,
      index: true,
    },
    assigned_user_id: {
      type: String,
      ref: 'User',
      default: null,
      index: true,
    },
    follow_up_type: {
      type: String,
      required: true,
      index: true,
    },
    scheduled_date: {
      type: String,
      required: true,
      index: true,
    },
    scheduled_time: {
      type: String,
      default: null,
    },
    remarks: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      default: 'Scheduled',
      index: true,
    },
    outcome: {
      type: String,
      default: null,
    },
    next_follow_up_date: {
      type: String,
      default: null,
    },
    created_by: {
      type: String,
      ref: 'User',
      default: null,
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

export const FollowUpModel = mongoose.model<IFollowUp>('FollowUp', FollowUpSchema, 'follow_ups');
