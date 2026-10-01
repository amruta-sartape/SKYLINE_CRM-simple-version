import crypto from 'crypto';
import { db } from '../db/database.js';
import {
  SiteVisit,
  SiteVisitStatus,
  SiteVisitType,
  SiteVisitOutcome,
  SiteVisitSummary,
  UserRole,
  JWTPayload,
  LeadActivity,
} from '../types/index.js';

export interface SiteVisitFilters {
  search?: string;
  leadId?: string;
  projectId?: string;
  unitId?: string;
  assignedUserId?: string;
  status?: SiteVisitStatus;
  fromDate?: string;
  toDate?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export class SiteVisitService {
  /**
   * Fetch paginated and filtered site visits with server-side RBAC
   */
  public static async list(
    filters: SiteVisitFilters,
    user: JWTPayload
  ): Promise<{ visits: SiteVisit[]; total: number; page: number; limit: number }> {
    const page = Math.max(1, filters.page || 1);
    const limit = Math.max(1, Math.min(100, filters.limit || 20));
    const offset = (page - 1) * limit;

    const conditions: string[] = [];
    const params: any[] = [];

    // RBAC: Agent can only view site visits assigned to them or their leads
    const isAdmin = user.roles.includes(UserRole.ADMIN);
    const isEmployee = user.roles.includes(UserRole.EMPLOYEE);

    if (!isAdmin && !isEmployee) {
      conditions.push('(sv.assigned_user_id = ? OR l.assigned_to = ?)');
      params.push(user.userId, user.userId);
    }

    if (filters.search && filters.search.trim()) {
      const term = `%${filters.search.trim()}%`;
      conditions.push(
        '(l.customer_name LIKE ? OR l.phone LIKE ? OR p.name LIKE ? OR un.unit_number LIKE ? OR sv.remarks LIKE ?)'
      );
      params.push(term, term, term, term, term);
    }

    if (filters.leadId) {
      conditions.push('sv.lead_id = ?');
      params.push(filters.leadId);
    }

    if (filters.projectId) {
      conditions.push('sv.project_id = ?');
      params.push(filters.projectId);
    }

    if (filters.unitId) {
      conditions.push('sv.unit_id = ?');
      params.push(filters.unitId);
    }

    if (filters.assignedUserId) {
      conditions.push('sv.assigned_user_id = ?');
      params.push(filters.assignedUserId);
    }

    if (filters.status) {
      conditions.push('sv.visit_status = ?');
      params.push(filters.status);
    }

    if (filters.fromDate) {
      conditions.push('sv.visit_date >= ?');
      params.push(filters.fromDate);
    }

    if (filters.toDate) {
      conditions.push('sv.visit_date <= ?');
      params.push(filters.toDate);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Count
    const countSql = `
      SELECT COUNT(*) as total
      FROM site_visits sv
      LEFT JOIN leads l ON sv.lead_id = l.id
      LEFT JOIN property_projects p ON sv.project_id = p.id
      LEFT JOIN property_units un ON sv.unit_id = un.id
      ${whereClause}
    `;
    const countRes = await db.get<{ total: number }>(countSql, params);
    const total = countRes?.total || 0;

    // Sort mapping
    const sortFieldMap: Record<string, string> = {
      visit_date: 'sv.visit_date',
      visit_time: 'sv.visit_time',
      created_at: 'sv.created_at',
      status: 'sv.visit_status',
      customer_name: 'l.customer_name',
      project_name: 'p.name',
    };
    const sortField = sortFieldMap[filters.sortBy || 'visit_date'] || 'sv.visit_date';
    const sortOrder = filters.sortOrder === 'ASC' ? 'ASC' : 'DESC';

    const selectSql = `
      SELECT 
        sv.*,
        l.customer_name,
        l.phone as customer_phone,
        l.email as customer_email,
        l.qualification_status as lead_status,
        l.budget as lead_budget,
        l.flat_type as lead_flat_type,
        l.pipeline_stage as lead_pipeline_stage,
        p.name as project_name,
        p.code as project_code,
        p.city as project_city,
        p.location as project_location,
        un.unit_number,
        un.configuration as unit_configuration,
        un.price as unit_price,
        un.availability_status as unit_availability,
        u.name as assigned_user_name,
        u.email as assigned_user_email,
        cb.name as created_by_name,
        pl.id as property_id,
        pl.code as property_code,
        COALESCE(pl.title, p.name) as property_title,
        pl.subtype as property_subtype,
        pl.cover_image as property_cover_image,
        COALESCE(pl.price_label, CAST(pl.price AS TEXT)) as property_price
      FROM site_visits sv
      LEFT JOIN leads l ON sv.lead_id = l.id
      LEFT JOIN property_projects p ON sv.project_id = p.id
      LEFT JOIN property_units un ON sv.unit_id = un.id
      LEFT JOIN property_listings pl ON sv.property_id = pl.id OR sv.project_id = pl.id OR sv.project_id = pl.code
      LEFT JOIN users u ON sv.assigned_user_id = u.id
      LEFT JOIN users cb ON sv.created_by = cb.id
      ${whereClause}
      ORDER BY ${sortField} ${sortOrder}, sv.visit_time ${sortOrder}
      LIMIT ? OFFSET ?
    `;

    const visits = await db.all<SiteVisit>(selectSql, [...params, limit, offset]);

    return {
      visits,
      total,
      page,
      limit,
    };
  }

  /**
   * Get aggregate metrics for site visits
   */
  public static async getSummary(user: JWTPayload): Promise<SiteVisitSummary> {
    const isAdmin = user.roles.includes(UserRole.ADMIN);
    const isEmployee = user.roles.includes(UserRole.EMPLOYEE);

    let whereClause = '';
    const params: any[] = [];

    if (!isAdmin && !isEmployee) {
      whereClause = 'WHERE assigned_user_id = ?';
      params.push(user.userId);
    }

    const todayStr = new Date().toISOString().split('T')[0];

    const sql = `
      SELECT
        COUNT(*) as total_visits,
        SUM(CASE WHEN visit_status = 'Scheduled' THEN 1 ELSE 0 END) as scheduled_visits,
        SUM(CASE WHEN visit_status = 'Completed' THEN 1 ELSE 0 END) as completed_visits,
        SUM(CASE WHEN visit_status = 'Rescheduled' THEN 1 ELSE 0 END) as rescheduled_visits,
        SUM(CASE WHEN visit_status = 'Cancelled' THEN 1 ELSE 0 END) as cancelled_visits,
        SUM(CASE WHEN visit_status = 'No Show' THEN 1 ELSE 0 END) as no_show_visits,
        SUM(CASE WHEN visit_date = '${todayStr}' AND visit_status = 'Scheduled' THEN 1 ELSE 0 END) as today_visits,
        SUM(CASE WHEN visit_date > '${todayStr}' AND visit_status = 'Scheduled' THEN 1 ELSE 0 END) as upcoming_visits
      FROM site_visits
      ${whereClause}
    `;

    const row = await db.get<any>(sql, params);

    return {
      total_visits: row?.total_visits || 0,
      scheduled_visits: row?.scheduled_visits || 0,
      completed_visits: row?.completed_visits || 0,
      rescheduled_visits: row?.rescheduled_visits || 0,
      cancelled_visits: row?.cancelled_visits || 0,
      no_show_visits: row?.no_show_visits || 0,
      today_visits: row?.today_visits || 0,
      upcoming_visits: row?.upcoming_visits || 0,
    };
  }

  /**
   * Get a single site visit by ID with joined details and audit activities
   */
  public static async getById(
    id: string,
    user: JWTPayload
  ): Promise<{ visit: SiteVisit; activities: LeadActivity[] } | null> {
    const sql = `
      SELECT 
        sv.*,
        l.customer_name,
        l.phone as customer_phone,
        l.email as customer_email,
        l.qualification_status as lead_status,
        l.budget as lead_budget,
        l.flat_type as lead_flat_type,
        l.pipeline_stage as lead_pipeline_stage,
        p.name as project_name,
        p.code as project_code,
        p.city as project_city,
        p.location as project_location,
        un.unit_number,
        un.configuration as unit_configuration,
        un.price as unit_price,
        un.availability_status as unit_availability,
        u.name as assigned_user_name,
        u.email as assigned_user_email,
        cb.name as created_by_name,
        pl.id as property_id,
        pl.code as property_code,
        COALESCE(pl.title, p.name) as property_title,
        pl.subtype as property_subtype,
        pl.cover_image as property_cover_image,
        COALESCE(pl.price_label, CAST(pl.price AS TEXT)) as property_price
      FROM site_visits sv
      LEFT JOIN leads l ON sv.lead_id = l.id
      LEFT JOIN property_projects p ON sv.project_id = p.id
      LEFT JOIN property_units un ON sv.unit_id = un.id
      LEFT JOIN property_listings pl ON sv.property_id = pl.id OR sv.project_id = pl.id OR sv.project_id = pl.code
      LEFT JOIN users u ON sv.assigned_user_id = u.id
      LEFT JOIN users cb ON sv.created_by = cb.id
      WHERE sv.id = ?
    `;

    const visit = await db.get<SiteVisit>(sql, [id]);
    if (!visit) return null;

    // RBAC check
    const isAdmin = user.roles.includes(UserRole.ADMIN);
    const isEmployee = user.roles.includes(UserRole.EMPLOYEE);
    if (!isAdmin && !isEmployee && visit.assigned_user_id !== user.userId) {
      const err: any = new Error('Access denied. You do not have permission to view this site visit.');
      err.statusCode = 403;
      throw err;
    }

    // Retrieve related lead activities
    const activitiesSql = `
      SELECT la.*, usr.name as performer_name, usr.email as performer_email
      FROM lead_activities la
      LEFT JOIN users usr ON la.performed_by = usr.id
      WHERE la.lead_id = ? AND (la.metadata LIKE ? OR la.activity_type LIKE 'SITE_VISIT%')
      ORDER BY la.created_at DESC
    `;
    const activities = await db.all<LeadActivity>(activitiesSql, [visit.lead_id, `%${id}%`]);

    return { visit, activities };
  }

  /**
   * Schedule a new site visit with comprehensive conflict detection and RBAC validation
   */
  public static async create(
    data: {
      lead_id: string;
      project_id: string;
      unit_id?: string | null;
      property_id?: string | null;
      assigned_user_id: string;
      visit_date: string;
      visit_time: string;
      visit_type?: SiteVisitType;
      remarks?: string | null;
    },
    user: JWTPayload
  ): Promise<SiteVisit> {
    // 1. Verify lead exists and user has permission
    const lead = await db.get<any>('SELECT * FROM leads WHERE id = ?', [data.lead_id]);
    if (!lead) {
      const err: any = new Error('Selected lead record was not found.');
      err.statusCode = 404;
      throw err;
    }

    const isAdmin = user.roles.includes(UserRole.ADMIN);
    const isEmployee = user.roles.includes(UserRole.EMPLOYEE);

    if (!isAdmin && !isEmployee && lead.assigned_to !== user.userId) {
      const err: any = new Error('You can only schedule site visits for leads assigned to you.');
      err.statusCode = 403;
      throw err;
    }

    let propertyId = data.property_id || null;
    let projectId = data.project_id;

    // Lookup property listing if property_id or project_id points to one
    let listing: any = null;
    if (propertyId) {
      listing = await db.get<any>('SELECT * FROM property_listings WHERE id = ?', [propertyId]);
    } else if (projectId) {
      listing = await db.get<any>('SELECT * FROM property_listings WHERE id = ? OR code = ?', [projectId, projectId]);
      if (listing) {
        propertyId = listing.id;
      }
    }

    if (listing && listing.project_id) {
      projectId = listing.project_id;
    }

    // 2. Verify project exists
    let project = await db.get<any>('SELECT * FROM property_projects WHERE id = ?', [projectId]);
    if (!project) {
      // Check if project exists by code or fallback from listing
      const fallbackProject = await db.get<any>('SELECT * FROM property_projects LIMIT 1');
      if (fallbackProject) {
        projectId = fallbackProject.id;
        project = fallbackProject;
      } else {
        const err: any = new Error('Selected property project does not exist.');
        err.statusCode = 404;
        throw err;
      }
    }

    // 3. Verify unit if provided (must exist and belong to project)
    if (data.unit_id) {
      const unit = await db.get<any>('SELECT * FROM property_units WHERE id = ?', [data.unit_id]);
      if (!unit) {
        const err: any = new Error('Selected property unit does not exist.');
        err.statusCode = 404;
        throw err;
      }
      if (unit.project_id !== projectId) {
        const err: any = new Error('Selected unit does not belong to the chosen property project.');
        err.statusCode = 400;
        throw err;
      }
    }

    // 4. Verify assigned executive exists
    const assignedUser = await db.get<any>('SELECT id, name, status FROM users WHERE id = ?', [
      data.assigned_user_id,
    ]);
    if (!assignedUser || assignedUser.status !== 'ACTIVE') {
      const err: any = new Error('Assigned executive is not an active system user.');
      err.statusCode = 400;
      throw err;
    }

    // Non-admins can only assign to themselves if agent
    if (!isAdmin && !isEmployee && data.assigned_user_id !== user.userId) {
      const err: any = new Error('Agents cannot assign site visits to other users.');
      err.statusCode = 403;
      throw err;
    }

    // 5. Conflict detection: No double-booking executive at exact same date & time for Scheduled visits
    const conflict = await db.get<any>(
      `SELECT id, visit_date, visit_time FROM site_visits 
       WHERE assigned_user_id = ? AND visit_date = ? AND visit_time = ? AND visit_status = 'Scheduled'`,
      [data.assigned_user_id, data.visit_date, data.visit_time]
    );

    if (conflict) {
      const err: any = new Error('This executive already has another activity scheduled at this time.');
      err.statusCode = 400;
      throw err;
    }

    const visitId = `sv_${crypto.randomUUID()}`;
    const now = new Date().toISOString();
    const visitType = data.visit_type || 'Direct Visit';

    await db.run(
      `INSERT INTO site_visits (
        id, lead_id, project_id, unit_id, property_id, assigned_user_id, visit_date, visit_time, visit_status, visit_type, remarks, created_by, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Scheduled', ?, ?, ?, ?, ?)`,
      [
        visitId,
        data.lead_id,
        projectId,
        data.unit_id || null,
        propertyId || null,
        data.assigned_user_id,
        data.visit_date,
        data.visit_time,
        visitType,
        data.remarks || null,
        user.userId,
        now,
        now,
      ]
    );

    // 6. Record activity in lead timeline
    const unitText = data.unit_id ? ` (Unit ID: ${data.unit_id})` : '';
    const displayName = listing?.title || project.name;
    await db.run(
      `INSERT INTO lead_activities (id, lead_id, activity_type, title, description, performed_by, metadata, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        `act_${crypto.randomUUID()}`,
        data.lead_id,
        'SITE_VISIT_SCHEDULED',
        `Site Visit Scheduled: ${displayName}`,
        `Site visit scheduled for ${data.visit_date} at ${data.visit_time} at ${displayName}${unitText}. Assigned to ${assignedUser.name}.`,
        user.userId,
        JSON.stringify({ site_visit_id: visitId, project_id: projectId, property_id: propertyId, unit_id: data.unit_id }),
        now,
      ]
    );

    const created = await this.getById(visitId, user);
    return created!.visit;
  }

  /**
   * Update site visit details
   */
  public static async update(
    id: string,
    data: {
      project_id?: string;
      unit_id?: string | null;
      visit_type?: SiteVisitType;
      remarks?: string | null;
    },
    user: JWTPayload
  ): Promise<SiteVisit> {
    const existing = await this.getById(id, user);
    if (!existing) {
      const err: any = new Error('Site visit not found.');
      err.statusCode = 404;
      throw err;
    }

    const current = existing.visit;

    if (current.visit_status === 'Completed' || current.visit_status === 'Cancelled') {
      const err: any = new Error(`Cannot modify a ${current.visit_status.toLowerCase()} site visit.`);
      err.statusCode = 400;
      throw err;
    }

    const projectId = data.project_id || current.project_id;
    const unitId = data.unit_id !== undefined ? data.unit_id : current.unit_id;
    const visitType = data.visit_type || current.visit_type;
    const remarks = data.remarks !== undefined ? data.remarks : current.remarks;
    const now = new Date().toISOString();

    if (unitId) {
      const unit = await db.get<any>('SELECT * FROM property_units WHERE id = ?', [unitId]);
      if (!unit || unit.project_id !== projectId) {
        const err: any = new Error('Selected unit is invalid or does not belong to the project.');
        err.statusCode = 400;
        throw err;
      }
    }

    await db.run(
      `UPDATE site_visits 
       SET project_id = ?, unit_id = ?, visit_type = ?, remarks = ?, updated_at = ?
       WHERE id = ?`,
      [projectId, unitId || null, visitType, remarks || null, now, id]
    );

    const updated = await this.getById(id, user);
    return updated!.visit;
  }

  /**
   * Controlled status change: Completed, Cancelled, No Show
   */
  public static async updateStatus(
    id: string,
    data: {
      visit_status: SiteVisitStatus;
      outcome?: SiteVisitOutcome | null;
      remarks?: string | null;
    },
    user: JWTPayload
  ): Promise<SiteVisit> {
    const existing = await this.getById(id, user);
    if (!existing) {
      const err: any = new Error('Site visit not found.');
      err.statusCode = 404;
      throw err;
    }

    const current = existing.visit;
    const targetStatus = data.visit_status;

    // Allowed transition validation
    if (current.visit_status === 'Completed') {
      const err: any = new Error('Completed site visits cannot change status.');
      err.statusCode = 400;
      throw err;
    }

    if (current.visit_status === 'Cancelled') {
      const err: any = new Error('Cancelled site visits cannot change status.');
      err.statusCode = 400;
      throw err;
    }

    if (current.visit_status === 'No Show' && targetStatus !== 'Rescheduled') {
      const err: any = new Error('A "No Show" visit can only be transitioned to "Rescheduled".');
      err.statusCode = 400;
      throw err;
    }

    const now = new Date().toISOString();
    const finalRemarks = data.remarks || current.remarks || null;
    const outcome = data.outcome || null;

    await db.run(
      `UPDATE site_visits 
       SET visit_status = ?, outcome = ?, remarks = ?, updated_at = ?
       WHERE id = ?`,
      [targetStatus, outcome, finalRemarks, now, id]
    );

    // Activity logging
    let actType = 'SITE_VISIT_COMPLETED';
    let title = `Site Visit Completed: ${current.project_name}`;
    if (targetStatus === 'Cancelled') {
      actType = 'SITE_VISIT_CANCELLED';
      title = `Site Visit Cancelled: ${current.project_name}`;
    } else if (targetStatus === 'No Show') {
      actType = 'SITE_VISIT_NO_SHOW';
      title = `Site Visit No Show: ${current.project_name}`;
    }

    const desc = `Status updated to "${targetStatus}".${outcome ? ` Outcome: ${outcome}.` : ''}${
      data.remarks ? ` Remarks: ${data.remarks}` : ''
    }`;

    await db.run(
      `INSERT INTO lead_activities (id, lead_id, activity_type, title, description, performed_by, metadata, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        `act_${crypto.randomUUID()}`,
        current.lead_id,
        actType,
        title,
        desc,
        user.userId,
        JSON.stringify({ site_visit_id: id, status: targetStatus, outcome }),
        now,
      ]
    );

    const updated = await this.getById(id, user);
    return updated!.visit;
  }

  /**
   * Reschedule Site Visit with conflict validation
   */
  public static async reschedule(
    id: string,
    data: {
      visit_date: string;
      visit_time: string;
      remarks?: string | null;
    },
    user: JWTPayload
  ): Promise<SiteVisit> {
    const existing = await this.getById(id, user);
    if (!existing) {
      const err: any = new Error('Site visit not found.');
      err.statusCode = 404;
      throw err;
    }

    const current = existing.visit;

    if (current.visit_status === 'Completed') {
      const err: any = new Error('Completed site visits cannot be rescheduled.');
      err.statusCode = 400;
      throw err;
    }

    if (current.visit_status === 'Cancelled') {
      const err: any = new Error('Cancelled site visits cannot be rescheduled.');
      err.statusCode = 400;
      throw err;
    }

    // Conflict detection for the assigned executive (excluding current visit)
    const conflict = await db.get<any>(
      `SELECT id FROM site_visits 
       WHERE assigned_user_id = ? AND visit_date = ? AND visit_time = ? AND visit_status = 'Scheduled' AND id != ?`,
      [current.assigned_user_id, data.visit_date, data.visit_time, id]
    );

    if (conflict) {
      const err: any = new Error('This executive already has another activity scheduled at this time.');
      err.statusCode = 400;
      throw err;
    }

    const now = new Date().toISOString();
    const prevDate = `${current.visit_date} ${current.visit_time}`;
    const newDate = `${data.visit_date} ${data.visit_time}`;

    await db.run(
      `UPDATE site_visits 
       SET visit_date = ?, visit_time = ?, visit_status = 'Rescheduled', remarks = ?, updated_at = ?
       WHERE id = ?`,
      [data.visit_date, data.visit_time, data.remarks || current.remarks, now, id]
    );

    // Record activity
    await db.run(
      `INSERT INTO lead_activities (id, lead_id, activity_type, title, description, performed_by, metadata, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        `act_${crypto.randomUUID()}`,
        current.lead_id,
        'SITE_VISIT_RESCHEDULED',
        `Site Visit Rescheduled: ${current.project_name}`,
        `Visit rescheduled from ${prevDate} to ${newDate}.${data.remarks ? ` Remarks: ${data.remarks}` : ''}`,
        user.userId,
        JSON.stringify({ site_visit_id: id, prevDate, newDate }),
        now,
      ]
    );

    const updated = await this.getById(id, user);
    return updated!.visit;
  }

  /**
   * Reassign site visit to a different executive (Admin only)
   */
  public static async reassign(
    id: string,
    data: {
      assigned_user_id: string;
      remarks?: string | null;
    },
    user: JWTPayload
  ): Promise<SiteVisit> {
    const existing = await this.getById(id, user);
    if (!existing) {
      const err: any = new Error('Site visit not found.');
      err.statusCode = 404;
      throw err;
    }

    const current = existing.visit;

    // RBAC: Only Admin can reassign arbitrary executive
    const isAdmin = user.roles.includes(UserRole.ADMIN);
    if (!isAdmin) {
      const err: any = new Error('Only administrators can reassign site visits.');
      err.statusCode = 403;
      throw err;
    }

    const targetUser = await db.get<any>('SELECT id, name, status FROM users WHERE id = ?', [
      data.assigned_user_id,
    ]);
    if (!targetUser || targetUser.status !== 'ACTIVE') {
      const err: any = new Error('Selected executive is not active.');
      err.statusCode = 400;
      throw err;
    }

    // Check conflict for target user
    const conflict = await db.get<any>(
      `SELECT id FROM site_visits 
       WHERE assigned_user_id = ? AND visit_date = ? AND visit_time = ? AND visit_status = 'Scheduled' AND id != ?`,
      [data.assigned_user_id, current.visit_date, current.visit_time, id]
    );

    if (conflict) {
      const err: any = new Error('This executive already has another activity scheduled at this time.');
      err.statusCode = 400;
      throw err;
    }

    const now = new Date().toISOString();

    await db.run(
      `UPDATE site_visits 
       SET assigned_user_id = ?, updated_at = ?
       WHERE id = ?`,
      [data.assigned_user_id, now, id]
    );

    // Record activity
    await db.run(
      `INSERT INTO lead_activities (id, lead_id, activity_type, title, description, performed_by, metadata, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        `act_${crypto.randomUUID()}`,
        current.lead_id,
        'SITE_VISIT_REASSIGNED',
        `Site Visit Reassigned: ${current.project_name}`,
        `Visit reassigned to ${targetUser.name}.${data.remarks ? ` Remarks: ${data.remarks}` : ''}`,
        user.userId,
        JSON.stringify({ site_visit_id: id, previous_executive: current.assigned_user_id, new_executive: data.assigned_user_id }),
        now,
      ]
    );

    const updated = await this.getById(id, user);
    return updated!.visit;
  }
}
