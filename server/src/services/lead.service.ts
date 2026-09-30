import crypto from 'crypto';
import { db } from '../db/database.js';
import {
  Lead,
  LeadActivity,
  FollowUp,
  UserRole,
  JWTPayload,
  PipelineStage,
  QualificationStatus,
  PropertyConfiguration,
  LeadPriority,
  PurchaseTimeline,
  PurchasePurpose,
  FollowUpType,
} from '../types/index.js';

export interface LeadFilters {
  search?: string;
  stage?: PipelineStage;
  qualification_status?: QualificationStatus;
  flat_type?: PropertyConfiguration;
  assigned_to?: string;
  priority?: LeadPriority;
  loan_required?: number;
  minBudget?: number;
  maxBudget?: number;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface PipelineStageSummary {
  stage: PipelineStage;
  count: number;
  totalValue: number;
  leads: Lead[];
}

export class LeadService {
  /**
   * Fetch paginated & filtered list of leads with RBAC enforcement
   */
  public static async getLeads(
    filters: LeadFilters,
    user: JWTPayload
  ): Promise<{ leads: Lead[]; total: number; page: number; limit: number }> {
    const page = Math.max(1, filters.page || 1);
    const limit = Math.max(1, Math.min(100, filters.limit || 20));
    const offset = (page - 1) * limit;

    const conditions: string[] = [];
    const params: any[] = [];

    // RBAC check:
    const isAdmin = user.roles.includes(UserRole.ADMIN);
    const isEmployee = user.roles.includes(UserRole.EMPLOYEE);

    if (!isAdmin && !isEmployee) {
      // Agent role can only see their own assigned leads
      conditions.push('l.assigned_to = ?');
      params.push(user.userId);
    }

    if (filters.search && filters.search.trim()) {
      const term = `%${filters.search.trim()}%`;
      conditions.push(
        '(l.customer_name LIKE ? OR l.phone LIKE ? OR l.email LIKE ? OR l.city LIKE ? OR l.interested_property LIKE ? OR l.preferred_location LIKE ?)'
      );
      params.push(term, term, term, term, term, term);
    }

    if (filters.stage) {
      conditions.push('l.pipeline_stage = ?');
      params.push(filters.stage);
    }

    if (filters.qualification_status) {
      conditions.push('l.qualification_status = ?');
      params.push(filters.qualification_status);
    }

    if (filters.flat_type) {
      conditions.push('l.flat_type = ?');
      params.push(filters.flat_type);
    }

    if (filters.assigned_to) {
      conditions.push('l.assigned_to = ?');
      params.push(filters.assigned_to);
    }

    if (filters.priority) {
      conditions.push('l.priority = ?');
      params.push(filters.priority);
    }

    if (filters.loan_required !== undefined) {
      conditions.push('l.loan_required = ?');
      params.push(filters.loan_required);
    }

    if (filters.minBudget) {
      conditions.push('l.budget >= ?');
      params.push(filters.minBudget);
    }

    if (filters.maxBudget) {
      conditions.push('l.budget <= ?');
      params.push(filters.maxBudget);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Count
    const countSql = `SELECT COUNT(*) as total FROM leads l ${whereClause}`;
    const countResult = await db.get<{ total: number }>(countSql, params);
    const total = countResult?.total || 0;

    // Sort
    const allowedSortFields: Record<string, string> = {
      customer_name: 'l.customer_name',
      created_at: 'l.created_at',
      budget: 'l.budget',
      next_followup_date: 'l.next_followup_date',
      priority: 'l.priority',
      pipeline_stage: 'l.pipeline_stage',
    };
    const sortField = allowedSortFields[filters.sortBy || 'created_at'] || 'l.created_at';
    const sortOrder = filters.sortOrder === 'ASC' ? 'ASC' : 'DESC';

    const selectSql = `
      SELECT 
        l.*,
        u.name as assigned_name,
        u.email as assigned_email,
        cb.name as created_by_name
      FROM leads l
      LEFT JOIN users u ON l.assigned_to = u.id
      LEFT JOIN users cb ON l.created_by = cb.id
      ${whereClause}
      ORDER BY ${sortField} ${sortOrder}
      LIMIT ? OFFSET ?
    `;

    const leads = await db.all<Lead>(selectSql, [...params, limit, offset]);

    return {
      leads,
      total,
      page,
      limit,
    };
  }

  /**
   * Fetch Leads grouped by Pipeline Stage for visual CRM board
   */
  public static async getPipelineBoard(
    filters: LeadFilters,
    user: JWTPayload
  ): Promise<{ stages: PipelineStageSummary[]; totalLeads: number; totalPipelineValue: number }> {
    const stagesList: PipelineStage[] = [
      'New',
      'Contacted',
      'Follow-up',
      'Site Visit',
      'Negotiation',
      'Converted',
      'Lost',
    ];

    const conditions: string[] = [];
    const params: any[] = [];

    const isAdmin = user.roles.includes(UserRole.ADMIN);
    const isEmployee = user.roles.includes(UserRole.EMPLOYEE);

    if (!isAdmin && !isEmployee) {
      conditions.push('l.assigned_to = ?');
      params.push(user.userId);
    }

    if (filters.search && filters.search.trim()) {
      const term = `%${filters.search.trim()}%`;
      conditions.push(
        '(l.customer_name LIKE ? OR l.phone LIKE ? OR l.email LIKE ? OR l.interested_property LIKE ? OR l.city LIKE ?)'
      );
      params.push(term, term, term, term, term);
    }

    if (filters.assigned_to) {
      conditions.push('l.assigned_to = ?');
      params.push(filters.assigned_to);
    }

    if (filters.flat_type) {
      conditions.push('l.flat_type = ?');
      params.push(filters.flat_type);
    }

    if (filters.qualification_status) {
      conditions.push('l.qualification_status = ?');
      params.push(filters.qualification_status);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const sql = `
      SELECT 
        l.*,
        u.name as assigned_name,
        u.email as assigned_email,
        cb.name as created_by_name
      FROM leads l
      LEFT JOIN users u ON l.assigned_to = u.id
      LEFT JOIN users cb ON l.created_by = cb.id
      ${whereClause}
      ORDER BY l.created_at DESC
    `;

    const allLeads = await db.all<Lead>(sql, params);

    let totalLeads = 0;
    let totalPipelineValue = 0;

    const stages: PipelineStageSummary[] = stagesList.map((stageName) => {
      const stageLeads = allLeads.filter((l) => l.pipeline_stage === stageName);
      const stageValue = stageLeads.reduce((acc, curr) => acc + (Number(curr.budget) || 0), 0);

      totalLeads += stageLeads.length;
      totalPipelineValue += stageValue;

      return {
        stage: stageName,
        count: stageLeads.length,
        totalValue: stageValue,
        leads: stageLeads,
      };
    });

    return {
      stages,
      totalLeads,
      totalPipelineValue,
    };
  }

  /**
   * Get single lead by ID with RBAC check
   */
  public static async getLeadById(id: string, user: JWTPayload): Promise<Lead | null> {
    const sql = `
      SELECT 
        l.*,
        u.name as assigned_name,
        u.email as assigned_email,
        cb.name as created_by_name
      FROM leads l
      LEFT JOIN users u ON l.assigned_to = u.id
      LEFT JOIN users cb ON l.created_by = cb.id
      WHERE l.id = ?
    `;

    const lead = await db.get<Lead>(sql, [id]);
    if (!lead) return null;

    const isAdmin = user.roles.includes(UserRole.ADMIN);
    const isEmployee = user.roles.includes(UserRole.EMPLOYEE);

    if (!isAdmin && !isEmployee && lead.assigned_to !== user.userId) {
      const error: any = new Error('Access denied. You do not have permission to view this lead.');
      error.statusCode = 403;
      throw error;
    }

    return lead;
  }

  /**
   * Get complete Lead Activity Timeline + Follow-ups (Customer 360 Foundation)
   */
  public static async getLeadTimeline(
    leadId: string,
    user: JWTPayload
  ): Promise<{ activities: LeadActivity[]; followUps: FollowUp[] }> {
    // Verify access first
    await this.getLeadById(leadId, user);

    const activitiesSql = `
      SELECT 
        la.*,
        u.name as performer_name,
        u.email as performer_email
      FROM lead_activities la
      LEFT JOIN users u ON la.performed_by = u.id
      WHERE la.lead_id = ?
      ORDER BY la.created_at DESC
    `;
    const activities = await db.all<LeadActivity>(activitiesSql, [leadId]);

    const followUpsSql = `
      SELECT 
        f.*,
        u.name as executive_name
      FROM follow_ups f
      LEFT JOIN users u ON f.executive_id = u.id
      WHERE f.lead_id = ?
      ORDER BY f.followup_date DESC, f.created_at DESC
    `;
    const followUps = await db.all<FollowUp>(followUpsSql, [leadId]);

    return { activities, followUps };
  }

  /**
   * Create a new Lead directly
   */
  public static async createLead(
    data: {
      customer_name: string;
      phone: string;
      email?: string | null;
      city?: string | null;
      budget: number;
      preferred_location?: string | null;
      flat_type: PropertyConfiguration;
      interested_property?: string | null;
      loan_required?: number;
      purchase_timeline?: PurchaseTimeline | null;
      purpose?: PurchasePurpose | null;
      assigned_to?: string | null;
      pipeline_stage?: PipelineStage;
      qualification_status?: QualificationStatus;
      priority?: LeadPriority;
      next_followup_date?: string | null;
      notes?: string | null;
    },
    user: JWTPayload
  ): Promise<Lead> {
    const id = `lead_${crypto.randomUUID()}`;
    const now = new Date().toISOString();
    const stage = data.pipeline_stage || 'New';
    const qualStatus = data.qualification_status || 'Future Prospect';
    const priority = data.priority || 'Medium';

    await db.run(
      `INSERT INTO leads (
        id, customer_name, phone, email, city, budget,
        preferred_location, flat_type, interested_property, loan_required,
        purchase_timeline, purpose, assigned_to, pipeline_stage,
        qualification_status, priority, next_followup_date, notes, created_by, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        data.customer_name.trim(),
        data.phone.trim(),
        data.email?.trim() || null,
        data.city?.trim() || null,
        data.budget,
        data.preferred_location?.trim() || null,
        data.flat_type,
        data.interested_property?.trim() || null,
        data.loan_required || 0,
        data.purchase_timeline || null,
        data.purpose || null,
        data.assigned_to || user.userId,
        stage,
        qualStatus,
        priority,
        data.next_followup_date || null,
        data.notes || null,
        user.userId,
        now,
        now,
      ]
    );

    // Initial activity
    await db.run(
      `INSERT INTO lead_activities (id, lead_id, activity_type, title, description, performed_by, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        `act_${crypto.randomUUID()}`,
        id,
        'LEAD_CREATED',
        'Lead Created Directly',
        `Direct lead profile initialized for ${data.customer_name}. Flat Type: ${data.flat_type}, Budget: ₹${(
          data.budget / 100000
        ).toFixed(1)} Lakhs.`,
        user.userId,
        now,
      ]
    );

    const created = await this.getLeadById(id, user);
    return created!;
  }

  /**
   * Qualify a Lead
   */
  public static async qualifyLead(
    leadId: string,
    data: {
      qualification_status: QualificationStatus;
      budget?: number;
      loan_required?: number;
      preferred_location?: string;
      flat_type?: PropertyConfiguration;
      purchase_timeline?: PurchaseTimeline;
      purpose?: PurchasePurpose;
      remarks?: string;
    },
    user: JWTPayload
  ): Promise<Lead> {
    const existing = await this.getLeadById(leadId, user);
    if (!existing) {
      const error: any = new Error('Lead not found.');
      error.statusCode = 404;
      throw error;
    }

    const updates: string[] = ['qualification_status = ?'];
    const params: any[] = [data.qualification_status];

    if (data.budget !== undefined) {
      updates.push('budget = ?');
      params.push(data.budget);
    }
    if (data.loan_required !== undefined) {
      updates.push('loan_required = ?');
      params.push(data.loan_required);
    }
    if (data.preferred_location !== undefined) {
      updates.push('preferred_location = ?');
      params.push(data.preferred_location.trim());
    }
    if (data.flat_type !== undefined) {
      updates.push('flat_type = ?');
      params.push(data.flat_type);
    }
    if (data.purchase_timeline !== undefined) {
      updates.push('purchase_timeline = ?');
      params.push(data.purchase_timeline);
    }
    if (data.purpose !== undefined) {
      updates.push('purpose = ?');
      params.push(data.purpose);
    }

    const now = new Date().toISOString();
    updates.push('updated_at = ?');
    params.push(now);

    params.push(leadId);

    await db.run(`UPDATE leads SET ${updates.join(', ')} WHERE id = ?`, params);

    // Record activity
    await db.run(
      `INSERT INTO lead_activities (id, lead_id, activity_type, title, description, performed_by, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        `act_${crypto.randomUUID()}`,
        leadId,
        'QUALIFICATION_UPDATED',
        `Lead Qualified as: ${data.qualification_status}`,
        data.remarks ||
          `Qualification status updated to "${data.qualification_status}". Flat type: ${
            data.flat_type || existing.flat_type
          }, Timeline: ${data.purchase_timeline || existing.purchase_timeline || 'N/A'}.`,
        user.userId,
        now,
      ]
    );

    const updated = await this.getLeadById(leadId, user);
    return updated!;
  }

  /**
   * Update Lead Pipeline Stage (with backend stage change recording)
   */
  public static async updateStage(
    leadId: string,
    newStage: PipelineStage,
    remarks: string | undefined,
    user: JWTPayload
  ): Promise<Lead> {
    const existing = await this.getLeadById(leadId, user);
    if (!existing) {
      const error: any = new Error('Lead not found.');
      error.statusCode = 404;
      throw error;
    }

    if (existing.pipeline_stage === newStage) {
      return existing;
    }

    const prevStage = existing.pipeline_stage;
    const now = new Date().toISOString();

    await db.run(
      'UPDATE leads SET pipeline_stage = ?, updated_at = ? WHERE id = ?',
      [newStage, now, leadId]
    );

    // Record Activity
    await db.run(
      `INSERT INTO lead_activities (id, lead_id, activity_type, title, description, performed_by, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        `act_${crypto.randomUUID()}`,
        leadId,
        'STAGE_CHANGED',
        `Pipeline Stage: ${prevStage} → ${newStage}`,
        remarks || `Lead progression transitioned from "${prevStage}" stage to "${newStage}" stage.`,
        user.userId,
        now,
      ]
    );

    const updated = await this.getLeadById(leadId, user);
    return updated!;
  }

  /**
   * Add Follow-Up Log to Lead
   */
  public static async addFollowUp(
    leadId: string,
    data: {
      type: FollowUpType;
      followup_date: string;
      followup_time?: string | null;
      remarks: string;
      next_followup_date?: string | null;
      executive_id?: string | null;
    },
    user: JWTPayload
  ): Promise<FollowUp> {
    const lead = await this.getLeadById(leadId, user);
    if (!lead) {
      const error: any = new Error('Lead not found.');
      error.statusCode = 404;
      throw error;
    }

    const followUpId = `fol_${crypto.randomUUID()}`;
    const now = new Date().toISOString();
    const executiveId = data.executive_id || user.userId;

    await db.run(
      `INSERT INTO follow_ups (
        id, lead_id, type, followup_date, followup_time, remarks, next_followup_date, executive_id, status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        followUpId,
        leadId,
        data.type,
        data.followup_date,
        data.followup_time || null,
        data.remarks.trim(),
        data.next_followup_date || null,
        executiveId,
        'Completed',
        now,
      ]
    );

    // If next follow-up date provided, update lead's next_followup_date
    if (data.next_followup_date) {
      await db.run('UPDATE leads SET next_followup_date = ?, updated_at = ? WHERE id = ?', [
        data.next_followup_date,
        now,
        leadId,
      ]);
    }

    // Record activity in lead timeline
    await db.run(
      `INSERT INTO lead_activities (id, lead_id, activity_type, title, description, performed_by, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        `act_${crypto.randomUUID()}`,
        leadId,
        'FOLLOW_UP_LOGGED',
        `Follow-Up Recorded: ${data.type}`,
        `Follow-up on ${data.followup_date}: "${data.remarks}"${
          data.next_followup_date ? ` (Next follow-up: ${data.next_followup_date})` : ''
        }`,
        user.userId,
        now,
      ]
    );

    const followUp = await db.get<FollowUp>(
      `SELECT f.*, u.name as executive_name
       FROM follow_ups f
       LEFT JOIN users u ON f.executive_id = u.id
       WHERE f.id = ?`,
      [followUpId]
    );

    return followUp!;
  }
}
