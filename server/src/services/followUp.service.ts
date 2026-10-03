import crypto from 'crypto';
import {
  FollowUpModel,
  LeadModel,
  UserModel,
  LeadActivityModel,
  SiteVisitModel,
  ProjectModel,
} from '../models/index.js';
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
    const skip = (page - 1) * limit;

    const query: any = {};

    const isAdmin = user.roles.includes(UserRole.ADMIN);
    const isEmployee = user.roles.includes(UserRole.EMPLOYEE);

    if (!isAdmin && !isEmployee) {
      query.assigned_user_id = user.userId;
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const nowTimeStr = new Date().toTimeString().split(' ')[0].substring(0, 5);

    if (filters.view === 'today') {
      query.scheduled_date = todayStr;
    } else if (filters.view === 'upcoming') {
      query.scheduled_date = { $gt: todayStr };
      query.status = 'Scheduled';
    } else if (filters.view === 'overdue') {
      query.$or = [
        { scheduled_date: { $lt: todayStr }, status: 'Scheduled' },
        { scheduled_date: todayStr, scheduled_time: { $lt: nowTimeStr }, status: 'Scheduled' },
      ];
    } else if (filters.view === 'completed') {
      query.status = 'Completed';
    }

    if (filters.leadId) query.lead_id = filters.leadId;
    if (filters.assignedUserId) query.assigned_user_id = filters.assignedUserId;
    if (filters.type) query.follow_up_type = filters.type;
    if (filters.status && !filters.view) query.status = filters.status;

    if (filters.fromDate || filters.toDate) {
      if (!query.scheduled_date || typeof query.scheduled_date === 'string') query.scheduled_date = {};
      if (filters.fromDate) query.scheduled_date.$gte = filters.fromDate;
      if (filters.toDate) query.scheduled_date.$lte = filters.toDate;
    }

    const sortOrder = filters.sortOrder === 'ASC' ? 1 : -1;
    const sortField = filters.sortBy || 'scheduled_date';
    const sortObj: any = { [sortField]: sortOrder, scheduled_time: sortOrder };

    const total = await FollowUpModel.countDocuments(query);
    const rows = await FollowUpModel.find(query).sort(sortObj).skip(skip).limit(limit);

    const followUps: FollowUpItem[] = await Promise.all(
      rows.map(async (f) => {
        const lead = await LeadModel.findById(f.lead_id);
        const assignedUser = await UserModel.findById(f.assigned_user_id);
        const creator = f.created_by ? await UserModel.findById(f.created_by) : null;
        let projectName: string | null = null;
        if (lead?.project_id) {
          const p = await ProjectModel.findById(lead.project_id);
          projectName = p?.name || null;
        }

        return {
          id: f._id,
          lead_id: f.lead_id,
          site_visit_id: f.site_visit_id,
          assigned_user_id: f.assigned_user_id,
          follow_up_type: f.follow_up_type,
          scheduled_date: f.scheduled_date,
          scheduled_time: f.scheduled_time || null,
          remarks: f.remarks,
          status: f.status,
          outcome: f.outcome || null,
          next_follow_up_date: f.next_follow_up_date || null,
          created_by: f.created_by || null,
          created_at: typeof f.created_at === 'string' ? f.created_at : f.created_at.toISOString(),
          updated_at: typeof f.updated_at === 'string' ? f.updated_at : f.updated_at.toISOString(),
          customer_name: lead?.customer_name || 'Client',
          customer_phone: lead?.phone || '',
          customer_email: lead?.email || '',
          assigned_user_name: assignedUser?.name || 'Executive',
          created_by_name: creator?.name || undefined,
          project_name: projectName || undefined,
        };
      })
    );

    return { followUps, total, page, limit };
  }

  /**
   * Fetch single follow-up by ID
   */
  public static async getById(id: string, user: JWTPayload): Promise<FollowUpItem | null> {
    const f = await FollowUpModel.findById(id);
    if (!f) return null;

    const lead = await LeadModel.findById(f.lead_id);
    const assignedUser = await UserModel.findById(f.assigned_user_id);
    const creator = f.created_by ? await UserModel.findById(f.created_by) : null;

    return {
      id: f._id,
      lead_id: f.lead_id,
      site_visit_id: f.site_visit_id,
      assigned_user_id: f.assigned_user_id,
      follow_up_type: f.follow_up_type,
      scheduled_date: f.scheduled_date,
      scheduled_time: f.scheduled_time || null,
      remarks: f.remarks,
      status: f.status,
      outcome: f.outcome || null,
      next_follow_up_date: f.next_follow_up_date || null,
      created_by: f.created_by || null,
      created_at: typeof f.created_at === 'string' ? f.created_at : f.created_at.toISOString(),
      updated_at: typeof f.updated_at === 'string' ? f.updated_at : f.updated_at.toISOString(),
      customer_name: lead?.customer_name || 'Client',
      customer_phone: lead?.phone || '',
      customer_email: lead?.email || '',
      assigned_user_name: assignedUser?.name || 'Executive',
      created_by_name: creator?.name || undefined,
    };
  }

  /**
   * Create new follow-up
   */
  public static async create(
    data: {
      lead_id: string;
      site_visit_id?: string;
      assigned_user_id?: string;
      follow_up_type: FollowUpType;
      scheduled_date: string;
      scheduled_time?: string;
      remarks: string;
    },
    userId?: string
  ): Promise<FollowUpItem> {
    const folId = `fol_${crypto.randomUUID()}`;
    await FollowUpModel.create({
      _id: folId,
      lead_id: data.lead_id,
      site_visit_id: data.site_visit_id || null,
      assigned_user_id: data.assigned_user_id || userId || '',
      follow_up_type: data.follow_up_type,
      scheduled_date: data.scheduled_date,
      scheduled_time: data.scheduled_time || null,
      remarks: data.remarks.trim(),
      status: 'Scheduled',
      created_by: userId || null,
    });

    await LeadModel.findByIdAndUpdate(data.lead_id, {
      next_followup_date: `${data.scheduled_date}T${data.scheduled_time || '10:00'}:00.000Z`,
    });

    await LeadActivityModel.create({
      _id: `act_${crypto.randomUUID()}`,
      lead_id: data.lead_id,
      activity_type: 'FOLLOW_UP_LOGGED',
      title: `${data.follow_up_type} Scheduled`,
      description: data.remarks,
      performed_by: userId || null,
    });

    return (await this.getById(folId, { userId: userId || '', email: '', roles: [UserRole.ADMIN] }))!;
  }

  /**
   * Mark follow-up as completed and optionally schedule next follow-up
   */
  public static async complete(
    id: string,
    data: {
      outcome: string;
      remarks?: string;
      next_follow_up_date?: string;
      next_follow_up_time?: string;
      next_follow_up_type?: FollowUpType;
    },
    user: JWTPayload
  ): Promise<FollowUpItem> {
    const fol = await FollowUpModel.findById(id);
    if (!fol) throw new Error('Follow-up not found.');

    fol.status = 'Completed';
    fol.outcome = data.outcome;
    if (data.remarks) fol.remarks = data.remarks;
    if (data.next_follow_up_date) fol.next_follow_up_date = data.next_follow_up_date;

    await fol.save();

    await LeadActivityModel.create({
      _id: `act_${crypto.randomUUID()}`,
      lead_id: fol.lead_id,
      activity_type: 'FOLLOW_UP_LOGGED',
      title: `${fol.follow_up_type} Completed`,
      description: `Outcome: ${data.outcome}${data.remarks ? ` - ${data.remarks}` : ''}`,
      performed_by: user.userId,
    });

    if (data.next_follow_up_date) {
      await LeadModel.findByIdAndUpdate(fol.lead_id, {
        next_followup_date: `${data.next_follow_up_date}T${data.next_follow_up_time || '10:00'}:00.000Z`,
      });

      await FollowUpModel.create({
        _id: `fol_${crypto.randomUUID()}`,
        lead_id: fol.lead_id,
        assigned_user_id: fol.assigned_user_id,
        follow_up_type: data.next_follow_up_type || fol.follow_up_type,
        scheduled_date: data.next_follow_up_date,
        scheduled_time: data.next_follow_up_time || '10:00',
        remarks: 'Next sequential follow-up conversation.',
        status: 'Scheduled',
        created_by: user.userId,
      });
    }

    return (await this.getById(id, user))!;
  }

  /**
   * Reschedule a follow-up
   */
  public static async reschedule(
    id: string,
    data: { scheduled_date: string; scheduled_time?: string; remarks?: string },
    user: JWTPayload
  ): Promise<FollowUpItem> {
    const fol = await FollowUpModel.findById(id);
    if (!fol) throw new Error('Follow-up not found.');

    fol.scheduled_date = data.scheduled_date;
    if (data.scheduled_time) fol.scheduled_time = data.scheduled_time;
    if (data.remarks) fol.remarks = data.remarks;
    fol.status = 'Scheduled';

    await fol.save();

    await LeadModel.findByIdAndUpdate(fol.lead_id, {
      next_followup_date: `${data.scheduled_date}T${data.scheduled_time || '10:00'}:00.000Z`,
    });

    return (await this.getById(id, user))!;
  }

  /**
   * Dashboard Summary counts
   */
  public static async update(
    id: string,
    data: Partial<{
      follow_up_type: FollowUpType;
      scheduled_date: string;
      scheduled_time: string;
      remarks: string;
      status: FollowUpStatus;
      outcome: string;
      next_follow_up_date: string;
      assigned_user_id: string;
    }>,
    user: JWTPayload
  ): Promise<FollowUpItem> {
    const fol = await FollowUpModel.findById(id);
    if (!fol) throw new Error('Follow-up not found.');

    if (data.follow_up_type !== undefined) fol.follow_up_type = data.follow_up_type;
    if (data.scheduled_date !== undefined) fol.scheduled_date = data.scheduled_date;
    if (data.scheduled_time !== undefined) fol.scheduled_time = data.scheduled_time;
    if (data.remarks !== undefined) fol.remarks = data.remarks;
    if (data.status !== undefined) fol.status = data.status;
    if (data.outcome !== undefined) fol.outcome = data.outcome;
    if (data.next_follow_up_date !== undefined) fol.next_follow_up_date = data.next_follow_up_date;
    if (data.assigned_user_id !== undefined) fol.assigned_user_id = data.assigned_user_id;

    await fol.save();
    return (await this.getById(id, user))!;
  }

  public static async cancel(id: string, remarks?: string, user?: JWTPayload): Promise<FollowUpItem> {
    const fol = await FollowUpModel.findById(id);
    if (!fol) throw new Error('Follow-up not found.');

    fol.status = 'Cancelled';
    if (remarks) fol.remarks = `${fol.remarks} [Cancelled: ${remarks}]`;
    await fol.save();

    return (await this.getById(id, user || { userId: '', email: '', roles: [UserRole.ADMIN] }))!;
  }

  public static async getSummary(user: JWTPayload): Promise<FollowUpSummary> {
    const query: any = {};
    const isAdmin = user.roles.includes(UserRole.ADMIN);
    const isEmployee = user.roles.includes(UserRole.EMPLOYEE);
    if (!isAdmin && !isEmployee) {
      query.assigned_user_id = user.userId;
    }

    const rows = await FollowUpModel.find(query);
    const todayStr = new Date().toISOString().split('T')[0];
    const nowTimeStr = new Date().toTimeString().split(' ')[0].substring(0, 5);

    const todayCount = rows.filter((f) => f.scheduled_date === todayStr && f.status === 'Scheduled').length;
    const upcomingCount = rows.filter((f) => f.scheduled_date > todayStr && f.status === 'Scheduled').length;
    const overdueCount = rows.filter(
      (f) =>
        f.status === 'Scheduled' &&
        (f.scheduled_date < todayStr || (f.scheduled_date === todayStr && f.scheduled_time && f.scheduled_time < nowTimeStr))
    ).length;
    const completedCount = rows.filter((f) => f.status === 'Completed').length;

    const total = rows.length;
    return {
      total,
      today: todayCount,
      upcoming: upcomingCount,
      overdue: overdueCount,
      completed: completedCount,
    };
  }
}
