import React from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { PropertyProject } from '../../types/property.types';
import {
  Building2,
  MapPin,
  ShieldCheck,
  Calendar,
  CheckCircle2,
  Clock,
  CheckCheck,
  ArrowRight,
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
  if (!project) return null;

  const total = project.total_units || 0;
  const available = project.available_units || 0;
  const reserved = project.reserved_units || 0;
  const sold = project.sold_units || 0;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={project.name}
      description={`Master Project Code: ${project.code} • Developer: ${project.developer}`}
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
              Explore Units
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-5 text-left text-xs">
        {/* Project Meta Card */}
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/90 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-brand-600 shrink-0" />
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Location</span>
                <span className="font-semibold text-slate-800">
                  {project.location}, {project.city}, {project.state}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-gold-600 shrink-0" />
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Developer</span>
                <span className="font-semibold text-slate-800">{project.developer}</span>
              </div>
            </div>
          </div>

          {project.description && (
            <div className="pt-2 border-t border-slate-200/80">
              <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">
                Project Overview
              </span>
              <p className="text-slate-600 leading-relaxed">{project.description}</p>
            </div>
          )}
        </div>

        {/* Inventory Summary Numbers */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
            Inventory Breakdown
          </h4>
          <div className="grid grid-cols-4 gap-2">
            <div className="p-3 bg-white border border-slate-200 rounded-lg text-center">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Total Units</span>
              <span className="text-base font-extrabold text-slate-900 mt-0.5 block">{total}</span>
            </div>
            <div className="p-3 bg-emerald-50/50 border border-emerald-200 rounded-lg text-center">
              <span className="text-[10px] text-emerald-700 uppercase font-bold block">Available</span>
              <span className="text-base font-extrabold text-emerald-800 mt-0.5 block">{available}</span>
            </div>
            <div className="p-3 bg-amber-50/50 border border-amber-200 rounded-lg text-center">
              <span className="text-[10px] text-amber-700 uppercase font-bold block">Reserved</span>
              <span className="text-base font-extrabold text-amber-800 mt-0.5 block">{reserved}</span>
            </div>
            <div className="p-3 bg-slate-100/70 border border-slate-200 rounded-lg text-center">
              <span className="text-[10px] text-slate-500 uppercase font-bold block">Sold Out</span>
              <span className="text-base font-extrabold text-slate-700 mt-0.5 block">{sold}</span>
            </div>
          </div>
        </div>

        {/* Wings List */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center justify-between">
            <span>Building Wings ({project.wings?.length || project.total_wings || 0})</span>
          </h4>

          {project.wings && project.wings.length > 0 ? (
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {project.wings.map((w) => (
                <div
                  key={w.id}
                  className="p-3 bg-white rounded-lg border border-slate-200/90 flex items-center justify-between shadow-2xs hover:border-brand-300 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-md bg-brand-50 text-brand-700">
                      <Building2 className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <span className="font-bold text-slate-900 block">{w.name}</span>
                      <span className="text-[11px] text-slate-500">
                        {w.total_floors} Floors • {w.units_per_floor} Units/Floor
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-right">
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase font-medium">Units</span>
                      <span className="font-bold text-slate-800">{w.total_units || 0} Registered</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                        <CheckCircle2 className="w-3 h-3" />
                        {w.available_units || 0}
                      </span>
                      <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold">
                        <Clock className="w-3 h-3" />
                        {w.reserved_units || 0}
                      </span>
                      <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200 text-[10px] font-medium">
                        <CheckCheck className="w-3 h-3" />
                        {w.sold_units || 0}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 text-center text-slate-400 bg-slate-50 rounded-lg border border-dashed border-slate-200">
              No wing specifications recorded yet.
            </div>
          )}
        </div>

        {/* System Footnote */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            <span>Created: {new Date(project.created_at).toLocaleDateString()}</span>
          </div>
          {project.created_by_name && <span>Manager: {project.created_by_name}</span>}
        </div>
      </div>
    </Modal>
  );
};
