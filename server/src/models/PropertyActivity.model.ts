import mongoose, { Schema } from 'mongoose';
import crypto from 'crypto';
import { PropertyActivityType } from '../types/index.js';

export interface IPropertyActivity {
  _id: string;
  id: string;
  resource_type: 'PROJECT' | 'UNIT';
  resource_id: string;
  activity_type: PropertyActivityType;
  title: string;
  description?: string | null;
  old_value?: string | null;
  new_value?: string | null;
  performed_by?: string | null;
  created_at: Date | string;
}

const PropertyActivitySchema = new Schema<IPropertyActivity>(
  {
    _id: {
      type: String,
      default: () => `pact_${crypto.randomUUID()}`,
    },
    resource_type: {
      type: String,
      enum: ['PROJECT', 'UNIT'],
      required: true,
      index: true,
    },
    resource_id: {
      type: String,
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
    old_value: {
      type: String,
      default: null,
    },
    new_value: {
      type: String,
      default: null,
    },
    performed_by: {
      type: String,
      ref: 'User',
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

export const PropertyActivityModel = mongoose.model<IPropertyActivity>('PropertyActivity', PropertyActivitySchema, 'property_activities');
