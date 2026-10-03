import mongoose, { Schema } from 'mongoose';
import crypto from 'crypto';
import { UserRole } from '../types/index.js';

export interface IRole {
  _id: string;
  id: string;
  name: UserRole;
  description: string;
  created_at: Date | string;
}

const RoleSchema = new Schema<IRole>(
  {
    _id: {
      type: String,
      default: () => `role_${crypto.randomUUID()}`,
    },
    name: {
      type: String,
      enum: Object.values(UserRole),
      required: true,
      unique: true,
      index: true,
    },
    description: {
      type: String,
      required: true,
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

export const RoleModel = mongoose.model<IRole>('Role', RoleSchema, 'roles');
