import crypto from 'crypto';
import { EnquiryModel, UserModel, ProjectModel, UnitModel, PropertyListingModel, LeadModel, LeadActivityModel } from '../models/index.js';
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
    const skip = (page - 1) * limit;

    const query: any = {};

    const isAdmin = user.roles.includes(UserRole.ADMIN);
    const isEmployee = user.roles.includes(UserRole.EMPLOYEE);
    const isCustomer = user.roles.includes(UserRole.CUSTOMER);

    if (isCustomer) {
      query.$or = [{ created_by: user.userId }, { email: user.email.toLowerCase() }];
    } else if (!isAdmin && !isEmployee) {
      query.assigned_to = user.userId;
    }

    if (filters.search && filters.search.trim()) {
      const regex = new RegExp(filters.search.trim(), 'i');
      const searchConditions = [
        { customer_name: regex },
        { phone: regex },
        { email: regex },
        { interested_property: regex },
        { city: regex },
      ];
      if (query.$or) {
        query.$and = [{ $or: query.$or }, { $or: searchConditions }];
        delete query.$or;
      } else {
        query.$or = searchConditions;
      }
    }

    if (filters.source) query.lead_source = filters.source;
    if (filters.configuration) query.configuration = filters.configuration;
    if (filters.status) query.status = filters.status;
    if (filters.assigned_to) query.assigned_to = filters.assigned_to;
    if (filters.city) query.city = new RegExp(`^${filters.city.trim()}$`, 'i');

    if (filters.startDate || filters.endDate) {
      query.enquiry_date = {};
      if (filters.startDate) query.enquiry_date.$gte = filters.startDate;
      if (filters.endDate) query.enquiry_date.$lte = filters.endDate;
    }

    const sortOrder = filters.sortOrder === 'ASC' ? 1 : -1;
    const sortField = filters.sortBy || 'enquiry_date';
    const sortObj: any = { [sortField]: sortOrder };

    const total = await EnquiryModel.countDocuments(query);
    const rows = await EnquiryModel.find(query).sort(sortObj).skip(skip).limit(limit);

    const enquiries: Enquiry[] = await Promise.all(
      rows.map(async (e) => {
        let assigned_name: string | null = null;
        let assigned_email: string | null = null;
        if (e.assigned_to) {
          const assignedUser = await UserModel.findById(e.assigned_to);
          assigned_name = assignedUser?.name || null;
          assigned_email = assignedUser?.email || null;
        }

        let created_by_name: string | null = null;
        if (e.created_by) {
          const creator = await UserModel.findById(e.created_by);
          created_by_name = creator?.name || null;
        }

        let project_name: string | null = null;
        if (e.project_id) {
          const project = await ProjectModel.findById(e.project_id);
          project_name = project?.name || null;
        }

        let unit_number: string | null = null;
        if (e.unit_id) {
          const unit = await UnitModel.findById(e.unit_id);
          unit_number = unit?.unit_number || null;
        }

        let property_code: string | null = null;
        let property_title: string | null = e.interested_property;
        let property_subtype: string | null = null;
        let property_price: number | null = null;
        let property_cover_image: string | null = null;

        if (e.property_id) {
          const listing = await PropertyListingModel.findById(e.property_id);
          if (listing) {
            property_code = listing.code;
            property_title = listing.title;
            property_subtype = listing.subtype;
            property_price = listing.price;
            property_cover_image = listing.cover_image || null;
          }
        }

        return {
          id: e._id,
          customer_name: e.customer_name,
          phone: e.phone,
          email: e.email,
          city: e.city,
          budget: e.budget,
          interested_property: e.interested_property,
          configuration: e.configuration as any,
          lead_source: e.lead_source as any,
          assigned_to: e.assigned_to,
          project_id: e.project_id,
          unit_id: e.unit_id,
          property_id: e.property_id,
          status: e.status as any,
          enquiry_date: typeof e.enquiry_date === 'string' ? e.enquiry_date : (e.enquiry_date as any)?.toISOString(),
          converted_lead_id: e.converted_lead_id,
          created_by: e.created_by,
          created_at: typeof e.created_at === 'string' ? e.created_at : e.created_at.toISOString(),
          updated_at: typeof e.updated_at === 'string' ? e.updated_at : e.updated_at.toISOString(),
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
        };
      })
    );

    return { enquiries, total, page, limit };
  }

  /**
   * Fetch single enquiry by ID
   */
  public static async getEnquiryById(id: string, user: JWTPayload): Promise<Enquiry | null> {
    const e = await EnquiryModel.findById(id);
    if (!e) return null;

    const isAdmin = user.roles.includes(UserRole.ADMIN);
    const isEmployee = user.roles.includes(UserRole.EMPLOYEE);
    const isCustomer = user.roles.includes(UserRole.CUSTOMER);

    if (isCustomer && e.created_by !== user.userId && e.email !== user.email.toLowerCase()) {
      return null;
    }
    if (!isAdmin && !isEmployee && !isCustomer && e.assigned_to !== user.userId) {
      return null;
    }

    let assigned_name: string | null = null;
    let assigned_email: string | null = null;
    if (e.assigned_to) {
      const assignedUser = await UserModel.findById(e.assigned_to);
      assigned_name = assignedUser?.name || null;
      assigned_email = assignedUser?.email || null;
    }

    let created_by_name: string | null = null;
    if (e.created_by) {
      const creator = await UserModel.findById(e.created_by);
      created_by_name = creator?.name || null;
    }

    let project_name: string | null = null;
    if (e.project_id) {
      const project = await ProjectModel.findById(e.project_id);
      project_name = project?.name || null;
    }

    let unit_number: string | null = null;
    if (e.unit_id) {
      const unit = await UnitModel.findById(e.unit_id);
      unit_number = unit?.unit_number || null;
    }

    let property_code: string | null = null;
    let property_title: string | null = e.interested_property;
    let property_subtype: string | null = null;
    let property_price: number | null = null;
    let property_cover_image: string | null = null;

    if (e.property_id) {
      const listing = await PropertyListingModel.findById(e.property_id);
      if (listing) {
        property_code = listing.code;
        property_title = listing.title;
        property_subtype = listing.subtype;
        property_price = listing.price;
        property_cover_image = listing.cover_image || null;
      }
    }

    return {
      id: e._id,
      customer_name: e.customer_name,
      phone: e.phone,
      email: e.email,
      city: e.city,
      budget: e.budget,
      interested_property: e.interested_property,
      configuration: e.configuration as any,
      lead_source: e.lead_source as any,
      assigned_to: e.assigned_to,
      project_id: e.project_id,
      unit_id: e.unit_id,
      property_id: e.property_id,
      status: e.status as any,
      enquiry_date: typeof e.enquiry_date === 'string' ? e.enquiry_date : (e.enquiry_date as any)?.toISOString(),
      converted_lead_id: e.converted_lead_id,
      created_by: e.created_by,
      created_at: typeof e.created_at === 'string' ? e.created_at : e.created_at.toISOString(),
      updated_at: typeof e.updated_at === 'string' ? e.updated_at : e.updated_at.toISOString(),
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
    };
  }

  /**
   * Create new enquiry
   */
  public static async createEnquiry(
    data: {
      customer_name: string;
      phone: string;
      email?: string;
      city?: string;
      budget: number;
      interested_property: string;
      configuration: PropertyConfiguration;
      lead_source: LeadSource;
      assigned_to?: string;
      project_id?: string;
      unit_id?: string;
      property_id?: string;
      status?: EnquiryStatus;
      enquiry_date?: string;
    },
    userId?: string
  ): Promise<Enquiry> {
    const enquiryId = `enq_${crypto.randomUUID()}`;
    const now = new Date().toISOString();

    await EnquiryModel.create({
      _id: enquiryId,
      customer_name: data.customer_name.trim(),
      phone: data.phone.trim(),
      email: data.email ? data.email.trim().toLowerCase() : null,
      city: data.city ? data.city.trim() : null,
      budget: data.budget,
      interested_property: data.interested_property.trim(),
      configuration: data.configuration,
      lead_source: data.lead_source,
      assigned_to: data.assigned_to || null,
      project_id: data.project_id || null,
      unit_id: data.unit_id || null,
      property_id: data.property_id || null,
      status: data.status || 'New Lead',
      enquiry_date: data.enquiry_date || now,
      created_by: userId || null,
    });

    return (await this.getEnquiryById(enquiryId, { userId: userId || '', email: '', roles: [UserRole.ADMIN] }))!;
  }

  /**
   * Update enquiry
   */
  public static async updateEnquiry(
    id: string,
    data: Partial<{
      customer_name: string;
      phone: string;
      email: string;
      city: string;
      budget: number;
      interested_property: string;
      configuration: PropertyConfiguration;
      lead_source: LeadSource;
      assigned_to: string;
      status: EnquiryStatus;
      project_id: string;
      unit_id: string;
      property_id: string;
    }>,
    user: JWTPayload
  ): Promise<Enquiry> {
    const enquiry = await EnquiryModel.findById(id);
    if (!enquiry) {
      const error: any = new Error('Enquiry not found.');
      error.statusCode = 404;
      throw error;
    }

    if (data.customer_name !== undefined) enquiry.customer_name = data.customer_name.trim();
    if (data.phone !== undefined) enquiry.phone = data.phone.trim();
    if (data.email !== undefined) enquiry.email = data.email.trim().toLowerCase();
    if (data.city !== undefined) enquiry.city = data.city.trim();
    if (data.budget !== undefined) enquiry.budget = data.budget;
    if (data.interested_property !== undefined) enquiry.interested_property = data.interested_property.trim();
    if (data.configuration !== undefined) enquiry.configuration = data.configuration;
    if (data.lead_source !== undefined) enquiry.lead_source = data.lead_source;
    if (data.assigned_to !== undefined) enquiry.assigned_to = data.assigned_to;
    if (data.status !== undefined) enquiry.status = data.status;
    if (data.project_id !== undefined) enquiry.project_id = data.project_id;
    if (data.unit_id !== undefined) enquiry.unit_id = data.unit_id;
    if (data.property_id !== undefined) enquiry.property_id = data.property_id;

    await enquiry.save();
    return (await this.getEnquiryById(id, user))!;
  }

  /**
   * Delete enquiry
   */
  public static async deleteEnquiry(id: string): Promise<boolean> {
    const result = await EnquiryModel.findByIdAndDelete(id);
    return !!result;
  }

  /**
   * Assign single enquiry to an executive
   */
  public static async assignEnquiry(id: string, assignedTo: string | null): Promise<Enquiry> {
    const enquiry = await EnquiryModel.findById(id);
    if (!enquiry) {
      const error: any = new Error('Enquiry not found.');
      error.statusCode = 404;
      throw error;
    }

    enquiry.assigned_to = assignedTo;
    await enquiry.save();

    return (await this.getEnquiryById(id, { userId: '', email: '', roles: [UserRole.ADMIN] }))!;
  }

  /**
   * Bulk assign enquiries
   */
  public static async bulkAssign(enquiryIds: string[], assignedTo: string): Promise<{ updatedCount: number }> {
    const res = await EnquiryModel.updateMany({ _id: { $in: enquiryIds } }, { assigned_to: assignedTo });
    return { updatedCount: res.modifiedCount };
  }

  /**
   * Convert enquiry to a qualified lead
   */
  public static async convertToLead(
    enquiryId: string,
    leadData: {
      preferred_location?: string;
      loan_required?: number;
      purchase_timeline?: string;
      purpose?: string;
      priority?: LeadPriority;
      notes?: string;
      assigned_to?: string;
      pipeline_stage?: string;
      qualification_status?: string;
    },
    userId?: string
  ): Promise<{ enquiry: Enquiry; lead: Lead }> {
    const enquiry = await EnquiryModel.findById(enquiryId);
    if (!enquiry) {
      const error: any = new Error('Enquiry not found.');
      error.statusCode = 404;
      throw error;
    }

    const leadId = `lead_${crypto.randomUUID()}`;
    const now = new Date().toISOString();

    const newLead = await LeadModel.create({
      _id: leadId,
      enquiry_id: enquiry._id,
      customer_name: enquiry.customer_name,
      phone: enquiry.phone,
      email: enquiry.email,
      city: enquiry.city,
      budget: enquiry.budget,
      preferred_location: leadData.preferred_location || enquiry.city || null,
      flat_type: enquiry.configuration,
      interested_property: enquiry.interested_property,
      project_id: enquiry.project_id,
      unit_id: enquiry.unit_id,
      property_id: enquiry.property_id,
      loan_required: leadData.loan_required || 0,
      purchase_timeline: (leadData.purchase_timeline || '1-3 Months') as any,
      purpose: (leadData.purpose || 'Self Use') as any,
      assigned_to: leadData.assigned_to || enquiry.assigned_to || null,
      pipeline_stage: (leadData.pipeline_stage || 'New') as any,
      qualification_status: (leadData.qualification_status || 'Qualified') as any,
      priority: leadData.priority || 'Medium',
      notes: leadData.notes || 'Converted from enquiry profile.',
      created_by: userId || null,
    });

    enquiry.status = 'Converted';
    enquiry.converted_lead_id = leadId;
    await enquiry.save();

    await LeadActivityModel.create({
      _id: `act_${crypto.randomUUID()}`,
      lead_id: leadId,
      activity_type: 'ENQUIRY_CONVERTED',
      title: 'Converted from Enquiry',
      description: `Enquiry for ${enquiry.interested_property} converted into active pipeline lead.`,
      performed_by: userId || null,
    });

    const updatedEnquiry = (await this.getEnquiryById(enquiryId, { userId: userId || '', email: '', roles: [UserRole.ADMIN] }))!;
    return { enquiry: updatedEnquiry, lead: newLead as any };
  }

  /**
   * Aggregate statistics for dashboard summary
   */
  public static async getEnquiryStats(user: JWTPayload): Promise<{
    total: number;
    newLeads: number;
    inProgress: number;
    converted: number;
    dropped: number;
    bySource: Record<string, number>;
  }> {
    const query: any = {};
    const isAdmin = user.roles.includes(UserRole.ADMIN);
    const isEmployee = user.roles.includes(UserRole.EMPLOYEE);
    if (!isAdmin && !isEmployee) {
      query.assigned_to = user.userId;
    }

    const enquiries = await EnquiryModel.find(query);
    const total = enquiries.length;
    const newLeads = enquiries.filter((e) => e.status === 'New Lead').length;
    const inProgress = enquiries.filter((e) => e.status === 'In Progress').length;
    const converted = enquiries.filter((e) => e.status === 'Converted').length;
    const dropped = enquiries.filter((e) => e.status === 'Dropped').length;

    const bySource: Record<string, number> = {};
    for (const e of enquiries) {
      bySource[e.lead_source] = (bySource[e.lead_source] || 0) + 1;
    }

    return { total, newLeads, inProgress, converted, dropped, bySource };
  }
}
