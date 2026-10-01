import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { db } from '../db/database.js';

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
  static async listProperties(filter: {
    search?: string;
    category?: string;
    subtype?: string;
    city?: string;
    status?: string;
    is_active?: number;
    page?: number;
    limit?: number;
  } = {}): Promise<{
    properties: PropertyListing[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const page = Math.max(1, filter.page || 1);
    const limit = Math.min(100, Math.max(1, filter.limit || 50));
    const offset = (page - 1) * limit;

    const conditions: string[] = [];
    const params: any[] = [];

    if (filter.is_active !== undefined) {
      conditions.push('p.is_active = ?');
      params.push(filter.is_active);
    } else {
      conditions.push('p.is_active = 1');
    }

    if (filter.category && filter.category !== 'All') {
      conditions.push('p.main_category = ?');
      params.push(filter.category);
    }

    if (filter.subtype) {
      conditions.push('p.subtype = ?');
      params.push(filter.subtype);
    }

    if (filter.city && filter.city !== 'All') {
      conditions.push('p.city = ?');
      params.push(filter.city);
    }

    if (filter.status) {
      conditions.push('p.status = ?');
      params.push(filter.status);
    }

    if (filter.search && filter.search.trim()) {
      const q = `%${filter.search.trim()}%`;
      conditions.push(
        '(p.title LIKE ? OR p.code LIKE ? OR p.location LIKE ? OR p.city LIKE ? OR p.developer LIKE ? OR p.subtype LIKE ?)'
      );
      params.push(q, q, q, q, q, q);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const countRow = await db.get<{ count: number }>(
      `SELECT COUNT(*) as count FROM property_listings p ${whereClause}`,
      params
    );
    const total = countRow?.count || 0;

    const rows = await db.all<any>(
      `SELECT p.* FROM property_listings p ${whereClause} ORDER BY p.created_at DESC LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    // Attach images to each property
    const properties: PropertyListing[] = [];
    for (const row of rows) {
      const images = await db.all<PropertyImageRecord>(
        `SELECT * FROM property_images WHERE property_id = ? ORDER BY is_cover DESC, display_order ASC, created_at ASC`,
        [row.id]
      );

      properties.push({
        ...row,
        highlights: row.highlights ? JSON.parse(row.highlights) : [],
        address_details: row.address_details ? JSON.parse(row.address_details) : {},
        specs_data: row.specs_data ? JSON.parse(row.specs_data) : {},
        amenity_ids: row.amenity_ids ? JSON.parse(row.amenity_ids) : [],
        images,
      });
    }

    return {
      properties,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Get single property listing by ID or Code
   */
  static async getPropertyById(idOrCode: string): Promise<PropertyListing | null> {
    const row = await db.get<any>(
      `SELECT * FROM property_listings WHERE id = ? OR code = ?`,
      [idOrCode, idOrCode]
    );

    if (!row) return null;

    const images = await db.all<PropertyImageRecord>(
      `SELECT * FROM property_images WHERE property_id = ? ORDER BY is_cover DESC, display_order ASC, created_at ASC`,
      [row.id]
    );

    return {
      ...row,
      highlights: row.highlights ? JSON.parse(row.highlights) : [],
      address_details: row.address_details ? JSON.parse(row.address_details) : {},
      specs_data: row.specs_data ? JSON.parse(row.specs_data) : {},
      amenity_ids: row.amenity_ids ? JSON.parse(row.amenity_ids) : [],
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
    // Generate unique code if not provided
    const code =
      dto.code?.trim() ||
      `SKP-${dto.subtype.slice(0, 3).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;

    // Uniqueness check for code
    const existingCode = await db.get(
      `SELECT id FROM property_listings WHERE code = ?`,
      [code]
    );
    if (existingCode) {
      throw new Error(`Property Code "${code}" is already registered. Please use a unique property code.`);
    }

    const id = `prop_admin_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    const priceLabel = dto.price_label || this.formatPrice(dto.price);
    const developer = dto.developer?.trim() || 'Skyline Realty Group';
    const state = dto.state?.trim() || 'Maharashtra';
    const availability = dto.availability || 'Available';
    const status = dto.status || 'Active';

    // Store JSON structures
    const highlightsJson = JSON.stringify(dto.highlights || []);
    const addressJson = JSON.stringify(dto.address_details || {});
    const specsJson = JSON.stringify(dto.specs_data || {});
    const amenityIdsJson = JSON.stringify(dto.amenity_ids || []);

    await db.run(
      `INSERT INTO property_listings (
        id, title, code, main_category, subtype, price, price_label, price_per_sqft,
        location, city, state, developer, availability, status, description,
        highlights, address_details, specs_data, amenity_ids, cover_image, is_active, created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?)`,
      [
        id,
        dto.title.trim(),
        code,
        dto.main_category,
        dto.subtype,
        dto.price,
        priceLabel,
        dto.price_per_sqft || null,
        dto.location.trim(),
        dto.city.trim(),
        state,
        developer,
        availability,
        status,
        dto.description?.trim() || '',
        highlightsJson,
        addressJson,
        specsJson,
        amenityIdsJson,
        dto.cover_image || null,
        userId || null,
      ]
    );

    // Record audit log
    await db.run(
      `INSERT INTO audit_logs (id, user_id, action, resource, details) VALUES (?, ?, ?, ?, ?)`,
      [
        crypto.randomUUID(),
        userId || 'SYSTEM',
        'PROPERTY_CREATED',
        `PROPERTY:${id}`,
        JSON.stringify({ title: dto.title, code, category: dto.main_category, subtype: dto.subtype }),
      ]
    );

    const created = await this.getPropertyById(id);
    return created!;
  }

  /**
   * Update property listing (Admin Only)
   */
  static async updateProperty(
    id: string,
    dto: UpdatePropertyListingDTO,
    userId?: string
  ): Promise<PropertyListing> {
    const existing = await this.getPropertyById(id);
    if (!existing) {
      throw new Error(`Property listing ${id} not found.`);
    }

    // Clean incompatible fields if category was changed
    let specsData = dto.specs_data !== undefined ? dto.specs_data : existing.specs_data;
    if (dto.main_category && dto.main_category !== existing.main_category) {
      if (dto.main_category === 'Land') {
        // Strip residential BHK/bedrooms/bathrooms
        delete specsData?.residentialSpecs;
        delete specsData?.commercialSpecs;
      } else if (dto.main_category === 'Commercial') {
        delete specsData?.residentialSpecs;
        delete specsData?.landSpecs;
      }
    }

    const title = dto.title !== undefined ? dto.title.trim() : existing.title;
    const mainCategory = dto.main_category || existing.main_category;
    const subtype = dto.subtype || existing.subtype;
    const price = dto.price !== undefined ? dto.price : existing.price;
    const priceLabel = dto.price_label || this.formatPrice(price);
    const pricePerSqft = dto.price_per_sqft !== undefined ? dto.price_per_sqft : existing.price_per_sqft;
    const location = dto.location !== undefined ? dto.location.trim() : existing.location;
    const city = dto.city !== undefined ? dto.city.trim() : existing.city;
    const state = dto.state !== undefined ? dto.state.trim() : existing.state;
    const developer = dto.developer !== undefined ? dto.developer.trim() : existing.developer;
    const availability = dto.availability || existing.availability;
    const status = dto.status || existing.status;
    const description = dto.description !== undefined ? dto.description.trim() : existing.description;
    const coverImage = dto.cover_image !== undefined ? dto.cover_image : existing.cover_image;
    const isActive = dto.is_active !== undefined ? dto.is_active : existing.is_active;

    const highlightsJson = JSON.stringify(dto.highlights !== undefined ? dto.highlights : existing.highlights || []);
    const addressJson = JSON.stringify(dto.address_details !== undefined ? dto.address_details : existing.address_details || {});
    const specsJson = JSON.stringify(specsData || {});
    const amenityIdsJson = JSON.stringify(dto.amenity_ids !== undefined ? dto.amenity_ids : existing.amenity_ids || []);

    await db.run(
      `UPDATE property_listings SET
        title = ?, main_category = ?, subtype = ?, price = ?, price_label = ?, price_per_sqft = ?,
        location = ?, city = ?, state = ?, developer = ?, availability = ?, status = ?, description = ?,
        highlights = ?, address_details = ?, specs_data = ?, amenity_ids = ?, cover_image = ?, is_active = ?,
        updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [
        title,
        mainCategory,
        subtype,
        price,
        priceLabel,
        pricePerSqft || null,
        location,
        city,
        state,
        developer,
        availability,
        status,
        description,
        highlightsJson,
        addressJson,
        specsJson,
        amenityIdsJson,
        coverImage || null,
        isActive,
        id,
      ]
    );

    // Record audit log
    await db.run(
      `INSERT INTO audit_logs (id, user_id, action, resource, details) VALUES (?, ?, ?, ?, ?)`,
      [
        crypto.randomUUID(),
        userId || 'SYSTEM',
        'PROPERTY_UPDATED',
        `PROPERTY:${id}`,
        JSON.stringify({ title, status, price }),
      ]
    );

    const updated = await this.getPropertyById(id);
    return updated!;
  }

  /**
   * Safe Archive Property Listing (Admin Only - Preserves CRM Relations)
   */
  static async archiveProperty(id: string, userId?: string): Promise<PropertyListing> {
    const existing = await this.getPropertyById(id);
    if (!existing) {
      throw new Error(`Property listing ${id} not found.`);
    }

    await db.run(
      `UPDATE property_listings SET is_active = 0, status = 'Archived', updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      [id]
    );

    await db.run(
      `INSERT INTO audit_logs (id, user_id, action, resource, details) VALUES (?, ?, ?, ?, ?)`,
      [
        crypto.randomUUID(),
        userId || 'SYSTEM',
        'PROPERTY_ARCHIVED',
        `PROPERTY:${id}`,
        JSON.stringify({ title: existing.title, code: existing.code }),
      ]
    );

    const archived = await this.getPropertyById(id);
    return archived!;
  }

  /**
   * Restore Archived Property Listing (Admin Only)
   */
  static async restoreProperty(id: string, userId?: string): Promise<PropertyListing> {
    const existing = await this.getPropertyById(id);
    if (!existing) {
      throw new Error(`Property listing ${id} not found.`);
    }

    await db.run(
      `UPDATE property_listings SET is_active = 1, status = 'Ready to Move', updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      [id]
    );

    await db.run(
      `INSERT INTO audit_logs (id, user_id, action, resource, details) VALUES (?, ?, ?, ?, ?)`,
      [
        crypto.randomUUID(),
        userId || 'SYSTEM',
        'PROPERTY_RESTORED',
        `PROPERTY:${id}`,
        JSON.stringify({ title: existing.title, code: existing.code }),
      ]
    );

    const restored = await this.getPropertyById(id);
    return restored!;
  }

  /**
   * Upload and Associate Property Images (Admin Only - Strict Property Isolation)
   */
  static async uploadPropertyImages(
    propertyId: string,
    images: UploadImageInput[],
    userId?: string
  ): Promise<PropertyImageRecord[]> {
    const property = await this.getPropertyById(propertyId);
    if (!property) {
      throw new Error(`Property ${propertyId} not found.`);
    }

    // Determine target upload directories (both client public and server fallback)
    const clientUploadDir = path.resolve(__dirname, '../../../client/public/images/uploads', propertyId);
    if (!fs.existsSync(clientUploadDir)) {
      fs.mkdirSync(clientUploadDir, { recursive: true });
    }

    const savedRecords: PropertyImageRecord[] = [];

    for (let i = 0; i < images.length; i++) {
      const img = images[i];
      if (!img.base64Data) continue;

      // Extract format and buffer
      let extension = 'jpg';
      if (img.filename.endsWith('.png') || img.contentType?.includes('png')) extension = 'png';
      else if (img.filename.endsWith('.webp') || img.contentType?.includes('webp')) extension = 'webp';

      const cleanFilename = `${img.category ? img.category.toLowerCase() : 'gallery'}_${Date.now()}_${i}.${extension}`;
      const filePath = path.join(clientUploadDir, cleanFilename);

      // Clean base64 header if present (e.g. data:image/jpeg;base64,...)
      const base64Clean = img.base64Data.replace(/^data:image\/\w+;base64,/, '');
      const fileBuffer = Buffer.from(base64Clean, 'base64');

      fs.writeFileSync(filePath, fileBuffer);

      const publicUrl = `/images/uploads/${propertyId}/${cleanFilename}`;
      const imgId = `img_${propertyId}_${Date.now()}_${i}`;
      const label = img.label || `${property.title} - ${img.category || 'View'}`;
      const category = img.category || 'Exterior';
      const isCover = img.isCover || (property.images && property.images.length === 0 && i === 0) ? 1 : 0;

      await db.run(
        `INSERT INTO property_images (id, property_id, url, label, category, alt_text, is_cover, display_order)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [imgId, propertyId, publicUrl, label, category, label, isCover, i]
      );

      // If marked as cover, update property_listings table cover_image
      if (isCover) {
        await db.run(
          `UPDATE property_images SET is_cover = 0 WHERE property_id = ? AND id != ?`,
          [propertyId, imgId]
        );
        await db.run(
          `UPDATE property_listings SET cover_image = ? WHERE id = ?`,
          [publicUrl, propertyId]
        );
      }

      savedRecords.push({
        id: imgId,
        property_id: propertyId,
        url: publicUrl,
        label,
        category,
        alt_text: label,
        is_cover: isCover,
        display_order: i,
        created_at: new Date().toISOString(),
      });
    }

    // Audit log
    await db.run(
      `INSERT INTO audit_logs (id, user_id, action, resource, details) VALUES (?, ?, ?, ?, ?)`,
      [
        crypto.randomUUID(),
        userId || 'SYSTEM',
        'PROPERTY_IMAGES_UPLOADED',
        `PROPERTY:${propertyId}`,
        JSON.stringify({ count: savedRecords.length }),
      ]
    );

    const allImages = await db.all<PropertyImageRecord>(
      `SELECT * FROM property_images WHERE property_id = ? ORDER BY is_cover DESC, display_order ASC`,
      [propertyId]
    );
    return allImages;
  }

  /**
   * Set Cover Image for a property
   */
  static async setCoverImage(
    propertyId: string,
    imageId: string,
    userId?: string
  ): Promise<PropertyListing> {
    const img = await db.get<PropertyImageRecord>(
      `SELECT * FROM property_images WHERE id = ? AND property_id = ?`,
      [imageId, propertyId]
    );
    if (!img) {
      throw new Error(`Image ${imageId} does not belong to property ${propertyId}.`);
    }

    await db.run(`UPDATE property_images SET is_cover = 0 WHERE property_id = ?`, [propertyId]);
    await db.run(`UPDATE property_images SET is_cover = 1 WHERE id = ?`, [imageId]);
    await db.run(`UPDATE property_listings SET cover_image = ? WHERE id = ?`, [img.url, propertyId]);

    const updated = await this.getPropertyById(propertyId);
    return updated!;
  }

  /**
   * Delete Property Image
   */
  static async deletePropertyImage(
    propertyId: string,
    imageId: string,
    userId?: string
  ): Promise<PropertyImageRecord[]> {
    const img = await db.get<PropertyImageRecord>(
      `SELECT * FROM property_images WHERE id = ? AND property_id = ?`,
      [imageId, propertyId]
    );
    if (!img) {
      throw new Error(`Image ${imageId} not found.`);
    }

    await db.run(`DELETE FROM property_images WHERE id = ?`, [imageId]);

    // If deleted image was cover, reassign cover to first available image
    if (img.is_cover) {
      const nextImg = await db.get<PropertyImageRecord>(
        `SELECT * FROM property_images WHERE property_id = ? ORDER BY display_order ASC LIMIT 1`,
        [propertyId]
      );
      if (nextImg) {
        await db.run(`UPDATE property_images SET is_cover = 1 WHERE id = ?`, [nextImg.id]);
        await db.run(`UPDATE property_listings SET cover_image = ? WHERE id = ?`, [nextImg.url, propertyId]);
      } else {
        await db.run(`UPDATE property_listings SET cover_image = NULL WHERE id = ?`, [propertyId]);
      }
    }

    const remaining = await db.all<PropertyImageRecord>(
      `SELECT * FROM property_images WHERE property_id = ? ORDER BY is_cover DESC, display_order ASC`,
      [propertyId]
    );
    return remaining;
  }
}
