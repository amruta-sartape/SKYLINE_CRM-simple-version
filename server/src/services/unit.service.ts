import crypto from 'crypto';
import { UnitModel, ProjectModel, AmenityModel, UserModel, PropertyActivityModel } from '../models/index.js';
import {
  PropertyUnit,
  UnitAvailability,
  ParkingType,
  InventorySummary,
  FloorMatrixData,
  FloorMatrixFloor,
  FloorMatrixUnit,
  Amenity,
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
    const skip = (page - 1) * limit;

    const query: any = {};

    if (filter.project_id) query.project_id = filter.project_id;
    if (filter.wing_id) query.wing_id = filter.wing_id;
    if (filter.configuration) query.configuration = filter.configuration;
    if (filter.availability_status) query.availability_status = filter.availability_status;

    if (filter.floor_min !== undefined || filter.floor_max !== undefined) {
      query.floor = {};
      if (filter.floor_min !== undefined) query.floor.$gte = filter.floor_min;
      if (filter.floor_max !== undefined) query.floor.$lte = filter.floor_max;
    }

    if (filter.min_price !== undefined || filter.max_price !== undefined) {
      query.price = {};
      if (filter.min_price !== undefined) query.price.$gte = filter.min_price;
      if (filter.max_price !== undefined) query.price.$lte = filter.max_price;
    }

    if (filter.min_carpet !== undefined || filter.max_carpet !== undefined) {
      query.carpet_area = {};
      if (filter.min_carpet !== undefined) query.carpet_area.$gte = filter.min_carpet;
      if (filter.max_carpet !== undefined) query.carpet_area.$lte = filter.max_carpet;
    }

    if (filter.search && filter.search.trim()) {
      const regex = new RegExp(filter.search.trim(), 'i');
      query.unit_number = regex;
    }

    const sortOrder = filter.sort_order === 'DESC' ? -1 : 1;
    const sortField = filter.sort_by || 'unit_number';
    const sortObj: any = { [sortField]: sortOrder };

    const total = await UnitModel.countDocuments(query);
    const rows = await UnitModel.find(query).sort(sortObj).skip(skip).limit(limit);

    const units: PropertyUnit[] = await Promise.all(
      rows.map(async (u) => {
        const project = await ProjectModel.findById(u.project_id);
        const wing = project?.wings.find((w) => w._id === u.wing_id);
        const amenities = await AmenityModel.find({ _id: { $in: u.amenity_ids || [] } });

        let created_by_name: string | null = null;
        if (u.created_by) {
          const user = await UserModel.findById(u.created_by);
          created_by_name = user?.name || null;
        }

        return {
          id: u._id,
          project_id: u.project_id,
          wing_id: u.wing_id,
          unit_number: u.unit_number,
          floor: u.floor,
          configuration: u.configuration,
          carpet_area: u.carpet_area,
          built_up_area: u.built_up_area,
          price: u.price,
          parking_type: u.parking_type,
          parking_slot: u.parking_slot,
          availability_status: u.availability_status,
          facing: u.facing,
          description: u.description,
          created_by: u.created_by,
          created_at: typeof u.created_at === 'string' ? u.created_at : u.created_at.toISOString(),
          updated_at: typeof u.updated_at === 'string' ? u.updated_at : u.updated_at.toISOString(),
          project_name: project?.name,
          project_code: project?.code,
          project_city: project?.city,
          wing_name: wing?.name,
          amenities: amenities.map((a) => ({
            id: a._id,
            name: a.name,
            category: a.category as any,
            icon: a.icon,
            is_active: a.is_active,
            created_at: typeof a.created_at === 'string' ? a.created_at : a.created_at.toISOString(),
          })),
          amenity_ids: u.amenity_ids || [],
          created_by_name,
        };
      })
    );

    return {
      units,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  /**
   * Get single unit by ID with full project, wing and amenity details
   */
  static async getUnitById(id: string): Promise<PropertyUnit | null> {
    const unit = await UnitModel.findById(id);
    if (!unit) return null;

    const project = await ProjectModel.findById(unit.project_id);
    const wing = project?.wings.find((w) => w._id === unit.wing_id);
    const amenities = await AmenityModel.find({ _id: { $in: unit.amenity_ids || [] } });

    let created_by_name: string | null = null;
    if (unit.created_by) {
      const user = await UserModel.findById(unit.created_by);
      created_by_name = user?.name || null;
    }

    return {
      id: unit._id,
      project_id: unit.project_id,
      wing_id: unit.wing_id,
      unit_number: unit.unit_number,
      floor: unit.floor,
      configuration: unit.configuration,
      carpet_area: unit.carpet_area,
      built_up_area: unit.built_up_area,
      price: unit.price,
      parking_type: unit.parking_type,
      parking_slot: unit.parking_slot,
      availability_status: unit.availability_status,
      facing: unit.facing,
      description: unit.description,
      created_by: unit.created_by,
      created_at: typeof unit.created_at === 'string' ? unit.created_at : unit.created_at.toISOString(),
      updated_at: typeof unit.updated_at === 'string' ? unit.updated_at : unit.updated_at.toISOString(),
      project_name: project?.name,
      project_code: project?.code,
      project_city: project?.city,
      wing_name: wing?.name,
      amenities: amenities.map((a) => ({
        id: a._id,
        name: a.name,
        category: a.category as any,
        icon: a.icon,
        is_active: a.is_active,
        created_at: typeof a.created_at === 'string' ? a.created_at : a.created_at.toISOString(),
      })),
      amenity_ids: unit.amenity_ids || [],
      created_by_name,
    };
  }

  /**
   * Create a new unit inventory record
   */
  static async createUnit(dto: CreateUnitDTO, userId?: string): Promise<PropertyUnit> {
    const project = await ProjectModel.findById(dto.project_id);
    if (!project) throw new Error(`Project with ID "${dto.project_id}" does not exist.`);

    const wing = project.wings.find((w) => w._id === dto.wing_id);
    if (!wing) throw new Error(`Wing with ID "${dto.wing_id}" does not exist in project "${project.name}".`);

    const existing = await UnitModel.findOne({
      project_id: dto.project_id,
      wing_id: dto.wing_id,
      unit_number: dto.unit_number.trim(),
    });
    if (existing) {
      throw new Error(`Unit "${dto.unit_number}" already exists in ${wing.name} of ${project.name}.`);
    }

    const unitId = `unt_${crypto.randomUUID()}`;
    await UnitModel.create({
      _id: unitId,
      project_id: dto.project_id,
      wing_id: dto.wing_id,
      unit_number: dto.unit_number.trim(),
      floor: dto.floor,
      configuration: dto.configuration.trim(),
      carpet_area: dto.carpet_area,
      built_up_area: dto.built_up_area,
      price: dto.price,
      parking_type: dto.parking_type || 'Included',
      parking_slot: dto.parking_slot || null,
      availability_status: dto.availability_status || 'Available',
      facing: dto.facing?.trim() || null,
      description: dto.description?.trim() || null,
      amenity_ids: dto.amenity_ids || [],
      created_by: userId || null,
    });

    project.total_units = (await UnitModel.countDocuments({ project_id: project._id }));
    await project.save();

    await PropertyActivityModel.create({
      _id: `pact_${crypto.randomUUID()}`,
      resource_type: 'UNIT',
      resource_id: unitId,
      activity_type: 'UNIT_CREATED',
      title: `Unit ${dto.unit_number} Created`,
      description: `Registered ${dto.configuration} unit in ${wing.name} (${project.name}).`,
      performed_by: userId || null,
    });

    return (await this.getUnitById(unitId))!;
  }

  /**
   * Update an existing unit specification
   */
  static async updateUnit(id: string, dto: UpdateUnitDTO, userId?: string): Promise<PropertyUnit> {
    const unit = await UnitModel.findById(id);
    if (!unit) throw new Error(`Unit with ID "${id}" not found.`);

    if (dto.unit_number !== undefined) unit.unit_number = dto.unit_number.trim();
    if (dto.floor !== undefined) unit.floor = dto.floor;
    if (dto.configuration !== undefined) unit.configuration = dto.configuration.trim();
    if (dto.carpet_area !== undefined) unit.carpet_area = dto.carpet_area;
    if (dto.built_up_area !== undefined) unit.built_up_area = dto.built_up_area;
    if (dto.price !== undefined) unit.price = dto.price;
    if (dto.parking_type !== undefined) unit.parking_type = dto.parking_type;
    if (dto.parking_slot !== undefined) unit.parking_slot = dto.parking_slot;
    if (dto.availability_status !== undefined) unit.availability_status = dto.availability_status;
    if (dto.facing !== undefined) unit.facing = dto.facing?.trim() || null;
    if (dto.description !== undefined) unit.description = dto.description?.trim() || null;
    if (dto.amenity_ids !== undefined) unit.amenity_ids = dto.amenity_ids;

    await unit.save();

    await PropertyActivityModel.create({
      _id: `pact_${crypto.randomUUID()}`,
      resource_type: 'UNIT',
      resource_id: id,
      activity_type: 'UNIT_UPDATED',
      title: `Unit ${unit.unit_number} Updated`,
      description: `Unit specifications modified by executive.`,
      performed_by: userId || null,
    });

    return (await this.getUnitById(id))!;
  }

  /**
   * Fast state transition for unit availability
   */
  static async updateAvailability(id: string, dto: UpdateAvailabilityDTO, userId?: string): Promise<PropertyUnit> {
    const unit = await UnitModel.findById(id);
    if (!unit) throw new Error(`Unit with ID "${id}" not found.`);

    const oldStatus = unit.availability_status;
    unit.availability_status = dto.availability_status;
    await unit.save();

    await PropertyActivityModel.create({
      _id: `pact_${crypto.randomUUID()}`,
      resource_type: 'UNIT',
      resource_id: id,
      activity_type: 'AVAILABILITY_CHANGED',
      title: `Availability Changed: ${unit.unit_number}`,
      description: `Status changed from ${oldStatus} to ${dto.availability_status}${dto.remarks ? ` (${dto.remarks})` : ''}`,
      old_value: oldStatus,
      new_value: dto.availability_status,
      performed_by: userId || null,
    });

    return (await this.getUnitById(id))!;
  }

  /**
   * Compute aggregated inventory metrics
   */
    static async getInventorySummary(projectId?: string): Promise<InventorySummary> {
    const query: any = {};
    if (projectId) query.project_id = projectId;

    const units = await UnitModel.find(query);
    const total_units = units.length;
    const available_units = units.filter((u) => u.availability_status === 'Available').length;
    const reserved_units = units.filter((u) => u.availability_status === 'Reserved').length;
    const sold_units = units.filter((u) => u.availability_status === 'Sold').length;
    const total_valuation = units.reduce((sum, u) => sum + (u.price || 0), 0);
    const available_valuation = units
      .filter((u) => u.availability_status === 'Available')
      .reduce((sum, u) => sum + (u.price || 0), 0);
    const totalSqft = units.reduce((sum, u) => sum + (u.carpet_area || 0), 0);
    const avg_sqft_price = totalSqft > 0 ? Math.round(total_valuation / totalSqft) : 0;

    return {
      total_units,
      available_units,
      reserved_units,
      sold_units,
      total_valuation,
      available_valuation,
      avg_sqft_price,
    };
  }

  /**
   * Floor Matrix computation grouped by Wing and Floor
   */
    static async getFloorMatrix(projectId: string, wingId: string): Promise<FloorMatrixData | null> {
    const project = await ProjectModel.findById(projectId);
    if (!project) return null;

    const wing = project.wings.find((w) => w._id === wingId);
    if (!wing) return null;

    const units = await UnitModel.find({ project_id: projectId, wing_id: wingId });

    const floorMap: Record<number, FloorMatrixUnit[]> = {};
    for (let f = 1; f <= wing.total_floors; f++) {
      floorMap[f] = [];
    }

    for (const u of units) {
      if (!floorMap[u.floor]) floorMap[u.floor] = [];
      floorMap[u.floor].push({
        id: u._id,
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

    const floors: FloorMatrixFloor[] = Object.entries(floorMap)
      .map(([floorStr, fUnits]) => ({
        floor: Number(floorStr),
        units: fUnits.sort((a, b) => a.unit_number.localeCompare(b.unit_number)),
      }))
      .sort((a, b) => b.floor - a.floor);

    return {
      project_id: project._id,
      project_name: project.name,
      wing_id: wing._id,
      wing_name: wing.name,
      total_floors: wing.total_floors,
      floors,
    };
  }

  /**
   * Delete a unit from inventory
   */
  static async deleteUnit(id: string): Promise<void> {
    const unit = await UnitModel.findById(id);
    if (!unit) throw new Error(`Unit with ID "${id}" not found.`);

    const projectId = unit.project_id;
    await UnitModel.findByIdAndDelete(id);

    const project = await ProjectModel.findById(projectId);
    if (project) {
      project.total_units = await UnitModel.countDocuments({ project_id: project._id });
      await project.save();
    }
  }
}
