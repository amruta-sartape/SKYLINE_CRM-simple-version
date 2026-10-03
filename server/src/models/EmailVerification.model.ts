import mongoose, { Schema } from 'mongoose';
import crypto from 'crypto';

export interface IEmailVerification {
  _id: string;
  id?: string;
  user_id: string;
  email: string;
  token_hash: string;
  expires_at: Date | string;
  used_at?: Date | string | null;
  created_at: Date | string;
}

const EmailVerificationSchema = new Schema<IEmailVerification>(
  {
    _id: {
      type: String,
      default: () => 'emv_' + crypto.randomUUID(),
    },
    user_id: {
      type: String,
      ref: 'User',
      required: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    token_hash: {
      type: String,
      required: true,
      index: true,
    },
    expires_at: {
      type: String,
      required: true,
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
  }
);

export const EmailVerificationModel = mongoose.model<IEmailVerification>(
  'EmailVerification',
  EmailVerificationSchema,
  'email_verifications'
);
