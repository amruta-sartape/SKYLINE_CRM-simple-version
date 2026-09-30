import crypto from 'crypto';
import { db } from '../db/database.js';
import {
  PropertyUnit,
  UnitAvailability,
  ParkingType,
  InventorySummary,
  FloorMatrixData,
  FloorMatrixFloor,
  FloorMatrixUnit,
  UserRole,
  Amenity,
  PropertyActivity,
} from '../types/index.js';

export interface ListUnitsFilter {
  project_id?: string;
  wing_id?: string;
  city?: string;
  floor_min?: number;
  floor_max?: number;
  configuration?: string;
  availability_status?: UnitAvailability;
  min_price?: number;
  max_price?: number;
  min_carpet?: number;
  max_carpet?: number;
  search?: string;
  page?: number;
  limit?: number;
  sort_by?: 'unit_number' | 'floor' | 'price' | 'carpet_area' | 'created_at';
  sort_order?: 'ASC' | 'DESC';
}

export interface CreateUnitDTO {
  project_id: string;
  wing_id: string;
  unit_number: string;
  floor: number;
  configuration: string;
  carpet_area: number;
  built_up_area: number;
  price: number;
  parking_type: ParkingType;
  parking_slot?: string | null;
  availability_status?: UnitAvailability;
  facing?: string | null;
  description?: string | null;
  amenity_ids?: string[];
}

export interface UpdateUnitDTO {
  unit_number?: string;
  floor?: number;
  configuration?: string;
  carpet_area?: number;
  built_up_area?: number;
  price?: number;
  parking_type?: ParkingType;
  parking_slot?: string | null;
  availability_status?: UnitAvailability;
  facing?: string | null;
  description?: string | null;
  amenity_ids?: string[];
}

export interface UpdateAvailabilityDTO {
  availability_status: UnitAvailability;
  remarks?: string;
  customer_lead_id?: string | null;
}

export class UnitService {
  /**
   * List units with comprehensive multi-criteria filtering, search, and pagination
   */
  static async listUnits(filter: ListUnitsFilter = {}): Promise<{
    units: PropertyUnit[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const page = Math.max(1, filter.page || 1);
    const limit = Math.min(100, Math.max(1, filter.limit || 25));
    const offset = (page - 1) * limit;

    const conditions: string[] = [];
    const params: any[] = [];

    if (filter.project_id) {
      conditions.push('u.project_id = ?');
      params.push(filter.project_id);
    }

    if (filter.wing_id) {
      conditions.push('u.wing_id = ?');
      params.push(filter.wing_id);
    }

    if (filter.city) {
      conditions.push('p.city = ?');
      params.push(filter.city);
    }

    if (filter.floor_min !== undefined) {
      conditions.push('u.floor >= ?');
      params.push(filter.floor_min);
    }

    if (filter.floor_max !== undefined) {
      conditions.push('u.floor <= ?');
      params.push(filter.floor_max);
    }

    if (filter.configuration) {
      conditions.push('u.configuration = ?');
      params.push(filter.configuration);
    }

    if (filter.availability_status) {
      conditions.push('u.availability_status = ?');
      params.push(filter.availability_status);
    }

    if (filter.min_price !== undefined) {
      conditions.push('u.price >= ?');
      params.push(filter.min_price);
    }

    if (filter.max_price !== undefined) {
      conditions.push('u.price <= ?');
      params.push(filter.max_price);
    }

    if (filter.min_carpet !== undefined) {
      conditions.push('u.carpet_area >= ?');
      params.push(filter.min_carpet);
    }

    if (filter.max_carpet !== undefined) {
      conditions.push('u.carpet_area <= ?');
      params.push(filter.max_carpet);
    }

    if (filter.search && filter.search.trim()) {
      const searchPattern = `%${filter.search.trim()}%`;
      conditions.push(
        '(u.unit_number LIKE ? OR p.name LIKE ? OR p.location LIKE ? OR w.name LIKE ?)'
      );
      params.push(searchPattern, searchPattern, searchPattern, searchPattern);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const countRow = await db.get<{ count: number }>(
      `SELECT COUNT(*) as count 
       FROM property_units u
       JOIN property_projects p ON u.project_id = p.id
       JOIN property_wings w ON u.wing_id = w.id
       ${whereClause}`,
      params
    );
    const total = countRow?.count || 0;

    // Sorting
    const allowedSortCols: Record<string, string> = {
      unit_number: 'u.unit_number',
      floor: 'u.floor',
      price: 'u.price',
      carpet_area: 'u.carpet_area',
      created_at: 'u.created_at',
    };
    const sortBy = allowedSortCols[filter.sort_by || 'created_at'] || 'u.floor ASC, u.unit_number ASC';
    const sortOrder = filter.sort_order === 'DESC' ? 'DESC' : 'ASC';
    const orderBy = filter.sort_by ? `${sortBy} ${sortOrder}` : 'p.name ASC, w.name ASC, u.floor ASC, u.unit_number ASC';

    const query = `
      SELECT 
        u.*,
        p.name as project_name,
        p.code as project_code,
        p.city as project_city,
        w.name as wing_name,
        usr.name as created_by_name
      FROM property_units u
      JOIN property_projects p ON u.project_id = p.id
      JOIN property_wings w ON u.wing_id = w.id
      LEFT JOIN users usr ON u.created_by = usr.id
      ${whereClause}
      ORDER BY ${orderBy}
      LIMIT ? OFFSET ?
    `;

    const rows = await db.all<any>(query, [...params, limit, offset]);

    // Batch load amenities for fetched units
    const unitIds = rows.map((r) => r.id);
    let amenitiesByUnit: Record<string, Amenity[]> = {};

    if (unitIds.length > 0) {
      const placeholders = unitIds.map(() => '?').join(',');
      const amenityRows = await db.all<any>(
        `SELECT pua.unit_id, a.*
         FROM property_unit_amenities pua
         JOIN amenities a ON pua.amenity_id = a.id
         WHERE pua.unit_id IN (${placeholders})`,
        unitIds
      );

      for (const ar of amenityRows) {
        if (!amenitiesByUnit[ar.unit_id]) {
          amenitiesByUnit[ar.unit_id] = [];
        }
        amenitiesByUnit[ar.unit_id].push({
          id: ar.id,
          name: ar.name,
          category: ar.category,
          icon: ar.icon,
          is_active: ar.is_active,
          created_at: ar.created_at,
        });
      }
    }

    const units: PropertyUnit[] = rows.map((r) => ({
      id: r.id,
      project_id: r.project_id,
      wing_id: r.wing_id,
      unit_number: r.unit_number,
      floor: r.floor,
      configuration: r.configuration,
      carpet_area: r.carpet_area,
      built_up_area: r.built_up_area,
      price: r.price,
      parking_type: r.parking_type,
      parking_slot: r.parking_slot,
      availability_status: r.availability_status,
      facing: r.facing,
      description: r.description,
      created_by: r.created_by,
      created_at: r.created_at,
      updated_at: r.updated_at,
      project_name: r.project_name,
      project_code: r.project_code,
      project_city: r.project_city,
      wing_name: r.wing_name,
      created_by_name: r.created_by_name,
      amenities: amenitiesByUnit[r.id] || [],
    }));

    return {
      units,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  /**
   * Get single unit by ID with full amenities and audit history
   */
  static async getUnitById(id: string): Promise<{
    unit: PropertyUnit;
    activities: PropertyActivity[];
  } | null> {
    const row = await db.get<any>(
      `SELECT 
        u.*,
        p.name as project_name,
        p.code as project_code,
        p.city as project_city,
        p.location as project_location,
        p.developer as project_developer,
        p.status as project_status,
        w.name as wing_name,
        usr.name as created_by_name
       FROM property_units u
       JOIN property_projects p ON u.project_id = p.id
       JOIN property_wings w ON u.wing_id = w.id
       LEFT JOIN users usr ON u.created_by = usr.id
       WHERE u.id = ?`,
      [id]
    );

    if (!row) return null;

    // Fetch Amenities
    const amenityRows = await db.all<any>(
      `SELECT a.*
       FROM property_unit_amenities pua
       JOIN amenities a ON pua.amenity_id = a.id
       WHERE pua.unit_id = ?
       ORDER BY a.category ASC, a.name ASC`,
      [id]
    );

    const amenities: Amenity[] = amenityRows.map((a) => ({
      id: a.id,
      name: a.name,
      category: a.category,
      icon: a.icon,
      is_active: a.is_active,
      created_at: a.created_at,
    }));

    // Fetch Property Activities
    const activityRows = await db.all<any>(
      `SELECT pa.*, usr.name as performer_name, usr.email as performer_email
       FROM property_activities pa
       LEFT JOIN users usr ON pa.performed_by = usr.id
       WHERE pa.resource_type = 'UNIT' AND pa.resource_id = ?
       ORDER BY pa.created_at DESC`,
      [id]
    );

    const activities: PropertyActivity[] = activityRows.map((a) => ({
      id: a.id,
      resource_type: a.resource_type,
      resource_id: a.resource_id,
      activity_type: a.activity_type,
      title: a.title,
      description: a.description,
      old_value: a.old_value,
      new_value: a.new_value,
      performed_by: a.performed_by,
      created_at: a.created_at,
      performer_name: a.performer_name,
      performer_email: a.performer_email,
    }));

    const unit: PropertyUnit = {
      id: row.id,
      project_id: row.project_id,
      wing_id: row.wing_id,
      unit_number: row.unit_number,
      floor: row.floor,
      configuration: row.configuration,
      carpet_area: row.carpet_area,
      built_up_area: row.built_up_area,
      price: row.price,
      parking_type: row.parking_type,
      parking_slot: row.parking_slot,
      availability_status: row.availability_status,
      facing: row.facing,
      description: row.description,
      created_by: row.created_by,
      created_at: row.created_at,
      updated_at: row.updated_at,
      project_name: row.project_name,
      project_code: row.project_code,
      project_city: row.project_city,
      wing_name: row.wing_name,
      created_by_name: row.created_by_name,
      amenities,
      amenity_ids: amenities.map((a) => a.id),
    };

    return { unit, activities };
  }

  /**
   * Create a new unit with unique constraint enforcement on (project_id, wing_id, unit_number)
   */
  static async createUnit(data: CreateUnitDTO, actorId: string): Promise<PropertyUnit> {
    const project = await db.get('SELECT id, name FROM property_projects WHERE id = ?', [
      data.project_id,
    ]);
    if (!project) {
      throw new Error('Selected project does not exist.');
    }

    const wing = await db.get(
      'SELECT id, name FROM property_wings WHERE id = ? AND project_id = ?',
      [data.wing_id, data.project_id]
    );
    if (!wing) {
      throw new Error('Selected wing does not belong to the selected project.');
    }

    const unitNumberTrimmed = data.unit_number.trim();

    // Check for duplicate unit in the same project & wing
    const existingUnit = await db.get(
      'SELECT id FROM property_units WHERE project_id = ? AND wing_id = ? AND unit_number = ?',
      [data.project_id, data.wing_id, unitNumberTrimmed]
    );
    if (existingUnit) {
      throw new Error(
        `Unit "${unitNumberTrimmed}" already exists in ${wing.name} of ${project.name}.`
      );
    }

    const unitId = `unt_${crypto.randomUUID()}`;
    const availability = data.availability_status || 'Available';

    await db.run(
      `INSERT INTO property_units (
        id, project_id, wing_id, unit_number, floor, configuration, 
        carpet_area, built_up_area, price, parking_type, parking_slot, 
        availability_status, facing, description, created_by, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
      [
        unitId,
        data.project_id,
        data.wing_id,
        unitNumberTrimmed,
        data.floor,
        data.configuration,
        data.carpet_area,
        data.built_up_area,
        data.price,
        data.parking_type || 'Included',
        data.parking_slot ? data.parking_slot.trim() : null,
        availability,
        data.facing ? data.facing.trim() : null,
        data.description ? data.description.trim() : null,
        actorId,
      ]
    );

    // Link Amenities
    if (data.amenity_ids && data.amenity_ids.length > 0) {
      for (const amnId of data.amenity_ids) {
        await db.run(
          `INSERT OR IGNORE INTO property_unit_amenities (id, unit_id, amenity_id, created_at)
           VALUES (?, ?, ?, CURRENT_TIMESTAMP)`,
          [`pua_${crypto.randomUUID()}`, unitId, amnId]
        );
      }
    }

    // Update project total_units count
    await db.run(
      `UPDATE property_projects 
       SET total_units = (SELECT COUNT(*) FROM property_units WHERE project_id = ?),
           updated_at = CURRENT_TIMESTAMP 
       WHERE id = ?`,
      [data.project_id, data.project_id]
    );

    // Log Activity
    await db.run(
      `INSERT INTO property_activities (id, resource_type, resource_id, activity_type, title, description, performed_by, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
      [
        `pact_${crypto.randomUUID()}`,
        'UNIT',
        unitId,
        'UNIT_CREATED',
        `Unit ${unitNumberTrimmed} Registered`,
        `Registered ${data.configuration} unit in ${wing.name}, ${project.name} priced at ₹${data.price.toLocaleString('en-IN')}.`,
        actorId,
      ]
    );

    const result = await this.getUnitById(unitId);
    return result!.unit;
  }

  /**
   * Update unit specifications and amenities
   */
  static async updateUnit(
    id: string,
    data: UpdateUnitDTO,
    actorId: string
  ): Promise<PropertyUnit> {
    const existing = await this.getUnitById(id);
    if (!existing) {
      throw new Error('Unit not found.');
    }

    // If unit number is being changed, check uniqueness
    if (data.unit_number && data.unit_number.trim() !== existing.unit.unit_number) {
      const unitNumTrimmed = data.unit_number.trim();
      const duplicate = await db.get(
        'SELECT id FROM property_units WHERE project_id = ? AND wing_id = ? AND unit_number = ? AND id != ?',
        [existing.unit.project_id, existing.unit.wing_id, unitNumTrimmed, id]
      );
      if (duplicate) {
        throw new Error(
          `Unit "${unitNumTrimmed}" already exists in ${existing.unit.wing_name} of ${existing.unit.project_name}.`
        );
      }
    }

    const updates: string[] = [];
    const params: any[] = [];

    if (data.unit_number !== undefined) {
      updates.push('unit_number = ?');
      params.push(data.unit_number.trim());
    }
    if (data.floor !== undefined) {
      updates.push('floor = ?');
      params.push(data.floor);
    }
    if (data.configuration !== undefined) {
      updates.push('configuration = ?');
      params.push(data.configuration);
    }
    if (data.carpet_area !== undefined) {
      updates.push('carpet_area = ?');
      params.push(data.carpet_area);
    }
    if (data.built_up_area !== undefined) {
      updates.push('built_up_area = ?');
      params.push(data.built_up_area);
    }
    if (data.price !== undefined) {
      updates.push('price = ?');
      params.push(data.price);
    }
    if (data.parking_type !== undefined) {
      updates.push('parking_type = ?');
      params.push(data.parking_type);
    }
    if (data.parking_slot !== undefined) {
      updates.push('parking_slot = ?');
      params.push(data.parking_slot ? data.parking_slot.trim() : null);
    }
    if (data.facing !== undefined) {
      updates.push('facing = ?');
      params.push(data.facing ? data.facing.trim() : null);
    }
    if (data.description !== undefined) {
      updates.push('description = ?');
      params.push(data.description ? data.description.trim() : null);
    }

    if (updates.length > 0) {
      updates.push('updated_at = CURRENT_TIMESTAMP');
      params.push(id);
      await db.run(`UPDATE property_units SET ${updates.join(', ')} WHERE id = ?`, params);
    }

    // Update amenities if provided
    if (data.amenity_ids !== undefined) {
      await db.run('DELETE FROM property_unit_amenities WHERE unit_id = ?', [id]);
      for (const amnId of data.amenity_ids) {
        await db.run(
          `INSERT OR IGNORE INTO property_unit_amenities (id, unit_id, amenity_id, created_at)
           VALUES (?, ?, ?, CURRENT_TIMESTAMP)`,
          [`pua_${crypto.randomUUID()}`, id, amnId]
        );
      }
    }

    // Log Activity
    await db.run(
      `INSERT INTO property_activities (id, resource_type, resource_id, activity_type, title, description, performed_by, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
      [
        `pact_${crypto.randomUUID()}`,
        'UNIT',
        id,
        'UNIT_UPDATED',
        `Unit Specifications Updated`,
        `Updated unit properties and configuration details.`,
        actorId,
      ]
    );

    const updated = await this.getUnitById(id);
    return updated!.unit;
  }

  /**
   * Controlled Availability State Machine Transition
   * Rules:
   * Available -> Reserved
   * Reserved  -> Available (release)
   * Reserved  -> Sold (confirmed)
   * Sold      -> Available (Admin cancellation override)
   */
  static async updateAvailability(
    id: string,
    data: UpdateAvailabilityDTO,
    actorId: string,
    userRole: UserRole
  ): Promise<PropertyUnit> {
    const existing = await this.getUnitById(id);
    if (!existing) {
      throw new Error('Unit not found.');
    }

    const currentStatus = existing.unit.availability_status;
    const targetStatus = data.availability_status;

    if (currentStatus === targetStatus) {
      throw new Error(`Unit is already in "${currentStatus}" status.`);
    }

    // Validate Transition Rules
    const allowed = this.isValidAvailabilityTransition(currentStatus, targetStatus, userRole);
    if (!allowed.valid) {
      throw new Error(allowed.reason);
    }

    await db.run(
      `UPDATE property_units SET availability_status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      [targetStatus, id]
    );

    const remarksText = data.remarks ? ` Remarks: ${data.remarks}` : '';

    // Log Property Activity
    await db.run(
      `INSERT INTO property_activities (id, resource_type, resource_id, activity_type, title, description, old_value, new_value, performed_by, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
      [
        `pact_${crypto.randomUUID()}`,
        'UNIT',
        id,
        'AVAILABILITY_CHANGED',
        `Availability Status Changed to ${targetStatus}`,
        `Transitioned from ${currentStatus} to ${targetStatus}.${remarksText}`,
        currentStatus,
        targetStatus,
        actorId,
      ]
    );

    // If customer lead id was referenced, log lead activity
    if (data.customer_lead_id) {
      const lead = await db.get('SELECT id, customer_name FROM leads WHERE id = ?', [
        data.customer_lead_id,
      ]);
      if (lead) {
        await db.run(
          `INSERT INTO lead_activities (id, lead_id, activity_type, title, description, performed_by, created_at)
           VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
          [
            `act_${crypto.randomUUID()}`,
            data.customer_lead_id,
            'REQUIREMENT_UPDATED',
            `Unit ${existing.unit.unit_number} Marked ${targetStatus}`,
            `Property unit ${existing.unit.unit_number} (${existing.unit.project_name}) status updated to ${targetStatus}.${remarksText}`,
            actorId,
          ]
        );
      }
    }

    const updated = await this.getUnitById(id);
    return updated!.unit;
  }

  /**
   * Transition validator helper
   */
  private static isValidAvailabilityTransition(
    current: UnitAvailability,
    target: UnitAvailability,
    userRole: UserRole
  ): { valid: boolean; reason: string } {
    // 1. Available -> Reserved (Allowed)
    if (current === 'Available' && target === 'Reserved') {
      return { valid: true, reason: '' };
    }

    // 2. Available -> Sold (Admin direct sale permitted)
    if (current === 'Available' && target === 'Sold') {
      if (userRole === UserRole.ADMIN) {
        return { valid: true, reason: '' };
      }
      return {
        valid: false,
        reason: 'Direct transition from Available to Sold requires unit reservation or Admin authorization.',
      };
    }

    // 3. Reserved -> Available (Release Reservation)
    if (current === 'Reserved' && target === 'Available') {
      return { valid: true, reason: '' };
    }

    // 4. Reserved -> Sold (Finalize Sale)
    if (current === 'Reserved' && target === 'Sold') {
      return { valid: true, reason: '' };
    }

    // 5. Sold -> Available (Cancellation / Forfeit - Admin only)
    if (current === 'Sold' && target === 'Available') {
      if (userRole === UserRole.ADMIN) {
        return { valid: true, reason: '' };
      }
      return {
        valid: false,
        reason: 'Sold units can only be released back to Available by an Administrator.',
      };
    }

    // 6. Sold -> Reserved (Disallowed)
    if (current === 'Sold' && target === 'Reserved') {
      return {
        valid: false,
        reason: 'Sold units cannot be changed directly to Reserved. Release to Available first.',
      };
    }

    return {
      valid: false,
      reason: `Invalid availability transition from "${current}" to "${target}".`,
    };
  }

  /**
   * Get Inventory Metrics & Valuation Summary
   */
  static async getInventorySummary(projectId?: string): Promise<InventorySummary> {
    const whereClause = projectId ? 'WHERE project_id = ?' : '';
    const params = projectId ? [projectId] : [];

    const row = await db.get<any>(
      `SELECT 
        COUNT(*) as total_units,
        SUM(CASE WHEN availability_status = 'Available' THEN 1 ELSE 0 END) as available_units,
        SUM(CASE WHEN availability_status = 'Reserved' THEN 1 ELSE 0 END) as reserved_units,
        SUM(CASE WHEN availability_status = 'Sold' THEN 1 ELSE 0 END) as sold_units,
        SUM(price) as total_valuation,
        SUM(CASE WHEN availability_status = 'Available' THEN price ELSE 0 END) as available_valuation,
        AVG(price / NULLIF(carpet_area, 0)) as avg_sqft_price
       FROM property_units
       ${whereClause}`,
      params
    );

    return {
      total_units: Number(row?.total_units || 0),
      available_units: Number(row?.available_units || 0),
      reserved_units: Number(row?.reserved_units || 0),
      sold_units: Number(row?.sold_units || 0),
      total_valuation: Number(row?.total_valuation || 0),
      available_valuation: Number(row?.available_valuation || 0),
      avg_sqft_price: Math.round(Number(row?.avg_sqft_price || 0)),
    };
  }

  /**
   * Get Visual Floor Matrix Data (Project -> Wing -> Floors -> Units)
   */
  static async getFloorMatrix(projectId: string, wingId: string): Promise<FloorMatrixData | null> {
    const project = await db.get<{ id: string; name: string }>(
      'SELECT id, name FROM property_projects WHERE id = ?',
      [projectId]
    );
    if (!project) return null;

    const wing = await db.get<{ id: string; name: string; total_floors: number }>(
      'SELECT id, name, total_floors FROM property_wings WHERE id = ? AND project_id = ?',
      [wingId, projectId]
    );
    if (!wing) return null;

    const units = await db.all<any>(
      `SELECT id, unit_number, floor, configuration, carpet_area, price, availability_status, parking_type, parking_slot
       FROM property_units
       WHERE project_id = ? AND wing_id = ?
       ORDER BY floor DESC, unit_number ASC`,
      [projectId, wingId]
    );

    // Group units by floor
    const floorsMap = new Map<number, FloorMatrixUnit[]>();

    for (const u of units) {
      if (!floorsMap.has(u.floor)) {
        floorsMap.set(u.floor, []);
      }
      floorsMap.get(u.floor)!.push({
        id: u.id,
        unit_number: u.unit_number,
        floor: u.floor,
        configuration: u.configuration,
        carpet_area: u.carpet_area,
        price: u.price,
        availability_status: u.availability_status,
        parking_type: u.parking_type,
        parking_slot: u.parking_slot,
      });
    }

    const floors: FloorMatrixFloor[] = Array.from(floorsMap.entries())
      .sort((a, b) => b[0] - a[0]) // Highest floor first
      .map(([floor, floorUnits]) => ({
        floor,
        units: floorUnits,
      }));

    return {
      project_id: project.id,
      project_name: project.name,
      wing_id: wing.id,
      wing_name: wing.name,
      total_floors: wing.total_floors,
      floors,
    };
  }
}
