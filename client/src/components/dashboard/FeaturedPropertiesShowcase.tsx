import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { projectService } from '../../services/project.service';
import { unitService } from '../../services/unit.service';
import { PropertyProject, PropertyUnit } from '../../types/property.types';
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

interface ShowcaseItem {
  id: string;
  title: string;
  subtype: string;
  location: string;
  city: string;
  developer?: string;
  priceLabel: string;
  image: string;
  area: string;
  config: string;
  parking: string;
  availability: string;
  description: string;
  code: string;
  status: string;
}

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

  // 4 Curated Realistic, Warm-Minimal Showcase Properties (Apartment, Villa, Row House, Commercial Office)
  const showcaseItems: ShowcaseItem[] = useMemo(() => {
    // Find matching catalog IDs to ensure full detail navigation works seamlessly
    const aptProp =
      fullCatalog.find((p) => p.subtype === 'Apartment' || p.title.toLowerCase().includes('heights')) ||
      fullCatalog[0];

    const villaProp =
      fullCatalog.find((p) => p.subtype === 'Villa' || p.title.toLowerCase().includes('oasis')) ||
      fullCatalog[1];

    const rowHouseProp =
      fullCatalog.find((p) => p.id === 'prop_res_row_01' || p.subtype === 'Row House') ||
      fullCatalog[2];

    const officeProp =
      fullCatalog.find((p) => p.id === 'prop_comm_off_01' || p.subtype === 'Office') ||
      fullCatalog[3];

    return [
      // 1. APARTMENT — Realistic, Sunlit Contemporary Indian Apartment
      {
        id: aptProp?.id || 'prop_proj_proj_002',
        title: 'Skyline Heights Contemporary 2 & 3 BHK Residences',
        subtype: 'Apartment',
        location: 'Kharadi IT Corridor',
        city: 'Pune',
        developer: 'Skyline Realty Group',
        priceLabel: '₹85 L – ₹1.45 Cr',
        image: '/images/projects/project-heights/interior.jpg',
        area: '950 – 1,450 sq.ft Carpet',
        config: '2 & 3 BHK Living',
        parking: '1 Covered Car Parking',
        availability: 'Ready to Move',
        description:
          'Sunlit residential apartments with warm wood laminate flooring, spacious living room, modular kitchen, and community clubhouse.',
        code: aptProp?.code || 'SKP-HGT-02',
        status: 'Active',
      },

      // 2. VILLA — Approachable, Sunlit Family Villa with Garden
      {
        id: villaProp?.id || 'prop_proj_proj_004',
        title: 'Skyline Palm Oasis 4 BHK Contemporary Villa',
        subtype: 'Villa',
        location: 'Whitefield',
        city: 'Bangalore',
        developer: 'Skyline Lifestyle Homes',
        priceLabel: '₹2.85 Cr – ₹3.60 Cr',
        image: '/images/projects/project-oasis/exterior.jpg',
        area: '2,850 sq.ft Built-Up',
        config: '4 BHK + Private Garden',
        parking: '2 Covered Car Bays',
        availability: 'Ready for Possession',
        description:
          'Approachable modern family villa with private backyard lawn, natural ventilation, and quiet gated community.',
        code: villaProp?.code || 'SKP-OAS-04',
        status: 'Active',
      },

      // 3. ROW HOUSE — Well-Designed Attached Row Home
      {
        id: rowHouseProp?.id || 'prop_res_row_01',
        title: 'Skyline Palms 3 BHK Garden Row House',
        subtype: 'Row House',
        location: 'Koregaon Park Annexe',
        city: 'Pune',
        developer: 'Skyline Lifestyle Homes',
        priceLabel: '₹1.45 Cr – ₹1.95 Cr',
        image: '/images/properties/prop_res_row_01/cover.jpg',
        area: '1,850 sq.ft Built-Up',
        config: '3 BHK Triplex',
        parking: '1 Covered Carport',
        availability: 'Ready to Move',
        description:
          'Well-planned attached row home with private terrace, personal parking, and tree-lined neighborhood.',
        code: rowHouseProp?.code || 'SKP-RH-04',
        status: 'Active',
      },

      // 4. COMMERCIAL OFFICE — Clean, Daylit Professional Office Suite
      {
        id: officeProp?.id || 'prop_comm_off_01',
        title: 'Skyline Tech Hub Grade-A Office Suite',
        subtype: 'Office',
        location: 'Bandra Kurla Complex (BKC)',
        city: 'Mumbai',
        developer: 'Skyline Commercial Properties',
        priceLabel: '₹2.20 Cr – ₹3.80 Cr',
        image: '/images/properties/prop_comm_off_01/lounge.jpg',
        area: '1,600 sq.ft Carpet',
        config: 'Fitted Workstations & Cabin',
        parking: '2 Dedicated Basement Slots',
        availability: 'Immediate Handover',
        description:
          'Fresh, naturally lit commercial workspace with executive conference cabin, pantry, and high-speed elevators.',
        code: officeProp?.code || 'SK-OFF-802',
        status: 'Active',
      },
    ];
  }, [fullCatalog]);

  return (
    <section className="space-y-6 text-left">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-200/80 dark:border-[#242F42] pb-3">
        <div>
          <h2 className="text-xl font-bold text-stone-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
            <span>Featured Properties</span>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-300 border border-amber-200 dark:border-amber-900/60">
              Curated Portfolio
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-stone-500 dark:text-slate-400 mt-0.5">
            Explore premier residential developments, family villas, and commercial spaces.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/discovery')}
            leftIcon={<Compass className="w-3.5 h-3.5 text-stone-600 dark:text-slate-300" />}
            className="text-xs font-semibold text-stone-700 dark:text-slate-200 hover:text-stone-900 dark:hover:text-white border-stone-200 dark:border-[#242F42] bg-white dark:bg-[#141A24]"
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
              className="bg-white dark:bg-[#141A24] rounded-3xl border border-stone-200/90 dark:border-[#242F42] p-6 sm:p-8 space-y-5 shadow-xs"
            >
              <div className="w-full aspect-[16/8] min-h-[260px] bg-stone-100 dark:bg-slate-800 rounded-2xl" />
              <div className="space-y-3">
                <div className="h-6 bg-stone-100 dark:bg-slate-800 rounded w-1/3" />
                <div className="h-4 bg-stone-100 dark:bg-slate-800 rounded w-1/4" />
                <div className="h-5 bg-stone-100 dark:bg-slate-800 rounded w-1/5" />
                <div className="grid grid-cols-4 gap-3 pt-2">
                  <div className="h-14 bg-stone-50 dark:bg-slate-800/60 rounded-xl" />
                  <div className="h-14 bg-stone-50 dark:bg-slate-800/60 rounded-xl" />
                  <div className="h-14 bg-stone-50 dark:bg-slate-800/60 rounded-xl" />
                  <div className="h-14 bg-stone-50 dark:bg-slate-800/60 rounded-xl" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : showcaseItems.length === 0 ? (
        /* Empty State */
        <div className="p-12 text-center bg-white dark:bg-[#141A24] rounded-3xl border border-stone-200/90 dark:border-[#242F42] shadow-xs space-y-4 max-w-xl mx-auto">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200/60 dark:border-amber-900/50 flex items-center justify-center mx-auto text-amber-800 dark:text-amber-300">
            <Building2 className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-stone-900 dark:text-slate-100">No Featured Properties Found</h3>
          <p className="text-xs text-stone-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
            There are currently no active properties in the discovery catalog. Add new real estate listings to display them in this showcase.
          </p>
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate('/discovery')}
            className="bg-stone-900 dark:bg-amber-500 hover:bg-stone-800 dark:hover:bg-amber-400 text-white dark:text-slate-950 font-semibold border-0 shadow-xs text-xs"
          >
            Open Property Discovery
          </Button>
        </div>
      ) : (
        /* LARGE VERTICAL PROPERTY SHOWCASE (One property per large visual section) */
        <div className="space-y-8 sm:space-y-10">
          {showcaseItems.map((property) => (
            <div
              key={property.id}
              className="bg-white dark:bg-[#141A24] rounded-3xl border border-stone-200/90 dark:border-[#242F42] shadow-xs hover:border-stone-300 dark:hover:border-slate-600 transition-all p-5 sm:p-7 md:p-8 space-y-6 text-left"
            >
              {/* 1. Large Property Image */}
              <div
                className="relative w-full aspect-[16/8] min-h-[260px] sm:min-h-[340px] md:min-h-[420px] rounded-2xl overflow-hidden bg-stone-100 dark:bg-slate-900 border border-stone-200/80 dark:border-[#242F42] shadow-xs group cursor-pointer"
                onClick={() => navigate(`/discovery/${property.id}`)}
              >
                <img
                  src={property.image}
                  alt={property.title}
                  className="w-full h-full object-cover object-center group-hover:scale-102 transition-transform duration-700 ease-out"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950/40 via-transparent to-transparent opacity-60" />

                {/* Top Left: Subtype Tag */}
                <div className="absolute top-3.5 left-3.5 flex items-center gap-2 z-10">
                  <span className="px-3 py-1 rounded-full bg-white/95 dark:bg-stone-900/95 backdrop-blur-md text-xs font-semibold text-stone-800 dark:text-stone-100 border border-stone-200/80 dark:border-stone-700 shadow-xs flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
                    {property.subtype}
                  </span>
                  <Badge projectStatus={property.status as any} size="sm" />
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
                    className="text-xl sm:text-2xl font-bold text-stone-900 dark:text-slate-100 hover:text-amber-800 dark:hover:text-amber-400 transition-colors tracking-tight cursor-pointer"
                  >
                    {property.title}
                  </h3>
                  <div className="flex flex-wrap items-center gap-1.5 text-xs sm:text-sm text-stone-500 dark:text-slate-400 font-medium">
                    <span>{property.subtype}</span>
                    <span className="text-stone-300 dark:text-slate-600">•</span>
                    <MapPin className="w-3.5 h-3.5 text-stone-400 dark:text-slate-500 shrink-0" />
                    <span>
                      {property.location}, {property.city}
                    </span>
                    {property.developer && (
                      <>
                        <span className="text-stone-300 dark:text-slate-600">•</span>
                        <span className="text-stone-400 dark:text-slate-500">{property.developer}</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Price */}
                <div className="pt-1">
                  <span className="text-xs text-stone-400 dark:text-slate-500 font-medium uppercase tracking-wider block">
                    Investment Valuation
                  </span>
                  <span className="text-xl sm:text-2xl font-bold text-stone-900 dark:text-slate-100 font-sans tracking-tight">
                    {property.priceLabel}
                  </span>
                </div>

                {/* Specs Parameter Grid (Area • Configuration • Parking • Availability) */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                  {/* Area */}
                  <div className="p-3 bg-stone-50 dark:bg-[#101622] rounded-xl border border-stone-200/80 dark:border-[#242F42] text-xs space-y-0.5">
                    <span className="text-[10px] text-stone-500 dark:text-slate-400 font-semibold uppercase tracking-wider flex items-center gap-1">
                      <Maximize2 className="w-3 h-3 text-stone-400 dark:text-slate-500" />
                      Area / Size
                    </span>
                    <span className="font-bold text-stone-900 dark:text-slate-100 text-xs sm:text-sm block truncate">
                      {property.area}
                    </span>
                  </div>

                  {/* Configuration */}
                  <div className="p-3 bg-stone-50 dark:bg-[#101622] rounded-xl border border-stone-200/80 dark:border-[#242F42] text-xs space-y-0.5">
                    <span className="text-[10px] text-stone-500 dark:text-slate-400 font-semibold uppercase tracking-wider flex items-center gap-1">
                      <Home className="w-3 h-3 text-stone-400 dark:text-slate-500" />
                      Configuration
                    </span>
                    <span className="font-bold text-stone-900 dark:text-slate-100 text-xs sm:text-sm block truncate">
                      {property.config}
                    </span>
                  </div>

                  {/* Parking / Feature */}
                  <div className="p-3 bg-stone-50 dark:bg-[#101622] rounded-xl border border-stone-200/80 dark:border-[#242F42] text-xs space-y-0.5">
                    <span className="text-[10px] text-stone-500 dark:text-slate-400 font-semibold uppercase tracking-wider flex items-center gap-1">
                      <Car className="w-3 h-3 text-stone-400 dark:text-slate-500" />
                      Parking & Access
                    </span>
                    <span className="font-bold text-stone-900 dark:text-slate-100 text-xs sm:text-sm block truncate">
                      {property.parking}
                    </span>
                  </div>

                  {/* Availability */}
                  <div className="p-3 bg-stone-50 dark:bg-[#101622] rounded-xl border border-stone-200/80 dark:border-[#242F42] text-xs space-y-0.5">
                    <span className="text-[10px] text-stone-500 dark:text-slate-400 font-semibold uppercase tracking-wider flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                      Availability
                    </span>
                    <span className="font-bold text-emerald-800 dark:text-emerald-400 text-xs sm:text-sm block truncate">
                      {property.availability}
                    </span>
                  </div>
                </div>

                {/* Short property highlight */}
                {property.description && (
                  <p className="text-xs sm:text-sm text-stone-600 dark:text-slate-300 leading-relaxed max-w-4xl pt-1">
                    {property.description}
                  </p>
                )}

                {/* Action Button */}
                <div className="pt-3 border-t border-stone-100 dark:border-[#242F42] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <Button
                    variant="primary"
                    size="md"
                    onClick={() => navigate(`/discovery/${property.id}`)}
                    rightIcon={<ArrowRight className="w-4 h-4" />}
                    className="text-xs sm:text-sm font-semibold bg-stone-900 dark:bg-amber-500 hover:bg-stone-800 dark:hover:bg-amber-400 text-white dark:text-slate-950 px-5 py-2.5 rounded-xl border-0 shadow-xs"
                  >
                    View Property Details
                  </Button>

                  <span className="text-[11px] text-stone-400 dark:text-slate-500 font-medium">
                    Verified real-estate listing with complete specifications & photo gallery
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};
