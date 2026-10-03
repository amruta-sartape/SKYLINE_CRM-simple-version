import mongoose, { Schema } from 'mongoose';
import crypto from 'crypto';
import { ProjectStatus } from '../types/index.js';

export interface IPropertyWing {
  _id: string;
  id: string;
  project_id: string;
  name: string;
  total_floors: number;
  units_per_floor: number;
  created_at: Date | string;
  updated_at: Date | string;
}

export interface IPropertyProject {
  _id: string;
  id: string;
  name: string;
  code: string;
  location: string;
  city: string;
  state: string;
  description?: string | null;
  developer: string;
  status: ProjectStatus;
  total_wings: number;
  total_units: number;
  is_active: number;
  created_by?: string | null;
  wings: IPropertyWing[];
  created_at: Date | string;
  updated_at: Date | string;
}

const WingSchema = new Schema<IPropertyWing>(
  {
    _id: {
      type: String,
      default: () => `wng_${crypto.randomUUID()}`,
    },
    project_id: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    total_floors: {
      type: Number,
      required: true,
      default: 1,
    },
    units_per_floor: {
      type: Number,
      required: true,
      default: 1,
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

const ProjectSchema = new Schema<IPropertyProject>(
  {
    _id: {
      type: String,
      default: () => `prj_${crypto.randomUUID()}`,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    location: {
      type: String,
      required: true,
      trim: true,
    },
    city: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    state: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: null,
    },
    developer: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      default: 'Upcoming',
      index: true,
    },
    total_wings: {
      type: Number,
      default: 0,
    },
    total_units: {
      type: Number,
      default: 0,
    },
    is_active: {
      type: Number,
      default: 1,
      index: true,
    },
    created_by: {
      type: String,
      ref: 'User',
      default: null,
    },
    wings: [WingSchema],
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

export const ProjectModel = mongoose.model<IPropertyProject>('PropertyProject', ProjectSchema, 'projects');
