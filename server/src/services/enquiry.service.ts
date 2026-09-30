import crypto from 'crypto';
import { db } from '../db/database.js';
import {
  Enquiry,
  UserRole,
  JWTPayload,
  PropertyConfiguration,
  LeadSource,
  EnquiryStatus,
  Lead,
  LeadPriority,
} from '../types/index.js';

export interface EnquiryFilters {
  search?: string;
  source?: LeadSource;
  configuration?: PropertyConfiguration;
  status?: EnquiryStatus;
  assigned_to?: string;
  city?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export class EnquiryService {
  /**
   * Fetch paginated & filtered list of enquiries with RBAC enforcement
   */
  public static async getEnquiries(
    filters: EnquiryFilters,
    user: JWTPayload
  ): Promise<{ enquiries: Enquiry[]; total: number; page: number; limit: number }> {
    const page = Math.max(1, filters.page || 1);
    const limit = Math.max(1, Math.min(100, filters.limit || 20));
    const offset = (page - 1) * limit;

    const conditions: string[] = [];
    const params: any[] = [];

    // RBAC check:
    // ADMIN can view all enquiries
    // EMPLOYEE can view all enquiries (or unassigned/assigned)
    // AGENT can only view enquiries assigned to them
    const isAdmin = user.roles.includes(UserRole.ADMIN);
    const isEmployee = user.roles.includes(UserRole.EMPLOYEE);

    if (!isAdmin && !isEmployee) {
      // Agent role
      conditions.push('e.assigned_to = ?');
      params.push(user.userId);
    }

    // Search filter across name, phone, email, property, city
    if (filters.search && filters.search.trim()) {
      const term = `%${filters.search.trim()}%`;
      conditions.push(
        '(e.customer_name LIKE ? OR e.phone LIKE ? OR e.email LIKE ? OR e.interested_property LIKE ? OR e.city LIKE ?)'
      );
      params.push(term, term, term, term, term);
    }

    if (filters.source) {
      conditions.push('e.lead_source = ?');
      params.push(filters.source);
    }

    if (filters.configuration) {
      conditions.push('e.configuration = ?');
      params.push(filters.configuration);
    }

    if (filters.status) {
      conditions.push('e.status = ?');
      params.push(filters.status);
    }

    if (filters.assigned_to) {
      conditions.push('e.assigned_to = ?');
      params.push(filters.assigned_to);
    }

    if (filters.city) {
      conditions.push('e.city = ?');
      params.push(filters.city);
    }

    if (filters.startDate) {
      conditions.push('e.enquiry_date >= ?');
      params.push(filters.startDate);
    }

    if (filters.endDate) {
      conditions.push('e.enquiry_date <= ?');
      params.push(filters.endDate);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Count total
    const countSql = `SELECT COUNT(*) as total FROM enquiries e ${whereClause}`;
    const countResult = await db.get<{ total: number }>(countSql, params);
    const total = countResult?.total || 0;

    // Sorting
    const allowedSortFields: Record<string, string> = {
      customer_name: 'e.customer_name',
      enquiry_date: 'e.enquiry_date',
      budget: 'e.budget',
      status: 'e.status',
      created_at: 'e.created_at',
    };
    const sortField = allowedSortFields[filters.sortBy || 'enquiry_date'] || 'e.enquiry_date';
    const sortOrder = filters.sortOrder === 'ASC' ? 'ASC' : 'DESC';

    // Select enquiries with assigned user and property joins
    const selectSql = `
      SELECT 
        e.*,
        u.name as assigned_name,
        u.email as assigned_email,
        cb.name as created_by_name,
        p.name as project_name,
        un.unit_number as unit_number
      FROM enquiries e
      LEFT JOIN users u ON e.assigned_to = u.id
      LEFT JOIN users cb ON e.created_by = cb.id
      LEFT JOIN property_projects p ON e.project_id = p.id
      LEFT JOIN property_units un ON e.unit_id = un.id
      ${whereClause}
      ORDER BY ${sortField} ${sortOrder}
      LIMIT ? OFFSET ?
    `;

    const queryParams = [...params, limit, offset];
    const enquiries = await db.all<Enquiry>(selectSql, queryParams);

    return {
      enquiries,
      total,
      page,
      limit,
    };
  }

  /**
   * Fetch single enquiry by ID with RBAC check
   */
  public static async getEnquiryById(id: string, user: JWTPayload): Promise<Enquiry | null> {
    const sql = `
      SELECT 
        e.*,
        u.name as assigned_name,
        u.email as assigned_email,
        cb.name as created_by_name,
        p.name as project_name,
        un.unit_number as unit_number
      FROM enquiries e
      LEFT JOIN users u ON e.assigned_to = u.id
      LEFT JOIN users cb ON e.created_by = cb.id
      LEFT JOIN property_projects p ON e.project_id = p.id
      LEFT JOIN property_units un ON e.unit_id = un.id
      WHERE e.id = ?
    `;

    const enquiry = await db.get<Enquiry>(sql, [id]);
    if (!enquiry) return null;

    // RBAC verify: If agent, must be assigned to them
    const isAdmin = user.roles.includes(UserRole.ADMIN);
    const isEmployee = user.roles.includes(UserRole.EMPLOYEE);
    if (!isAdmin && !isEmployee && enquiry.assigned_to !== user.userId) {
      const error: any = new Error('Access denied. You do not have permission to view this enquiry.');
      error.statusCode = 403;
      throw error;
    }

    return enquiry;
  }

  /**
   * Create new Client Enquiry
   */
  public static async createEnquiry(
    data: {
      customer_name: string;
      phone: string;
      email?: string | null;
      city?: string | null;
      budget: number;
      interested_property: string;
      configuration: PropertyConfiguration;
      lead_source: LeadSource;
      assigned_to?: string | null;
      project_id?: string | null;
      unit_id?: string | null;
      status?: EnquiryStatus;
      enquiry_date?: string;
    },
    user: JWTPayload
  ): Promise<Enquiry> {
    const id = `enq_${crypto.randomUUID()}`;
    const now = new Date().toISOString();
    const enquiryDate = data.enquiry_date || now;
    const status = data.status || 'New Lead';

    await db.run(
      `INSERT INTO enquiries (
        id, customer_name, phone, email, city, budget, interested_property,
        configuration, lead_source, assigned_to, project_id, unit_id, status, enquiry_date, created_by, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        data.customer_name.trim(),
        data.phone.trim(),
        data.email?.trim() || null,
        data.city?.trim() || null,
        data.budget,
        data.interested_property.trim(),
        data.configuration,
        data.lead_source,
        data.assigned_to || null,
        data.project_id || null,
        data.unit_id || null,
        status,
        enquiryDate,
        user.userId,
        now,
        now,
      ]
    );

    // Audit log
    await db.run(
      `INSERT INTO audit_logs (id, user_id, action, resource, details)
       VALUES (?, ?, ?, ?, ?)`,
      [
        `log_${crypto.randomUUID()}`,
        user.userId,
        'ENQUIRY_CREATED',
        'enquiries',
        JSON.stringify({ enquiryId: id, customerName: data.customer_name }),
      ]
    );

    const created = await this.getEnquiryById(id, user);
    return created!;
  }

  /**
   * Update existing enquiry
   */
  public static async updateEnquiry(
    id: string,
    data: Partial<Enquiry>,
    user: JWTPayload
  ): Promise<Enquiry> {
    const existing = await this.getEnquiryById(id, user);
    if (!existing) {
      const error: any = new Error('Enquiry not found.');
      error.statusCode = 404;
      throw error;
    }

    const updates: string[] = [];
    const params: any[] = [];

    if (data.customer_name !== undefined) {
      updates.push('customer_name = ?');
      params.push(data.customer_name.trim());
    }
    if (data.phone !== undefined) {
      updates.push('phone = ?');
      params.push(data.phone.trim());
    }
    if (data.email !== undefined) {
      updates.push('email = ?');
      params.push(data.email?.trim() || null);
    }
    if (data.city !== undefined) {
      updates.push('city = ?');
      params.push(data.city?.trim() || null);
    }
    if (data.budget !== undefined) {
      updates.push('budget = ?');
      params.push(data.budget);
    }
    if (data.interested_property !== undefined) {
      updates.push('interested_property = ?');
      params.push(data.interested_property.trim());
    }
    if (data.configuration !== undefined) {
      updates.push('configuration = ?');
      params.push(data.configuration);
    }
    if (data.lead_source !== undefined) {
      updates.push('lead_source = ?');
      params.push(data.lead_source);
    }
    if (data.assigned_to !== undefined) {
      updates.push('assigned_to = ?');
      params.push(data.assigned_to || null);
    }
    if (data.project_id !== undefined) {
      updates.push('project_id = ?');
      params.push(data.project_id || null);
    }
    if (data.unit_id !== undefined) {
      updates.push('unit_id = ?');
      params.push(data.unit_id || null);
    }
    if (data.status !== undefined) {
      updates.push('status = ?');
      params.push(data.status);
    }
    if (data.enquiry_date !== undefined) {
      updates.push('enquiry_date = ?');
      params.push(data.enquiry_date);
    }

    if (updates.length === 0) {
      return existing;
    }

    const now = new Date().toISOString();
    updates.push('updated_at = ?');
    params.push(now);

    params.push(id);

    await db.run(`UPDATE enquiries SET ${updates.join(', ')} WHERE id = ?`, params);

    const updated = await this.getEnquiryById(id, user);
    return updated!;
  }

  /**
   * Convert Enquiry into a CRM Lead
   */
  public static async convertToLead(
    enquiryId: string,
    conversionData: {
      preferred_location?: string;
      loan_required?: number;
      purchase_timeline?: any;
      purpose?: any;
      assigned_to?: string;
      project_id?: string;
      unit_id?: string;
      priority?: LeadPriority;
      notes?: string;
    },
    user: JWTPayload
  ): Promise<{ lead: Lead; enquiry: Enquiry }> {
    const enquiry = await this.getEnquiryById(enquiryId, user);
    if (!enquiry) {
      const error: any = new Error('Enquiry not found.');
      error.statusCode = 404;
      throw error;
    }

    // Prevent duplicate conversion
    if (enquiry.status === 'Converted' || enquiry.converted_lead_id) {
      const error: any = new Error('This enquiry has already been converted to a Lead.');
      error.statusCode = 400;
      throw error;
    }

    const leadId = `lead_${crypto.randomUUID()}`;
    const now = new Date().toISOString();
    const assignedTo = conversionData.assigned_to || enquiry.assigned_to || user.userId;
    const projectId = conversionData.project_id || enquiry.project_id || null;
    const unitId = conversionData.unit_id || enquiry.unit_id || null;

    // Insert into leads table
    await db.run(
      `INSERT INTO leads (
        id, enquiry_id, customer_name, phone, email, city, budget,
        preferred_location, flat_type, interested_property, project_id, unit_id, loan_required,
        purchase_timeline, purpose, assigned_to, pipeline_stage,
        qualification_status, priority, notes, created_by, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        leadId,
        enquiry.id,
        enquiry.customer_name,
        enquiry.phone,
        enquiry.email,
        enquiry.city,
        enquiry.budget,
        conversionData.preferred_location || enquiry.city || null,
        enquiry.configuration,
        enquiry.interested_property,
        projectId,
        unitId,
        conversionData.loan_required || 0,
        conversionData.purchase_timeline || '1-3 Months',
        conversionData.purpose || 'Self Use',
        assignedTo,
        'New',
        'Qualified',
        conversionData.priority || 'Medium',
        conversionData.notes || `Converted from enquiry #${enquiry.id} (${enquiry.lead_source})`,
        user.userId,
        now,
        now,
      ]
    );

    // Update enquiry record status and link converted lead
    await db.run(
      `UPDATE enquiries SET status = 'Converted', converted_lead_id = ?, updated_at = ? WHERE id = ?`,
      [leadId, now, enquiry.id]
    );

    // Record lead creation & enquiry conversion activity
    await db.run(
      `INSERT INTO lead_activities (id, lead_id, activity_type, title, description, performed_by, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        `act_${crypto.randomUUID()}`,
        leadId,
        'ENQUIRY_CONVERTED',
        'Enquiry Converted to Lead',
        `Successfully converted from Client Enquiry (${enquiry.lead_source}) for ${enquiry.interested_property}.`,
        user.userId,
        now,
      ]
    );

    // Audit log
    await db.run(
      `INSERT INTO audit_logs (id, user_id, action, resource, details)
       VALUES (?, ?, ?, ?, ?)`,
      [
        `log_${crypto.randomUUID()}`,
        user.userId,
        'ENQUIRY_CONVERTED',
        'leads',
        JSON.stringify({ enquiryId: enquiry.id, leadId, customerName: enquiry.customer_name }),
      ]
    );

    const lead = await db.get<Lead>(
      `SELECT l.*, u.name as assigned_name, u.email as assigned_email, cb.name as created_by_name
       FROM leads l
       LEFT JOIN users u ON l.assigned_to = u.id
       LEFT JOIN users cb ON l.created_by = cb.id
       WHERE l.id = ?`,
      [leadId]
    );

    const updatedEnquiry = (await this.getEnquiryById(enquiryId, user))!;

    return { lead: lead!, enquiry: updatedEnquiry };
  }
}
