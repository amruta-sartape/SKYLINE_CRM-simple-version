import mongoose, { Schema } from 'mongoose';
import crypto from 'crypto';

export interface IAuditLog {
  _id: string;
  id?: string;
  user_id?: string | null;
  action: string;
  resource?: string | null;
  details?: any;
  ip_address?: string | null;
  user_agent?: string | null;
  created_at: Date | string;
}

const AuditLogSchema = new Schema<IAuditLog>(
  {
    _id: {
      type: String,
      default: () => `log_${crypto.randomUUID()}`,
    },
    user_id: {
      type: String,
      ref: 'User',
      default: null,
      index: true,
    },
    action: {
      type: String,
      required: true,
    },
    details: { type: Schema.Types.Mixed, default: null },
    resource: {
      type: String,
      default: null,
    },
    ip_address: {
      type: String,
      default: null,
    },
    user_agent: {
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

export const AuditLogModel = mongoose.model<IAuditLog>('AuditLog', AuditLogSchema, 'audit_logs');
