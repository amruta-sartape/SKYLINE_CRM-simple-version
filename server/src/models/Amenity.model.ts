import mongoose, { Schema } from 'mongoose';
import crypto from 'crypto';
import { AmenityCategory } from '../types/index.js';

export interface IAmenity {
  _id: string;
  id: string;
  name: string;
  category: AmenityCategory;
  icon?: string | null;
  is_active: number;
  created_at: Date | string;
}

const AmenitySchema = new Schema<IAmenity>(
  {
    _id: {
      type: String,
      default: () => `amn_${crypto.randomUUID()}`,
    },
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      index: true,
    },
    icon: {
      type: String,
      default: null,
    },
    is_active: {
      type: Number,
      default: 1,
      index: true,
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

export const AmenityModel = mongoose.model<IAmenity>('Amenity', AmenitySchema, 'amenities');
