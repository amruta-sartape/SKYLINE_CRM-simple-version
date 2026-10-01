import React, { useState } from 'react';
import { PropertyProject } from '../../types/property.types';
import { getProjectImageSet } from '../../utils/propertyImageMap';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import {
  MapPin,
  Layers,
  Home,
  Eye,
  Edit2,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  ChevronLeft,
  ChevronRight,
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
  const [activeImageIdx, setActiveImageIdx] = useState(0);

  const total = project.total_units || 0;
  const available = project.available_units || 0;
  const reserved = project.reserved_units || 0;
  const sold = project.sold_units || 0;

  const availPercent = total > 0 ? (available / total) * 100 : 0;
  const resPercent = total > 0 ? (reserved / total) * 100 : 0;
  const soldPercent = total > 0 ? (sold / total) * 100 : 0;

  const imageSet = getProjectImageSet(project);
  const currentImage = imageSet.gallery[activeImageIdx] || imageSet.gallery[0];

  const handlePrevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveImageIdx((prev) => (prev > 0 ? prev - 1 : imageSet.gallery.length - 1));
  };

  const handleNextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveImageIdx((prev) => (prev < imageSet.gallery.length - 1 ? prev + 1 : 0));
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-subtle hover:shadow-card-hover transition-all duration-300 flex flex-col justify-between group overflow-hidden">
      {/* 1. Photorealistic Real Estate Image Header with Gallery Controls */}
      <div className="relative h-44 w-full overflow-hidden bg-slate-900 shrink-0">
        <img
          src={currentImage.url}
          alt={currentImage.altText}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-transparent to-black/40" />

        {/* Top Badges */}
        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 z-10">
          <span className="text-[10px] font-bold uppercase tracking-wider text-white bg-slate-900/80 backdrop-blur-md px-2 py-0.5 rounded border border-white/20 shadow-xs">
            {project.code}
          </span>
          <Badge projectStatus={project.status} size="sm" />
        </div>

        <div className="absolute top-2.5 right-2.5 z-10 flex items-center gap-1.5">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-900/80 backdrop-blur-md text-[9px] font-semibold text-amber-300 border border-amber-400/30 shadow-xs">
            <Sparkles className="w-2.5 h-2.5 text-amber-400" />
            {currentImage.category}
          </span>
        </div>

        {/* Gallery Carousel Arrows (Visible on card hover) */}
        <div className="absolute inset-y-0 left-1 right-1 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity z-20 pointer-events-none">
          <button
            type="button"
            onClick={handlePrevImage}
            className="pointer-events-auto p-1.5 rounded-full bg-slate-950/70 hover:bg-slate-900 text-white backdrop-blur-md border border-white/20 shadow-md transition-transform hover:scale-110"
            title="Previous Image"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={handleNextImage}
            className="pointer-events-auto p-1.5 rounded-full bg-slate-950/70 hover:bg-slate-900 text-white backdrop-blur-md border border-white/20 shadow-md transition-transform hover:scale-110"
            title="Next Image"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Bottom Banner Title & Image Indicator */}
        <div className="absolute bottom-2 left-3 right-3 text-white z-10 flex items-end justify-between">
          <div className="truncate pr-2">
            <h3 className="text-sm sm:text-base font-bold text-white tracking-tight drop-shadow-sm truncate">
              {project.name}
            </h3>
            <p className="text-[10px] text-slate-300 drop-shadow-xs truncate">
              {currentImage.label}
            </p>
          </div>
          <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-950/75 border border-white/10 text-slate-300 shrink-0">
            {activeImageIdx + 1} / {imageSet.gallery.length}
          </span>
        </div>
      </div>

      {/* 2. Body Details */}
      <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
        <div className="space-y-2.5">
          {/* Location & Developer */}
          <div className="space-y-1 text-xs text-slate-600">
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="truncate">
                {project.location}, {project.city}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span className="truncate">{project.developer}</span>
            </div>
          </div>

          {/* Description snippet */}
          {project.description && (
            <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed bg-slate-50 p-2 rounded-lg border border-slate-100">
              {project.description}
            </p>
          )}

          {/* Units & Wings Metric Chips */}
          <div className="grid grid-cols-2 gap-2 py-1.5 border-t border-b border-slate-100 text-xs">
            <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg">
              <Layers className="w-4 h-4 text-brand-600" />
              <div>
                <span className="text-[10px] text-slate-400 block font-medium uppercase">Wings</span>
                <span className="font-bold text-slate-900">{project.total_wings} Towers</span>
              </div>
            </div>
            <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg">
              <Home className="w-4 h-4 text-emerald-600" />
              <div>
                <span className="text-[10px] text-slate-400 block font-medium uppercase">Inventory</span>
                <span className="font-bold text-slate-900">{total} Total Flats</span>
              </div>
            </div>
          </div>

          {/* Inventory Availability Progress Bar */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[11px] font-semibold text-slate-600">
              <span>Availability Distribution</span>
              <span className="text-emerald-700 font-bold">{available} Units Ready</span>
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
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                <span>Avail ({available})</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block" />
                <span>Res ({reserved})</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 inline-block" />
                <span>Sold ({sold})</span>
              </span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onView(project)}
              leftIcon={<Eye className="w-3.5 h-3.5" />}
              className="text-xs"
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
            className="text-xs shadow-xs"
          >
            Inventory
          </Button>
        </div>
      </div>
    </div>
  );
};
