import mongoose, { Schema } from 'mongoose';
import crypto from 'crypto';

export interface IPasswordReset {
  _id: string;
  id?: string;
  user_id: string;
  token?: string;
  token_hash?: string;
  expires_at: Date | string;
  used: number;
  used_at?: Date | string | null;
  created_at: Date | string;
}

const PasswordResetSchema = new Schema<IPasswordReset>(
  {
    _id: {
      type: String,
      default: () => `pwd_${crypto.randomUUID()}`,
    },
    user_id: {
      type: String,
      ref: 'User',
      required: true,
      index: true,
    },
    token: {
      type: String,
      default: null,
      index: true,
    },
    token_hash: {
      type: String,
      default: null,
      index: true,
    },
    expires_at: {
      type: String,
      required: true,
    },
    used: {
      type: Number,
      default: 0,
    },
    used_at: {
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

export const PasswordResetModel = mongoose.model<IPasswordReset>('PasswordReset', PasswordResetSchema, 'password_resets');
