import mongoose, { Schema } from 'mongoose';
import crypto from 'crypto';
import { SiteVisitStatus, SiteVisitType, SiteVisitOutcome } from '../types/index.js';

export interface ISiteVisit {
  _id: string;
  id: string;
  lead_id: string;
  project_id?: string | null;
  unit_id?: string | null;
  property_id?: string | null;
  assigned_user_id: string;
  visit_date: string;
  visit_time: string;
  visit_status: SiteVisitStatus;
  visit_type: SiteVisitType;
  remarks?: string | null;
  outcome?: SiteVisitOutcome | null;
  created_by?: string | null;
  created_at: Date | string;
  updated_at: Date | string;
}

const SiteVisitSchema = new Schema<ISiteVisit>(
  {
    _id: {
      type: String,
      default: () => `sv_${crypto.randomUUID()}`,
    },
    lead_id: {
      type: String,
      ref: 'Lead',
      required: true,
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
    assigned_user_id: {
      type: String,
      ref: 'User',
      required: true,
      index: true,
    },
    visit_date: {
      type: String,
      required: true,
      index: true,
    },
    visit_time: {
      type: String,
      required: true,
    },
    visit_status: {
      type: String,
      default: 'Scheduled',
      index: true,
    },
    visit_type: {
      type: String,
      default: 'Direct Visit',
    },
    remarks: {
      type: String,
      default: null,
    },
    outcome: {
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

export const SiteVisitModel = mongoose.model<ISiteVisit>('SiteVisit', SiteVisitSchema, 'site_visits');
