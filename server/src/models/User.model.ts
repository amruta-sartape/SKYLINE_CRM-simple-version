import mongoose, { Schema } from 'mongoose';
import crypto from 'crypto';
import { UserRole, UserStatus } from '../types/index.js';

export interface IUser {
  _id: string;
  id: string;
  name: string;
  email: string;
  phone: string;
  password_hash: string;
  status: UserStatus;
  roles: UserRole[];
  is_email_verified?: boolean;
  email_verified_at?: Date | string | null;
  last_login_at?: Date | string | null;
  created_at: Date | string;
  updated_at: Date | string;
}

const UserSchema = new Schema<IUser>(
  {
    _id: {
      type: String,
      default: () => `usr_${crypto.randomUUID()}`,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    password_hash: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(UserStatus),
      default: UserStatus.ACTIVE,
      index: true,
    },
    roles: [
      {
        type: String,
        enum: Object.values(UserRole),
        default: [UserRole.AGENT],
      },
    ],
    is_email_verified: {
      type: Boolean,
      default: false,
      index: true,
    },
    email_verified_at: {
      type: String,
      default: null,
    },
    last_login_at: {
      type: String,
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

export const UserModel = mongoose.model<IUser>('User', UserSchema, 'users');
