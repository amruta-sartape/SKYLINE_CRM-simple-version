import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { projectService } from '../../services/project.service';
import { unitService } from '../../services/unit.service';
import { PropertyProject, PropertyUnit } from '../../types/property.types';
import { DiscoveryProperty } from '../../types/discovery.types';
import { buildDiscoveryCatalog } from '../../utils/discoveryData';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import {
  Building2,
  MapPin,
  Home,
  ArrowRight,
  Maximize2,
  Car,
  CheckCircle2,
  Sparkles,
  Compass,
} from 'lucide-react';

export const FeaturedPropertiesShowcase: React.FC = () => {
  const navigate = useNavigate();
  const [dbProjects, setDbProjects] = useState<PropertyProject[]>([]);
  const [dbUnits, setDbUnits] = useState<PropertyUnit[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadShowcaseData() {
      try {
        setIsLoading(true);
        const [projectsRes, unitsRes] = await Promise.all([
          projectService.list({ limit: 10 }).catch(() => ({ projects: [] })),
          unitService.list({ limit: 50 }).catch(() => ({ units: [] })),
        ]);

        if (isMounted) {
          setDbProjects(projectsRes.projects || []);
          setDbUnits(unitsRes.units || []);
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

  // Build full discovery catalog
  const fullCatalog = useMemo(() => {
    return buildDiscoveryCatalog(dbProjects, dbUnits);
  }, [dbProjects, dbUnits]);

  // Select 3–4 distinct featured properties with diverse classifications
  const featuredProperties = useMemo(() => {
    if (fullCatalog.length === 0) return [];

    const selected: DiscoveryProperty[] = [];
    const usedIds = new Set<string>();

    // 1. Apartment or Flat
    const apt = fullCatalog.find(
      (p) => (p.subtype === 'Apartment' || p.subtype === 'Flat') && !usedIds.has(p.id)
    );
    if (apt) {
      selected.push(apt);
      usedIds.add(apt.id);
    }

    // 2. Villa or Bungalow
    const villa = fullCatalog.find(
      (p) => (p.subtype === 'Villa' || p.subtype === 'Bungalow') && !usedIds.has(p.id)
    );
    if (villa) {
      selected.push(villa);
      usedIds.add(villa.id);
    }

    // 3. Row House or Penthouse
    const rowHouse = fullCatalog.find(
      (p) => (p.subtype === 'Row House' || p.subtype === 'Penthouse') && !usedIds.has(p.id)
    );
    if (rowHouse) {
      selected.push(rowHouse);
      usedIds.add(rowHouse.id);
    }

    // 4. Commercial Office or Residential Plot or Master Township
    const commOrLand = fullCatalog.find(
      (p) =>
        (p.mainCategory === 'Commercial' ||
          p.mainCategory === 'Land' ||
          p.mainCategory === 'Projects') &&
        !usedIds.has(p.id)
    );
    if (commOrLand) {
      selected.push(commOrLand);
      usedIds.add(commOrLand.id);
    }

    // Fallback if less than 4 selected
    if (selected.length < 4) {
      for (const p of fullCatalog) {
        if (!usedIds.has(p.id)) {
          selected.push(p);
          usedIds.add(p.id);
        }
        if (selected.length >= 4) break;
      }
    }

    return selected.slice(0, 4);
  }, [fullCatalog]);

  const getShowcaseSpecs = (p: DiscoveryProperty) => {
    let area = '1,350 sq.ft';
    let config: string = p.subtype;
    let parking = '2 Covered Bays';

    if (p.residentialSpecs) {
      area = p.residentialSpecs.carpetArea
        ? `${p.residentialSpecs.carpetArea.toLocaleString('en-IN')} sq.ft Carpet`
        : p.residentialSpecs.builtUpArea
        ? `${p.residentialSpecs.builtUpArea.toLocaleString('en-IN')} sq.ft Built-Up`
        : '1,350 sq.ft';
      config = p.residentialSpecs.bhk || p.subtype;
      parking = p.residentialSpecs.parking || '2 Covered Carports';
    } else if (p.landSpecs) {
      area = p.landSpecs.plotArea || '5,000 sq.ft Plot';
      config = p.landSpecs.zoning || 'NA Clear Title Land';
      parking = p.landSpecs.roadWidth || 'Direct Arterial Access';
    } else if (p.commercialSpecs) {
      area = p.commercialSpecs.commercialArea
        ? `${p.commercialSpecs.commercialArea.toLocaleString('en-IN')} sq.ft`
        : '3,200 sq.ft Carpet';
      config = p.commercialSpecs.furnishing || 'Grade-A Fitted Space';
      parking = p.commercialSpecs.parking || 'Reserved Basement Bays';
    } else if (p.projectSpecs) {
      area = p.projectSpecs.landParcel || 'Integrated Master Development';
      config = p.projectSpecs.configurations || '2, 3 & 4 BHK Enclaves';
      parking = `${p.projectSpecs.totalWings || 4} Towers & Clubhouses`;
    }

    return { area, config, parking };
  };

  return (
    <section className="space-y-6 text-left">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-200/80 pb-3">
        <div>
          <h2 className="text-xl font-bold text-stone-900 tracking-tight flex items-center gap-2">
            <span>Featured Properties</span>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-900 border border-amber-200">
              Curated Portfolio
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-stone-500 mt-0.5">
            Explore premier residential developments, luxury villas, and commercial real estate.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/discovery')}
            leftIcon={<Compass className="w-3.5 h-3.5 text-stone-600" />}
            className="text-xs font-semibold text-stone-700 hover:text-stone-900 border-stone-200 bg-white"
          >
            Browse All Properties
          </Button>
        </div>
      </div>

      {/* Loading Skeleton */}
      {isLoading ? (
        <div className="space-y-8 animate-pulse">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="bg-white rounded-3xl border border-stone-200/90 p-6 sm:p-8 space-y-5 shadow-xs"
            >
              <div className="w-full aspect-[16/8] min-h-[260px] bg-stone-100 rounded-2xl" />
              <div className="space-y-3">
                <div className="h-6 bg-stone-100 rounded w-1/3" />
                <div className="h-4 bg-stone-100 rounded w-1/4" />
                <div className="h-5 bg-stone-100 rounded w-1/5" />
                <div className="grid grid-cols-4 gap-3 pt-2">
                  <div className="h-14 bg-stone-50 rounded-xl" />
                  <div className="h-14 bg-stone-50 rounded-xl" />
                  <div className="h-14 bg-stone-50 rounded-xl" />
                  <div className="h-14 bg-stone-50 rounded-xl" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : featuredProperties.length === 0 ? (
        /* Empty State */
        <div className="p-12 text-center bg-white rounded-3xl border border-stone-200/90 shadow-xs space-y-4 max-w-xl mx-auto">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200/60 flex items-center justify-center mx-auto text-amber-800">
            <Building2 className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-stone-900">No Featured Properties Found</h3>
          <p className="text-xs text-stone-500 max-w-md mx-auto leading-relaxed">
            There are currently no active properties in the discovery catalog. Add new real estate listings to display them in this showcase.
          </p>
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate('/discovery')}
            className="bg-stone-900 hover:bg-stone-800 text-white font-semibold border-0 shadow-xs text-xs"
          >
            Open Property Discovery
          </Button>
        </div>
      ) : (
        /* LARGE VERTICAL PROPERTY SHOWCASE (One property per large visual section) */
        <div className="space-y-8 sm:space-y-10">
          {featuredProperties.map((property) => {
            const specs = getShowcaseSpecs(property);

            return (
              <div
                key={property.id}
                className="bg-white rounded-3xl border border-stone-200/90 shadow-xs hover:border-stone-300 transition-all p-5 sm:p-7 md:p-8 space-y-6 text-left"
              >
                {/* 1. Large Property Image */}
                <div
                  className="relative w-full aspect-[16/8] min-h-[260px] sm:min-h-[340px] md:min-h-[420px] rounded-2xl overflow-hidden bg-stone-100 border border-stone-200/80 shadow-xs group cursor-pointer"
                  onClick={() => navigate(`/discovery/${property.id}`)}
                >
                  <img
                    src={property.images.cover}
                    alt={property.title}
                    className="w-full h-full object-cover object-center group-hover:scale-102 transition-transform duration-700 ease-out"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-950/40 via-transparent to-transparent opacity-60" />

                  {/* Top Left: Subtype Tag */}
                  <div className="absolute top-3.5 left-3.5 flex items-center gap-2 z-10">
                    <span className="px-3 py-1 rounded-full bg-white/95 backdrop-blur-md text-xs font-semibold text-stone-800 border border-stone-200/80 shadow-xs flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-700" />
                      {property.subtype}
                    </span>
                    <Badge projectStatus={property.status} size="sm" />
                  </div>

                  {/* Top Right: Property Code */}
                  <div className="absolute top-3.5 right-3.5 z-10">
                    <span className="px-2.5 py-1 rounded-md bg-stone-900/80 backdrop-blur-md text-xs font-mono font-semibold text-stone-200 border border-white/15">
                      {property.code}
                    </span>
                  </div>
                </div>

                {/* 2. Property Information Below Image */}
                <div className="space-y-4">
                  {/* Property Name & Type • Location */}
                  <div className="space-y-1">
                    <h3
                      onClick={() => navigate(`/discovery/${property.id}`)}
                      className="text-xl sm:text-2xl font-bold text-stone-900 hover:text-amber-800 transition-colors tracking-tight cursor-pointer"
                    >
                      {property.title}
                    </h3>
                    <div className="flex flex-wrap items-center gap-1.5 text-xs sm:text-sm text-stone-500 font-medium">
                      <span>{property.subtype}</span>
                      <span className="text-stone-300">•</span>
                      <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                      <span>
                        {property.location}, {property.city}
                      </span>
                      {property.developer && (
                        <>
                          <span className="text-stone-300">•</span>
                          <span className="text-stone-400">{property.developer}</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Price */}
                  <div className="pt-1">
                    <span className="text-xs text-stone-400 font-medium uppercase tracking-wider block">
                      Investment Valuation
                    </span>
                    <span className="text-xl sm:text-2xl font-bold text-stone-900 font-sans tracking-tight">
                      {property.priceLabel}
                    </span>
                  </div>

                  {/* Specs Parameter Grid (Area • Configuration • Parking • Availability) */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                    {/* Area */}
                    <div className="p-3 bg-stone-50 rounded-xl border border-stone-200/80 text-xs space-y-0.5">
                      <span className="text-[10px] text-stone-500 font-semibold uppercase tracking-wider flex items-center gap-1">
                        <Maximize2 className="w-3 h-3 text-stone-400" />
                        Area / Size
                      </span>
                      <span className="font-bold text-stone-900 text-xs sm:text-sm block truncate">
                        {specs.area}
                      </span>
                    </div>

                    {/* Configuration */}
                    <div className="p-3 bg-stone-50 rounded-xl border border-stone-200/80 text-xs space-y-0.5">
                      <span className="text-[10px] text-stone-500 font-semibold uppercase tracking-wider flex items-center gap-1">
                        <Home className="w-3 h-3 text-stone-400" />
                        Configuration
                      </span>
                      <span className="font-bold text-stone-900 text-xs sm:text-sm block truncate">
                        {specs.config}
                      </span>
                    </div>

                    {/* Parking / Feature */}
                    <div className="p-3 bg-stone-50 rounded-xl border border-stone-200/80 text-xs space-y-0.5">
                      <span className="text-[10px] text-stone-500 font-semibold uppercase tracking-wider flex items-center gap-1">
                        <Car className="w-3 h-3 text-stone-400" />
                        Parking & Access
                      </span>
                      <span className="font-bold text-stone-900 text-xs sm:text-sm block truncate">
                        {specs.parking}
                      </span>
                    </div>

                    {/* Availability */}
                    <div className="p-3 bg-stone-50 rounded-xl border border-stone-200/80 text-xs space-y-0.5">
                      <span className="text-[10px] text-stone-500 font-semibold uppercase tracking-wider flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        Availability
                      </span>
                      <span className="font-bold text-emerald-800 text-xs sm:text-sm block truncate">
                        {property.availability}
                      </span>
                    </div>
                  </div>

                  {/* Short property highlight */}
                  {property.description && (
                    <p className="text-xs sm:text-sm text-stone-600 leading-relaxed max-w-4xl pt-1">
                      {property.description}
                    </p>
                  )}

                  {/* Action Button */}
                  <div className="pt-3 border-t border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <Button
                      variant="primary"
                      size="md"
                      onClick={() => navigate(`/discovery/${property.id}`)}
                      rightIcon={<ArrowRight className="w-4 h-4" />}
                      className="text-xs sm:text-sm font-semibold bg-stone-900 hover:bg-stone-800 text-white px-5 py-2.5 rounded-xl border-0 shadow-xs"
                    >
                      View Property Details
                    </Button>

                    <span className="text-[11px] text-stone-400 font-medium">
                      Verified real-estate listing with complete specifications & photo gallery
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};
