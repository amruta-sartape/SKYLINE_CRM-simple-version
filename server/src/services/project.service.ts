import crypto from 'crypto';
import { db } from '../db/database.js';
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
    const offset = (page - 1) * limit;

    const conditions: string[] = [];
    const params: any[] = [];

    if (filter.is_active !== undefined) {
      conditions.push('p.is_active = ?');
      params.push(filter.is_active);
    } else {
      conditions.push('p.is_active = 1');
    }

    if (filter.status) {
      conditions.push('p.status = ?');
      params.push(filter.status);
    }

    if (filter.city) {
      conditions.push('p.city = ?');
      params.push(filter.city);
    }

    if (filter.search && filter.search.trim()) {
      const searchPattern = `%${filter.search.trim()}%`;
      conditions.push(
        '(p.name LIKE ? OR p.code LIKE ? OR p.location LIKE ? OR p.city LIKE ? OR p.developer LIKE ?)'
      );
      params.push(searchPattern, searchPattern, searchPattern, searchPattern, searchPattern);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const countRow = await db.get<{ count: number }>(
      `SELECT COUNT(*) as count FROM property_projects p ${whereClause}`,
      params
    );
    const total = countRow?.count || 0;

    const query = `
      SELECT 
        p.*,
        u.name as created_by_name,
        COUNT(un.id) as total_units,
        SUM(CASE WHEN un.availability_status = 'Available' THEN 1 ELSE 0 END) as available_units,
        SUM(CASE WHEN un.availability_status = 'Reserved' THEN 1 ELSE 0 END) as reserved_units,
        SUM(CASE WHEN un.availability_status = 'Sold' THEN 1 ELSE 0 END) as sold_units
      FROM property_projects p
      LEFT JOIN users u ON p.created_by = u.id
      LEFT JOIN property_units un ON p.id = un.project_id
      ${whereClause}
      GROUP BY p.id
      ORDER BY p.created_at DESC
      LIMIT ? OFFSET ?
    `;

    const rows = await db.all<any>(query, [...params, limit, offset]);

    const projects: PropertyProject[] = rows.map((r) => ({
      id: r.id,
      name: r.name,
      code: r.code,
      location: r.location,
      city: r.city,
      state: r.state,
      description: r.description,
      developer: r.developer,
      status: r.status,
      total_wings: r.total_wings,
      total_units: Number(r.total_units || 0),
      is_active: r.is_active,
      created_by: r.created_by,
      created_at: r.created_at,
      updated_at: r.updated_at,
      created_by_name: r.created_by_name,
      available_units: Number(r.available_units || 0),
      reserved_units: Number(r.reserved_units || 0),
      sold_units: Number(r.sold_units || 0),
    }));

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
    const row = await db.get<any>(
      `SELECT 
        p.*,
        u.name as created_by_name,
        COUNT(un.id) as total_units,
        SUM(CASE WHEN un.availability_status = 'Available' THEN 1 ELSE 0 END) as available_units,
        SUM(CASE WHEN un.availability_status = 'Reserved' THEN 1 ELSE 0 END) as reserved_units,
        SUM(CASE WHEN un.availability_status = 'Sold' THEN 1 ELSE 0 END) as sold_units
       FROM property_projects p
       LEFT JOIN users u ON p.created_by = u.id
       LEFT JOIN property_units un ON p.id = un.project_id
       WHERE p.id = ?
       GROUP BY p.id`,
      [id]
    );

    if (!row) return null;

    // Fetch Wings
    const wingRows = await db.all<any>(
      `SELECT 
        w.*,
        COUNT(un.id) as total_units,
        SUM(CASE WHEN un.availability_status = 'Available' THEN 1 ELSE 0 END) as available_units,
        SUM(CASE WHEN un.availability_status = 'Reserved' THEN 1 ELSE 0 END) as reserved_units,
        SUM(CASE WHEN un.availability_status = 'Sold' THEN 1 ELSE 0 END) as sold_units
       FROM property_wings w
       LEFT JOIN property_units un ON w.id = un.wing_id
       WHERE w.project_id = ?
       GROUP BY w.id
       ORDER BY w.name ASC`,
      [id]
    );

    const wings: PropertyWing[] = wingRows.map((w) => ({
      id: w.id,
      project_id: w.project_id,
      name: w.name,
      total_floors: w.total_floors,
      units_per_floor: w.units_per_floor,
      created_at: w.created_at,
      updated_at: w.updated_at,
      total_units: Number(w.total_units || 0),
      available_units: Number(w.available_units || 0),
      reserved_units: Number(w.reserved_units || 0),
      sold_units: Number(w.sold_units || 0),
    }));

    return {
      id: row.id,
      name: row.name,
      code: row.code,
      location: row.location,
      city: row.city,
      state: row.state,
      description: row.description,
      developer: row.developer,
      status: row.status,
      total_wings: row.total_wings,
      total_units: Number(row.total_units || 0),
      is_active: row.is_active,
      created_by: row.created_by,
      created_at: row.created_at,
      updated_at: row.updated_at,
      created_by_name: row.created_by_name,
      available_units: Number(row.available_units || 0),
      reserved_units: Number(row.reserved_units || 0),
      sold_units: Number(row.sold_units || 0),
      wings,
    };
  }

  /**
   * Create a new project master and optional initial wings
   */
  static async createProject(data: CreateProjectDTO, actorId: string): Promise<PropertyProject> {
    const codeNormalized = data.code.trim().toUpperCase();

    const existingCode = await db.get('SELECT id FROM property_projects WHERE code = ?', [
      codeNormalized,
    ]);
    if (existingCode) {
      throw new Error(`Project code "${codeNormalized}" already exists. Please choose a unique project code.`);
    }

    const projectId = `proj_${crypto.randomUUID()}`;
    const wingsData = data.wings && data.wings.length > 0 ? data.wings : [{ name: 'Wing A' }];

    await db.run(
      `INSERT INTO property_projects (id, name, code, location, city, state, description, developer, status, total_wings, total_units, is_active, created_by, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 1, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
      [
        projectId,
        data.name.trim(),
        codeNormalized,
        data.location.trim(),
        data.city.trim(),
        data.state.trim(),
        data.description?.trim() || null,
        data.developer?.trim() || 'Skyline Realty Group',
        data.status || 'Active',
        wingsData.length,
        actorId,
      ]
    );

    // Insert Wings
    for (const w of wingsData) {
      const wingId = `wng_${crypto.randomUUID()}`;
      await db.run(
        `INSERT INTO property_wings (id, project_id, name, total_floors, units_per_floor, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
        [wingId, projectId, w.name.trim(), w.total_floors || 10, w.units_per_floor || 4]
      );
    }

    // Log Activity
    await db.run(
      `INSERT INTO property_activities (id, resource_type, resource_id, activity_type, title, description, performed_by, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
      [
        `pact_${crypto.randomUUID()}`,
        'PROJECT',
        projectId,
        'PROJECT_CREATED',
        `Project ${data.name} Created`,
        `Project code ${codeNormalized} in ${data.city} registered with ${wingsData.length} wings.`,
        actorId,
      ]
    );

    const created = await this.getProjectById(projectId);
    return created!;
  }

  /**
   * Update an existing project's metadata
   */
  static async updateProject(
    id: string,
    data: UpdateProjectDTO,
    actorId: string
  ): Promise<PropertyProject> {
    const existing = await this.getProjectById(id);
    if (!existing) {
      throw new Error('Project not found');
    }

    const updates: string[] = [];
    const params: any[] = [];

    if (data.name !== undefined) {
      updates.push('name = ?');
      params.push(data.name.trim());
    }
    if (data.location !== undefined) {
      updates.push('location = ?');
      params.push(data.location.trim());
    }
    if (data.city !== undefined) {
      updates.push('city = ?');
      params.push(data.city.trim());
    }
    if (data.state !== undefined) {
      updates.push('state = ?');
      params.push(data.state.trim());
    }
    if (data.description !== undefined) {
      updates.push('description = ?');
      params.push(data.description ? data.description.trim() : null);
    }
    if (data.developer !== undefined) {
      updates.push('developer = ?');
      params.push(data.developer.trim());
    }
    if (data.status !== undefined) {
      updates.push('status = ?');
      params.push(data.status);
    }
    if (data.is_active !== undefined) {
      updates.push('is_active = ?');
      params.push(data.is_active);
    }

    if (updates.length > 0) {
      updates.push('updated_at = CURRENT_TIMESTAMP');
      params.push(id);
      await db.run(`UPDATE property_projects SET ${updates.join(', ')} WHERE id = ?`, params);

      // Log Activity
      await db.run(
        `INSERT INTO property_activities (id, resource_type, resource_id, activity_type, title, description, performed_by, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
        [
          `pact_${crypto.randomUUID()}`,
          'PROJECT',
          id,
          'PROJECT_UPDATED',
          `Project Details Updated`,
          `Modified project specifications and status.`,
          actorId,
        ]
      );
    }

    const updated = await this.getProjectById(id);
    return updated!;
  }

  /**
   * Safe Archive / Deactivate a project
   */
  static async archiveProject(id: string, actorId: string): Promise<PropertyProject> {
    const existing = await this.getProjectById(id);
    if (!existing) {
      throw new Error('Project not found');
    }

    // Check if there are active reserved or sold units
    if (existing.reserved_units && existing.reserved_units > 0) {
      throw new Error(
        `Cannot archive project with ${existing.reserved_units} active reserved unit(s). Release reservations first.`
      );
    }

    await db.run(
      `UPDATE property_projects SET is_active = 0, status = 'On Hold', updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      [id]
    );

    // Log Activity
    await db.run(
      `INSERT INTO property_activities (id, resource_type, resource_id, activity_type, title, description, performed_by, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
      [
        `pact_${crypto.randomUUID()}`,
        'PROJECT',
        id,
        'PROJECT_ARCHIVED',
        `Project Archived`,
        `Project marked inactive and moved to On Hold status.`,
        actorId,
      ]
    );

    const updated = await this.getProjectById(id);
    return updated!;
  }

  /**
   * List wings for a specific project
   */
  static async listWings(projectId: string): Promise<PropertyWing[]> {
    const rows = await db.all<any>(
      `SELECT 
        w.*,
        COUNT(un.id) as total_units,
        SUM(CASE WHEN un.availability_status = 'Available' THEN 1 ELSE 0 END) as available_units,
        SUM(CASE WHEN un.availability_status = 'Reserved' THEN 1 ELSE 0 END) as reserved_units,
        SUM(CASE WHEN un.availability_status = 'Sold' THEN 1 ELSE 0 END) as sold_units
       FROM property_wings w
       LEFT JOIN property_units un ON w.id = un.wing_id
       WHERE w.project_id = ?
       GROUP BY w.id
       ORDER BY w.name ASC`,
      [projectId]
    );

    return rows.map((w) => ({
      id: w.id,
      project_id: w.project_id,
      name: w.name,
      total_floors: w.total_floors,
      units_per_floor: w.units_per_floor,
      created_at: w.created_at,
      updated_at: w.updated_at,
      total_units: Number(w.total_units || 0),
      available_units: Number(w.available_units || 0),
      reserved_units: Number(w.reserved_units || 0),
      sold_units: Number(w.sold_units || 0),
    }));
  }

  /**
   * Add a new wing to a project
   */
  static async createWing(
    projectId: string,
    data: CreateWingDTO,
    actorId: string
  ): Promise<PropertyWing> {
    const project = await db.get('SELECT id, name FROM property_projects WHERE id = ?', [projectId]);
    if (!project) {
      throw new Error('Project not found');
    }

    const wingName = data.name.trim();
    const existing = await db.get(
      'SELECT id FROM property_wings WHERE project_id = ? AND name = ?',
      [projectId, wingName]
    );
    if (existing) {
      throw new Error(`Wing "${wingName}" already exists in this project.`);
    }

    const wingId = `wng_${crypto.randomUUID()}`;
    await db.run(
      `INSERT INTO property_wings (id, project_id, name, total_floors, units_per_floor, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
      [wingId, projectId, wingName, data.total_floors || 10, data.units_per_floor || 4]
    );

    // Increment project total_wings
    await db.run(
      `UPDATE property_projects SET total_wings = total_wings + 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      [projectId]
    );

    // Log Activity
    await db.run(
      `INSERT INTO property_activities (id, resource_type, resource_id, activity_type, title, description, performed_by, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
      [
        `pact_${crypto.randomUUID()}`,
        'PROJECT',
        projectId,
        'PROJECT_UPDATED',
        `New Wing Added`,
        `Wing "${wingName}" registered with ${data.total_floors || 10} floors.`,
        actorId,
      ]
    );

    return {
      id: wingId,
      project_id: projectId,
      name: wingName,
      total_floors: data.total_floors || 10,
      units_per_floor: data.units_per_floor || 4,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      total_units: 0,
      available_units: 0,
      reserved_units: 0,
      sold_units: 0,
    };
  }
}
