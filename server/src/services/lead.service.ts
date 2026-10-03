import crypto from 'crypto';
import {
  LeadModel,
  UserModel,
  ProjectModel,
  UnitModel,
  PropertyListingModel,
  LeadActivityModel,
  FollowUpModel,
  SiteVisitModel,
  EnquiryModel,
} from '../models/index.js';
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
    const skip = (page - 1) * limit;

    const query: any = {};

    const isAdmin = user.roles.includes(UserRole.ADMIN);
    const isEmployee = user.roles.includes(UserRole.EMPLOYEE);

    if (!isAdmin && !isEmployee) {
      query.assigned_to = user.userId;
    }

    if (filters.search && filters.search.trim()) {
      const regex = new RegExp(filters.search.trim(), 'i');
      query.$or = [
        { customer_name: regex },
        { phone: regex },
        { email: regex },
        { city: regex },
        { interested_property: regex },
        { preferred_location: regex },
      ];
    }

    if (filters.stage) query.pipeline_stage = filters.stage;
    if (filters.qualification_status) query.qualification_status = filters.qualification_status;
    if (filters.flat_type) query.flat_type = filters.flat_type;
    if (filters.assigned_to) query.assigned_to = filters.assigned_to;
    if (filters.priority) query.priority = filters.priority;
    if (filters.loan_required !== undefined) query.loan_required = filters.loan_required;

    if (filters.minBudget !== undefined || filters.maxBudget !== undefined) {
      query.budget = {};
      if (filters.minBudget !== undefined) query.budget.$gte = filters.minBudget;
      if (filters.maxBudget !== undefined) query.budget.$lte = filters.maxBudget;
    }

    const sortOrder = filters.sortOrder === 'ASC' ? 1 : -1;
    const sortField = filters.sortBy || 'created_at';
    const sortObj: any = { [sortField]: sortOrder };

    const total = await LeadModel.countDocuments(query);
    const rows = await LeadModel.find(query).sort(sortObj).skip(skip).limit(limit);

    const leads: Lead[] = await Promise.all(
      rows.map(async (l) => {
        let assigned_name: string | null = null;
        let assigned_email: string | null = null;
        if (l.assigned_to) {
          const assignedUser = await UserModel.findById(l.assigned_to);
          assigned_name = assignedUser?.name || null;
          assigned_email = assignedUser?.email || null;
        }

        let created_by_name: string | null = null;
        if (l.created_by) {
          const creator = await UserModel.findById(l.created_by);
          created_by_name = creator?.name || null;
        }

        let project_name: string | null = null;
        if (l.project_id) {
          const project = await ProjectModel.findById(l.project_id);
          project_name = project?.name || null;
        }

        let unit_number: string | null = null;
        if (l.unit_id) {
          const unit = await UnitModel.findById(l.unit_id);
          unit_number = unit?.unit_number || null;
        }

        let property_code: string | null = null;
        let property_title: string | null = l.interested_property || null;
        let property_subtype: string | null = null;
        let property_price: number | null = null;
        let property_cover_image: string | null = null;

        if (l.property_id) {
          const listing = await PropertyListingModel.findById(l.property_id);
          if (listing) {
            property_code = listing.code;
            property_title = listing.title;
            property_subtype = listing.subtype;
            property_price = listing.price;
            property_cover_image = listing.cover_image || null;
          }
        }

        return {
          id: l._id,
          enquiry_id: l.enquiry_id,
          customer_name: l.customer_name,
          phone: l.phone,
          email: l.email,
          city: l.city,
          budget: l.budget,
          preferred_location: l.preferred_location,
          flat_type: l.flat_type as any,
          interested_property: l.interested_property,
          project_id: l.project_id,
          unit_id: l.unit_id,
          property_id: l.property_id,
          loan_required: l.loan_required,
          purchase_timeline: l.purchase_timeline as any,
          purpose: l.purpose as any,
          assigned_to: l.assigned_to,
          pipeline_stage: l.pipeline_stage as any,
          qualification_status: l.qualification_status as any,
          priority: l.priority as any,
          next_followup_date: typeof l.next_followup_date === 'string' ? l.next_followup_date : (l.next_followup_date as any)?.toISOString(),
          notes: l.notes,
          created_by: l.created_by,
          created_at: typeof l.created_at === 'string' ? l.created_at : l.created_at.toISOString(),
          updated_at: typeof l.updated_at === 'string' ? l.updated_at : l.updated_at.toISOString(),
          assigned_name: assigned_name || undefined,
          assigned_email: assigned_email || undefined,
          created_by_name: created_by_name || undefined,
          project_name: project_name || undefined,
          unit_number: unit_number || undefined,
          property_code: property_code || undefined,
          property_title: property_title || undefined,
          property_subtype: property_subtype || undefined,
          property_price: property_price !== null ? property_price : undefined,
          property_cover_image: property_cover_image || undefined,
        };
      })
    );

    return { leads, total, page, limit };
  }

  /**
   * Fetch Kanban Pipeline Board Grouped by Stages
   */
  public static async getPipelineBoard(filters: LeadFilters, user: JWTPayload): Promise<PipelineStageSummary[]> {
    const stages: PipelineStage[] = [
      'New',
      'Contacted',
      'Follow-up',
      'Site Visit',
      'Negotiation',
      'Converted',
      'Lost',
    ];

    const { leads } = await this.getLeads({ ...filters, limit: 500 }, user);

    return stages.map((stage) => {
      const stageLeads = leads.filter((l) => l.pipeline_stage === stage);
      const totalValue = stageLeads.reduce((acc, l) => acc + (l.budget || 0), 0);
      return {
        stage,
        count: stageLeads.length,
        totalValue,
        leads: stageLeads,
      };
    });
  }

  /**
   * Fetch single lead with Customer 360 Timeline Details
   */
  public static async getLeadById(id: string, user: JWTPayload): Promise<any | null> {
    const l = await LeadModel.findById(id);
    if (!l) return null;

    const isAdmin = user.roles.includes(UserRole.ADMIN);
    const isEmployee = user.roles.includes(UserRole.EMPLOYEE);

    if (!isAdmin && !isEmployee && l.assigned_to !== user.userId) {
      return null;
    }

    let assigned_name: string | null = null;
    let assigned_email: string | null = null;
    if (l.assigned_to) {
      const assignedUser = await UserModel.findById(l.assigned_to);
      assigned_name = assignedUser?.name || null;
      assigned_email = assignedUser?.email || null;
    }

    let created_by_name: string | null = null;
    if (l.created_by) {
      const creator = await UserModel.findById(l.created_by);
      created_by_name = creator?.name || null;
    }

    let project_name: string | null = null;
    if (l.project_id) {
      const project = await ProjectModel.findById(l.project_id);
      project_name = project?.name || null;
    }

    let unit_number: string | null = null;
    if (l.unit_id) {
      const unit = await UnitModel.findById(l.unit_id);
      unit_number = unit?.unit_number || null;
    }

    let property_code: string | null = null;
    let property_title: string | null = l.interested_property || null;
    let property_subtype: string | null = null;
    let property_price: number | null = null;
    let property_cover_image: string | null = null;

    if (l.property_id) {
      const listing = await PropertyListingModel.findById(l.property_id);
      if (listing) {
        property_code = listing.code;
        property_title = listing.title;
        property_subtype = listing.subtype;
        property_price = listing.price;
        property_cover_image = listing.cover_image || null;
      }
    }

    // Fetch activities, follow-ups, and site visits for 360 View
    const activities = await LeadActivityModel.find({ lead_id: id }).sort({ created_at: -1 });
    const activitiesWithPerformer = await Promise.all(
      activities.map(async (act) => {
        let performer_name: string | null = null;
        if (act.performed_by) {
          const p = await UserModel.findById(act.performed_by);
          performer_name = p?.name || null;
        }
        return {
          id: act._id,
          lead_id: act.lead_id,
          activity_type: act.activity_type,
          title: act.title,
          description: act.description,
          performed_by: act.performed_by,
          performer_name,
          metadata: act.metadata,
          created_at: typeof act.created_at === 'string' ? act.created_at : act.created_at.toISOString(),
        };
      })
    );

    const followUps = await FollowUpModel.find({ lead_id: id }).sort({ scheduled_date: -1 });
    const siteVisits = await SiteVisitModel.find({ lead_id: id }).sort({ visit_date: -1 });

    return {
      id: l._id,
      enquiry_id: l.enquiry_id,
      customer_name: l.customer_name,
      phone: l.phone,
      email: l.email,
      city: l.city,
      budget: l.budget,
      preferred_location: l.preferred_location,
      flat_type: l.flat_type as any,
      interested_property: l.interested_property,
      project_id: l.project_id,
      unit_id: l.unit_id,
      property_id: l.property_id,
      loan_required: l.loan_required,
      purchase_timeline: l.purchase_timeline as any,
      purpose: l.purpose as any,
      assigned_to: l.assigned_to,
      pipeline_stage: l.pipeline_stage as any,
      qualification_status: l.qualification_status as any,
      priority: l.priority as any,
      next_followup_date: typeof l.next_followup_date === 'string' ? l.next_followup_date : (l.next_followup_date as any)?.toISOString(),
      notes: l.notes,
      created_by: l.created_by,
      created_at: typeof l.created_at === 'string' ? l.created_at : l.created_at.toISOString(),
      updated_at: typeof l.updated_at === 'string' ? l.updated_at : l.updated_at.toISOString(),
      assigned_name,
      assigned_email,
      created_by_name,
      project_name,
      unit_number,
      property_code,
      property_title,
      property_subtype,
      property_price,
      property_cover_image,
      activities: activitiesWithPerformer,
      follow_ups: followUps.map((f) => ({
        id: f._id,
        lead_id: f.lead_id,
        site_visit_id: f.site_visit_id,
        assigned_user_id: f.assigned_user_id,
        follow_up_type: f.follow_up_type,
        scheduled_date: f.scheduled_date,
        scheduled_time: f.scheduled_time,
        remarks: f.remarks,
        status: f.status,
        outcome: f.outcome,
        next_follow_up_date: f.next_follow_up_date,
        created_at: typeof f.created_at === 'string' ? f.created_at : f.created_at.toISOString(),
      })),
      site_visits: siteVisits.map((s) => ({
        id: s._id,
        lead_id: s.lead_id,
        project_id: s.project_id,
        unit_id: s.unit_id,
        property_id: s.property_id,
        assigned_user_id: s.assigned_user_id,
        visit_date: s.visit_date,
        visit_time: s.visit_time,
        visit_status: s.visit_status,
        visit_type: s.visit_type,
        remarks: s.remarks,
        outcome: s.outcome,
        created_at: typeof s.created_at === 'string' ? s.created_at : s.created_at.toISOString(),
      })),
      properties: [],
    };
  }

  /**
   * Create new Lead directly
   */
  public static async createLead(
    data: {
      customer_name: string;
      phone: string;
      email?: string;
      city?: string;
      budget: number;
      preferred_location?: string;
      flat_type: PropertyConfiguration;
      interested_property?: string;
      project_id?: string;
      unit_id?: string;
      property_id?: string;
      loan_required?: number;
      purchase_timeline?: PurchaseTimeline;
      purpose?: PurchasePurpose;
      assigned_to?: string;
      pipeline_stage?: PipelineStage;
      qualification_status?: QualificationStatus;
      priority?: LeadPriority;
      next_followup_date?: string;
      notes?: string;
    },
    userId?: string
  ): Promise<Lead> {
    const leadId = `lead_${crypto.randomUUID()}`;

    await LeadModel.create({
      _id: leadId,
      customer_name: data.customer_name.trim(),
      phone: data.phone.trim(),
      email: data.email ? data.email.trim().toLowerCase() : null,
      city: data.city ? data.city.trim() : null,
      budget: data.budget,
      preferred_location: data.preferred_location?.trim() || null,
      flat_type: data.flat_type,
      interested_property: data.interested_property?.trim() || null,
      project_id: data.project_id || null,
      unit_id: data.unit_id || null,
      property_id: data.property_id || null,
      loan_required: data.loan_required || 0,
      purchase_timeline: data.purchase_timeline || '1-3 Months',
      purpose: data.purpose || 'Self Use',
      assigned_to: data.assigned_to || null,
      pipeline_stage: data.pipeline_stage || 'New',
      qualification_status: data.qualification_status || 'Future Prospect',
      priority: data.priority || 'Medium',
      next_followup_date: data.next_followup_date || null,
      notes: data.notes?.trim() || null,
      created_by: userId || null,
    });

    await LeadActivityModel.create({
      _id: `act_${crypto.randomUUID()}`,
      lead_id: leadId,
      activity_type: 'LEAD_CREATED',
      title: 'Lead Profile Created',
      description: `Lead created for ${data.customer_name} with budget ₹${(data.budget / 100000).toFixed(1)} L.`,
      performed_by: userId || null,
    });

    return (await this.getLeadById(leadId, { userId: userId || '', email: '', roles: [UserRole.ADMIN] }))!;
  }

  /**
   * Update lead details
   */
  public static async updateLead(
    id: string,
    data: Partial<{
      customer_name: string;
      phone: string;
      email: string;
      city: string;
      budget: number;
      preferred_location: string;
      flat_type: PropertyConfiguration;
      interested_property: string;
      project_id: string;
      unit_id: string;
      property_id: string;
      loan_required: number;
      purchase_timeline: PurchaseTimeline;
      purpose: PurchasePurpose;
      assigned_to: string;
      pipeline_stage: PipelineStage;
      qualification_status: QualificationStatus;
      priority: LeadPriority;
      next_followup_date: string;
      notes: string;
    }>,
    user: JWTPayload
  ): Promise<Lead> {
    const lead = await LeadModel.findById(id);
    if (!lead) {
      const error: any = new Error('Lead not found.');
      error.statusCode = 404;
      throw error;
    }

    if (data.customer_name !== undefined) lead.customer_name = data.customer_name.trim();
    if (data.phone !== undefined) lead.phone = data.phone.trim();
    if (data.email !== undefined) lead.email = data.email.trim().toLowerCase();
    if (data.city !== undefined) lead.city = data.city.trim();
    if (data.budget !== undefined) lead.budget = data.budget;
    if (data.preferred_location !== undefined) lead.preferred_location = data.preferred_location?.trim() || null;
    if (data.flat_type !== undefined) lead.flat_type = data.flat_type;
    if (data.interested_property !== undefined) lead.interested_property = data.interested_property?.trim() || null;
    if (data.project_id !== undefined) lead.project_id = data.project_id;
    if (data.unit_id !== undefined) lead.unit_id = data.unit_id;
    if (data.property_id !== undefined) lead.property_id = data.property_id;
    if (data.loan_required !== undefined) lead.loan_required = data.loan_required;
    if (data.purchase_timeline !== undefined) lead.purchase_timeline = data.purchase_timeline;
    if (data.purpose !== undefined) lead.purpose = data.purpose;
    if (data.assigned_to !== undefined) lead.assigned_to = data.assigned_to;
    if (data.pipeline_stage !== undefined) lead.pipeline_stage = data.pipeline_stage;
    if (data.qualification_status !== undefined) lead.qualification_status = data.qualification_status;
    if (data.priority !== undefined) lead.priority = data.priority;
    if (data.next_followup_date !== undefined) lead.next_followup_date = data.next_followup_date;
    if (data.notes !== undefined) lead.notes = data.notes?.trim() || null;

    await lead.save();
    return (await this.getLeadById(id, user))!;
  }

  /**
   * Update Pipeline Stage
   */
  public static async updatePipelineStage(id: string, stage: PipelineStage, userId?: string): Promise<Lead> {
    const lead = await LeadModel.findById(id);
    if (!lead) {
      const error: any = new Error('Lead not found.');
      error.statusCode = 404;
      throw error;
    }

    const oldStage = lead.pipeline_stage;
    lead.pipeline_stage = stage;
    await lead.save();

    await LeadActivityModel.create({
      _id: `act_${crypto.randomUUID()}`,
      lead_id: id,
      activity_type: 'STAGE_CHANGED',
      title: `Stage Advanced to ${stage}`,
      description: `Pipeline stage changed from ${oldStage} to ${stage}.`,
      performed_by: userId || null,
    });

    return (await this.getLeadById(id, { userId: userId || '', email: '', roles: [UserRole.ADMIN] }))!;
  }

  /**
   * Assign lead to executive
   */
  public static async assignLead(id: string, assignedTo: string | null, userId?: string): Promise<Lead> {
    const lead = await LeadModel.findById(id);
    if (!lead) {
      const error: any = new Error('Lead not found.');
      error.statusCode = 404;
      throw error;
    }

    lead.assigned_to = assignedTo;
    await lead.save();

    let executiveName = 'Unassigned';
    if (assignedTo) {
      const exec = await UserModel.findById(assignedTo);
      executiveName = exec?.name || 'Executive';
    }

    await LeadActivityModel.create({
      _id: `act_${crypto.randomUUID()}`,
      lead_id: id,
      activity_type: 'EXECUTIVE_ASSIGNED',
      title: 'Lead Reassigned',
      description: `Lead assigned to ${executiveName}.`,
      performed_by: userId || null,
    });

    return (await this.getLeadById(id, { userId: userId || '', email: '', roles: [UserRole.ADMIN] }))!;
  }

  /**
   * Delete lead
   */
  public static async deleteLead(id: string): Promise<boolean> {
    const res = await LeadModel.findByIdAndDelete(id);
    if (res) {
      await LeadActivityModel.deleteMany({ lead_id: id });
      await FollowUpModel.deleteMany({ lead_id: id });
      await SiteVisitModel.deleteMany({ lead_id: id });
      return true;
    }
    return false;
  }

  /**
   * Pipeline dashboard metrics
   */
  public static async getLeadTimeline(leadId: string, user: JWTPayload): Promise<LeadActivity[]> {
    return this.getLeadActivities(leadId);
  }

  public static async qualifyLead(
    id: string,
    data: { qualification_status: QualificationStatus; remarks?: string; budget?: number; purchase_timeline?: PurchaseTimeline },
    user: JWTPayload
  ): Promise<Lead> {
    const lead = await LeadModel.findById(id);
    if (!lead) throw new Error('Lead not found.');

    lead.qualification_status = data.qualification_status;
    if (data.budget !== undefined) lead.budget = data.budget;
    if (data.purchase_timeline !== undefined) lead.purchase_timeline = data.purchase_timeline;
    await lead.save();

    await LeadActivityModel.create({
      _id: `act_${crypto.randomUUID()}`,
      lead_id: id,
      activity_type: 'QUALIFICATION_UPDATED',
      title: `Qualification Updated to ${data.qualification_status}`,
      description: data.remarks || `Status updated to ${data.qualification_status}.`,
      performed_by: user.userId,
    });

    return (await this.getLeadById(id, user))!;
  }

  public static async updateStage(
    id: string,
    stage: PipelineStage,
    remarks?: string,
    user?: JWTPayload
  ): Promise<Lead> {
    return this.updatePipelineStage(id, stage, user?.userId);
  }

  public static async addFollowUp(
    leadId: string,
    data: any,
    user: JWTPayload
  ): Promise<FollowUp> {
    return this.createFollowUp(leadId, data, user.userId);
  }

  public static async getLeadStats(user: JWTPayload): Promise<{
    totalLeads: number;
    pipelineValue: number;
    convertedCount: number;
    conversionRate: number;
    stageDistribution: Record<string, number>;
  }> {
    const query: any = {};
    const isAdmin = user.roles.includes(UserRole.ADMIN);
    const isEmployee = user.roles.includes(UserRole.EMPLOYEE);
    if (!isAdmin && !isEmployee) {
      query.assigned_to = user.userId;
    }

    const leads = await LeadModel.find(query);
    const totalLeads = leads.length;
    const pipelineValue = leads.reduce((acc, l) => acc + (l.budget || 0), 0);
    const convertedCount = leads.filter((l) => l.pipeline_stage === 'Converted').length;
    const conversionRate = totalLeads > 0 ? Number(((convertedCount / totalLeads) * 100).toFixed(1)) : 0;

    const stageDistribution: Record<string, number> = {};
    for (const l of leads) {
      stageDistribution[l.pipeline_stage] = (stageDistribution[l.pipeline_stage] || 0) + 1;
    }

    return { totalLeads, pipelineValue, convertedCount, conversionRate, stageDistribution };
  }

  /**
   * Timeline Activities
   */
  public static async getLeadActivities(leadId: string): Promise<LeadActivity[]> {
    const rows = await LeadActivityModel.find({ lead_id: leadId }).sort({ created_at: -1 });
    return Promise.all(
      rows.map(async (act) => {
        let performer_name: string | null = null;
        if (act.performed_by) {
          const u = await UserModel.findById(act.performed_by);
          performer_name = u?.name || null;
        }
        return {
          id: act._id,
          lead_id: act.lead_id,
          activity_type: act.activity_type as any,
          title: act.title,
          description: act.description,
          performed_by: act.performed_by,
          performer_name,
          metadata: act.metadata,
          created_at: typeof act.created_at === 'string' ? act.created_at : act.created_at.toISOString(),
        };
      })
    );
  }

  public static async createActivity(
    leadId: string,
    data: { activity_type: string; title: string; description?: string; metadata?: any },
    userId?: string
  ): Promise<LeadActivity> {
    const actId = `act_${crypto.randomUUID()}`;
    const doc: any = await LeadActivityModel.create({
      _id: actId,
      lead_id: leadId,
      activity_type: data.activity_type as any,
      title: data.title,
      description: data.description || null,
      metadata: data.metadata || null,
      performed_by: userId || null,
    });

    let performer_name: string | null = null;
    if (userId) {
      const u = await UserModel.findById(userId);
      performer_name = u?.name || null;
    }

    return {
      id: doc._id,
      lead_id: doc.lead_id,
      activity_type: doc.activity_type as any,
      title: doc.title,
      description: doc.description,
      performed_by: doc.performed_by,
      performer_name,
      metadata: doc.metadata,
      created_at: typeof doc.created_at === 'string' ? doc.created_at : doc.created_at.toISOString(),
    };
  }

  /**
   * Follow-ups for a lead
   */
  public static async getLeadFollowUps(leadId: string): Promise<FollowUp[]> {
    const rows = await FollowUpModel.find({ lead_id: leadId }).sort({ scheduled_date: -1 });
    return rows.map((f) => ({
      id: f._id,
      lead_id: f.lead_id,
      type: f.follow_up_type,
      followup_date: f.scheduled_date,
      followup_time: f.scheduled_time || '',
      remarks: f.remarks,
      next_followup_date: f.next_follow_up_date || null,
      executive_id: f.assigned_user_id,
      status: f.status as any,
      created_at: typeof f.created_at === 'string' ? f.created_at : f.created_at.toISOString(),
    }));
  }

  public static async createFollowUp(
    leadId: string,
    data: {
      type: FollowUpType;
      followup_date: string;
      followup_time?: string;
      remarks: string;
      next_followup_date?: string;
      executive_id?: string;
      status?: string;
    },
    userId?: string
  ): Promise<FollowUp> {
    const folId = `fol_${crypto.randomUUID()}`;
    const doc = await FollowUpModel.create({
      _id: folId,
      lead_id: leadId,
      assigned_user_id: data.executive_id || userId || '',
      follow_up_type: data.type,
      scheduled_date: data.followup_date,
      scheduled_time: data.followup_time || null,
      remarks: data.remarks,
      status: (data.status as any) || 'Completed',
      next_follow_up_date: data.next_followup_date || null,
      created_by: userId || null,
    });

    if (data.next_followup_date) {
      await LeadModel.findByIdAndUpdate(leadId, { next_followup_date: data.next_followup_date });
    }

    await LeadActivityModel.create({
      _id: `act_${crypto.randomUUID()}`,
      lead_id: leadId,
      activity_type: 'FOLLOW_UP_LOGGED',
      title: `${data.type} Logged`,
      description: data.remarks,
      performed_by: userId || null,
    });

    return {
      id: doc._id,
      lead_id: doc.lead_id,
      type: doc.follow_up_type,
      followup_date: doc.scheduled_date,
      followup_time: doc.scheduled_time || '',
      remarks: doc.remarks,
      next_followup_date: doc.next_follow_up_date || null,
      executive_id: doc.assigned_user_id,
      status: doc.status as any,
      created_at: typeof doc.created_at === 'string' ? doc.created_at : doc.created_at.toISOString(),
    };
  }

  public static async updateFollowUp(
    id: string,
    data: Partial<{
      type: FollowUpType;
      followup_date: string;
      followup_time: string;
      remarks: string;
      next_followup_date: string;
      status: string;
    }>
  ): Promise<FollowUp> {
    const fol = await FollowUpModel.findById(id);
    if (!fol) throw new Error('Follow-up not found.');

    if (data.type !== undefined) fol.follow_up_type = data.type;
    if (data.followup_date !== undefined) fol.scheduled_date = data.followup_date;
    if (data.followup_time !== undefined) fol.scheduled_time = data.followup_time;
    if (data.remarks !== undefined) fol.remarks = data.remarks;
    if (data.next_followup_date !== undefined) fol.next_follow_up_date = data.next_followup_date;
    if (data.status !== undefined) fol.status = data.status as any;

    await fol.save();

    return {
      id: fol._id,
      lead_id: fol.lead_id,
      type: fol.follow_up_type,
      followup_date: fol.scheduled_date,
      followup_time: fol.scheduled_time || '',
      remarks: fol.remarks,
      next_followup_date: fol.next_follow_up_date || null,
      executive_id: fol.assigned_user_id,
      status: fol.status as any,
      created_at: typeof fol.created_at === 'string' ? fol.created_at : fol.created_at.toISOString(),
    };
  }
}
