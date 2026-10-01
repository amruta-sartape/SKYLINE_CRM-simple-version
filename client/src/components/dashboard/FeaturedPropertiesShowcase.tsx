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
        // Fetch real database projects & units
        const [projectsRes, unitsRes] = await Promise.all([
          projectService.list({ limit: 10 }),
          unitService.list({ limit: 50 }),
        ]);

        if (isMounted) {
          const distinctProjects: PropertyProject[] = [];
          const seenNames = new Set<string>();

          for (const p of projectsRes.projects) {
            if (!seenNames.has(p.name)) {
              seenNames.add(p.name);
              distinctProjects.push(p);
            }
            if (distinctProjects.length >= 4) break;
          }

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
        { configs: '2, 3 & 4 BHK Residences', area: '950 – 2,850 sq.ft', price: '₹1.85 Cr – ₹4.50 Cr', count: 8 },
        { configs: '3 & 4 BHK Designer Suites', area: '1,450 – 3,200 sq.ft', price: '₹1.60 Cr – ₹3.80 Cr', count: 12 },
        { configs: '2 & 3 BHK Condos', area: '1,100 – 2,400 sq.ft', price: '₹1.20 Cr – ₹2.90 Cr', count: 6 },
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-3">
        <div>
          <h2 className="text-lg font-bold text-stone-900 tracking-tight flex items-center gap-2">
            <span>Featured Properties</span>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-stone-100 text-stone-700">
              Active Portfolio
            </span>
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Key residential and commercial developments with ready inventory.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/discovery')}
            leftIcon={<Compass className="w-3.5 h-3.5 text-stone-600" />}
            className="text-xs font-medium text-stone-700 hover:text-stone-900 border-stone-200 bg-white"
          >
            All Properties
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/inventory')}
            className="text-xs font-medium text-stone-700 hover:text-stone-900 border-stone-200 bg-white"
          >
            Unit Matrix
          </Button>
        </div>
      </div>

      {/* Loading Skeleton */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 animate-pulse">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs h-96">
              <div className="h-48 bg-stone-100" />
              <div className="p-5 space-y-3">
                <div className="h-4 bg-stone-100 rounded w-3/4" />
                <div className="h-3 bg-stone-100 rounded w-1/2" />
                <div className="h-10 bg-stone-100 rounded w-full mt-4" />
              </div>
            </div>
          ))}
        </div>
      ) : projects.length === 0 ? (
        /* Empty State */
        <div className="p-10 text-center bg-white rounded-2xl border border-stone-200 shadow-xs space-y-3">
          <Building2 className="w-10 h-10 text-stone-400 mx-auto" />
          <h3 className="text-sm font-bold text-stone-800">No Projects Found</h3>
          <p className="text-xs text-stone-500 max-w-md mx-auto">
            Add new property developments in the Projects Master to showcase them on this portfolio board.
          </p>
          <Button variant="primary" size="sm" onClick={() => navigate('/properties')} className="bg-stone-900 text-white">
            Open Projects Master
          </Button>
        </div>
      ) : (
        /* 4-Card Unique Project Gallery Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
          {projects.map((project, idx) => {
            const imageSet = getProjectImageSet(project, idx);
            const activeIdx = cardImageIndices[project.id] || 0;
            const currentImg = imageSet.gallery[activeIdx] || imageSet.gallery[0];
            const specs = getProjectSpecs(project.id, idx);

            return (
              <div
                key={project.id}
                className="group bg-white rounded-2xl border border-stone-200/90 hover:border-stone-400/80 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between overflow-hidden relative"
              >
                {/* 1. Large Project Image with Gallery Carousel Controls */}
                <div
                  className="relative h-48 sm:h-50 w-full overflow-hidden bg-stone-100 shrink-0 cursor-pointer"
                  onClick={() => setSelectedProject(project)}
                >
                  <img
                    src={currentImg.url}
                    alt={currentImg.altText}
                    className="w-full h-full object-cover object-center group-hover:scale-103 transition-transform duration-500 ease-out"
                    loading="lazy"
                  />
                  
                  {/* Subtle Gradient Shade */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

                  {/* Top Left: Category Badge */}
                  <div className="absolute top-3 left-3 flex items-center gap-1.5 z-10">
                    <span className="px-2.5 py-0.5 rounded-full bg-white/90 backdrop-blur-md text-[10px] font-bold text-stone-800 border border-stone-200/60 shadow-xs">
                      {currentImg.category}
                    </span>
                  </div>

                  {/* Top Right: Gallery Counter Indicator */}
                  <div className="absolute top-3 right-3 flex items-center gap-1.5 z-10">
                    <span className="px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-[10px] font-mono font-medium text-white flex items-center gap-1">
                      <Images className="w-3 h-3 text-stone-200" />
                      {activeIdx + 1}/{imageSet.gallery.length}
                    </span>
                  </div>

                  {/* Left & Right Interactive Carousel Arrows */}
                  <div className="absolute inset-y-0 left-0 right-0 flex items-center justify-between px-2 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                    <button
                      type="button"
                      onClick={(e) => handlePrevImage(e, project.id, imageSet.gallery.length)}
                      className="p-1.5 rounded-full bg-black/60 text-white hover:bg-black transition-colors cursor-pointer"
                      title="Previous Image"
                      aria-label="Previous image"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => handleNextImage(e, project.id, imageSet.gallery.length)}
                      className="p-1.5 rounded-full bg-black/60 text-white hover:bg-black transition-colors cursor-pointer"
                      title="Next Image"
                      aria-label="Next image"
                    >
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Bottom Image Info: Starting Price & Available Units */}
                  <div className="absolute bottom-2.5 left-3.5 right-3.5 flex items-end justify-between text-white z-10">
                    <div>
                      <span className="text-[10px] text-stone-200 block font-medium uppercase tracking-wider">
                        Price Range
                      </span>
                      <span className="text-sm font-bold text-white drop-shadow-sm font-sans tracking-tight">
                        {specs.priceRange}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-300">
                        <CheckCircle2 className="w-3 h-3" />
                        {specs.availableCount} Available
                      </span>
                    </div>
                  </div>
                </div>

                {/* 2. Card Body: Real Project Information */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3.5">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <h3
                        onClick={() => setSelectedProject(project)}
                        className="text-sm font-bold text-stone-900 group-hover:text-stone-700 transition-colors line-clamp-1 cursor-pointer"
                      >
                        {project.name}
                      </h3>
                      <Badge projectStatus={project.status} size="xs" />
                    </div>
                    <div className="flex items-center gap-1 text-xs text-stone-500">
                      <MapPin className="w-3 h-3 text-stone-400 shrink-0" />
                      <span className="truncate">{project.location}, {project.city}</span>
                    </div>
                  </div>

                  {/* Configurations & Specs */}
                  <div className="p-2.5 bg-stone-50 rounded-xl border border-stone-200/60 text-xs space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-stone-500 font-medium">Layouts:</span>
                      <span className="font-semibold text-stone-800 truncate max-w-[140px]">{specs.configs}</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-stone-500 font-medium">Carpet Area:</span>
                      <span className="font-medium text-stone-700">{specs.areaRange}</span>
                    </div>
                  </div>

                  {/* Wings & Buildings Summary */}
                  <div className="flex items-center justify-between text-[11px] text-stone-500 pt-1 border-t border-stone-100">
                    <span className="flex items-center gap-1">
                      <Layers className="w-3 h-3 text-stone-400" />
                      <span>{project.total_wings || 1} Towers</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <Home className="w-3 h-3 text-stone-400" />
                      <span>{project.total_units || 0} Total Units</span>
                    </span>
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-2 flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedProject(project)}
                      leftIcon={<Eye className="w-3 h-3" />}
                      className="w-1/2 text-xs font-medium text-stone-700 hover:text-stone-900 border-stone-200 bg-white"
                    >
                      Details
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleExploreProject(project.id)}
                      rightIcon={<ArrowRight className="w-3 h-3" />}
                      className="w-1/2 text-xs font-semibold bg-stone-900 hover:bg-stone-800 text-white shadow-xs border-0"
                    >
                      Units
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Project Detail Modal */}
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
