import crypto from 'crypto';
import {
  SiteVisitModel,
  LeadModel,
  ProjectModel,
  UnitModel,
  PropertyListingModel,
  UserModel,
  LeadActivityModel,
  FollowUpModel,
} from '../models/index.js';
import {
  SiteVisit,
  SiteVisitStatus,
  SiteVisitType,
  SiteVisitOutcome,
  SiteVisitSummary,
  UserRole,
  UserStatus,
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
    const skip = (page - 1) * limit;

    const query: any = {};

    const isAdmin = user.roles.includes(UserRole.ADMIN);
    const isEmployee = user.roles.includes(UserRole.EMPLOYEE);
    const isCustomer = user.roles.includes(UserRole.CUSTOMER);

    if (isCustomer) {
      const customerLeads = await LeadModel.find({
        $or: [{ created_by: user.userId }, { email: user.email.toLowerCase() }],
      });
      const leadIds = customerLeads.map((l) => l._id);
      query.$or = [{ created_by: user.userId }, { lead_id: { $in: leadIds } }];
    } else if (!isAdmin && !isEmployee) {
      query.assigned_user_id = user.userId;
    }

    if (filters.leadId) query.lead_id = filters.leadId;
    if (filters.projectId) query.project_id = filters.projectId;
    if (filters.unitId) query.unit_id = filters.unitId;
    if (filters.assignedUserId) query.assigned_user_id = filters.assignedUserId;
    if (filters.status) query.visit_status = filters.status;

    if (filters.fromDate || filters.toDate) {
      query.visit_date = {};
      if (filters.fromDate) query.visit_date.$gte = filters.fromDate;
      if (filters.toDate) query.visit_date.$lte = filters.toDate;
    }

    const sortOrder = filters.sortOrder === 'ASC' ? 1 : -1;
    const sortField = filters.sortBy === 'customer_name' ? 'visit_date' : filters.sortBy || 'visit_date';
    const sortObj: any = { [sortField]: sortOrder, visit_time: sortOrder };

    const total = await SiteVisitModel.countDocuments(query);
    const rows = await SiteVisitModel.find(query).sort(sortObj).skip(skip).limit(limit);

    const visits: SiteVisit[] = await Promise.all(
      rows.map(async (sv) => {
        const lead = await LeadModel.findById(sv.lead_id);
        const project = sv.project_id ? await ProjectModel.findById(sv.project_id) : null;
        const unit = sv.unit_id ? await UnitModel.findById(sv.unit_id) : null;
        const assignedUser = await UserModel.findById(sv.assigned_user_id);
        const creator = sv.created_by ? await UserModel.findById(sv.created_by) : null;

        let property_code: string | null = null;
        let property_title: string | null = project?.name || null;
        let property_subtype: string | null = null;
        let property_price: number | null = null;
        let property_cover_image: string | null = null;

        const propId = sv.property_id || sv.project_id;
        if (propId) {
          const listing = await PropertyListingModel.findById(propId);
          if (listing) {
            property_code = listing.code;
            property_title = listing.title;
            property_subtype = listing.subtype;
            property_price = listing.price;
            property_cover_image = listing.cover_image || null;
          }
        }

        return {
          id: sv._id,
          lead_id: sv.lead_id,
          project_id: sv.project_id || '',
          unit_id: sv.unit_id || null,
          assigned_user_id: sv.assigned_user_id,
          visit_date: sv.visit_date,
          visit_time: sv.visit_time,
          visit_status: sv.visit_status as any,
          visit_type: sv.visit_type as any,
          remarks: sv.remarks,
          outcome: sv.outcome as any,
          created_by: sv.created_by,
          created_at: typeof sv.created_at === 'string' ? sv.created_at : sv.created_at.toISOString(),
          updated_at: typeof sv.updated_at === 'string' ? sv.updated_at : sv.updated_at.toISOString(),
          customer_name: lead?.customer_name || 'Client',
          customer_phone: lead?.phone || '',
          customer_email: lead?.email || '',
          lead_status: lead?.qualification_status,
          lead_budget: lead?.budget,
          lead_flat_type: lead?.flat_type,
          lead_pipeline_stage: lead?.pipeline_stage,
          project_name: project?.name,
          project_code: project?.code,
          project_city: project?.city,
          project_location: project?.location,
          unit_number: unit?.unit_number,
          unit_configuration: unit?.configuration,
          unit_price: unit?.price,
          unit_availability: unit?.availability_status,
          assigned_user_name: assignedUser?.name || 'Executive',
          assigned_user_email: assignedUser?.email || '',
          created_by_name: creator?.name || undefined,
          property_id: sv.property_id || undefined,
          property_code: property_code || undefined,
          property_title: property_title || undefined,
          property_subtype: property_subtype || undefined,
          property_cover_image: property_cover_image || undefined,
        };
      })
    );

    return { visits, total, page, limit };
  }

  /**
   * Fetch single visit by ID
   */
  public static async getById(id: string, user: JWTPayload): Promise<SiteVisit | null> {
    const sv = await SiteVisitModel.findById(id);
    if (!sv) return null;

    const lead = await LeadModel.findById(sv.lead_id);
    const project = sv.project_id ? await ProjectModel.findById(sv.project_id) : null;
    const unit = sv.unit_id ? await UnitModel.findById(sv.unit_id) : null;
    const assignedUser = await UserModel.findById(sv.assigned_user_id);
    const creator = sv.created_by ? await UserModel.findById(sv.created_by) : null;

    let property_code: string | null = null;
    let property_title: string | null = project?.name || null;
    let property_subtype: string | null = null;
    let property_price: number | null = null;
    let property_cover_image: string | null = null;

    const propId = sv.property_id || sv.project_id;
    if (propId) {
      const listing = await PropertyListingModel.findById(propId);
      if (listing) {
        property_code = listing.code;
        property_title = listing.title;
        property_subtype = listing.subtype;
        property_price = listing.price;
        property_cover_image = listing.cover_image || null;
      }
    }

    return {
      id: sv._id,
      lead_id: sv.lead_id,
      project_id: sv.project_id || '',
      unit_id: sv.unit_id || null,
      assigned_user_id: sv.assigned_user_id,
      visit_date: sv.visit_date,
      visit_time: sv.visit_time,
      visit_status: sv.visit_status as any,
      visit_type: sv.visit_type as any,
      remarks: sv.remarks,
      outcome: sv.outcome as any,
      created_by: sv.created_by,
      created_at: typeof sv.created_at === 'string' ? sv.created_at : sv.created_at.toISOString(),
      updated_at: typeof sv.updated_at === 'string' ? sv.updated_at : sv.updated_at.toISOString(),
      customer_name: lead?.customer_name || 'Client',
      customer_phone: lead?.phone || '',
      customer_email: lead?.email || '',
      lead_status: lead?.qualification_status,
      lead_budget: lead?.budget,
      lead_flat_type: lead?.flat_type,
      lead_pipeline_stage: lead?.pipeline_stage,
      project_name: project?.name,
      project_code: project?.code,
      project_city: project?.city,
      project_location: project?.location,
      unit_number: unit?.unit_number,
      unit_configuration: unit?.configuration,
      unit_price: unit?.price,
      unit_availability: unit?.availability_status,
      assigned_user_name: assignedUser?.name || 'Executive',
      assigned_user_email: assignedUser?.email || '',
      created_by_name: creator?.name || undefined,
      property_id: sv.property_id || undefined,
      property_code: property_code || undefined,
      property_title: property_title || undefined,
      property_subtype: property_subtype || undefined,
      property_cover_image: property_cover_image || undefined,
    };
  }

  /**
   * Schedule new site visit
   */
  public static async create(
    data: {
      lead_id?: string;
      customer_name?: string;
      phone?: string;
      email?: string;
      project_id?: string;
      unit_id?: string;
      property_id?: string;
      assigned_user_id?: string;
      visit_date: string;
      visit_time: string;
      visit_type?: SiteVisitType;
      remarks?: string;
    },
    userId?: string
  ): Promise<SiteVisit> {
    let leadId = data.lead_id;
    let customerName = data.customer_name;
    let customerPhone = data.phone;
    let customerEmail = data.email;

    if (!leadId && (!customerName || !customerPhone) && userId) {
      const userDoc = await UserModel.findById(userId);
      if (userDoc) {
        if (!customerName) customerName = userDoc.name;
        if (!customerPhone) customerPhone = userDoc.phone || '+1 555-000-0000';
        if (!customerEmail) customerEmail = userDoc.email;
      }
    }

    if (!leadId && customerName && customerPhone) {
      const newLead = await LeadModel.create({
        _id: `lead_${crypto.randomUUID()}`,
        customer_name: customerName.trim(),
        phone: customerPhone.trim(),
        email: customerEmail ? customerEmail.trim().toLowerCase() : null,
        budget: 10000000,
        flat_type: '2 BHK',
        interested_property: data.property_id || data.project_id || 'Property Inquiry',
        project_id: data.project_id || null,
        unit_id: data.unit_id || null,
        property_id: data.property_id || null,
        assigned_to: data.assigned_user_id || userId || null,
        pipeline_stage: 'Site Visit',
        qualification_status: 'Qualified',
        priority: 'High',
        created_by: userId || null,
      });
      leadId = newLead._id;
    }

    if (!leadId) {
      throw new Error('A valid lead_id or customer details (name and phone) must be provided.');
    }

    let assignedUserId = data.assigned_user_id;
    if (!assignedUserId) {
      const defaultAgent = await UserModel.findOne({ roles: UserRole.AGENT, status: UserStatus.ACTIVE });
      assignedUserId = defaultAgent?._id || userId || 'usr_agent_001';
    }

    const visitId = `sv_${crypto.randomUUID()}`;
    await SiteVisitModel.create({
      _id: visitId,
      lead_id: leadId,
      project_id: data.project_id || null,
      unit_id: data.unit_id || null,
      property_id: data.property_id || null,
      assigned_user_id: assignedUserId,
      visit_date: data.visit_date,
      visit_time: data.visit_time,
      visit_status: 'Scheduled',
      visit_type: data.visit_type || 'Direct Visit',
      remarks: data.remarks?.trim() || null,
      created_by: userId || null,
    });

    await LeadModel.findByIdAndUpdate(leadId, {
      pipeline_stage: 'Site Visit',
      next_followup_date: `${data.visit_date}T${data.visit_time}:00.000Z`,
    });

    await LeadActivityModel.create({
      _id: `act_${crypto.randomUUID()}`,
      lead_id: leadId,
      activity_type: 'STAGE_CHANGED',
      title: 'Site Visit Scheduled',
      description: `Site visit scheduled for ${data.visit_date} at ${data.visit_time}.`,
      performed_by: userId || null,
    });

    return (await this.getById(visitId, { userId: userId || '', email: '', roles: [UserRole.ADMIN] }))!;
  }

  /**
   * Update Site Visit details
   */
  public static async update(
    id: string,
    data: Partial<{
      visit_date: string;
      visit_time: string;
      assigned_user_id: string;
      project_id: string;
      unit_id: string;
      property_id: string;
      visit_type: SiteVisitType;
      remarks: string;
    }>,
    user: JWTPayload
  ): Promise<SiteVisit> {
    const sv = await SiteVisitModel.findById(id);
    if (!sv) throw new Error('Site visit not found.');

    if (data.visit_date !== undefined) sv.visit_date = data.visit_date;
    if (data.visit_time !== undefined) sv.visit_time = data.visit_time;
    if (data.assigned_user_id !== undefined) sv.assigned_user_id = data.assigned_user_id;
    if (data.project_id !== undefined) sv.project_id = data.project_id;
    if (data.unit_id !== undefined) sv.unit_id = data.unit_id;
    if (data.property_id !== undefined) sv.property_id = data.property_id;
    if (data.visit_type !== undefined) sv.visit_type = data.visit_type;
    if (data.remarks !== undefined) sv.remarks = data.remarks?.trim() || null;

    await sv.save();
    return (await this.getById(id, user))!;
  }

  /**
   * Update status / outcome of a site visit
   */
  public static async updateStatus(
    id: string,
    data: {
      visit_status: SiteVisitStatus;
      outcome?: SiteVisitOutcome;
      remarks?: string;
      rescheduled_date?: string;
      rescheduled_time?: string;
      schedule_next_follow_up?: boolean;
      next_follow_up_date?: string;
      next_follow_up_time?: string;
      next_follow_up_type?: string;
    },
    user: JWTPayload
  ): Promise<SiteVisit> {
    const sv = await SiteVisitModel.findById(id);
    if (!sv) throw new Error('Site visit not found.');

    const oldStatus = sv.visit_status;
    sv.visit_status = data.visit_status;
    if (data.outcome !== undefined) sv.outcome = data.outcome;
    if (data.remarks) sv.remarks = data.remarks;

    if (data.visit_status === 'Rescheduled' && data.rescheduled_date) {
      sv.visit_date = data.rescheduled_date;
      if (data.rescheduled_time) sv.visit_time = data.rescheduled_time;
    }

    await sv.save();

    await LeadActivityModel.create({
      _id: `act_${crypto.randomUUID()}`,
      lead_id: sv.lead_id,
      activity_type: 'STAGE_CHANGED',
      title: `Site Visit ${data.visit_status}`,
      description: `Status changed from ${oldStatus} to ${data.visit_status}.`,
      performed_by: user.userId,
    });

    if (data.schedule_next_follow_up && data.next_follow_up_date) {
      await FollowUpModel.create({
        _id: `fol_${crypto.randomUUID()}`,
        lead_id: sv.lead_id,
        site_visit_id: sv._id,
        assigned_user_id: sv.assigned_user_id,
        follow_up_type: (data.next_follow_up_type as any) || 'Phone Call',
        scheduled_date: data.next_follow_up_date,
        scheduled_time: data.next_follow_up_time || '10:00',
        remarks: `Follow-up scheduled after ${data.visit_status} site visit.`,
        status: 'Scheduled',
        created_by: user.userId,
      });
    }

    return (await this.getById(id, user))!;
  }

  /**
   * Summary metrics for site visits
   */
  public static async reschedule(
    id: string,
    data: { rescheduled_date?: string; visit_date?: string; rescheduled_time?: string; visit_time?: string; remarks?: string },
    user: JWTPayload
  ): Promise<SiteVisit> {
    return this.updateStatus(
      id,
      {
        visit_status: 'Rescheduled',
        rescheduled_date: data.rescheduled_date || data.visit_date,
        rescheduled_time: data.rescheduled_time || data.visit_time,
        remarks: data.remarks,
      },
      user
    );
  }

  public static async reassign(
    id: string,
    data: { assigned_user_id: string; remarks?: string },
    user: JWTPayload
  ): Promise<SiteVisit> {
    return this.update(id, { assigned_user_id: data.assigned_user_id, remarks: data.remarks }, user);
  }

  public static async getSummary(user: JWTPayload): Promise<SiteVisitSummary> {
    const query: any = {};
    const isAdmin = user.roles.includes(UserRole.ADMIN);
    const isEmployee = user.roles.includes(UserRole.EMPLOYEE);
    if (!isAdmin && !isEmployee) {
      query.assigned_user_id = user.userId;
    }

    const visits = await SiteVisitModel.find(query);
    const total = visits.length;
    const scheduled = visits.filter((v) => v.visit_status === 'Scheduled').length;
    const completed = visits.filter((v) => v.visit_status === 'Completed').length;
    const rescheduled = visits.filter((v) => v.visit_status === 'Rescheduled').length;
    const cancelled = visits.filter((v) => v.visit_status === 'Cancelled').length;
    const noShow = visits.filter((v) => v.visit_status === 'No Show').length;

    const todayStr = new Date().toISOString().split('T')[0];
    const todayCount = visits.filter((v) => v.visit_date === todayStr && v.visit_status === 'Scheduled').length;
    const upcomingCount = visits.filter((v) => v.visit_date > todayStr && v.visit_status === 'Scheduled').length;

    return {
      total_visits: total,
      scheduled_visits: scheduled,
      completed_visits: completed,
      rescheduled_visits: rescheduled,
      cancelled_visits: cancelled,
      no_show_visits: noShow,
      today_visits: todayCount,
      upcoming_visits: upcomingCount,
    };
  }

  public static async getTodayVisits(user: JWTPayload): Promise<SiteVisit[]> {
    const todayStr = new Date().toISOString().split('T')[0];
    const { visits } = await this.list({ fromDate: todayStr, toDate: todayStr, status: 'Scheduled' }, user);
    return visits;
  }

  public static async getExecutiveSchedule(executiveId: string, date: string): Promise<SiteVisit[]> {
    const { visits } = await this.list(
      { assignedUserId: executiveId, fromDate: date, toDate: date },
      { userId: executiveId, email: '', roles: [UserRole.ADMIN] }
    );
    return visits;
  }
}
