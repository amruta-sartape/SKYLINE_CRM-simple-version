import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { PropertyListingModel, IPropertyImage } from '../models/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface PropertyListing {
  id: string;
  title: string;
  code: string;
  main_category: string;
  subtype: string;
  price: number;
  price_label?: string;
  price_per_sqft?: number;
  location: string;
  city: string;
  state: string;
  developer: string;
  availability: string;
  status: string;
  description?: string;
  highlights?: string[];
  address_details?: Record<string, any>;
  specs_data?: Record<string, any>;
  amenity_ids?: string[];
  cover_image?: string;
  is_active: number;
  created_by?: string;
  created_at: string;
  updated_at: string;
  images?: PropertyImageRecord[];
}

export interface PropertyImageRecord {
  id: string;
  property_id: string;
  url: string;
  label: string;
  category: string;
  alt_text?: string;
  is_cover: number;
  display_order: number;
  created_at: string;
}

export interface CreatePropertyListingDTO {
  title: string;
  code?: string;
  main_category: string;
  subtype: string;
  price: number;
  price_label?: string;
  price_per_sqft?: number;
  location: string;
  city: string;
  state?: string;
  developer?: string;
  availability?: string;
  status?: string;
  description?: string;
  highlights?: string[];
  address_details?: Record<string, any>;
  specs_data?: Record<string, any>;
  amenity_ids?: string[];
  cover_image?: string;
}

export interface UpdatePropertyListingDTO {
  title?: string;
  main_category?: string;
  subtype?: string;
  price?: number;
  price_label?: string;
  price_per_sqft?: number;
  location?: string;
  city?: string;
  state?: string;
  developer?: string;
  availability?: string;
  status?: string;
  description?: string;
  highlights?: string[];
  address_details?: Record<string, any>;
  specs_data?: Record<string, any>;
  amenity_ids?: string[];
  cover_image?: string;
  is_active?: number;
}

export interface UploadImageInput {
  filename: string;
  contentType: string;
  base64Data: string;
  label?: string;
  category?: string;
  isCover?: boolean;
}

export class PropertyListingService {
  /**
   * Format numeric price to human-readable Indian currency string
   */
  private static formatPrice(val: number): string {
    if (val >= 10000000) {
      return `₹${(val / 10000000).toFixed(2)} Cr`;
    }
    if (val >= 100000) {
      return `₹${(val / 100000).toFixed(1)} L`;
    }
    return `₹${val.toLocaleString('en-IN')}`;
  }

  /**
   * List properties with multi-criteria filtering
   */
  static async listProperties(
    filter: {
      search?: string;
      category?: string;
      subtype?: string;
      city?: string;
      status?: string;
      is_active?: number;
      page?: number;
      limit?: number;
    } = {},
    user?: any
  ): Promise<{
    properties: PropertyListing[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const page = Math.max(1, filter.page || 1);
    const limit = Math.min(100, Math.max(1, filter.limit || 50));
    const skip = (page - 1) * limit;

    const query: any = {};

    if (filter.is_active !== undefined) {
      query.is_active = filter.is_active;
    } else {
      query.is_active = 1;
    }

    if (filter.category && filter.category !== 'All') {
      query.main_category = filter.category;
    }

    if (filter.subtype) {
      query.subtype = filter.subtype;
    }

    if (filter.city && filter.city !== 'All') {
      query.city = filter.city;
    }

    if (filter.status) {
      query.status = filter.status;
    }

    if (filter.search && filter.search.trim()) {
      const regex = new RegExp(filter.search.trim(), 'i');
      query.$or = [
        { title: regex },
        { code: regex },
        { location: regex },
        { city: regex },
        { developer: regex },
        { subtype: regex },
      ];
    }

    const total = await PropertyListingModel.countDocuments(query);
    const rows = await PropertyListingModel.find(query).sort({ created_at: -1 }).skip(skip).limit(limit);

    const properties: PropertyListing[] = rows.map((p) => {
      const images: PropertyImageRecord[] = (p.images || []).map((img) => ({
        id: (img._id || img.id || "") as string,
        property_id: p._id,
        url: img.url,
        label: img.label,
        category: img.category,
        alt_text: img.alt_text || undefined,
        is_cover: img.is_cover,
        display_order: img.display_order,
        created_at: typeof img.created_at === 'string' ? img.created_at : (img.created_at?.toISOString() || new Date().toISOString()),
      }));

      return {
        id: p._id,
        title: p.title,
        code: p.code,
        main_category: p.main_category,
        subtype: p.subtype,
        price: p.price,
        price_label: p.price_label || this.formatPrice(p.price),
        price_per_sqft: p.price_per_sqft || undefined,
        location: p.location,
        city: p.city,
        state: p.state,
        developer: p.developer,
        availability: p.availability,
        status: p.status,
        description: p.description || undefined,
        highlights: p.highlights || [],
        address_details: p.address_details || {},
        specs_data: p.specs_data || {},
        amenity_ids: p.amenity_ids || [],
        cover_image: p.cover_image || undefined,
        is_active: p.is_active,
        created_by: p.created_by || undefined,
        created_at: typeof p.created_at === 'string' ? p.created_at : p.created_at.toISOString(),
        updated_at: typeof p.updated_at === 'string' ? p.updated_at : p.updated_at.toISOString(),
        images,
      };
    });

    return {
      properties,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  /**
   * Get single property listing by ID or Code
   */
  static async getPropertyById(idOrCode: string): Promise<PropertyListing | null> {
    const p = await PropertyListingModel.findOne({
      $or: [{ _id: idOrCode }, { code: idOrCode }],
    });

    if (!p) return null;

    const images: PropertyImageRecord[] = (p.images || []).map((img) => ({
      id: (img._id || img.id || "") as string,
      property_id: p._id,
      url: img.url,
      label: img.label,
      category: img.category,
      alt_text: img.alt_text || undefined,
      is_cover: img.is_cover,
      display_order: img.display_order,
      created_at: typeof img.created_at === 'string' ? img.created_at : (img.created_at?.toISOString() || new Date().toISOString()),
    }));

    return {
      id: p._id,
      title: p.title,
      code: p.code,
      main_category: p.main_category,
      subtype: p.subtype,
      price: p.price,
      price_label: p.price_label || this.formatPrice(p.price),
      price_per_sqft: p.price_per_sqft || undefined,
      location: p.location,
      city: p.city,
      state: p.state,
      developer: p.developer,
      availability: p.availability,
      status: p.status,
      description: p.description || undefined,
      highlights: p.highlights || [],
      address_details: p.address_details || {},
      specs_data: p.specs_data || {},
      amenity_ids: p.amenity_ids || [],
      cover_image: p.cover_image || undefined,
      is_active: p.is_active,
      created_by: p.created_by || undefined,
      created_at: typeof p.created_at === 'string' ? p.created_at : p.created_at.toISOString(),
      updated_at: typeof p.updated_at === 'string' ? p.updated_at : p.updated_at.toISOString(),
      images,
    };
  }

  /**
   * Create a new property listing (Admin Only)
   */
  static async createProperty(
    dto: CreatePropertyListingDTO,
    userId?: string
  ): Promise<PropertyListing> {
    const code =
      dto.code?.trim() ||
      `SKP-${dto.subtype.slice(0, 3).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const existingCode = await PropertyListingModel.findOne({ code });
    if (existingCode) {
      throw new Error(`Property Code "${code}" is already registered. Please use a unique property code.`);
    }

    const id = `prop_admin_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    const priceLabel = dto.price_label || this.formatPrice(dto.price);
    const developer = dto.developer?.trim() || 'Skyline Realty Group';
    const state = dto.state?.trim() || 'Maharashtra';
    const availability = dto.availability || 'Available';
    const status = dto.status || 'Active';

    const p = await PropertyListingModel.create({
      _id: id,
      title: dto.title.trim(),
      code,
      main_category: dto.main_category,
      subtype: dto.subtype,
      price: dto.price,
      price_label: priceLabel,
      price_per_sqft: dto.price_per_sqft || null,
      location: dto.location.trim(),
      city: dto.city.trim(),
      state,
      developer,
      availability,
      status,
      description: dto.description?.trim() || '',
      highlights: dto.highlights || [],
      address_details: dto.address_details || {},
      specs_data: dto.specs_data || {},
      amenity_ids: dto.amenity_ids || [],
      cover_image: dto.cover_image || null,
      is_active: 1,
      created_by: userId || null,
      images: [],
    });

    return (await this.getPropertyById(p._id))!;
  }

  /**
   * Update existing property listing (Admin Only)
   */
  static async updateProperty(
    id: string,
    dto: UpdatePropertyListingDTO,
    userId?: string
  ): Promise<PropertyListing> {
    const p = await PropertyListingModel.findById(id);
    if (!p) throw new Error(`Property Listing with ID "${id}" not found.`);

    if (dto.title !== undefined) p.title = dto.title.trim();
    if (dto.main_category !== undefined) p.main_category = dto.main_category;
    if (dto.subtype !== undefined) p.subtype = dto.subtype;
    if (dto.price !== undefined) {
      p.price = dto.price;
      p.price_label = dto.price_label || this.formatPrice(dto.price);
    }
    if (dto.price_label !== undefined) p.price_label = dto.price_label;
    if (dto.price_per_sqft !== undefined) p.price_per_sqft = dto.price_per_sqft;
    if (dto.location !== undefined) p.location = dto.location.trim();
    if (dto.city !== undefined) p.city = dto.city.trim();
    if (dto.state !== undefined) p.state = dto.state.trim();
    if (dto.developer !== undefined) p.developer = dto.developer.trim();
    if (dto.availability !== undefined) p.availability = dto.availability;
    if (dto.status !== undefined) p.status = dto.status;
    if (dto.description !== undefined) p.description = dto.description.trim();
    if (dto.highlights !== undefined) p.highlights = dto.highlights;
    if (dto.address_details !== undefined) p.address_details = dto.address_details;
    if (dto.specs_data !== undefined) p.specs_data = dto.specs_data;
    if (dto.amenity_ids !== undefined) p.amenity_ids = dto.amenity_ids;
    if (dto.cover_image !== undefined) p.cover_image = dto.cover_image;
    if (dto.is_active !== undefined) p.is_active = dto.is_active;

    await p.save();
    return (await this.getPropertyById(id))!;
  }

  /**
   * Archive property listing
   */
  static async archiveProperty(id: string, userId?: string): Promise<PropertyListing> {
    const p = await PropertyListingModel.findById(id);
    if (!p) throw new Error(`Property Listing with ID "${id}" not found.`);

    p.is_active = 0;
    p.status = 'Archived';
    await p.save();

    return (await this.getPropertyById(id))!;
  }

  /**
   * Restore archived property listing
   */
  static async restoreProperty(id: string, userId?: string): Promise<PropertyListing> {
    const p = await PropertyListingModel.findById(id);
    if (!p) throw new Error(`Property Listing with ID "${id}" not found.`);

    p.is_active = 1;
    p.status = 'Ready to Move';
    await p.save();

    return (await this.getPropertyById(id))!;
  }

  /**
   * Multi-image upload for a property
   */
  static async uploadPropertyImages(
    propertyId: string,
    images: UploadImageInput[],
    userId?: string
  ): Promise<PropertyImageRecord[]> {
    const p = await PropertyListingModel.findById(propertyId);
    if (!p) throw new Error(`Property Listing with ID "${propertyId}" not found.`);

    const uploadDir = path.resolve(process.cwd(), '../client/public/uploads/properties', propertyId);
    const serverUploadDir = path.resolve(process.cwd(), 'public/uploads/properties', propertyId);

    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
    if (!fs.existsSync(serverUploadDir)) fs.mkdirSync(serverUploadDir, { recursive: true });

    let hasCover = p.images.some((img) => img.is_cover === 1);

    for (let i = 0; i < images.length; i++) {
      const img = images[i];
      const imageId = `img_${Date.now()}_${i}_${Math.random().toString(36).substr(2, 6)}`;
      let fileExt = '.jpg';
      if (img.contentType.includes('png')) fileExt = '.png';
      if (img.contentType.includes('webp')) fileExt = '.webp';
      if (img.contentType.includes('jpeg')) fileExt = '.jpg';

      const fileName = `${imageId}${fileExt}`;
      const clientFilePath = path.join(uploadDir, fileName);
      const serverFilePath = path.join(serverUploadDir, fileName);

      let cleanBase64 = img.base64Data;
      if (cleanBase64.includes('base64,')) {
        cleanBase64 = cleanBase64.split('base64,')[1];
      }

      const buffer = Buffer.from(cleanBase64, 'base64');
      fs.writeFileSync(clientFilePath, buffer);
      fs.writeFileSync(serverFilePath, buffer);

      const publicUrl = `/uploads/properties/${propertyId}/${fileName}`;
      const isCoverNum = img.isCover || (!hasCover && i === 0) ? 1 : 0;
      if (isCoverNum === 1) {
        hasCover = true;
        p.cover_image = publicUrl;
        p.images.forEach((im) => {
          im.is_cover = 0;
        });
      }

      p.images.push({
        _id: imageId,
        url: publicUrl,
        label: img.label || `Image ${p.images.length + 1}`,
        category: img.category || 'Exterior',
        alt_text: `${p.title} - ${img.label || 'View'}`,
        is_cover: isCoverNum,
        display_order: p.images.length,
        created_at: new Date().toISOString(),
      });
    }

    await p.save();

    return p.images.map((img) => ({
      id: (img._id || img.id || "") as string,
      property_id: p._id,
      url: img.url,
      label: img.label,
      category: img.category,
      alt_text: img.alt_text || undefined,
      is_cover: img.is_cover,
      display_order: img.display_order,
      created_at: typeof img.created_at === 'string' ? img.created_at : (img.created_at?.toISOString() || new Date().toISOString()),
    }));
  }

  /**
   * Set an existing image as the cover image
   */
  static async setCoverImage(propertyId: string, imageId: string, userId?: string): Promise<PropertyListing> {
    const p = await PropertyListingModel.findById(propertyId);
    if (!p) throw new Error(`Property Listing with ID "${propertyId}" not found.`);

    const img = p.images.find((im) => im._id === imageId);
    if (!img) throw new Error(`Image with ID "${imageId}" not found in property.`);

    p.images.forEach((im) => {
      im.is_cover = im._id === imageId ? 1 : 0;
    });
    p.cover_image = img.url;

    await p.save();
    return (await this.getPropertyById(propertyId))!;
  }

  /**
   * Delete an image from property
   */
  static async deletePropertyImage(propertyId: string, imageId: string, userId?: string): Promise<PropertyImageRecord[]> {
    return this.deleteImage(propertyId, imageId);
  }

  static async deleteImage(propertyId: string, imageId: string): Promise<PropertyImageRecord[]> {
    const p = await PropertyListingModel.findById(propertyId);
    if (!p) throw new Error(`Property Listing with ID "${propertyId}" not found.`);

    const imgIndex = p.images.findIndex((im) => im._id === imageId);
    if (imgIndex === -1) throw new Error(`Image with ID "${imageId}" not found in property.`);

    const wasCover = p.images[imgIndex].is_cover === 1;
    p.images.splice(imgIndex, 1);

    if (wasCover) {
      if (p.images.length > 0) {
        p.images[0].is_cover = 1;
        p.cover_image = p.images[0].url;
      } else {
        p.cover_image = null;
      }
    }

    await p.save();

    return p.images.map((img) => ({
      id: (img._id || img.id || "") as string,
      property_id: p._id,
      url: img.url,
      label: img.label,
      category: img.category,
      alt_text: img.alt_text || undefined,
      is_cover: img.is_cover,
      display_order: img.display_order,
      created_at: typeof img.created_at === 'string' ? img.created_at : (img.created_at?.toISOString() || new Date().toISOString()),
    }));
  }
}
