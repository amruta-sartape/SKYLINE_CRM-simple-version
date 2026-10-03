import mongoose, { Schema } from 'mongoose';
import crypto from 'crypto';

export interface IWishlistItem {
  _id: string;
  id: string;
  user_id: string;
  property_id: string;
  property_data: {
    id: string;
    code?: string;
    title: string;
    subtype: string;
    mainCategory?: string;
    location: string;
    city: string;
    state?: string;
    price: number;
    priceLabel: string;
    pricePerSqft?: number;
    areaLabel?: string;
    area?: number;
    availability: string;
    status?: string;
    developer?: string;
    highlights?: string[];
    coverImage: string;
    savedAt?: string;
  };
  created_at: Date | string;
  updated_at: Date | string;
}

const WishlistSchema = new Schema<IWishlistItem>(
  {
    _id: {
      type: String,
      default: () => `wsh_${crypto.randomUUID()}`,
    },
    user_id: {
      type: String,
      ref: 'User',
      required: true,
      index: true,
    },
    property_id: {
      type: String,
      required: true,
      index: true,
    },
    property_data: {
      type: Schema.Types.Mixed,
      required: true,
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

// Compound unique index to prevent duplicate entries per user & property
WishlistSchema.index({ user_id: 1, property_id: 1 }, { unique: true });

export const WishlistModel = mongoose.model<IWishlistItem>('Wishlist', WishlistSchema, 'wishlists');
