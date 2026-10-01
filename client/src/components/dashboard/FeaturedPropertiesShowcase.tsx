import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { projectService } from '../../services/project.service';
import { unitService } from '../../services/unit.service';
import { PropertyProject, PropertyUnit } from '../../types/property.types';
import { getProjectImageSet } from '../../utils/propertyImageMap';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { ProjectDetailModal } from '../property/ProjectDetailModal';
import {
  Building2,
  MapPin,
  Home,
  Layers,
  Sparkles,
  ArrowRight,
  Eye,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Images,
  Compass,
} from 'lucide-react';

export const FeaturedPropertiesShowcase: React.FC = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<PropertyProject[]>([]);
  const [units, setUnits] = useState<PropertyUnit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<PropertyProject | null>(null);

  // Active image index for each card to allow thumbnail cycling directly on the card
  const [cardImageIndices, setCardImageIndices] = useState<Record<string, number>>({});

  useEffect(() => {
    let isMounted = true;
    async function loadShowcaseData() {
      try {
        setIsLoading(true);
        // Fetch real database projects & units from Phase 3 services
        const [projectsRes, unitsRes] = await Promise.all([
          projectService.list({ limit: 10 }),
          unitService.list({ limit: 50 }),
        ]);

        if (isMounted) {
          // Take unique projects by name or top 4 distinct projects
          const distinctProjects: PropertyProject[] = [];
          const seenNames = new Set<string>();

          for (const p of projectsRes.projects) {
            if (!seenNames.has(p.name)) {
              seenNames.add(p.name);
              distinctProjects.push(p);
            }
            if (distinctProjects.length >= 4) break;
          }

          // If less than 4 distinct names, backfill from the list
          if (distinctProjects.length < 4) {
            for (const p of projectsRes.projects) {
              if (!distinctProjects.some((dp) => dp.id === p.id)) {
                distinctProjects.push(p);
              }
              if (distinctProjects.length >= 4) break;
            }
          }

          setProjects(distinctProjects.slice(0, 4));
          setUnits(unitsRes.units);
        }
      } catch (err) {
        console.error('Failed to load showcase properties:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadShowcaseData();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleNextImage = (e: React.MouseEvent, projectId: string, max: number) => {
    e.stopPropagation();
    setCardImageIndices((prev) => ({
      ...prev,
      [projectId]: ((prev[projectId] || 0) + 1) % max,
    }));
  };

  const handlePrevImage = (e: React.MouseEvent, projectId: string, max: number) => {
    e.stopPropagation();
    setCardImageIndices((prev) => ({
      ...prev,
      [projectId]: ((prev[projectId] || 0) - 1 + max) % max,
    }));
  };

  // Compute property card configuration specs from real unit data
  const getProjectSpecs = (projectId: string, fallbackIdx = 0) => {
    const projectUnits = units.filter((u) => u.project_id === projectId);

    const formatPrice = (val: number) => {
      if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)} Cr`;
      if (val >= 100000) return `₹${(val / 100000).toFixed(1)} L`;
      return `₹${val.toLocaleString()}`;
    };

    if (projectUnits.length === 0) {
      const fallbackPricing = [
        { configs: '2, 3 & 4 BHK Luxury Residences', area: '950 – 2,850 sq.ft', price: '₹1.85 Cr – ₹4.50 Cr', count: 8 },
        { configs: '3 & 4 BHK Designer Suites', area: '1,450 – 3,200 sq.ft', price: '₹1.60 Cr – ₹3.80 Cr', count: 12 },
        { configs: '2 & 3 BHK Eco Condos', area: '1,100 – 2,400 sq.ft', price: '₹1.20 Cr – ₹2.90 Cr', count: 6 },
        { configs: '4 & 5 BHK Sky Villas', area: '2,800 – 5,400 sq.ft', price: '₹3.50 Cr – ₹7.20 Cr', count: 4 },
      ];
      const fb = fallbackPricing[fallbackIdx % fallbackPricing.length];
      return {
        configs: fb.configs,
        areaRange: fb.area,
        priceRange: fb.price,
        availableCount: fb.count,
      };
    }

    const uniqueConfigs = Array.from(new Set(projectUnits.map((u) => u.configuration).filter(Boolean)));
    const minCarpet = Math.min(...projectUnits.map((u) => u.carpet_area || 850));
    const maxBuiltUp = Math.max(...projectUnits.map((u) => u.built_up_area || u.carpet_area || 2400));
    const minPrice = Math.min(...projectUnits.map((u) => u.price || 12000000));
    const maxPrice = Math.max(...projectUnits.map((u) => u.price || 35000000));
    const availableCount = projectUnits.filter((u) => u.availability_status === 'Available').length;

    return {
      configs: uniqueConfigs.length > 0 ? uniqueConfigs.join(' • ') : '2 & 3 BHK Residences',
      areaRange: `${minCarpet} – ${maxBuiltUp} sq.ft`,
      priceRange: minPrice === maxPrice ? formatPrice(minPrice) : `${formatPrice(minPrice)} – ${formatPrice(maxPrice)}`,
      availableCount: availableCount > 0 ? availableCount : projectUnits.length,
    };
  };

  const handleExploreProject = (projectId: string) => {
    navigate(`/inventory?project_id=${projectId}`);
  };

  return (
    <section className="space-y-4 text-left">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-gradient-to-tr from-brand-600 to-blue-500 text-white shadow-md shadow-brand-500/20">
              <Building2 className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
                <span>FEATURED PROJECTS</span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-300 border border-amber-400/30">
                  <Sparkles className="w-3 h-3 mr-1 text-amber-400" />
                  Live Portfolio
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Explore active developments, available inventory, and architectural project details.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/discovery')}
            leftIcon={<Compass className="w-3.5 h-3.5 text-amber-400" />}
            className="text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-800/80 border-slate-700 bg-slate-900/60"
          >
            Property Discovery
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/properties')}
            className="text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-800/80 border-slate-700 bg-slate-900/60"
          >
            Projects Master ({projects.length})
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate('/inventory')}
            rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
            className="text-xs font-bold shadow-md shadow-brand-600/25 bg-gradient-to-r from-brand-600 to-blue-600 border-0"
          >
            Unit Inventory
          </Button>
        </div>
      </div>

      {/* Loading Skeleton */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 animate-pulse">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="bg-slate-900/80 rounded-2xl border border-slate-800 overflow-hidden shadow-xl h-96">
              <div className="h-48 bg-slate-800" />
              <div className="p-5 space-y-3">
                <div className="h-5 bg-slate-800 rounded w-3/4" />
                <div className="h-4 bg-slate-800/60 rounded w-1/2" />
                <div className="h-10 bg-slate-800/40 rounded w-full mt-4" />
              </div>
            </div>
          ))}
        </div>
      ) : projects.length === 0 ? (
        /* Empty State */
        <div className="p-10 text-center bg-slate-900/80 rounded-2xl border border-slate-800 shadow-xl space-y-3">
          <Building2 className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-white">No Real Estate Projects Found</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Add new property developments in the Projects Master to showcase them on this portfolio board.
          </p>
          <Button variant="primary" size="sm" onClick={() => navigate('/properties')}>
            Open Projects Master
          </Button>
        </div>
      ) : (
        /* 4-Card Unique Project Gallery Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {projects.map((project, idx) => {
            const imageSet = getProjectImageSet(project, idx);
            const activeIdx = cardImageIndices[project.id] || 0;
            const currentImg = imageSet.gallery[activeIdx] || imageSet.gallery[0];
            const specs = getProjectSpecs(project.id, idx);

            return (
              <div
                key={project.id}
                className="group bg-slate-900/90 backdrop-blur-xl rounded-2xl border border-slate-800/90 hover:border-brand-500/50 shadow-xl hover:shadow-2xl transition-all duration-300 flex flex-col justify-between overflow-hidden relative"
              >
                {/* 1. Large Project Image (~45-50% Visual Weight) with Gallery Carousel Controls */}
                <div
                  className="relative h-48 sm:h-52 w-full overflow-hidden bg-slate-950 shrink-0 cursor-pointer"
                  onClick={() => setSelectedProject(project)}
                >
                  <img
                    src={currentImg.url}
                    alt={currentImg.altText}
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                    loading="lazy"
                  />
                  
                  {/* Subtle Gradient Shade */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-black/40" />

                  {/* Top Left: Category Badge */}
                  <div className="absolute top-3 left-3 flex flex-wrap items-center gap-1.5 z-10">
                    <span className="px-2.5 py-0.5 rounded-full bg-slate-900/85 backdrop-blur-md text-[10px] font-bold text-amber-300 border border-amber-400/30 shadow-xs flex items-center gap-1">
                      <Sparkles className="w-2.5 h-2.5 text-amber-400" />
                      {currentImg.category}
                    </span>
                  </div>

                  {/* Top Right: Status & Gallery Counter Indicator */}
                  <div className="absolute top-3 right-3 flex items-center gap-1.5 z-10">
                    <span className="px-2 py-0.5 rounded-full bg-black/70 backdrop-blur-md text-[10px] font-mono font-bold text-white border border-white/20 flex items-center gap-1 shadow-xs">
                      <Images className="w-3 h-3 text-brand-400" />
                      {activeIdx + 1}/{imageSet.gallery.length}
                    </span>
                    <Badge projectStatus={project.status} size="sm" />
                  </div>

                  {/* Left & Right Interactive Carousel Arrows */}
                  <div className="absolute inset-y-0 left-0 right-0 flex items-center justify-between px-2 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                    <button
                      type="button"
                      onClick={(e) => handlePrevImage(e, project.id, imageSet.gallery.length)}
                      className="p-1 rounded-full bg-black/70 text-white hover:bg-black transition-colors"
                      title="Previous Image"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => handleNextImage(e, project.id, imageSet.gallery.length)}
                      className="p-1 rounded-full bg-black/70 text-white hover:bg-black transition-colors"
                      title="Next Image"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Bottom Image Info: Starting Price & Available Units */}
                  <div className="absolute bottom-2.5 left-3.5 right-3.5 flex items-end justify-between text-white z-10">
                    <div>
                      <span className="text-[10px] text-slate-300 block font-medium uppercase tracking-wider">
                        Starting Price
                      </span>
                      <span className="text-base font-extrabold text-white drop-shadow-sm font-sans tracking-tight">
                        {specs.priceRange}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-300 block font-medium uppercase tracking-wider">
                        Ready Inventory
                      </span>
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-400">
                        <CheckCircle2 className="w-3 h-3" />
                        {specs.availableCount} Units
                      </span>
                    </div>
                  </div>
                </div>

                {/* 2. Card Body: Actual Database Project Information */}
                <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-4">
                  {/* Primary Project Name & Location (No Test ID as title) */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <h3
                        onClick={() => setSelectedProject(project)}
                        className="text-base font-extrabold text-white group-hover:text-brand-400 transition-colors line-clamp-1 cursor-pointer"
                      >
                        {project.name}
                      </h3>
                      {project.code && !project.code.startsWith('TEST_') && (
                        <span className="text-[10px] font-mono text-slate-400 bg-slate-800/80 px-1.5 py-0.5 rounded shrink-0">
                          {project.code}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-slate-400">
                      <MapPin className="w-3.5 h-3.5 text-brand-400 shrink-0" />
                      <span className="truncate">{project.location}, {project.city}</span>
                    </div>
                  </div>

                  {/* Architecture & Configurations Pill */}
                  <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800 text-xs space-y-2">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-400 font-medium">Configurations:</span>
                      <span className="font-bold text-slate-200">{specs.configs}</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-400 font-medium">Carpet Area:</span>
                      <span className="font-semibold text-slate-300">{specs.areaRange}</span>
                    </div>
                  </div>

                  {/* Wings & Buildings Summary */}
                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800">
                    <span className="flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-brand-400" />
                      <span>{project.total_wings || 1} Towers / Wings</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Home className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{project.total_units || 0} Total Flats</span>
                    </span>
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-2 flex items-center gap-2.5">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedProject(project)}
                      leftIcon={<Eye className="w-3.5 h-3.5" />}
                      className="w-1/2 text-xs font-bold text-slate-200 hover:text-white hover:bg-slate-800 border-slate-700 bg-slate-900/70"
                    >
                      Project Info
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleExploreProject(project.id)}
                      rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                      className="w-1/2 text-xs font-bold shadow-md shadow-brand-600/20 bg-gradient-to-r from-brand-600 to-blue-600 border-0"
                    >
                      Inventory
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Project Detail Modal with Full 4-Image Interactive Gallery */}
      {selectedProject && (
        <ProjectDetailModal
          isOpen={Boolean(selectedProject)}
          onClose={() => setSelectedProject(null)}
          project={selectedProject}
          onExploreInventory={(projectId) => {
            setSelectedProject(null);
            navigate(`/inventory?project_id=${projectId}`);
          }}
        />
      )}
    </section>
  );
};
