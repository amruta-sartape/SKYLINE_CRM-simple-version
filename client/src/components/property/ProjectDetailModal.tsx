import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { PropertyProject } from '../../types/property.types';
import { getProjectImageSet } from '../../utils/propertyImageMap';
import {
  MapPin,
  ShieldCheck,
  Home,
  Layers,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

interface ProjectDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: PropertyProject | null;
  onExploreInventory: (projectId: string) => void;
}

export const ProjectDetailModal: React.FC<ProjectDetailModalProps> = ({
  isOpen,
  onClose,
  project,
  onExploreInventory,
}) => {
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  if (!project) return null;

  const total = project.total_units || 0;
  const available = project.available_units || 0;
  const reserved = project.reserved_units || 0;
  const sold = project.sold_units || 0;

  const imageSet = getProjectImageSet(project);
  const activeImage = imageSet.gallery[activeImageIndex] || imageSet.gallery[0];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={project.name}
      description={`Master Project Code: ${project.code} • Location: ${project.location}, ${project.city}`}
      maxWidth="xl"
      footer={
        <div className="flex items-center justify-between w-full">
          <Badge projectStatus={project.status} size="sm" />
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onClose}>
              Close
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                onClose();
                onExploreInventory(project.id);
              }}
              rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
            >
              Explore Unit Inventory
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-5 text-left text-xs">
        {/* 1. Project Photo Gallery Showcase */}
        <div className="space-y-3">
          {/* Main Hero Image */}
          <div className="relative h-64 sm:h-72 w-full rounded-2xl overflow-hidden bg-slate-900 shadow-md">
            <img
              src={activeImage.url}
              alt={activeImage.altText}
              className="w-full h-full object-cover object-center transition-all duration-300"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/30" />

            {/* Top Badges */}
            <div className="absolute top-3 left-3 flex items-center gap-2 z-10">
              <span className="px-2.5 py-1 rounded-md bg-slate-900/80 backdrop-blur-md text-[11px] font-bold text-white border border-white/20">
                {activeImage.category}
              </span>
              <span className="px-2.5 py-1 rounded-md bg-amber-500/20 backdrop-blur-md text-[11px] font-semibold text-amber-300 border border-amber-400/30">
                {imageSet.badge}
              </span>
            </div>

            {/* Bottom Caption */}
            <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between text-white z-10">
              <div>
                <p className="text-sm font-bold drop-shadow-sm text-white">{activeImage.label}</p>
                <p className="text-[10px] text-slate-300 mt-0.5">{imageSet.category}</p>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-black/60 text-slate-300">
                {activeImageIndex + 1} / {imageSet.gallery.length}
              </span>
            </div>
          </div>

          {/* 4-Image Thumbnail Navigation Strip */}
          <div className="grid grid-cols-4 gap-2">
            {imageSet.gallery.map((img, idx) => (
              <button
                key={img.url + idx}
                type="button"
                onClick={() => setActiveImageIndex(idx)}
                className={`relative h-18 rounded-xl overflow-hidden border-2 transition-all group ${
                  activeImageIndex === idx
                    ? 'border-brand-500 ring-2 ring-brand-500/20 scale-[1.02]'
                    : 'border-slate-200 hover:border-slate-400 opacity-75 hover:opacity-100'
                }`}
              >
                <img
                  src={img.url}
                  alt={img.altText}
                  className="w-full h-full object-cover object-center"
                />
                <div className="absolute inset-0 bg-slate-950/30 group-hover:bg-transparent transition-colors" />
                <span className="absolute bottom-1 left-1.5 right-1.5 text-[9px] font-bold text-white truncate drop-shadow-xs">
                  {img.category}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* 2. Project Meta & Overview */}
        <div className="p-4 bg-slate-50 dark:bg-[#141A24] rounded-2xl border border-slate-200/90 dark:border-[#242F42] space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex items-center gap-2.5">
              <MapPin className="w-4.5 h-4.5 text-brand-600 dark:text-amber-400 shrink-0" />
              <div>
                <span className="text-[10px] text-slate-400 dark:text-slate-400 font-bold uppercase block">Location</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {project.location}, {project.city}, {project.state}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-4.5 h-4.5 text-amber-500 shrink-0" />
              <div>
                <span className="text-[10px] text-slate-400 dark:text-slate-400 font-bold uppercase block">Developer</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{project.developer}</span>
              </div>
            </div>
          </div>

          {project.description && (
            <div className="pt-2.5 border-t border-slate-200/80 dark:border-[#242F42]">
              <span className="text-[10px] text-slate-400 dark:text-slate-400 font-bold uppercase block mb-1">
                Project Overview
              </span>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-xs">{project.description}</p>
            </div>
          )}
        </div>

        {/* 3. Real Inventory Statistics */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
            Live Inventory Breakdown
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div className="p-3 bg-white dark:bg-[#101622] border border-slate-200 dark:border-[#242F42] rounded-xl text-center shadow-xs">
              <span className="text-[10px] text-slate-400 dark:text-slate-400 uppercase font-bold block">Total Units</span>
              <span className="text-base font-extrabold text-slate-900 dark:text-slate-100 mt-0.5 block">{total}</span>
            </div>
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/40 rounded-xl text-center shadow-xs">
              <span className="text-[10px] text-emerald-700 dark:text-emerald-300 uppercase font-bold block">Available</span>
              <span className="text-base font-extrabold text-emerald-800 dark:text-emerald-200 mt-0.5 block">{available}</span>
            </div>
            <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/40 rounded-xl text-center shadow-xs">
              <span className="text-[10px] text-amber-700 dark:text-amber-300 uppercase font-bold block">Reserved</span>
              <span className="text-base font-extrabold text-amber-800 dark:text-amber-200 mt-0.5 block">{reserved}</span>
            </div>
            <div className="p-3 bg-slate-100 dark:bg-[#1A2230] border border-slate-200 dark:border-[#242F42] rounded-xl text-center shadow-xs">
              <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold block">Sold Out</span>
              <span className="text-base font-extrabold text-slate-700 dark:text-slate-300 mt-0.5 block">{sold}</span>
            </div>
          </div>
        </div>

        {/* 4. Wings & Building Specifications */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          <div className="p-3 bg-slate-50 dark:bg-[#141A24] rounded-xl border border-slate-200 dark:border-[#242F42] flex items-center gap-2.5">
            <Layers className="w-5 h-5 text-brand-600 dark:text-amber-400" />
            <div>
              <span className="text-[10px] text-slate-400 dark:text-slate-400 uppercase font-bold block">Towers / Wings</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">{project.total_wings} Buildings</span>
            </div>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-[#141A24] rounded-xl border border-slate-200 dark:border-[#242F42] flex items-center gap-2.5">
            <Home className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <div>
              <span className="text-[10px] text-slate-400 dark:text-slate-400 uppercase font-bold block">Catalog Units</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">{total} Configured Units</span>
            </div>
          </div>
        </div>

        {/* Visual Notice */}
        <div className="p-2.5 rounded-lg bg-blue-50/50 dark:bg-[#141A24] border border-blue-100 dark:border-[#242F42] text-[11px] text-slate-600 dark:text-slate-300 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-brand-600 dark:text-amber-400" />
            <span>Database Records Connected to Live Inventory</span>
          </span>
          <span className="text-slate-400 dark:text-slate-500 text-[10px]">Staged Visual Photography</span>
        </div>
      </div>
    </Modal>
  );
};
