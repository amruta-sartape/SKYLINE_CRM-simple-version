import React from 'react';
import { PropertyProject } from '../../types/property.types';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import {
  Building2,
  MapPin,
  Layers,
  Home,
  Eye,
  Edit2,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

interface ProjectCardProps {
  project: PropertyProject;
  onView: (project: PropertyProject) => void;
  onEdit?: (project: PropertyProject) => void;
  onExploreInventory: (projectId: string) => void;
  canEdit?: boolean;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  onView,
  onEdit,
  onExploreInventory,
  canEdit = false,
}) => {
  const total = project.total_units || 0;
  const available = project.available_units || 0;
  const reserved = project.reserved_units || 0;
  const sold = project.sold_units || 0;

  const availPercent = total > 0 ? (available / total) * 100 : 0;
  const resPercent = total > 0 ? (reserved / total) * 100 : 0;
  const soldPercent = total > 0 ? (sold / total) * 100 : 0;

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 shadow-subtle hover:shadow-card transition-all p-5 flex flex-col justify-between group">
      {/* Header */}
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                {project.code}
              </span>
              <Badge projectStatus={project.status} size="sm" />
            </div>
            <h3 className="text-base font-bold text-slate-900 group-hover:text-brand-700 transition-colors mt-1">
              {project.name}
            </h3>
          </div>

          <div className="p-2 rounded-xl bg-slate-50 border border-slate-100 text-brand-600 group-hover:bg-brand-50 transition-colors">
            <Building2 className="w-5 h-5" />
          </div>
        </div>

        {/* Location & Developer */}
        <div className="space-y-1 text-xs text-slate-600">
          <div className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate">
              {project.location}, {project.city}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
            <ShieldCheck className="w-3.5 h-3.5 text-gold-500 shrink-0" />
            <span className="truncate">{project.developer}</span>
          </div>
        </div>

        {/* Description snippet */}
        {project.description && (
          <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed bg-slate-50/50 p-2 rounded-lg border border-slate-100">
            {project.description}
          </p>
        )}

        {/* Units & Wings Metric Chips */}
        <div className="grid grid-cols-2 gap-2 py-2 border-t border-b border-slate-100 text-xs">
          <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg">
            <Layers className="w-4 h-4 text-brand-600" />
            <div>
              <span className="text-[10px] text-slate-400 block font-medium uppercase">Wings</span>
              <span className="font-bold text-slate-900">{project.total_wings} Buildings</span>
            </div>
          </div>
          <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg">
            <Home className="w-4 h-4 text-emerald-600" />
            <div>
              <span className="text-[10px] text-slate-400 block font-medium uppercase">Inventory</span>
              <span className="font-bold text-slate-900">{total} Total Units</span>
            </div>
          </div>
        </div>

        {/* Inventory Availability Progress Bar */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-600">
            <span>Availability Distribution</span>
            <span className="text-emerald-700">{available} Available</span>
          </div>
          <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden flex">
            <div
              style={{ width: `${availPercent}%` }}
              className="bg-emerald-500 h-full transition-all duration-500"
              title={`Available: ${available} (${availPercent.toFixed(0)}%)`}
            />
            <div
              style={{ width: `${resPercent}%` }}
              className="bg-amber-400 h-full transition-all duration-500"
              title={`Reserved: ${reserved} (${resPercent.toFixed(0)}%)`}
            />
            <div
              style={{ width: `${soldPercent}%` }}
              className="bg-slate-400 h-full transition-all duration-500"
              title={`Sold: ${sold} (${soldPercent.toFixed(0)}%)`}
            />
          </div>
          <div className="flex items-center justify-between text-[10px] text-slate-400 pt-0.5">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
              <span>Avail ({available})</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />
              <span>Res ({reserved})</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-slate-400 inline-block" />
              <span>Sold ({sold})</span>
            </span>
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="pt-4 mt-3 border-t border-slate-100 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onView(project)}
            leftIcon={<Eye className="w-3.5 h-3.5" />}
          >
            Details
          </Button>

          {canEdit && onEdit && (
            <button
              onClick={() => onEdit(project)}
              className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
              title="Edit Project"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => onExploreInventory(project.id)}
          rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
        >
          View Units
        </Button>
      </div>
    </div>
  );
};
