import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { unitService, UnitFilters } from '../services/unit.service';
import { projectService } from '../services/project.service';
import type {
  PropertyUnit,
  PropertyProject,
  PropertyWing,
  Amenity,
  InventorySummary,
  FloorMatrixData,
  UnitFormData,
  UpdateAvailabilityFormData,
  UnitAvailability,
} from '../types/property.types';
import { InventoryStats } from '../components/property/InventoryStats';
import { UnitFormModal } from '../components/property/UnitFormModal';
import { UnitAvailabilityModal } from '../components/property/UnitAvailabilityModal';
import { FloorMatrixView } from '../components/property/FloorMatrixView';
import { AppShell } from '../components/layout/AppShell';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Alert } from '../components/ui/Alert';
import {
  Plus,
  Search,
  Filter,
  RefreshCw,
  LayoutGrid,
  Table as TableIcon,
  Home,
  Car,
  Eye,
  Edit2,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

export const InventoryPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const isAdmin = user?.roles?.includes('ADMIN' as any) || false;
  const userPrimaryRole = user?.roles?.[0] || 'AGENT';

  // Data States
  const [units, setUnits] = useState<PropertyUnit[]>([]);
  const [totalUnits, setTotalUnits] = useState(0);
  const [summary, setSummary] = useState<InventorySummary | null>(null);
  const [projects, setProjects] = useState<PropertyProject[]>([]);
  const [amenities, setAmenities] = useState<Amenity[]>([]);
  const [matrixData, setMatrixData] = useState<FloorMatrixData | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMatrix, setIsLoadingMatrix] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // View Mode
  const [viewMode, setViewMode] = useState<'table' | 'matrix'>('table');

  // Multi-faceted Filters
  const initialProjectId = searchParams.get('project_id') || '';
  const [selectedProject, setSelectedProject] = useState<string>(initialProjectId);
  const [selectedWing, setSelectedWing] = useState<string>('');
  const [selectedConfig, setSelectedConfig] = useState<string>('');
  const [selectedAvailability, setSelectedAvailability] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [minCarpet, setMinCarpet] = useState<string>('');
  const [maxCarpet, setMaxCarpet] = useState<string>('');
  const [floorMin, setFloorMin] = useState<string>('');
  const [floorMax, setFloorMax] = useState<string>('');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState<boolean>(false);

  // Pagination & Sorting
  const [page, setPage] = useState<number>(1);
  const [sortBy, setSortBy] = useState<string>('floor');
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('ASC');
  const limit = 25;

  // Modals
  const [isUnitFormOpen, setIsUnitFormOpen] = useState<boolean>(false);
  const [selectedUnitForEdit, setSelectedUnitForEdit] = useState<PropertyUnit | null>(null);
  const [selectedUnitForStatus, setSelectedUnitForStatus] = useState<PropertyUnit | null>(null);

  // Load Projects Master & Amenities Master once
  useEffect(() => {
    async function loadMasterData() {
      try {
        const [projRes, amnRes] = await Promise.all([
          projectService.list({ limit: 100 }),
          unitService.listAmenities(),
        ]);
        setProjects(projRes.projects);
        setAmenities(amnRes);
      } catch (err: any) {
        console.error('Failed to load master metadata:', err);
      }
    }
    loadMasterData();
  }, []);

  // Sync selected project wings
  const activeProjectData = projects.find((p) => p.id === selectedProject);
  const availableWings: PropertyWing[] = activeProjectData?.wings || [];

  // Fetch Inventory Units & Summary
  const fetchInventory = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const filters: UnitFilters = {
        project_id: selectedProject || undefined,
        wing_id: selectedWing || undefined,
        configuration: selectedConfig || undefined,
        availability_status: (selectedAvailability as any) || undefined,
        search: searchQuery.trim() || undefined,
        min_price: minPrice ? Number(minPrice) : undefined,
        max_price: maxPrice ? Number(maxPrice) : undefined,
        min_carpet: minCarpet ? Number(minCarpet) : undefined,
        max_carpet: maxCarpet ? Number(maxCarpet) : undefined,
        floor_min: floorMin ? Number(floorMin) : undefined,
        floor_max: floorMax ? Number(floorMax) : undefined,
        page,
        limit,
        sort_by: sortBy,
        sort_order: sortOrder,
      };

      const [unitRes, summaryRes] = await Promise.all([
        unitService.list(filters),
        unitService.getSummary(selectedProject || undefined),
      ]);

      setUnits(unitRes.units);
      setTotalUnits(unitRes.total);
      setSummary(summaryRes);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch unit inventory.');
    } finally {
      setIsLoading(false);
    }
  }, [
    selectedProject,
    selectedWing,
    selectedConfig,
    selectedAvailability,
    searchQuery,
    minPrice,
    maxPrice,
    minCarpet,
    maxCarpet,
    floorMin,
    floorMax,
    page,
    sortBy,
    sortOrder,
  ]);

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  // Fetch Visual Floor Matrix when in matrix view
  const fetchMatrixData = useCallback(async () => {
    if (!selectedProject) return;
    const wingId = selectedWing || availableWings[0]?.id;
    if (!wingId) return;

    setIsLoadingMatrix(true);
    try {
      const data = await unitService.getFloorMatrix(selectedProject, wingId);
      setMatrixData(data);
    } catch (err) {
      console.error('Failed to load floor matrix:', err);
    } finally {
      setIsLoadingMatrix(false);
    }
  }, [selectedProject, selectedWing, availableWings]);

  useEffect(() => {
    if (viewMode === 'matrix' && selectedProject) {
      fetchMatrixData();
    }
  }, [viewMode, selectedProject, selectedWing, fetchMatrixData]);

  // Handle Unit Form Submission
  const handleSaveUnit = async (formData: UnitFormData) => {
    if (selectedUnitForEdit) {
      await unitService.update(selectedUnitForEdit.id, formData);
    } else {
      await unitService.create(formData);
    }
    await fetchInventory();
    if (viewMode === 'matrix') await fetchMatrixData();
  };

  // Handle Availability Change Submission
  const handleUpdateAvailability = async (unitId: string, data: UpdateAvailabilityFormData) => {
    await unitService.updateAvailability(unitId, data);
    await fetchInventory();
    if (viewMode === 'matrix') await fetchMatrixData();
  };

  const handleResetFilters = () => {
    setSelectedProject('');
    setSelectedWing('');
    setSelectedConfig('');
    setSelectedAvailability('');
    setSearchQuery('');
    setMinPrice('');
    setMaxPrice('');
    setMinCarpet('');
    setMaxCarpet('');
    setFloorMin('');
    setFloorMax('');
    setPage(1);
    setSearchParams({});
  };

  const formatCurrency = (amount: number) => {
    if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(2)} Cr`;
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)} L`;
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  const configOptions = ['1 BHK', '2 BHK', '3 BHK', '4 BHK', 'Studio', 'Penthouse'];
  const availabilityOptions: UnitAvailability[] = ['Available', 'Reserved', 'Sold'];

  const totalPages = Math.ceil(totalUnits / limit) || 1;

  return (
    <AppShell>
      <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Property Inventory Management
            </h1>
            <span className="px-2 py-0.5 text-[11px] font-extrabold bg-brand-50 text-brand-700 border border-brand-200 rounded-full">
              {totalUnits} Units
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Central real estate unit repository with availability transitions, specs, and visual matrix.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <div className="flex items-center border border-slate-200 rounded-lg p-0.5 bg-slate-50">
            <button
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-1 px-2.5 py-1 text-xs rounded-md font-semibold transition-all ${
                viewMode === 'table'
                  ? 'bg-white shadow-2xs text-brand-600'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <TableIcon className="w-3.5 h-3.5" />
              <span>Table</span>
            </button>
            <button
              onClick={() => {
                setViewMode('matrix');
                if (!selectedProject && projects.length > 0) {
                  setSelectedProject(projects[0].id);
                }
              }}
              className={`flex items-center gap-1 px-2.5 py-1 text-xs rounded-md font-semibold transition-all ${
                viewMode === 'matrix'
                  ? 'bg-white shadow-2xs text-brand-600'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Floor Matrix</span>
            </button>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={fetchInventory}
            leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />}
          >
            Refresh
          </Button>

          {isAdmin && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                setSelectedUnitForEdit(null);
                setIsUnitFormOpen(true);
              }}
              leftIcon={<Plus className="w-3.5 h-3.5" />}
            >
              Add Unit
            </Button>
          )}
        </div>
      </div>

      {/* Aggregate Valuation Metrics */}
      <InventoryStats summary={summary} isLoading={isLoading} />

      {/* Search & Multi-Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-subtle space-y-3">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Search */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search unit (e.g. A-101), project..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-brand-500 bg-slate-50/50"
            />
          </div>

          {/* Quick Selectors */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            {/* Project Filter */}
            <select
              value={selectedProject}
              onChange={(e) => {
                setSelectedProject(e.target.value);
                setSelectedWing('');
                setPage(1);
              }}
              className="px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg bg-white text-slate-700 font-medium"
            >
              <option value="">All Projects</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.code})
                </option>
              ))}
            </select>

            {/* Wing Filter */}
            <select
              value={selectedWing}
              onChange={(e) => {
                setSelectedWing(e.target.value);
                setPage(1);
              }}
              disabled={!selectedProject}
              className="px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg bg-white text-slate-700 disabled:opacity-40 font-medium"
            >
              <option value="">All Wings</option>
              {availableWings.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name}
                </option>
              ))}
            </select>

            {/* Configuration Filter */}
            <select
              value={selectedConfig}
              onChange={(e) => {
                setSelectedConfig(e.target.value);
                setPage(1);
              }}
              className="px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg bg-white text-slate-700 font-medium"
            >
              <option value="">All Configurations</option>
              {configOptions.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            {/* Availability Filter */}
            <select
              value={selectedAvailability}
              onChange={(e) => {
                setSelectedAvailability(e.target.value);
                setPage(1);
              }}
              className="px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg bg-white text-slate-700 font-medium"
            >
              <option value="">All Statuses</option>
              {availabilityOptions.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>

            {/* Advanced Filters Toggle */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              leftIcon={<Filter className="w-3.5 h-3.5" />}
              className={showAdvancedFilters ? 'bg-slate-100 text-brand-700 font-bold' : ''}
            >
              Filters {showAdvancedFilters ? '▲' : '▼'}
            </Button>
          </div>
        </div>

        {/* Advanced Filters Drawer */}
        {showAdvancedFilters && (
          <div className="pt-3 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs animate-in fade-in duration-150">
            <div>
              <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                Min Price (₹)
              </label>
              <input
                type="number"
                placeholder="e.g. 5000000"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg"
              />
            </div>
            <div>
              <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                Max Price (₹)
              </label>
              <input
                type="number"
                placeholder="e.g. 25000000"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg"
              />
            </div>
            <div>
              <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                Carpet Area (sq ft)
              </label>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  placeholder="Min"
                  value={minCarpet}
                  onChange={(e) => setMinCarpet(e.target.value)}
                  className="w-1/2 px-2 py-1.5 text-xs border border-slate-200 rounded-lg"
                />
                <span className="text-slate-400">-</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={maxCarpet}
                  onChange={(e) => setMaxCarpet(e.target.value)}
                  className="w-1/2 px-2 py-1.5 text-xs border border-slate-200 rounded-lg"
                />
              </div>
            </div>
            <div className="flex items-end gap-2">
              <div className="flex-1">
                <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                  Floor Range
                </label>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    placeholder="Min"
                    value={floorMin}
                    onChange={(e) => setFloorMin(e.target.value)}
                    className="w-1/2 px-2 py-1.5 text-xs border border-slate-200 rounded-lg"
                  />
                  <span className="text-slate-400">-</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={floorMax}
                    onChange={(e) => setFloorMax(e.target.value)}
                    className="w-1/2 px-2 py-1.5 text-xs border border-slate-200 rounded-lg"
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={handleResetFilters}
                className="px-2.5 py-1.5 text-xs text-rose-600 hover:bg-rose-50 rounded-lg border border-rose-200 font-semibold"
              >
                Reset
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Error Alert */}
      {error && (
        <Alert
          variant="error"
          title="Inventory Error"
          message={error}
          onClose={() => setError(null)}
        />
      )}

      {/* Main Content View */}
      {viewMode === 'matrix' ? (
        /* Visual Floor Matrix Mode */
        <FloorMatrixView
          matrixData={matrixData}
          isLoading={isLoadingMatrix}
          onSelectUnit={(id) => navigate(`/inventory/${id}`)}
          onChangeAvailability={(unit) => {
            const fullUnit = units.find((u) => u.id === unit.id) || (unit as any);
            setSelectedUnitForStatus(fullUnit);
          }}
          canManage={true}
        />
      ) : (
        /* Table View Mode */
        <div className="bg-white rounded-xl border border-slate-200/90 shadow-subtle overflow-hidden">
          {isLoading ? (
            <div className="p-12 text-center text-slate-400">
              <div className="animate-spin w-8 h-8 border-3 border-brand-600 border-t-transparent rounded-full mx-auto mb-3" />
              <p className="text-xs font-medium">Loading inventory specifications...</p>
            </div>
          ) : units.length === 0 ? (
            <div className="p-16 text-center text-slate-400">
              <Home className="w-10 h-10 mx-auto mb-2 text-slate-300" />
              <p className="text-base font-bold text-slate-700">No Inventory Units Found</p>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                No units match your active filter parameters. Adjust filters or register new units.
              </p>
              {isAdmin && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    setSelectedUnitForEdit(null);
                    setIsUnitFormOpen(true);
                  }}
                  leftIcon={<Plus className="w-4 h-4" />}
                  className="mt-4"
                >
                  Add Unit
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <tr>
                    <th
                      className="py-3 px-4 cursor-pointer hover:text-slate-800"
                      onClick={() => {
                        setSortBy('unit_number');
                        setSortOrder(sortOrder === 'ASC' ? 'DESC' : 'ASC');
                      }}
                    >
                      <div className="flex items-center gap-1">
                        <span>Unit</span>
                        <ArrowUpDown className="w-3 h-3 text-slate-400" />
                      </div>
                    </th>
                    <th className="py-3 px-4">Project & Wing</th>
                    <th
                      className="py-3 px-4 text-center cursor-pointer hover:text-slate-800"
                      onClick={() => {
                        setSortBy('floor');
                        setSortOrder(sortOrder === 'ASC' ? 'DESC' : 'ASC');
                      }}
                    >
                      <div className="flex items-center justify-center gap-1">
                        <span>Floor</span>
                        <ArrowUpDown className="w-3 h-3 text-slate-400" />
                      </div>
                    </th>
                    <th className="py-3 px-4">Config</th>
                    <th
                      className="py-3 px-4 cursor-pointer hover:text-slate-800"
                      onClick={() => {
                        setSortBy('carpet_area');
                        setSortOrder(sortOrder === 'ASC' ? 'DESC' : 'ASC');
                      }}
                    >
                      <div className="flex items-center gap-1">
                        <span>Carpet (sqft)</span>
                        <ArrowUpDown className="w-3 h-3 text-slate-400" />
                      </div>
                    </th>
                    <th
                      className="py-3 px-4 cursor-pointer hover:text-slate-800"
                      onClick={() => {
                        setSortBy('price');
                        setSortOrder(sortOrder === 'ASC' ? 'DESC' : 'ASC');
                      }}
                    >
                      <div className="flex items-center gap-1">
                        <span>Base Price (INR)</span>
                        <ArrowUpDown className="w-3 h-3 text-slate-400" />
                      </div>
                    </th>
                    <th className="py-3 px-4">Parking</th>
                    <th className="py-3 px-4">Availability</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {units.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4 font-black text-slate-900 tracking-tight text-xs sm:text-sm">
                        {u.unit_number}
                      </td>
                      <td className="py-3.5 px-4">
                        <div>
                          <span className="font-bold text-slate-900 block">{u.project_name}</span>
                          <span className="text-[11px] text-slate-500 font-medium">
                            {u.wing_name} • {u.project_city}
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-center font-bold text-slate-800">
                        {u.floor}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-brand-800 bg-brand-50 px-2 py-0.5 rounded border border-brand-200">
                          {u.configuration}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-700 font-semibold">
                        {u.carpet_area}{' '}
                        <span className="text-[10px] text-slate-400 font-normal">
                          ({u.built_up_area} built)
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-extrabold text-slate-900 block">
                          {formatCurrency(u.price)}
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium">
                          ₹{Math.round(u.price / (u.carpet_area || 1))}/sqft
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        {u.parking_slot ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                            <Car className="w-3 h-3 text-slate-500" />
                            {u.parking_slot}
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[11px]">{u.parking_type}</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <Badge availability={u.availability_status} size="sm" />
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Quick Availability Trigger */}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedUnitForStatus(u)}
                            className="text-[10px] font-bold"
                          >
                            Status
                          </Button>

                          {/* Edit Unit (Admin) */}
                          {isAdmin && (
                            <button
                              onClick={() => {
                                setSelectedUnitForEdit(u);
                                setIsUnitFormOpen(true);
                              }}
                              className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
                              title="Edit Unit"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {/* 360 Detail View */}
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => navigate(`/inventory/${u.id}`)}
                            rightIcon={<Eye className="w-3 h-3" />}
                          >
                            360°
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {!isLoading && units.length > 0 && (
            <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <div>
                Showing {(page - 1) * limit + 1} to {Math.min(page * limit, totalUnits)} of{' '}
                {totalUnits} units
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  leftIcon={<ChevronLeft className="w-3.5 h-3.5" />}
                >
                  Prev
                </Button>
                <span className="px-2 font-bold text-slate-800">
                  {page} / {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  rightIcon={<ChevronRight className="w-3.5 h-3.5" />}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      <UnitFormModal
        isOpen={isUnitFormOpen}
        onClose={() => {
          setIsUnitFormOpen(false);
          setSelectedUnitForEdit(null);
        }}
        onSubmit={handleSaveUnit}
        initialData={selectedUnitForEdit}
        projects={projects}
        amenities={amenities}
      />

      <UnitAvailabilityModal
        isOpen={Boolean(selectedUnitForStatus)}
        onClose={() => setSelectedUnitForStatus(null)}
        unit={selectedUnitForStatus}
        onSubmit={handleUpdateAvailability}
        userRole={userPrimaryRole}
      />
    </div>
    </AppShell>
  );
};
