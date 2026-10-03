import crypto from 'crypto';
import { ProjectModel, UnitModel, UserModel, PropertyActivityModel } from '../models/index.js';
import { PropertyProject, PropertyWing, ProjectStatus } from '../types/index.js';

export interface ListProjectsFilter {
  search?: string;
  status?: ProjectStatus;
  city?: string;
  is_active?: number;
  page?: number;
  limit?: number;
}

export interface CreateProjectDTO {
  name: string;
  code: string;
  location: string;
  city: string;
  state: string;
  description?: string;
  developer?: string;
  status?: ProjectStatus;
  wings?: Array<{
    name: string;
    total_floors?: number;
    units_per_floor?: number;
  }>;
}

export interface UpdateProjectDTO {
  name?: string;
  location?: string;
  city?: string;
  state?: string;
  description?: string;
  developer?: string;
  status?: ProjectStatus;
  is_active?: number;
}

export interface CreateWingDTO {
  name: string;
  total_floors?: number;
  units_per_floor?: number;
}

export class ProjectService {
  /**
   * List projects with multi-criteria filtering and computed unit availability metrics
   */
  static async listProjects(filter: ListProjectsFilter = {}): Promise<{
    projects: PropertyProject[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const page = Math.max(1, filter.page || 1);
    const limit = Math.min(100, Math.max(1, filter.limit || 20));
    const skip = (page - 1) * limit;

    const query: any = {};
    if (filter.is_active !== undefined) {
      query.is_active = filter.is_active;
    } else {
      query.is_active = 1;
    }

    if (filter.status) {
      query.status = filter.status;
    }

    if (filter.city) {
      query.city = filter.city;
    }

    if (filter.search && filter.search.trim()) {
      const regex = new RegExp(filter.search.trim(), 'i');
      query.$or = [
        { name: regex },
        { code: regex },
        { location: regex },
        { city: regex },
        { developer: regex },
      ];
    }

    const total = await ProjectModel.countDocuments(query);
    const rows = await ProjectModel.find(query).sort({ created_at: -1 }).skip(skip).limit(limit);

    const projects: PropertyProject[] = await Promise.all(
      rows.map(async (r) => {
        const units = await UnitModel.find({ project_id: r._id });
        const available = units.filter((u) => u.availability_status === 'Available').length;
        const reserved = units.filter((u) => u.availability_status === 'Reserved').length;
        const sold = units.filter((u) => u.availability_status === 'Sold').length;

        let created_by_name: string | null = null;
        if (r.created_by) {
          const user = await UserModel.findById(r.created_by);
          created_by_name = user?.name || null;
        }

        return {
          id: r._id,
          name: r.name,
          code: r.code,
          location: r.location,
          city: r.city,
          state: r.state,
          description: r.description,
          developer: r.developer,
          status: r.status,
          total_wings: r.total_wings,
          total_units: units.length,
          is_active: r.is_active,
          created_by: r.created_by,
          created_at: typeof r.created_at === 'string' ? r.created_at : r.created_at.toISOString(),
          updated_at: typeof r.updated_at === 'string' ? r.updated_at : r.updated_at.toISOString(),
          created_by_name,
          available_units: available,
          reserved_units: reserved,
          sold_units: sold,
          wings: (r.wings || []).map((w) => ({
            id: w._id,
            project_id: r._id,
            name: w.name,
            total_floors: w.total_floors,
            units_per_floor: w.units_per_floor,
            created_at: typeof w.created_at === 'string' ? w.created_at : (w.created_at?.toISOString() || new Date().toISOString()),
            updated_at: typeof w.updated_at === 'string' ? w.updated_at : (w.updated_at?.toISOString() || new Date().toISOString()),
          })),
        };
      })
    );

    return {
      projects,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  /**
   * Get single project by ID with full wing breakdown and unit availability
   */
  static async getProjectById(id: string): Promise<PropertyProject | null> {
    const project = await ProjectModel.findById(id);
    if (!project) return null;

    const units = await UnitModel.find({ project_id: project._id });

    const wings: PropertyWing[] = project.wings.map((w) => {
      const wingUnits = units.filter((u) => u.wing_id === w._id);
      return {
        id: w._id,
        project_id: project._id,
        name: w.name,
        total_floors: w.total_floors,
        units_per_floor: w.units_per_floor,
        created_at: typeof w.created_at === 'string' ? w.created_at : (w.created_at?.toISOString() || new Date().toISOString()),
        updated_at: typeof w.updated_at === 'string' ? w.updated_at : (w.updated_at?.toISOString() || new Date().toISOString()),
        total_units: wingUnits.length,
        available_units: wingUnits.filter((u) => u.availability_status === 'Available').length,
        reserved_units: wingUnits.filter((u) => u.availability_status === 'Reserved').length,
        sold_units: wingUnits.filter((u) => u.availability_status === 'Sold').length,
      };
    });

    let created_by_name: string | null = null;
    if (project.created_by) {
      const user = await UserModel.findById(project.created_by);
      created_by_name = user?.name || null;
    }

    return {
      id: project._id,
      name: project.name,
      code: project.code,
      location: project.location,
      city: project.city,
      state: project.state,
      description: project.description,
      developer: project.developer,
      status: project.status,
      total_wings: project.total_wings,
      total_units: units.length,
      is_active: project.is_active,
      created_by: project.created_by,
      created_at: typeof project.created_at === 'string' ? project.created_at : project.created_at.toISOString(),
      updated_at: typeof project.updated_at === 'string' ? project.updated_at : project.updated_at.toISOString(),
      created_by_name,
      available_units: units.filter((u) => u.availability_status === 'Available').length,
      reserved_units: units.filter((u) => u.availability_status === 'Reserved').length,
      sold_units: units.filter((u) => u.availability_status === 'Sold').length,
      wings,
    };
  }

  /**
   * Create a new project master and its wings
   */
  static async createProject(dto: CreateProjectDTO, userId?: string): Promise<PropertyProject> {
    const existing = await ProjectModel.findOne({ code: dto.code.trim().toUpperCase() });
    if (existing) {
      throw new Error(`Project code "${dto.code}" is already registered. Codes must be unique.`);
    }

    const projectId = `proj_${crypto.randomUUID()}`;
    const wingsData = (dto.wings && dto.wings.length > 0 ? dto.wings : [{ name: 'Wing A' }]).map((w) => ({
      _id: `wng_${crypto.randomUUID()}`,
      name: w.name.trim(),
      total_floors: w.total_floors || 10,
      units_per_floor: w.units_per_floor || 4,
    }));

    const project = await ProjectModel.create({
      _id: projectId,
      name: dto.name.trim(),
      code: dto.code.trim().toUpperCase(),
      location: dto.location.trim(),
      city: dto.city.trim(),
      state: dto.state.trim(),
      description: dto.description?.trim() || null,
      developer: dto.developer?.trim() || 'Skyline Realty Group',
      status: dto.status || 'Active',
      total_wings: wingsData.length,
      total_units: 0,
      is_active: 1,
      created_by: userId || null,
      wings: wingsData,
    });

    await PropertyActivityModel.create({
      _id: `pact_${crypto.randomUUID()}`,
      resource_type: 'PROJECT',
      resource_id: projectId,
      activity_type: 'PROJECT_CREATED',
      title: `Project ${project.name} Created`,
      description: `Master project created with code ${project.code} and ${wingsData.length} wing(s).`,
      performed_by: userId || null,
    });

    return (await this.getProjectById(projectId))!;
  }

  /**
   * Update an existing project
   */
  static async updateProject(id: string, dto: UpdateProjectDTO, userId?: string): Promise<PropertyProject> {
    const project = await ProjectModel.findById(id);
    if (!project) {
      throw new Error(`Project with ID "${id}" not found.`);
    }

    if (dto.name !== undefined) project.name = dto.name.trim();
    if (dto.location !== undefined) project.location = dto.location.trim();
    if (dto.city !== undefined) project.city = dto.city.trim();
    if (dto.state !== undefined) project.state = dto.state.trim();
    if (dto.description !== undefined) project.description = dto.description?.trim() || null;
    if (dto.developer !== undefined) project.developer = dto.developer?.trim() || 'Skyline Realty Group';
    if (dto.status !== undefined) project.status = dto.status;
    if (dto.is_active !== undefined) project.is_active = dto.is_active;

    await project.save();

    await PropertyActivityModel.create({
      _id: `pact_${crypto.randomUUID()}`,
      resource_type: 'PROJECT',
      resource_id: id,
      activity_type: 'PROJECT_UPDATED',
      title: `Project ${project.name} Updated`,
      description: `Project metadata updated by executive.`,
      performed_by: userId || null,
    });

    return (await this.getProjectById(id))!;
  }

  /**
   * Add a new wing to an existing project
   */
  static async addWing(projectId: string, dto: CreateWingDTO, userId?: string): Promise<PropertyWing> {
    const project = await ProjectModel.findById(projectId);
    if (!project) {
      throw new Error(`Project with ID "${projectId}" not found.`);
    }

    const wingExists = project.wings.some((w) => w.name.toLowerCase() === dto.name.trim().toLowerCase());
    if (wingExists) {
      throw new Error(`Wing "${dto.name}" already exists in project "${project.name}".`);
    }

    const wingId = `wng_${crypto.randomUUID()}`;
    const newWing = {
      _id: wingId,
      name: dto.name.trim(),
      total_floors: dto.total_floors || 10,
      units_per_floor: dto.units_per_floor || 4,
    };

    project.wings.push(newWing as any);
    project.total_wings = project.wings.length;
    await project.save();

    return {
      id: wingId,
      project_id: projectId,
      name: newWing.name,
      total_floors: newWing.total_floors,
      units_per_floor: newWing.units_per_floor,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      total_units: 0,
      available_units: 0,
      reserved_units: 0,
      sold_units: 0,
    };
  }

  /**
   * Soft-delete / Archive a project
   */
  static async listWings(projectId: string): Promise<PropertyWing[]> {
    const project = await this.getProjectById(projectId);
    if (!project) throw new Error(`Project with ID "${projectId}" not found.`);
    return project.wings || [];
  }

  static async createWing(projectId: string, dto: CreateWingDTO, userId?: string): Promise<PropertyWing> {
    return this.addWing(projectId, dto, userId);
  }

  static async archiveProject(id: string, userId?: string): Promise<void> {
    const project = await ProjectModel.findById(id);
    if (!project) {
      throw new Error(`Project with ID "${id}" not found.`);
    }

    project.is_active = 0;
    project.status = 'On Hold';
    await project.save();

    await PropertyActivityModel.create({
      _id: `pact_${crypto.randomUUID()}`,
      resource_type: 'PROJECT',
      resource_id: id,
      activity_type: 'PROJECT_ARCHIVED',
      title: `Project ${project.name} Archived`,
      description: 'Project moved to inactive/archived status.',
      performed_by: userId || null,
    });
  }
}
