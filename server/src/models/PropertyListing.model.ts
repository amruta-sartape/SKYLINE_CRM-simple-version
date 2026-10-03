import mongoose, { Schema } from 'mongoose';
import crypto from 'crypto';

export interface IPropertyImage {
  _id?: string;
  id?: string;
  url: string;
  label: string;
  category: string;
  alt_text?: string | null;
  is_cover: number;
  display_order: number;
  created_at: Date | string;
}

export interface IPropertyListing {
  _id: string;
  id: string;
  title: string;
  code: string;
  main_category: string;
  subtype: string;
  price: number;
  price_label: string;
  price_per_sqft?: number | null;
  location: string;
  city: string;
  state: string;
  developer: string;
  availability: string;
  status: string;
  description?: string | null;
  highlights: string[];
  address_details: Record<string, any>;
  specs_data: Record<string, any>;
  amenity_ids: string[];
  cover_image?: string | null;
  is_active: number;
  created_by?: string | null;
  images: IPropertyImage[];
  created_at: Date | string;
  updated_at: Date | string;
}

const PropertyImageSchema = new Schema<IPropertyImage>(
  {
    _id: {
      type: String,
      default: () => `img_${crypto.randomUUID()}`,
    },
    url: {
      type: String,
      required: true,
    },
    label: {
      type: String,
      default: 'View',
    },
    category: {
      type: String,
      default: 'Exterior',
    },
    alt_text: {
      type: String,
      default: null,
    },
    is_cover: {
      type: Number,
      default: 0,
    },
    display_order: {
      type: Number,
      default: 0,
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

const PropertyListingSchema = new Schema<IPropertyListing>(
  {
    _id: {
      type: String,
      default: () => `prop_admin_${Date.now()}_${crypto.randomUUID().slice(0, 8)}`,
    },
    title: {
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
    main_category: {
      type: String,
      required: true,
      index: true,
    },
    subtype: {
      type: String,
      required: true,
      index: true,
    },
    price: {
      type: Number,
      required: true,
      index: true,
    },
    price_label: {
      type: String,
      required: true,
    },
    price_per_sqft: {
      type: Number,
      default: null,
    },
    location: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    city: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    state: {
      type: String,
      default: 'Maharashtra',
      trim: true,
    },
    developer: {
      type: String,
      default: 'Skyline Realty Group',
      trim: true,
    },
    availability: {
      type: String,
      default: 'Available',
      index: true,
    },
    status: {
      type: String,
      default: 'Active',
      index: true,
    },
    description: {
      type: String,
      default: '',
    },
    highlights: {
      type: [String],
      default: [],
    },
    address_details: {
      type: Schema.Types.Mixed,
      default: {},
    },
    specs_data: {
      type: Schema.Types.Mixed,
      default: {},
    },
    amenity_ids: {
      type: [String],
      default: [],
    },
    cover_image: {
      type: String,
      default: null,
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
    images: [PropertyImageSchema],
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

export const PropertyListingModel = mongoose.model<IPropertyListing>('PropertyListing', PropertyListingSchema, 'property_listings');
