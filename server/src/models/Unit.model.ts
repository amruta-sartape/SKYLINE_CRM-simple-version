import mongoose, { Schema } from 'mongoose';
import crypto from 'crypto';
import { UnitAvailability, ParkingType } from '../types/index.js';

export interface IPropertyUnit {
  _id: string;
  id: string;
  project_id: string;
  wing_id: string;
  unit_number: string;
  floor: number;
  configuration: string;
  carpet_area: number;
  built_up_area: number;
  price: number;
  parking_type: ParkingType;
  parking_slot?: string | null;
  availability_status: UnitAvailability;
  facing?: string | null;
  description?: string | null;
  amenity_ids: string[];
  created_by?: string | null;
  created_at: Date | string;
  updated_at: Date | string;
}

const UnitSchema = new Schema<IPropertyUnit>(
  {
    _id: {
      type: String,
      default: () => `unt_${crypto.randomUUID()}`,
    },
    project_id: {
      type: String,
      ref: 'PropertyProject',
      required: true,
      index: true,
    },
    wing_id: {
      type: String,
      required: true,
      index: true,
    },
    unit_number: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    floor: {
      type: Number,
      required: true,
      index: true,
    },
    configuration: {
      type: String,
      required: true,
      index: true,
    },
    carpet_area: {
      type: Number,
      required: true,
    },
    built_up_area: {
      type: Number,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      index: true,
    },
    parking_type: {
      type: String,
      default: 'Included',
    },
    parking_slot: {
      type: String,
      default: null,
    },
    availability_status: {
      type: String,
      default: 'Available',
      index: true,
    },
    facing: {
      type: String,
      default: null,
    },
    description: {
      type: String,
      default: null,
    },
    amenity_ids: {
      type: [String],
      default: [],
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

export const UnitModel = mongoose.model<IPropertyUnit>('PropertyUnit', UnitSchema, 'units');
