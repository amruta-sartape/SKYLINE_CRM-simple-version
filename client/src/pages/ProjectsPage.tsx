import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { projectService, ProjectFilters } from '../services/project.service';
import type { PropertyProject, ProjectFormData } from '../types/property.types';
import { ProjectCard } from '../components/property/ProjectCard';
import { ProjectFormModal } from '../components/property/ProjectFormModal';
import { ProjectDetailModal } from '../components/property/ProjectDetailModal';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Alert } from '../components/ui/Alert';
import {
  Building2,
  Plus,
  Search,
  Filter,
  RefreshCw,
  LayoutGrid,
  List,
  MapPin,
  CheckCircle2,
  Clock,
  CheckCheck,
} from 'lucide-react';

export const ProjectsPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isAdmin = user?.roles?.includes('ADMIN' as any) || false;

  const [projects, setProjects] = useState<PropertyProject[]>([]);
  const [totalProjects, setTotalProjects] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page] = useState(1);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Modals
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [selectedProjectForEdit, setSelectedProjectForEdit] = useState<PropertyProject | null>(null);
  const [selectedProjectForView, setSelectedProjectForView] = useState<PropertyProject | null>(null);

  const fetchProjects = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const filters: ProjectFilters = {
        search: search.trim() || undefined,
        city: cityFilter || undefined,
        status: (statusFilter as any) || undefined,
        page,
        limit: 20,
      };

      const result = await projectService.list(filters);
      setProjects(result.projects);
      setTotalProjects(result.total);
    } catch (err: any) {
      setError(err.message || 'Failed to load projects catalog.');
    } finally {
      setIsLoading(false);
    }
  }, [search, cityFilter, statusFilter, page]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const handleCreateProject = async (data: ProjectFormData) => {
    await projectService.create(data);
    await fetchProjects();
  };

  const handleUpdateProject = async (data: ProjectFormData) => {
    if (!selectedProjectForEdit) return;
    await projectService.update(selectedProjectForEdit.id, data);
    await fetchProjects();
  };

  const handleExploreInventory = (projectId: string) => {
    navigate(`/inventory?project_id=${projectId}`);
  };

  // Compute Aggregates
  const totalUnits = projects.reduce((acc, p) => acc + (p.total_units || 0), 0);
  const totalAvailable = projects.reduce((acc, p) => acc + (p.available_units || 0), 0);
  const totalReserved = projects.reduce((acc, p) => acc + (p.reserved_units || 0), 0);
  const totalSold = projects.reduce((acc, p) => acc + (p.sold_units || 0), 0);

  // Unique Cities for filter
  const cities = Array.from(new Set(projects.map((p) => p.city).filter(Boolean)));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Property Project Master
            </h1>
            <span className="px-2 py-0.5 text-[11px] font-extrabold bg-brand-50 text-brand-700 border border-brand-200 rounded-full">
              {totalProjects} Projects • {totalUnits} Units Master
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Centralized property development catalog, wing hierarchies, and unit master inventory.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchProjects}
            leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />}
          >
            Refresh
          </Button>

          {isAdmin && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                setSelectedProjectForEdit(null);
                setIsFormModalOpen(true);
              }}
              leftIcon={<Plus className="w-3.5 h-3.5" />}
            >
              Add Project
            </Button>
          )}
        </div>
      </div>

      {/* Aggregate Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-subtle flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-brand-50 text-brand-600">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Projects</span>
            <span className="text-lg font-extrabold text-slate-900">{totalProjects} Active</span>
          </div>
        </div>

        <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-subtle flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-600">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Available</span>
            <span className="text-lg font-extrabold text-emerald-700">{totalAvailable} Units</span>
          </div>
        </div>

        <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-subtle flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-amber-50 text-amber-600">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Reserved</span>
            <span className="text-lg font-extrabold text-amber-700">{totalReserved} Units</span>
          </div>
        </div>

        <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-subtle flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-slate-100 text-slate-600">
            <CheckCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Sold / Closed</span>
            <span className="text-lg font-extrabold text-slate-900">{totalSold} Units</span>
          </div>
        </div>
      </div>

      {/* Search & Filters Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-subtle flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search projects, location, code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-brand-500 bg-slate-50/50"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          {/* City Filter */}
          <div className="flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
              className="px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg bg-white text-slate-700"
            >
              <option value="">All Cities</option>
              {cities.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg bg-white text-slate-700"
            >
              <option value="">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Upcoming">Upcoming</option>
              <option value="Completed">Completed</option>
              <option value="On Hold">On Hold</option>
            </select>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center border border-slate-200 rounded-lg p-0.5 bg-slate-50">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-md ${
                viewMode === 'grid'
                  ? 'bg-white shadow-2xs text-brand-600 font-bold'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-md ${
                viewMode === 'table'
                  ? 'bg-white shadow-2xs text-brand-600 font-bold'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
              title="Table View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert
          variant="error"
          title="Catalog Load Error"
          message={error}
          onClose={() => setError(null)}
        />
      )}

      {/* Content */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="h-64 bg-slate-100/70 rounded-xl border border-slate-200 animate-pulse"
            />
          ))}
        </div>
      ) : projects.length === 0 ? (
        <div className="p-16 text-center bg-white rounded-xl border border-slate-200 text-slate-400">
          <Building2 className="w-10 h-10 mx-auto mb-2 text-slate-300" />
          <p className="text-base font-bold text-slate-700">No Projects Found</p>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            No property projects match your filter criteria. Create a new real estate project or clear search filters.
          </p>
          {isAdmin && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                setSelectedProjectForEdit(null);
                setIsFormModalOpen(true);
              }}
              leftIcon={<Plus className="w-4 h-4" />}
              className="mt-4"
            >
              Add First Project
            </Button>
          )}
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onView={(p) => setSelectedProjectForView(p)}
              onEdit={(p) => {
                setSelectedProjectForEdit(p);
                setIsFormModalOpen(true);
              }}
              onExploreInventory={handleExploreInventory}
              canEdit={isAdmin}
            />
          ))}
        </div>
      ) : (
        /* Table View */
        <div className="bg-white rounded-xl border border-slate-200/90 shadow-subtle overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Project & Code</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4">Developer</th>
                  <th className="py-3 px-4 text-center">Wings</th>
                  <th className="py-3 px-4 text-center">Units Master</th>
                  <th className="py-3 px-4">Availability</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {projects.map((p) => {
                  const total = p.total_units || 0;
                  const available = p.available_units || 0;
                  const reserved = p.reserved_units || 0;
                  const sold = p.sold_units || 0;

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[10px] font-bold bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded border border-slate-200">
                            {p.code}
                          </span>
                          <span className="font-bold text-slate-900">{p.name}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">
                        {p.location}, {p.city}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 font-medium">{p.developer}</td>
                      <td className="py-3.5 px-4 text-center font-bold text-slate-800">
                        {p.total_wings}
                      </td>
                      <td className="py-3.5 px-4 text-center font-extrabold text-slate-900">
                        {total}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1 text-[11px] font-semibold">
                          <span className="text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                            {available} Avail
                          </span>
                          <span className="text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                            {reserved} Res
                          </span>
                          <span className="text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                            {sold} Sold
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <Badge projectStatus={p.status} size="sm" />
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedProjectForView(p)}
                          >
                            Details
                          </Button>
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleExploreInventory(p.id)}
                          >
                            Units
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modals */}
      <ProjectFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setSelectedProjectForEdit(null);
        }}
        onSubmit={selectedProjectForEdit ? handleUpdateProject : handleCreateProject}
        initialData={selectedProjectForEdit}
      />

      <ProjectDetailModal
        isOpen={Boolean(selectedProjectForView)}
        onClose={() => setSelectedProjectForView(null)}
        project={selectedProjectForView}
        onExploreInventory={handleExploreInventory}
      />
    </div>
  );
};
