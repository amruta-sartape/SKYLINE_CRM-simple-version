import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { projectService } from '../services/project.service';
import { unitService } from '../services/unit.service';
import { leadService } from '../services/lead.service';
import { enquiryService } from '../services/enquiry.service';
import { PropertyProject, PropertyUnit } from '../types/property.types';
import { UserSummary, EnquiryFormData } from '../types/crm.types';
import { buildDiscoveryCatalog } from '../utils/discoveryData';
import { AppShell } from '../components/layout/AppShell';
import { PropertyGallery } from '../components/discovery/PropertyGallery';
import { ScheduleSiteVisitModal } from '../components/siteVisit/ScheduleSiteVisitModal';
import { EnquiryFormModal } from '../components/crm/EnquiryFormModal';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { useToast } from '../context/ToastContext';
import {
  ArrowLeft,
  MapPin,
  Sparkles,
  CalendarCheck,
  PhoneCall,
  ArrowRight,
  CheckCircle2,
  Building2,
  Maximize2,
  Check,
} from 'lucide-react';

export const PropertyDetailPage: React.FC = () => {
  const { propertyId, id } = useParams<{ propertyId?: string; id?: string }>();
  const activeId = propertyId || id;
  const navigate = useNavigate();
  const { showToast } = useToast();

  // Data fetching
  const [dbProjects, setDbProjects] = useState<PropertyProject[]>([]);
  const [dbUnits, setDbUnits] = useState<PropertyUnit[]>([]);
  const [executives, setExecutives] = useState<UserSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modals
  const [isSiteVisitModalOpen, setIsSiteVisitModalOpen] = useState(false);
  const [isEnquiryModalOpen, setIsEnquiryModalOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        setIsLoading(true);
        const [projRes, unitsRes, execRes] = await Promise.all([
          projectService.list({ limit: 50 }),
          unitService.list({ limit: 100 }),
          leadService.getExecutives().catch(() => [] as UserSummary[]),
        ]);

        if (isMounted) {
          setDbProjects(projRes.projects || []);
          setDbUnits(unitsRes.units || []);
          setExecutives(execRes || []);
        }
      } catch (err) {
        console.error('Failed to load property details:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  // Build full discovery catalog
  const fullCatalog = useMemo(() => {
    return buildDiscoveryCatalog(dbProjects, dbUnits);
  }, [dbProjects, dbUnits]);

  // Find targeted property
  const property = useMemo(() => {
    if (!activeId) return null;
    return (
      fullCatalog.find(
        (p) =>
          p.id === activeId ||
          p.code === activeId ||
          p.linkedProjectId === activeId ||
          p.linkedUnitId === activeId
      ) || null
    );
  }, [fullCatalog, activeId]);

  // Handle Enquiry submission
  const handleEnquirySubmit = async (formData: EnquiryFormData) => {
    try {
      await enquiryService.createEnquiry({
        ...formData,
        property_id: property?.id,
        interested_property: property?.title || formData.interested_property,
      });
      showToast({
        variant: 'success',
        message: 'Enquiry registered successfully! Inbound lead captured with full property interest.',
      });
      setIsEnquiryModalOpen(false);
    } catch (err: any) {
      showToast({
        variant: 'error',
        message: err.message || 'Failed to submit enquiry.',
      });
    }
  };

  // Loading State
  if (isLoading) {
    return (
      <AppShell>
        <div className="space-y-6 text-left animate-pulse">
          <div className="h-10 bg-white rounded-xl border border-stone-200/90 w-48" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 h-96 bg-white rounded-2xl border border-stone-200/90" />
            <div className="h-96 bg-white rounded-2xl border border-stone-200/90" />
          </div>
        </div>
      </AppShell>
    );
  }

  // Not Found State
  if (!property) {
    return (
      <AppShell>
        <div className="p-12 sm:p-16 text-center bg-white rounded-2xl border border-stone-200/90 shadow-xs space-y-4 max-w-xl mx-auto my-12">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200/60 flex items-center justify-center mx-auto text-amber-800">
            <Building2 className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-stone-900">Property Not Found</h2>
          <p className="text-xs text-stone-500 leading-relaxed max-w-md mx-auto">
            The property identifier <code className="text-amber-900 font-mono font-semibold">{activeId}</code> could not be located in the current real estate discovery catalog.
          </p>
          <div className="pt-2">
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate('/discovery')}
              leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}
              className="text-xs font-semibold bg-stone-900 hover:bg-stone-800 text-white border-0 shadow-xs"
            >
              Back to Properties
            </Button>
          </div>
        </div>
      </AppShell>
    );
  }

  const isSoldOrReserved =
    property.availability.toLowerCase().includes('sold') ||
    property.availability.toLowerCase().includes('reserved');

  return (
    <AppShell>
      <div className="space-y-6 text-left">
        {/* ========================================================================= */}
        {/* 1. TOP BREADCRUMB & BACK ACTION BAR */}
        {/* ========================================================================= */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 sm:p-4 rounded-2xl border border-stone-200/90 shadow-xs text-xs">
          <div className="flex items-center gap-2 text-stone-500 overflow-x-auto">
            <button
              type="button"
              onClick={() => navigate('/discovery')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-50 text-stone-700 hover:text-stone-950 hover:bg-stone-100 border border-stone-200 transition-colors font-semibold shrink-0 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-stone-500" />
              <span>Back to Properties</span>
            </button>

            <span className="text-stone-300">•</span>
            <Link to="/discovery" className="hover:text-amber-800 truncate font-medium">
              Discovery
            </Link>
            <span className="text-stone-300">/</span>
            <span className="text-stone-700 font-semibold">{property.mainCategory}</span>
            <span className="text-stone-300">/</span>
            <span className="text-amber-900 font-bold truncate max-w-[200px]">
              {property.title}
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="px-2.5 py-1 rounded-md bg-stone-50 text-[11px] font-mono font-semibold text-stone-600 border border-stone-200">
              ID: {property.code}
            </span>
            <Badge projectStatus={property.status} size="sm" />
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 2. MAIN 2-COLUMN HERO: GALLERY + INVESTMENT SIDEBAR */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Interactive Image Gallery (7 Cols) */}
          <div className="lg:col-span-7 xl:col-span-8">
            <PropertyGallery
              coverImage={property.images.cover}
              gallery={property.images.gallery}
              propertyTitle={property.title}
              propertyCode={property.code}
              propertySubtype={property.subtype}
            />
          </div>

          {/* Right Column: Hero Price, Overview & Action Card (5 Cols) */}
          <div className="lg:col-span-5 xl:col-span-4 flex flex-col justify-between space-y-4 bg-white p-5 sm:p-6 rounded-2xl border border-stone-200/90 shadow-xs">
            <div className="space-y-4">
              {/* Category & Title */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-900 border border-amber-200 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-700" />
                    {property.subtype}
                  </span>
                  <span className="text-xs text-stone-500 font-medium">
                    {property.mainCategory} Real Estate
                  </span>
                </div>

                <h1 className="text-xl sm:text-2xl font-bold text-stone-900 tracking-tight leading-snug">
                  {property.title}
                </h1>

                <div className="flex items-center gap-1.5 text-xs text-stone-600 pt-0.5">
                  <MapPin className="w-4 h-4 text-stone-400 shrink-0" />
                  <span className="font-medium">
                    {property.location}, {property.city}, {property.state}
                  </span>
                </div>
              </div>

              {/* Investment Price Banner */}
              <div className="p-4 bg-stone-50 rounded-xl border border-stone-200/90 space-y-1 text-left">
                <span className="text-[10px] text-stone-500 font-bold uppercase tracking-wider block">
                  Investment Valuation
                </span>
                <div className="flex items-baseline justify-between">
                  <span className="text-2xl sm:text-3xl font-bold text-stone-900 font-sans tracking-tight">
                    {property.priceLabel}
                  </span>
                  {property.pricePerSqft && (
                    <span className="text-xs font-mono font-semibold text-stone-500">
                      ₹{property.pricePerSqft.toLocaleString('en-IN')}/sq.ft
                    </span>
                  )}
                </div>
              </div>

              {/* Developer & Availability Status */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200/80">
                  <span className="text-[10px] text-stone-500 uppercase font-bold block">Developer</span>
                  <span className="font-semibold text-stone-800 mt-0.5 block truncate">
                    {property.developer}
                  </span>
                </div>

                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200/80">
                  <span className="text-[10px] text-stone-500 uppercase font-bold block">Availability</span>
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 mt-0.5 truncate">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                    {property.availability}
                  </span>
                </div>
              </div>

              {/* Quick Summary Highlights */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block">
                  Key Features
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {property.highlights.slice(0, 4).map((h, idx) => (
                    <span
                      key={idx}
                      className="text-[11px] font-medium bg-stone-100 text-stone-700 px-2.5 py-1 rounded-lg border border-stone-200 flex items-center gap-1"
                    >
                      <Check className="w-3 h-3 text-amber-700 shrink-0" />
                      <span>{h}</span>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Action Buttons Section */}
            <div className="pt-4 border-t border-stone-100 space-y-2.5">
              {isSoldOrReserved ? (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs text-center font-semibold">
                  This property is currently {property.status}. Inquire to check future releases.
                </div>
              ) : null}

              <div className="grid grid-cols-2 gap-2.5">
                <Button
                  variant="outline"
                  size="md"
                  onClick={() => setIsEnquiryModalOpen(true)}
                  leftIcon={<PhoneCall className="w-4 h-4 text-stone-600" />}
                  className="w-full text-xs font-semibold bg-white border-stone-300 text-stone-800 hover:text-stone-950 hover:bg-stone-50"
                >
                  Enquire Now
                </Button>

                <Button
                  variant="primary"
                  size="md"
                  onClick={() => setIsSiteVisitModalOpen(true)}
                  leftIcon={<CalendarCheck className="w-4 h-4" />}
                  className="w-full text-xs font-semibold bg-stone-900 hover:bg-stone-800 text-white border-0 shadow-xs"
                >
                  Request Site Visit
                </Button>
              </div>

              {property.linkedProjectId && (
                <button
                  type="button"
                  onClick={() => navigate(`/inventory?project_id=${property.linkedProjectId}`)}
                  className="w-full py-2 px-3 rounded-xl bg-stone-50 hover:bg-stone-100 border border-stone-200 text-stone-700 hover:text-stone-900 text-xs font-medium flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <Building2 className="w-3.5 h-3.5 text-stone-500" />
                  <span>Inspect Project Inventory Units</span>
                  <ArrowRight className="w-3.5 h-3.5 text-stone-400" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 3. TYPE-SPECIFIC COMPREHENSIVE SPECIFICATIONS SECTION */}
        {/* ========================================================================= */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-stone-200/90 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-amber-50 text-amber-800 border border-amber-200/60">
                <Maximize2 className="w-4 h-4" />
              </span>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-stone-900">
                  Property Overview & Specifications
                </h3>
                <p className="text-[11px] text-stone-500">
                  Verified structural, architectural, and planning parameters
                </p>
              </div>
            </div>

            <span className="px-3 py-1 rounded-full bg-stone-100 text-xs font-semibold text-stone-700 border border-stone-200">
              {property.subtype}
            </span>
          </div>

          {/* DYNAMIC CASE 1: RESIDENTIAL APARTMENT / FLAT / STUDIO */}
          {property.residentialSpecs &&
            (property.subtype === 'Apartment' ||
              property.subtype === 'Flat' ||
              property.subtype === 'Studio') && (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 text-xs">
                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200/80 space-y-1">
                  <span className="text-[10px] text-stone-500 font-bold uppercase block">Configuration</span>
                  <span className="font-bold text-stone-900 text-sm block">{property.residentialSpecs.bhk}</span>
                </div>
                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200/80 space-y-1">
                  <span className="text-[10px] text-stone-500 font-bold uppercase block">Carpet Area</span>
                  <span className="font-bold text-stone-900 text-sm block">{property.residentialSpecs.carpetArea} sq.ft</span>
                </div>
                {property.residentialSpecs.builtUpArea && (
                  <div className="p-3 bg-stone-50 rounded-xl border border-stone-200/80 space-y-1">
                    <span className="text-[10px] text-stone-500 font-bold uppercase block">Built-Up Area</span>
                    <span className="font-semibold text-stone-800 text-sm block">{property.residentialSpecs.builtUpArea} sq.ft</span>
                  </div>
                )}
                {property.residentialSpecs.floor !== undefined && (
                  <div className="p-3 bg-stone-50 rounded-xl border border-stone-200/80 space-y-1">
                    <span className="text-[10px] text-stone-500 font-bold uppercase block">Floor Level</span>
                    <span className="font-semibold text-stone-800 text-sm block">
                      Floor {property.residentialSpecs.floor} of {property.residentialSpecs.totalFloors}
                    </span>
                  </div>
                )}
                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200/80 space-y-1">
                  <span className="text-[10px] text-stone-500 font-bold uppercase block">Parking Provision</span>
                  <span className="font-semibold text-stone-800 text-sm block truncate">{property.residentialSpecs.parking}</span>
                </div>
                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200/80 space-y-1">
                  <span className="text-[10px] text-stone-500 font-bold uppercase block">Orientation / Facing</span>
                  <span className="font-semibold text-stone-800 text-sm block">{property.residentialSpecs.facing || 'East Facing Vastu'}</span>
                </div>
                {property.residentialSpecs.societyOrProject && (
                  <div className="p-3 bg-stone-50 rounded-xl border border-stone-200/80 space-y-1 col-span-2">
                    <span className="text-[10px] text-stone-500 font-bold uppercase block">Development Name</span>
                    <span className="font-bold text-amber-900 text-sm block truncate">{property.residentialSpecs.societyOrProject}</span>
                  </div>
                )}
              </div>
            )}

          {/* DYNAMIC CASE 2: VILLA / BUNGALOW / ROW HOUSE */}
          {property.residentialSpecs &&
            (property.subtype === 'Villa' ||
              property.subtype === 'Bungalow' ||
              property.subtype === 'Row House') && (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 text-xs">
                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200/80 space-y-1">
                  <span className="text-[10px] text-stone-500 font-bold uppercase block">Estate Layout</span>
                  <span className="font-bold text-amber-900 text-sm block">{property.residentialSpecs.bhk}</span>
                </div>
                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200/80 space-y-1">
                  <span className="text-[10px] text-stone-500 font-bold uppercase block">Bedrooms & Baths</span>
                  <span className="font-bold text-stone-900 text-sm block">
                    {property.residentialSpecs.bedrooms} Beds • {property.residentialSpecs.bathrooms} Baths
                  </span>
                </div>
                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200/80 space-y-1">
                  <span className="text-[10px] text-stone-500 font-bold uppercase block">Built-Up Area</span>
                  <span className="font-bold text-stone-900 text-sm block">{property.residentialSpecs.builtUpArea} sq.ft</span>
                </div>
                {property.residentialSpecs.plotArea && (
                  <div className="p-3 bg-stone-50 rounded-xl border border-stone-200/80 space-y-1">
                    <span className="text-[10px] text-stone-500 font-bold uppercase block">Freehold Plot Parcel</span>
                    <span className="font-semibold text-emerald-800 text-sm block">{property.residentialSpecs.plotArea} sq.ft Plot</span>
                  </div>
                )}
                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200/80 space-y-1">
                  <span className="text-[10px] text-stone-500 font-bold uppercase block">Structure Level</span>
                  <span className="font-semibold text-stone-800 text-sm block">{property.residentialSpecs.floor}</span>
                </div>
                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200/80 space-y-1">
                  <span className="text-[10px] text-stone-500 font-bold uppercase block">Private Parking</span>
                  <span className="font-semibold text-stone-800 text-sm block truncate">{property.residentialSpecs.parking}</span>
                </div>
                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200/80 space-y-1">
                  <span className="text-[10px] text-stone-500 font-bold uppercase block">Orientation / Facing</span>
                  <span className="font-semibold text-stone-800 text-sm block">{property.residentialSpecs.facing}</span>
                </div>
                {property.residentialSpecs.terraceArea && (
                  <div className="p-3 bg-stone-50 rounded-xl border border-stone-200/80 space-y-1">
                    <span className="text-[10px] text-stone-500 font-bold uppercase block">Private Lawn / Terrace</span>
                    <span className="font-semibold text-stone-800 text-sm block">{property.residentialSpecs.terraceArea} sq.ft Deck</span>
                  </div>
                )}
              </div>
            )}

          {/* DYNAMIC CASE 3: PENTHOUSE */}
          {property.residentialSpecs && property.subtype === 'Penthouse' && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 text-xs">
              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200/80 space-y-1">
                <span className="text-[10px] text-stone-500 font-bold uppercase block">Sky Penthouse Suite</span>
                <span className="font-bold text-amber-900 text-sm block">{property.residentialSpecs.bhk}</span>
              </div>
              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200/80 space-y-1">
                <span className="text-[10px] text-stone-500 font-bold uppercase block">Carpet Living Space</span>
                <span className="font-bold text-stone-900 text-sm block">{property.residentialSpecs.carpetArea} sq.ft</span>
              </div>
              {property.residentialSpecs.terraceArea && (
                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200/80 space-y-1">
                  <span className="text-[10px] text-stone-500 font-bold uppercase block">Private Sky Terrace</span>
                  <span className="font-bold text-amber-900 text-sm block">{property.residentialSpecs.terraceArea} sq.ft Deck</span>
                </div>
              )}
              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200/80 space-y-1">
                <span className="text-[10px] text-stone-500 font-bold uppercase block">Tower Floor Level</span>
                <span className="font-semibold text-stone-800 text-sm block">{property.residentialSpecs.floor}</span>
              </div>
              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200/80 space-y-1">
                <span className="text-[10px] text-stone-500 font-bold uppercase block">Reserved Parking</span>
                <span className="font-semibold text-stone-800 text-sm block truncate">{property.residentialSpecs.parking}</span>
              </div>
              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200/80 space-y-1">
                <span className="text-[10px] text-stone-500 font-bold uppercase block">Horizon View Facing</span>
                <span className="font-semibold text-stone-800 text-sm block">{property.residentialSpecs.facing}</span>
              </div>
            </div>
          )}

          {/* DYNAMIC CASE 4: LAND & PLOTS (STRICTLY NO BHK) */}
          {property.landSpecs && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 text-xs">
              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200/80 space-y-1">
                <span className="text-[10px] text-stone-500 font-bold uppercase block">Total Plot Area</span>
                <span className="font-bold text-emerald-800 text-sm block">{property.landSpecs.plotArea}</span>
              </div>
              {property.landSpecs.dimensions && (
                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200/80 space-y-1">
                  <span className="text-[10px] text-stone-500 font-bold uppercase block">Plot Dimensions</span>
                  <span className="font-bold text-stone-900 text-sm block">{property.landSpecs.dimensions}</span>
                </div>
              )}
              {property.landSpecs.roadWidth && (
                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200/80 space-y-1">
                  <span className="text-[10px] text-stone-500 font-bold uppercase block">Road Frontage / Width</span>
                  <span className="font-semibold text-stone-800 text-sm block">{property.landSpecs.roadWidth}</span>
                </div>
              )}
              {property.landSpecs.zoning && (
                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200/80 space-y-1">
                  <span className="text-[10px] text-stone-500 font-bold uppercase block">Zoning & Title</span>
                  <span className="font-bold text-amber-900 text-sm block truncate">{property.landSpecs.zoning}</span>
                </div>
              )}
              {property.landSpecs.facing && (
                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200/80 space-y-1">
                  <span className="text-[10px] text-stone-500 font-bold uppercase block">Plot Orientation</span>
                  <span className="font-semibold text-stone-800 text-sm block">{property.landSpecs.facing}</span>
                </div>
              )}
              {property.landSpecs.roadAccess && (
                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200/80 space-y-1">
                  <span className="text-[10px] text-stone-500 font-bold uppercase block">Access Corridor</span>
                  <span className="font-semibold text-stone-800 text-sm block truncate">{property.landSpecs.roadAccess}</span>
                </div>
              )}
              {property.landSpecs.utilities && (
                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200/80 space-y-1 col-span-2">
                  <span className="text-[10px] text-stone-500 font-bold uppercase block">Utilities & Infrastructure</span>
                  <span className="font-semibold text-stone-800 text-sm block">{property.landSpecs.utilities}</span>
                </div>
              )}
            </div>
          )}

          {/* DYNAMIC CASE 5: COMMERCIAL (STRICTLY NO RESIDENTIAL BHK) */}
          {property.commercialSpecs && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 text-xs">
              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200/80 space-y-1">
                <span className="text-[10px] text-stone-500 font-bold uppercase block">Commercial Carpet Area</span>
                <span className="font-bold text-stone-900 text-sm block">
                  {property.commercialSpecs.commercialArea.toLocaleString('en-IN')} sq.ft
                </span>
              </div>
              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200/80 space-y-1">
                <span className="text-[10px] text-stone-500 font-bold uppercase block">Building & Floor</span>
                <span className="font-bold text-stone-900 text-sm block">
                  {property.commercialSpecs.floor || property.commercialSpecs.building}
                </span>
              </div>
              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200/80 space-y-1">
                <span className="text-[10px] text-stone-500 font-bold uppercase block">Fitout / Furnishing</span>
                <span className="font-bold text-amber-900 text-sm block">
                  {property.commercialSpecs.furnishing || 'Fitted Grade-A Space'}
                </span>
              </div>
              {property.commercialSpecs.ceilingHeight && (
                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200/80 space-y-1">
                  <span className="text-[10px] text-stone-500 font-bold uppercase block">Clear Finished Height</span>
                  <span className="font-semibold text-stone-800 text-sm block">{property.commercialSpecs.ceilingHeight}</span>
                </div>
              )}
              {property.commercialSpecs.loadingDocks && (
                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200/80 space-y-1">
                  <span className="text-[10px] text-stone-500 font-bold uppercase block">Hydraulic Loading Docks</span>
                  <span className="font-semibold text-stone-800 text-sm block">{property.commercialSpecs.loadingDocks}</span>
                </div>
              )}
              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200/80 space-y-1 col-span-2">
                <span className="text-[10px] text-stone-500 font-bold uppercase block">Parking & Vehicle Ingress</span>
                <span className="font-semibold text-stone-800 text-sm block truncate">{property.commercialSpecs.parking}</span>
              </div>
            </div>
          )}

          {/* DYNAMIC CASE 6: MASTER TOWNSHIP & PROJECTS */}
          {property.projectSpecs && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 text-xs">
              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200/80 space-y-1">
                <span className="text-[10px] text-stone-500 font-bold uppercase block">Master Land Parcel</span>
                <span className="font-bold text-amber-900 text-sm block">{property.projectSpecs.landParcel}</span>
              </div>
              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200/80 space-y-1">
                <span className="text-[10px] text-stone-500 font-bold uppercase block">Total Towers / Wings</span>
                <span className="font-bold text-stone-900 text-sm block">{property.projectSpecs.totalWings} Towers</span>
              </div>
              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200/80 space-y-1">
                <span className="text-[10px] text-stone-500 font-bold uppercase block">Active Ready Units</span>
                <span className="font-semibold text-emerald-800 text-sm block">
                  {property.projectSpecs.availableUnits} of {property.projectSpecs.totalUnits} Units Ready
                </span>
              </div>
              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200/80 space-y-1">
                <span className="text-[10px] text-stone-500 font-bold uppercase block">Phase / Delivery</span>
                <span className="font-semibold text-stone-800 text-sm block">{property.projectSpecs.phase}</span>
              </div>
              {property.projectSpecs.configurations && (
                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200/80 space-y-1 col-span-2">
                  <span className="text-[10px] text-stone-500 font-bold uppercase block">Available Layout Configurations</span>
                  <span className="font-bold text-amber-900 text-sm block">{property.projectSpecs.configurations}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* 4. ABOUT THIS PROPERTY (DESCRIPTION) & HIGHLIGHTS */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* About This Property */}
          <div className="md:col-span-7 bg-white p-5 sm:p-6 rounded-2xl border border-stone-200/90 shadow-xs space-y-3">
            <h3 className="text-sm sm:text-base font-bold text-stone-900">
              About This Property
            </h3>
            <p className="text-stone-700 leading-relaxed text-xs sm:text-sm whitespace-pre-line font-normal">
              {property.description || 'Description not available.'}
            </p>
          </div>

          {/* Highlights Cards */}
          <div className="md:col-span-5 bg-white p-5 sm:p-6 rounded-2xl border border-stone-200/90 shadow-xs space-y-3">
            <h3 className="text-sm sm:text-base font-bold text-stone-900">
              Key Property Highlights
            </h3>
            <div className="space-y-2">
              {property.highlights.map((h, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2.5 p-2.5 bg-stone-50 rounded-xl border border-stone-200 text-stone-800 text-xs"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span className="font-medium">{h}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 5. COMPLETE ADDRESS & LOCATION SECTION */}
        {/* ========================================================================= */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-stone-200/90 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-stone-100 pb-3">
            <span className="p-2 rounded-xl bg-amber-50 text-amber-800 border border-amber-200/60">
              <MapPin className="w-4 h-4" />
            </span>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-stone-900">
                Complete Property Address & Connectivity
              </h3>
              <p className="text-[11px] text-stone-500">
                Official real estate title and micro-market location
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-2">
              <span className="text-[10px] text-stone-500 font-bold uppercase tracking-wider block">
                Verified Address
              </span>
              <div className="space-y-1 text-stone-700 leading-relaxed font-medium">
                <p className="text-stone-900 font-bold text-sm">{property.title}</p>
                <p>Property Code: {property.code}</p>
                <p>Area / Corridor: {property.location}</p>
                <p>City & State: {property.city}, {property.state}</p>
                <p>Developer: {property.developer}</p>
              </div>
            </div>

            <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-2">
              <span className="text-[10px] text-stone-500 font-bold uppercase tracking-wider block">
                Corridor Connectivity & Access
              </span>
              <div className="space-y-1.5 text-stone-700 text-xs">
                <p className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-stone-500" />
                  <span>Prime arterial access road with direct transit connectivity</span>
                </p>
                <p className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-stone-500" />
                  <span>Proximity to business centers, tech corridors & lifestyle amenities</span>
                </p>
                <p className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-stone-500" />
                  <span>RERA compliant & clear-title ownership documentation</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 6. MODALS: SITE VISIT & ENQUIRY WORKFLOWS */}
        {/* ========================================================================= */}
        <ScheduleSiteVisitModal
          isOpen={isSiteVisitModalOpen}
          onClose={() => setIsSiteVisitModalOpen(false)}
          preselectedProperty={property ? {
            id: property.id,
            title: property.title,
            code: property.code,
            project_id: property.linkedProjectId,
            cover_image: property.images.cover,
            subtype: property.subtype,
            city: property.city,
            price_formatted: property.priceLabel,
          } : null}
          onSuccess={() => {
            setIsSiteVisitModalOpen(false);
            showToast({
              variant: 'success',
              message: 'Site visit scheduled successfully! Details added to your schedule.',
            });
          }}
        />

        <EnquiryFormModal
          isOpen={isEnquiryModalOpen}
          onClose={() => setIsEnquiryModalOpen(false)}
          onSubmit={handleEnquirySubmit}
          initialPropertyContext={property ? {
            id: property.id,
            title: property.title,
            code: property.code,
            subtype: property.subtype,
            city: property.city,
            price: property.price,
            price_formatted: property.priceLabel,
            cover_image: property.images.cover,
          } : null}
          executives={executives}
        />
      </div>
    </AppShell>
  );
};
