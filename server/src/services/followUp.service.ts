import crypto from 'crypto';
import { db } from '../db/database.js';
import {
  FollowUpItem,
  FollowUpType,
  FollowUpStatus,
  FollowUpSummary,
  UserRole,
  JWTPayload,
  LeadActivity,
} from '../types/index.js';

export interface FollowUpFilters {
  search?: string;
  leadId?: string;
  assignedUserId?: string;
  type?: FollowUpType;
  status?: FollowUpStatus;
  fromDate?: string;
  toDate?: string;
  view?: 'today' | 'upcoming' | 'overdue' | 'completed' | 'all';
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export class FollowUpService {
  /**
   * Fetch paginated and filtered follow-ups with server-side RBAC and dashboard view modes
   */
  public static async list(
    filters: FollowUpFilters,
    user: JWTPayload
  ): Promise<{ followUps: FollowUpItem[]; total: number; page: number; limit: number }> {
    const page = Math.max(1, filters.page || 1);
    const limit = Math.max(1, Math.min(100, filters.limit || 20));
    const offset = (page - 1) * limit;

    const conditions: string[] = [];
    const params: any[] = [];

    const isAdmin = user.roles.includes(UserRole.ADMIN);
    const isEmployee = user.roles.includes(UserRole.EMPLOYEE);

    // RBAC: Agent can only view follow-ups assigned to them or their leads
    if (!isAdmin && !isEmployee) {
      conditions.push('(COALESCE(f.assigned_user_id, f.executive_id) = ? OR l.assigned_to = ?)');
      params.push(user.userId, user.userId);
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const nowTimeStr = new Date().toTimeString().split(' ')[0].substring(0, 5); // 'HH:mm'

    // View specific filtering
    if (filters.view === 'today') {
      conditions.push('(COALESCE(f.scheduled_date, f.followup_date) = ?)');
      params.push(todayStr);
    } else if (filters.view === 'upcoming') {
      conditions.push('(COALESCE(f.scheduled_date, f.followup_date) > ? AND f.status = "Scheduled")');
      params.push(todayStr);
    } else if (filters.view === 'overdue') {
      conditions.push(
        '((COALESCE(f.scheduled_date, f.followup_date) < ? OR (COALESCE(f.scheduled_date, f.followup_date) = ? AND COALESCE(f.scheduled_time, f.followup_time) < ?)) AND f.status = "Scheduled")'
      );
      params.push(todayStr, todayStr, nowTimeStr);
    } else if (filters.view === 'completed') {
      conditions.push('f.status = "Completed"');
    }

    if (filters.search && filters.search.trim()) {
      const term = `%${filters.search.trim()}%`;
      conditions.push('(l.customer_name LIKE ? OR l.phone LIKE ? OR f.remarks LIKE ?)');
      params.push(term, term, term);
    }

    if (filters.leadId) {
      conditions.push('f.lead_id = ?');
      params.push(filters.leadId);
    }

    if (filters.assignedUserId) {
      conditions.push('COALESCE(f.assigned_user_id, f.executive_id) = ?');
      params.push(filters.assignedUserId);
    }

    if (filters.type) {
      conditions.push('(f.follow_up_type = ? OR f.type = ?)');
      params.push(filters.type, filters.type);
    }

    if (filters.status) {
      conditions.push('f.status = ?');
      params.push(filters.status);
    }

    if (filters.fromDate) {
      conditions.push('COALESCE(f.scheduled_date, f.followup_date) >= ?');
      params.push(filters.fromDate);
    }

    if (filters.toDate) {
      conditions.push('COALESCE(f.scheduled_date, f.followup_date) <= ?');
      params.push(filters.toDate);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Count query
    const countSql = `
      SELECT COUNT(*) as total
      FROM follow_ups f
      LEFT JOIN leads l ON f.lead_id = l.id
      ${whereClause}
    `;
    const countRes = await db.get<{ total: number }>(countSql, params);
    const total = countRes?.total || 0;

    // Sorting
    const sortFieldMap: Record<string, string> = {
      scheduled_date: 'COALESCE(f.scheduled_date, f.followup_date)',
      created_at: 'f.created_at',
      customer_name: 'l.customer_name',
      status: 'f.status',
    };
    const sortField = sortFieldMap[filters.sortBy || 'scheduled_date'] || 'COALESCE(f.scheduled_date, f.followup_date)';
    const sortOrder = filters.sortOrder === 'ASC' ? 'ASC' : 'DESC';

    const selectSql = `
      SELECT 
        f.id,
        f.lead_id,
        f.site_visit_id,
        COALESCE(f.assigned_user_id, f.executive_id) as assigned_user_id,
        COALESCE(f.follow_up_type, f.type) as follow_up_type,
        COALESCE(f.scheduled_date, f.followup_date) as scheduled_date,
        COALESCE(f.scheduled_time, f.followup_time) as scheduled_time,
        f.remarks,
        f.status,
        f.outcome,
        COALESCE(f.next_follow_up_date, f.next_followup_date) as next_follow_up_date,
        f.created_by,
        f.created_at,
        f.updated_at,
        l.customer_name,
        l.phone as customer_phone,
        l.email as customer_email,
        u.name as assigned_user_name,
        cb.name as created_by_name,
        p.name as project_name,
        pl.id as property_id,
        COALESCE(pl.title, p.name) as property_title,
        pl.code as property_code,
        pl.subtype as property_subtype,
        pl.cover_image as property_cover_image
      FROM follow_ups f
      LEFT JOIN leads l ON f.lead_id = l.id
      LEFT JOIN users u ON COALESCE(f.assigned_user_id, f.executive_id) = u.id
      LEFT JOIN users cb ON f.created_by = cb.id
      LEFT JOIN property_projects p ON l.project_id = p.id
      LEFT JOIN property_listings pl ON l.property_id = pl.id OR l.project_id = pl.id OR l.interested_property = pl.id OR l.interested_property = pl.title
      ${whereClause}
      ORDER BY ${sortField} ${sortOrder}, COALESCE(f.scheduled_time, f.followup_time) ${sortOrder}
      LIMIT ? OFFSET ?
    `;

    const rawFollowUps = await db.all<any>(selectSql, [...params, limit, offset]);

    const followUps: FollowUpItem[] = rawFollowUps.map((row) => {
      const isOverdue =
        row.status === 'Scheduled' &&
        (row.scheduled_date < todayStr ||
          (row.scheduled_date === todayStr && row.scheduled_time && row.scheduled_time < nowTimeStr));

      return {
        ...row,
        is_overdue: isOverdue,
      };
    });

    return {
      followUps,
      total,
      page,
      limit,
    };
  }

  /**
   * Get dynamic follow-up dashboard summary metrics
   */
  public static async getSummary(user: JWTPayload): Promise<FollowUpSummary> {
    const isAdmin = user.roles.includes(UserRole.ADMIN);
    const isEmployee = user.roles.includes(UserRole.EMPLOYEE);

    let whereClause = '';
    const params: any[] = [];

    if (!isAdmin && !isEmployee) {
      whereClause = 'WHERE COALESCE(assigned_user_id, executive_id) = ?';
      params.push(user.userId);
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const nowTimeStr = new Date().toTimeString().split(' ')[0].substring(0, 5);

    const sql = `
      SELECT
        COUNT(*) as total,
        SUM(CASE WHEN COALESCE(scheduled_date, followup_date) = '${todayStr}' THEN 1 ELSE 0 END) as today,
        SUM(CASE WHEN COALESCE(scheduled_date, followup_date) > '${todayStr}' AND status = 'Scheduled' THEN 1 ELSE 0 END) as upcoming,
        SUM(CASE WHEN (COALESCE(scheduled_date, followup_date) < '${todayStr}' OR (COALESCE(scheduled_date, followup_date) = '${todayStr}' AND COALESCE(scheduled_time, followup_time) < '${nowTimeStr}')) AND status = 'Scheduled' THEN 1 ELSE 0 END) as overdue,
        SUM(CASE WHEN status = 'Completed' THEN 1 ELSE 0 END) as completed
      FROM follow_ups
      ${whereClause}
    `;

    const row = await db.get<any>(sql, params);

    return {
      total: row?.total || 0,
      today: row?.today || 0,
      upcoming: row?.upcoming || 0,
      overdue: row?.overdue || 0,
      completed: row?.completed || 0,
    };
  }

  /**
   * Get single follow-up by ID
   */
  public static async getById(
    id: string,
    user: JWTPayload
  ): Promise<{ followUp: FollowUpItem; activities: LeadActivity[] } | null> {
    const todayStr = new Date().toISOString().split('T')[0];
    const nowTimeStr = new Date().toTimeString().split(' ')[0].substring(0, 5);

    const sql = `
      SELECT 
        f.id,
        f.lead_id,
        f.site_visit_id,
        COALESCE(f.assigned_user_id, f.executive_id) as assigned_user_id,
        COALESCE(f.follow_up_type, f.type) as follow_up_type,
        COALESCE(f.scheduled_date, f.followup_date) as scheduled_date,
        COALESCE(f.scheduled_time, f.followup_time) as scheduled_time,
        f.remarks,
        f.status,
        f.outcome,
        COALESCE(f.next_follow_up_date, f.next_followup_date) as next_follow_up_date,
        f.created_by,
        f.created_at,
        f.updated_at,
        l.customer_name,
        l.phone as customer_phone,
        l.email as customer_email,
        u.name as assigned_user_name,
        cb.name as created_by_name,
        p.name as project_name,
        pl.id as property_id,
        COALESCE(pl.title, p.name) as property_title,
        pl.code as property_code,
        pl.subtype as property_subtype,
        pl.cover_image as property_cover_image
      FROM follow_ups f
      LEFT JOIN leads l ON f.lead_id = l.id
      LEFT JOIN users u ON COALESCE(f.assigned_user_id, f.executive_id) = u.id
      LEFT JOIN users cb ON f.created_by = cb.id
      LEFT JOIN property_projects p ON l.project_id = p.id
      LEFT JOIN property_listings pl ON l.property_id = pl.id OR l.project_id = pl.id OR l.interested_property = pl.id OR l.interested_property = pl.title
      WHERE f.id = ?
    `;

    const row = await db.get<any>(sql, [id]);
    if (!row) return null;

    const isAdmin = user.roles.includes(UserRole.ADMIN);
    const isEmployee = user.roles.includes(UserRole.EMPLOYEE);
    if (!isAdmin && !isEmployee && row.assigned_user_id !== user.userId) {
      const err: any = new Error('Access denied. You do not have permission to view this follow-up.');
      err.statusCode = 403;
      throw err;
    }

    const isOverdue =
      row.status === 'Scheduled' &&
      (row.scheduled_date < todayStr ||
        (row.scheduled_date === todayStr && row.scheduled_time && row.scheduled_time < nowTimeStr));

    const followUp: FollowUpItem = {
      ...row,
      is_overdue: isOverdue,
    };

    // Related activities
    const activitiesSql = `
      SELECT la.*, usr.name as performer_name, usr.email as performer_email
      FROM lead_activities la
      LEFT JOIN users usr ON la.performed_by = usr.id
      WHERE la.lead_id = ? AND (la.metadata LIKE ? OR la.activity_type LIKE 'FOLLOW_UP%')
      ORDER BY la.created_at DESC
    `;
    const activities = await db.all<LeadActivity>(activitiesSql, [followUp.lead_id, `%${id}%`]);

    return { followUp, activities };
  }

  /**
   * Create a new Follow-Up with duplicate conflict detection
   */
  public static async create(
    data: {
      lead_id: string;
      site_visit_id?: string | null;
      assigned_user_id?: string | null;
      executive_id?: string | null;
      follow_up_type?: FollowUpType;
      type?: FollowUpType;
      scheduled_date?: string;
      followup_date?: string;
      scheduled_time?: string | null;
      followup_time?: string | null;
      remarks: string;
      next_follow_up_date?: string | null;
      next_followup_date?: string | null;
    },
    user: JWTPayload
  ): Promise<FollowUpItem> {
    const lead = await db.get<any>('SELECT * FROM leads WHERE id = ?', [data.lead_id]);
    if (!lead) {
      const err: any = new Error('Selected lead record was not found.');
      err.statusCode = 404;
      throw err;
    }

    const isAdmin = user.roles.includes(UserRole.ADMIN);
    const isEmployee = user.roles.includes(UserRole.EMPLOYEE);

    if (!isAdmin && !isEmployee && lead.assigned_to !== user.userId) {
      const err: any = new Error('You can only create follow-ups for leads assigned to you.');
      err.statusCode = 403;
      throw err;
    }

    const assignedUserId = data.assigned_user_id || data.executive_id || user.userId;
    const followUpType = data.follow_up_type || data.type || 'Phone Call';
    const scheduledDate =
      data.scheduled_date || data.followup_date || new Date().toISOString().split('T')[0];
    const scheduledTime = data.scheduled_time || data.followup_time || null;
    const nextFollowUpDate = data.next_follow_up_date || data.next_followup_date || null;

    // Duplicate conflict check for same lead, assigned user, date and time
    if (scheduledTime) {
      const conflict = await db.get<any>(
        `SELECT id FROM follow_ups 
         WHERE lead_id = ? AND COALESCE(assigned_user_id, executive_id) = ? 
           AND COALESCE(scheduled_date, followup_date) = ? 
           AND COALESCE(scheduled_time, followup_time) = ? 
           AND status = 'Scheduled'`,
        [data.lead_id, assignedUserId, scheduledDate, scheduledTime]
      );

      if (conflict) {
        const err: any = new Error('This executive already has a follow-up scheduled for this lead at this time.');
        err.statusCode = 400;
        throw err;
      }
    }

    const followUpId = `fol_${crypto.randomUUID()}`;
    const now = new Date().toISOString();

    await db.run(
      `INSERT INTO follow_ups (
        id, lead_id, site_visit_id, assigned_user_id, executive_id,
        follow_up_type, type, scheduled_date, followup_date, scheduled_time, followup_time,
        remarks, status, next_follow_up_date, next_followup_date, created_by, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Scheduled', ?, ?, ?, ?, ?)`,
      [
        followUpId,
        data.lead_id,
        data.site_visit_id || null,
        assignedUserId,
        assignedUserId,
        followUpType,
        followUpType,
        scheduledDate,
        scheduledDate,
        scheduledTime,
        scheduledTime,
        data.remarks.trim(),
        nextFollowUpDate,
        nextFollowUpDate,
        user.userId,
        now,
        now,
      ]
    );

    // Sync lead's next follow-up date if provided
    if (nextFollowUpDate) {
      await db.run('UPDATE leads SET next_followup_date = ?, updated_at = ? WHERE id = ?', [
        nextFollowUpDate,
        now,
        data.lead_id,
      ]);
    }

    // Record activity in lead timeline
    await db.run(
      `INSERT INTO lead_activities (id, lead_id, activity_type, title, description, performed_by, metadata, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        `act_${crypto.randomUUID()}`,
        data.lead_id,
        'FOLLOW_UP_CREATED',
        `Follow-Up Scheduled: ${followUpType}`,
        `Follow-up scheduled for ${scheduledDate}${scheduledTime ? ` at ${scheduledTime}` : ''} (${followUpType}): "${data.remarks}"`,
        user.userId,
        JSON.stringify({ follow_up_id: followUpId, type: followUpType, scheduledDate }),
        now,
      ]
    );

    const created = await this.getById(followUpId, user);
    return created!.followUp;
  }

  /**
   * Complete Follow-up with outcome, remarks, and optional next follow-up link
   */
  public static async complete(
    id: string,
    data: {
      outcome?: string | null;
      remarks?: string | null;
      next_follow_up_date?: string | null;
    },
    user: JWTPayload
  ): Promise<FollowUpItem> {
    const existing = await this.getById(id, user);
    if (!existing) {
      const err: any = new Error('Follow-up record not found.');
      err.statusCode = 404;
      throw err;
    }

    const current = existing.followUp;
    const now = new Date().toISOString();
    const finalRemarks = data.remarks ? `${current.remarks} | Completion: ${data.remarks}` : current.remarks;

    await db.run(
      `UPDATE follow_ups 
       SET status = 'Completed', outcome = ?, remarks = ?, next_follow_up_date = ?, next_followup_date = ?, updated_at = ?
       WHERE id = ?`,
      [data.outcome || 'Completed', finalRemarks, data.next_follow_up_date || null, data.next_follow_up_date || null, now, id]
    );

    // If next follow-up date is supplied, sync lead & create next scheduled follow-up
    if (data.next_follow_up_date) {
      await db.run('UPDATE leads SET next_followup_date = ?, updated_at = ? WHERE id = ?', [
        data.next_follow_up_date,
        now,
        current.lead_id,
      ]);

      const dateParts = data.next_follow_up_date.includes('T')
        ? data.next_follow_up_date.split('T')
        : data.next_follow_up_date.split(' ');
      const nextDate = dateParts[0];
      const nextTime = dateParts[1] || null;
      const nextFollowUpId = `fol_${crypto.randomUUID()}`;

      await db.run(
        `INSERT INTO follow_ups (
          id, lead_id, assigned_user_id, executive_id, follow_up_type, type, scheduled_date, followup_date,
          scheduled_time, followup_time, remarks, status, created_by, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Scheduled', ?, ?, ?)`,
        [
          nextFollowUpId,
          current.lead_id,
          current.assigned_user_id,
          current.assigned_user_id,
          current.follow_up_type,
          current.follow_up_type,
          nextDate,
          nextDate,
          nextTime,
          nextTime,
          `Next planned follow-up following up on: ${data.outcome || 'previous interaction'}`,
          user.userId,
          now,
          now,
        ]
      );
    }

    // Record activity in lead timeline
    await db.run(
      `INSERT INTO lead_activities (id, lead_id, activity_type, title, description, performed_by, metadata, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        `act_${crypto.randomUUID()}`,
        current.lead_id,
        'FOLLOW_UP_COMPLETED',
        `Follow-Up Completed: ${current.follow_up_type}`,
        `Completed on ${new Date().toLocaleDateString()}.${data.outcome ? ` Outcome: "${data.outcome}".` : ''}${
          data.remarks ? ` Remarks: ${data.remarks}` : ''
        }${data.next_follow_up_date ? ` Next scheduled: ${data.next_follow_up_date}` : ''}`,
        user.userId,
        JSON.stringify({ follow_up_id: id, outcome: data.outcome, next_follow_up: data.next_follow_up_date }),
        now,
      ]
    );

    const updated = await this.getById(id, user);
    return updated!.followUp;
  }

  /**
   * Reschedule follow-up
   */
  public static async reschedule(
    id: string,
    data: {
      scheduled_date: string;
      scheduled_time?: string | null;
      remarks?: string | null;
    },
    user: JWTPayload
  ): Promise<FollowUpItem> {
    const existing = await this.getById(id, user);
    if (!existing) {
      const err: any = new Error('Follow-up record not found.');
      err.statusCode = 404;
      throw err;
    }

    const current = existing.followUp;
    const now = new Date().toISOString();
    const prevDate = `${current.scheduled_date}${current.scheduled_time ? ` ${current.scheduled_time}` : ''}`;
    const newDate = `${data.scheduled_date}${data.scheduled_time ? ` ${data.scheduled_time}` : ''}`;

    await db.run(
      `UPDATE follow_ups 
       SET scheduled_date = ?, followup_date = ?, scheduled_time = ?, followup_time = ?, status = 'Rescheduled', remarks = ?, updated_at = ?
       WHERE id = ?`,
      [
        data.scheduled_date,
        data.scheduled_date,
        data.scheduled_time || null,
        data.scheduled_time || null,
        data.remarks || current.remarks,
        now,
        id,
      ]
    );

    // Sync lead
    await db.run('UPDATE leads SET next_followup_date = ?, updated_at = ? WHERE id = ?', [
      newDate,
      now,
      current.lead_id,
    ]);

    // Record activity
    await db.run(
      `INSERT INTO lead_activities (id, lead_id, activity_type, title, description, performed_by, metadata, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        `act_${crypto.randomUUID()}`,
        current.lead_id,
        'FOLLOW_UP_RESCHEDULED',
        `Follow-Up Rescheduled: ${current.follow_up_type}`,
        `Rescheduled from ${prevDate} to ${newDate}.${data.remarks ? ` Remarks: ${data.remarks}` : ''}`,
        user.userId,
        JSON.stringify({ follow_up_id: id, prevDate, newDate }),
        now,
      ]
    );

    const updated = await this.getById(id, user);
    return updated!.followUp;
  }

  /**
   * Cancel follow-up
   */
  public static async cancel(id: string, remarks: string | undefined, user: JWTPayload): Promise<FollowUpItem> {
    const existing = await this.getById(id, user);
    if (!existing) {
      const err: any = new Error('Follow-up record not found.');
      err.statusCode = 404;
      throw err;
    }

    const current = existing.followUp;
    const now = new Date().toISOString();

    await db.run(
      `UPDATE follow_ups 
       SET status = 'Cancelled', remarks = ?, updated_at = ?
       WHERE id = ?`,
      [remarks || current.remarks, now, id]
    );

    // Record activity
    await db.run(
      `INSERT INTO lead_activities (id, lead_id, activity_type, title, description, performed_by, metadata, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        `act_${crypto.randomUUID()}`,
        current.lead_id,
        'FOLLOW_UP_CANCELLED',
        `Follow-Up Cancelled: ${current.follow_up_type}`,
        `Follow-up was cancelled.${remarks ? ` Remarks: ${remarks}` : ''}`,
        user.userId,
        JSON.stringify({ follow_up_id: id }),
        now,
      ]
    );

    const updated = await this.getById(id, user);
    return updated!.followUp;
  }

  /**
   * Update follow-up details
   */
  public static async update(
    id: string,
    data: {
      follow_up_type?: FollowUpType;
      remarks?: string;
    },
    user: JWTPayload
  ): Promise<FollowUpItem> {
    const existing = await this.getById(id, user);
    if (!existing) {
      const err: any = new Error('Follow-up record not found.');
      err.statusCode = 404;
      throw err;
    }

    const current = existing.followUp;
    const type = data.follow_up_type || current.follow_up_type;
    const remarks = data.remarks !== undefined ? data.remarks : current.remarks;
    const now = new Date().toISOString();

    await db.run(
      `UPDATE follow_ups 
       SET follow_up_type = ?, type = ?, remarks = ?, updated_at = ?
       WHERE id = ?`,
      [type, type, remarks, now, id]
    );

    const updated = await this.getById(id, user);
    return updated!.followUp;
  }
}
