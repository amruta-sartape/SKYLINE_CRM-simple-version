import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
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
import { Modal } from '../components/ui/Modal';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
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
  Heart,
  UserCheck,
  Mail,
} from 'lucide-react';

import { propertyListingService } from '../services/propertyListing.service';
import { getProjectImageSet } from '../utils/propertyImageMap';

export const PropertyDetailPage: React.FC = () => {
  const { propertyId, id } = useParams<{ propertyId?: string; id?: string }>();
  const activeId = propertyId || id;
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();
  const { user } = useAuth();
  const { isSaved, toggleSave } = useWishlist();
  const isCustomer = user?.roles?.includes('CUSTOMER' as any);

  // Data fetching
  const [dbProjects, setDbProjects] = useState<PropertyProject[]>([]);
  const [dbUnits, setDbUnits] = useState<PropertyUnit[]>([]);
  const [dbListings, setDbListings] = useState<any[]>([]);
  const [executives, setExecutives] = useState<UserSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modals
  const [isSiteVisitModalOpen, setIsSiteVisitModalOpen] = useState(false);
  const [isEnquiryModalOpen, setIsEnquiryModalOpen] = useState(false);
  const [isAuthGateModalOpen, setIsAuthGateModalOpen] = useState(false);
  const [authGateAction, setAuthGateAction] = useState<'enquiry' | 'visit'>('enquiry');

  const handleEnquiryClick = () => {
    if (!user) {
      setAuthGateAction('enquiry');
      setIsAuthGateModalOpen(true);
      return;
    }
    setIsEnquiryModalOpen(true);
  };

  const handleSiteVisitClick = () => {
    if (!user) {
      setAuthGateAction('visit');
      setIsAuthGateModalOpen(true);
      return;
    }
    setIsSiteVisitModalOpen(true);
  };

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        setIsLoading(true);
        const [projRes, unitsRes, listingsRes, execRes] = await Promise.all([
          projectService.list({ limit: 100 }),
          unitService.list({ limit: 100 }),
          propertyListingService.list({ limit: 100 }).catch(() => ({ properties: [] })),
          leadService.getExecutives().catch(() => [] as UserSummary[]),
        ]);

        if (isMounted) {
          setDbProjects(projRes.projects || []);
          setDbUnits(unitsRes.units || []);
          setDbListings(listingsRes.properties || []);
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
    return buildDiscoveryCatalog(dbProjects, dbUnits, dbListings);
  }, [dbProjects, dbUnits, dbListings]);

  // Find targeted property
  const property = useMemo(() => {
    if (!activeId) return null;
    const cleanId = activeId.toLowerCase().trim();

    // 1. Direct match in compiled catalog
    const baseCleanId = cleanId.replace('prop_proj_', '').replace('prop_', '');
    const found = fullCatalog.find((p) => {
      const pId = p.id.toLowerCase();
      const pCode = (p.code || '').toLowerCase();
      const pLinked = (p.linkedProjectId || '').toLowerCase();
      const pTitle = p.title.toLowerCase();

      return (
        pId === cleanId ||
        pCode === cleanId ||
        pLinked === cleanId ||
        pLinked === baseCleanId ||
        pId === `prop_proj_${cleanId}` ||
        pId === `prop_proj_${baseCleanId}` ||
        cleanId === `prop_proj_${pLinked}` ||
        pId.includes(baseCleanId) ||
        pTitle === cleanId ||
        pTitle.includes(cleanId) ||
        cleanId.includes(pId)
      );
    });

    if (found) return found;

    // 2. Direct fallback matching from dbListings
    const matchedListing = dbListings.find(
      (l) =>
        l.id?.toLowerCase() === cleanId ||
        l.code?.toLowerCase() === cleanId ||
        l.title?.toLowerCase().includes(cleanId)
    );

    if (matchedListing) {
      const galleryImages =
        matchedListing.images && matchedListing.images.length > 0
          ? matchedListing.images.map((img: any) => ({
              url: img.url,
              label: img.label || matchedListing.title,
              category: img.category || 'Exterior',
              altText: img.alt_text || matchedListing.title,
            }))
          : matchedListing.cover_image
          ? [
              {
                url: matchedListing.cover_image,
                label: `${matchedListing.title} Main View`,
                category: 'Exterior',
                altText: matchedListing.title,
              },
            ]
          : [];

      const cover =
        matchedListing.cover_image ||
        galleryImages[0]?.url ||
        (matchedListing.title?.toLowerCase().includes('aurora')
          ? '/images/property-penthouse.jpg'
          : '/images/classifications/apartment.jpg');

      const fullGallery =
        galleryImages.length > 0
          ? galleryImages
          : [
              {
                url: cover,
                label: `${matchedListing.title} Main View`,
                category: 'Interior',
                altText: matchedListing.title,
              },
              {
                url: '/images/projects/project-grandeur/exterior.jpg',
                label: 'Exterior Facade',
                category: 'Exterior',
                altText: 'Exterior building view',
              },
              {
                url: '/images/projects/project-grandeur/amenities.jpg',
                label: 'Lifestyle Amenities',
                category: 'Amenities',
                altText: 'Amenities terrace',
              },
              {
                url: '/images/projects/project-grandeur/entrance.jpg',
                label: 'Arrival Lobby',
                category: 'Entrance',
                altText: 'Grand entrance lobby',
              },
            ];

      return {
        id: matchedListing.id,
        title: matchedListing.title,
        code: matchedListing.code,
        mainCategory: matchedListing.main_category,
        subtype: matchedListing.subtype,
        location: matchedListing.location,
        city: matchedListing.city,
        state: matchedListing.state || 'Maharashtra',
        developer: matchedListing.developer || 'Skyline Realty Group',
        price: Number(matchedListing.price),
        priceLabel:
          matchedListing.price_label ||
          `₹${(Number(matchedListing.price) / 10000000).toFixed(2)} Cr`,
        pricePerSqft: matchedListing.price_per_sqft || 14500,
        availability: matchedListing.availability || 'Ready to Move',
        status: matchedListing.status || 'Active',
        images: {
          cover,
          gallery: fullGallery,
        },
        highlights: Array.isArray(matchedListing.highlights)
          ? matchedListing.highlights
          : typeof matchedListing.highlights === 'string'
          ? JSON.parse(matchedListing.highlights)
          : ['Prime Location', 'RERA Approved Development', '5-Star Concierge'],
        description:
          matchedListing.description ||
          `${matchedListing.title} in prime ${matchedListing.location}, ${matchedListing.city}.`,
        featured: true,
        residentialSpecs:
          matchedListing.specs_data?.residentialSpecs ||
          (matchedListing.main_category === 'Residential'
            ? matchedListing.specs_data
            : undefined),
        landSpecs:
          matchedListing.specs_data?.landSpecs ||
          (matchedListing.main_category === 'Land' ? matchedListing.specs_data : undefined),
        commercialSpecs:
          matchedListing.specs_data?.commercialSpecs ||
          (matchedListing.main_category === 'Commercial'
            ? matchedListing.specs_data
            : undefined),
        projectSpecs:
          matchedListing.specs_data?.projectSpecs ||
          (matchedListing.main_category === 'Projects'
            ? matchedListing.specs_data
            : undefined),
      } as any;
    }

    // 3. Direct fallback matching from dbProjects
    const matchedProject = dbProjects.find(
      (p) =>
        p.id?.toLowerCase() === cleanId ||
        p.code?.toLowerCase() === cleanId ||
        p.name?.toLowerCase().includes(cleanId) ||
        cleanId.includes(p.id?.toLowerCase() || '') ||
        cleanId.includes(p.name?.toLowerCase() || '')
    );

    if (matchedProject) {
      const imgSet = getProjectImageSet(matchedProject);
      return {
        id: matchedProject.id,
        title: matchedProject.name,
        code: matchedProject.code,
        mainCategory: 'Residential',
        subtype: 'Luxury Residential Development',
        location: matchedProject.location,
        city: matchedProject.city,
        state: 'Maharashtra',
        developer: 'Skyline Realty Group',
        price: 25000000,
        priceLabel: '₹2.50 Cr - ₹6.50 Cr',
        pricePerSqft: 18500,
        availability: 'Under Construction',
        status: 'Active',
        images: {
          cover: imgSet.cover,
          gallery: imgSet.gallery,
        },
        highlights: [
          'Prime Connectivity Corridor',
          'RERA Approved Project',
          'Rooftop Horizon Lounge & Fitness Club',
          'Double-Height Grand Arrival Court',
        ],
        description:
          matchedProject.description ||
          `${matchedProject.name} is a premier luxury development located in ${matchedProject.location}, ${matchedProject.city}. Featuring world-class amenities and architectural design.`,
        featured: true,
      } as any;
    }

    // 4. Direct fallback matching from dbUnits
    const matchedUnit = dbUnits.find(
      (u) =>
        u.id?.toLowerCase() === cleanId ||
        u.unit_number?.toLowerCase() === cleanId ||
        cleanId.includes(u.id?.toLowerCase() || '')
    );

    if (matchedUnit) {
      const parentProject = dbProjects.find((p) => p.id === matchedUnit.project_id);
      const imgSet = getProjectImageSet(parentProject);
      return {
        id: matchedUnit.id,
        title: `${parentProject?.name || 'Skyline'} • Unit ${matchedUnit.unit_number}`,
        code: `${parentProject?.code || 'SKP'}-${matchedUnit.unit_number}`,
        mainCategory: 'Residential',
        subtype: matchedUnit.configuration || 'Luxury Flat',
        location: parentProject?.location || 'Prime Location',
        city: parentProject?.city || 'Mumbai',
        state: 'Maharashtra',
        developer: 'Skyline Realty Group',
        price: Number(matchedUnit.price),
        priceLabel: `₹${(Number(matchedUnit.price) / 10000000).toFixed(2)} Cr`,
        pricePerSqft: Math.round(Number(matchedUnit.price) / (Number(matchedUnit.built_up_area) || 1500)),
        availability: matchedUnit.availability_status || 'Available',
        status: 'Active',
        images: {
          cover: imgSet.cover,
          gallery: imgSet.gallery,
        },
        highlights: [
          `Spacious ${matchedUnit.configuration} Layout`,
          `${matchedUnit.carpet_area} sq.ft Carpet Area`,
          `Floor ${matchedUnit.floor || 1}`,
          `${matchedUnit.facing || 'East'} Facing Corner Unit`,
        ],
        description: `Premium ${matchedUnit.configuration} unit in ${parentProject?.name || 'Skyline Residences'}, offering ${matchedUnit.built_up_area || 1500} sq.ft of luxurious living space.`,
        featured: true,
      } as any;
    }

    console.warn(`[PropertyDetail] Property ID "${activeId}" could not be located in catalog.`);
    return null;
  }, [fullCatalog, dbListings, dbProjects, dbUnits, activeId]);

  // Resolve assigned advisor (Hook must precede conditional returns)
  const assignedAdvisor = useMemo(() => {
    if (property?.assigned_to) {
      const match = executives.find((e) => e.id === property.assigned_to);
      if (match) return match;
    }
    const agent = executives.find(
      (e) => e.role === 'AGENT' || e.name?.toLowerCase().includes('agent') || e.name?.toLowerCase().includes('marcus')
    );
    return agent || executives[0] || {
      id: 'usr_agent_001',
      name: 'Marcus Sterling',
      email: 'agent@skylinecrm.com',
      role: 'AGENT',
    };
  }, [property, executives]);

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
        message:
          'Enquiry registered successfully! Inbound lead captured with full property interest.',
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
          <div className="h-10 bg-white dark:bg-[#141A24] rounded-xl border border-stone-200/90 dark:border-[#242F42] w-48" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 h-96 bg-white dark:bg-[#141A24] rounded-2xl border border-stone-200/90 dark:border-[#242F42]" />
            <div className="h-96 bg-white dark:bg-[#141A24] rounded-2xl border border-stone-200/90 dark:border-[#242F42]" />
          </div>
        </div>
      </AppShell>
    );
  }

  // Not Found State (Graceful fallback)
  if (!property) {
    return (
      <AppShell>
        <div className="p-10 sm:p-14 text-center bg-white dark:bg-[#141A24] rounded-2xl border border-slate-200/90 dark:border-[#242F42] shadow-xs space-y-4 max-w-xl mx-auto my-12 text-left">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-sky-950/50 border border-blue-200/60 dark:border-sky-800/60 flex items-center justify-center mx-auto text-blue-700 dark:text-sky-400 shadow-2xs">
            <Building2 className="w-7 h-7" />
          </div>
          <div className="text-center space-y-1.5">
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Property Details Unavailable</h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed max-w-md mx-auto">
              The property record with reference <code className="text-blue-900 dark:text-sky-300 bg-blue-50 dark:bg-sky-950/60 px-1.5 py-0.5 rounded font-mono font-semibold">{activeId}</code> could not be located in the current real estate portfolio or may have been archived.
            </p>
          </div>
          <div className="pt-3 flex flex-wrap items-center justify-center gap-2.5">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/site-visits')}
              leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}
              className="text-xs font-semibold text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700"
            >
              Back to Site Visits
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate('/discovery')}
              className="text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white border-0 shadow-xs"
            >
              Browse All Properties
            </Button>
          </div>
        </div>
      </AppShell>
    );
  }

  const isSoldOrReserved =
    property.availability.toLowerCase().includes('sold') ||
    property.availability.toLowerCase().includes('reserved');

  const advisorName = assignedAdvisor?.name || 'Marcus Sterling';
  const advisorEmail = assignedAdvisor?.email || 'advisor@skylinecrm.com';
  const advisorPhone = (assignedAdvisor as any)?.phone || '+1 (555) 456-7890';
  const isSavedInWishlist = property ? isSaved(property.id) : false;

  return (
    <AppShell>
      <div className="space-y-6 text-left">
        {/* ========================================================================= */}
        {/* 1. TOP BREADCRUMB & BACK ACTION BAR */}
        {/* ========================================================================= */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-[#141A24] p-3.5 sm:p-4 rounded-2xl border border-stone-200/90 dark:border-[#242F42] shadow-xs text-xs">
          <div className="flex items-center gap-2 text-stone-500 dark:text-slate-400 overflow-x-auto">
            <button
              type="button"
              onClick={() => navigate('/discovery')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-50 dark:bg-[#1A2230] text-stone-700 dark:text-slate-300 hover:text-stone-950 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-slate-800 border border-stone-200 dark:border-[#242F42] transition-colors font-semibold shrink-0 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-stone-500 dark:text-slate-400" />
              <span>Back to Properties</span>
            </button>

            <span className="text-stone-300 dark:text-slate-600">•</span>
            <Link to="/discovery" className="hover:text-amber-800 dark:hover:text-amber-400 truncate font-medium">
              Discovery
            </Link>
            <span className="text-stone-300 dark:text-slate-600">/</span>
            <span className="text-stone-700 dark:text-slate-300 font-semibold">{property.mainCategory}</span>
            <span className="text-stone-300 dark:text-slate-600">/</span>
            <span className="text-amber-900 dark:text-amber-400 font-bold truncate max-w-[200px]">
              {property.title}
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="px-2.5 py-1 rounded-md bg-stone-50 dark:bg-[#101622] text-[11px] font-mono font-semibold text-stone-600 dark:text-slate-400 border border-stone-200 dark:border-[#242F42]">
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
          <div className="lg:col-span-5 xl:col-span-4 flex flex-col justify-between space-y-4 bg-white dark:bg-[#141A24] p-5 sm:p-6 rounded-2xl border border-stone-200/90 dark:border-[#242F42] shadow-xs">
            <div className="space-y-4">
              {/* Category & Title */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/50 text-amber-900 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-700 dark:text-amber-400" />
                    {property.subtype}
                  </span>
                  <span className="text-xs text-stone-500 dark:text-slate-400 font-medium">
                    {property.mainCategory} Real Estate
                  </span>
                </div>

                <h1 className="text-xl sm:text-2xl font-bold text-stone-900 dark:text-slate-100 tracking-tight leading-snug">
                  {property.title}
                </h1>

                <div className="flex items-center gap-1.5 text-xs text-stone-600 dark:text-slate-400 pt-0.5">
                  <MapPin className="w-4 h-4 text-stone-400 shrink-0" />
                  <span className="font-medium">
                    {property.location}, {property.city}, {property.state}
                  </span>
                </div>
              </div>

              {/* Investment Price Banner */}
              <div className="p-4 bg-stone-50 dark:bg-[#101622] rounded-xl border border-stone-200/90 dark:border-[#242F42] space-y-1 text-left">
                <span className="text-[10px] text-stone-500 dark:text-slate-400 font-bold uppercase tracking-wider block">
                  Investment Valuation
                </span>
                <div className="flex items-baseline justify-between">
                  <span className="text-2xl sm:text-3xl font-bold text-stone-900 dark:text-slate-100 font-sans tracking-tight">
                    {property.priceLabel}
                  </span>
                  {property.pricePerSqft && (
                    <span className="text-xs font-mono font-semibold text-stone-500 dark:text-slate-400">
                      ₹{property.pricePerSqft.toLocaleString('en-IN')}/sq.ft
                    </span>
                  )}
                </div>
              </div>

              {/* Developer & Availability Status */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-3 bg-stone-50 dark:bg-[#101622] rounded-xl border border-stone-200/80 dark:border-[#242F42]">
                  <span className="text-[10px] text-stone-500 dark:text-slate-400 uppercase font-bold block">Developer</span>
                  <span className="font-semibold text-stone-800 dark:text-slate-200 mt-0.5 block truncate">
                    {property.developer}
                  </span>
                </div>

                <div className="p-3 bg-stone-50 dark:bg-[#101622] rounded-xl border border-stone-200/80 dark:border-[#242F42]">
                  <span className="text-[10px] text-stone-500 dark:text-slate-400 uppercase font-bold block">Availability</span>
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400 mt-0.5 truncate">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                    {property.availability}
                  </span>
                </div>
              </div>

              {/* Quick Summary Highlights */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 dark:text-slate-400 block">
                  Key Features
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {property.highlights.slice(0, 4).map((h: string, idx: number) => (
                    <span
                      key={idx}
                      className="text-[11px] font-medium bg-stone-100 dark:bg-[#1A2230] text-stone-700 dark:text-slate-300 px-2.5 py-1 rounded-lg border border-stone-200 dark:border-[#242F42] flex items-center gap-1"
                    >
                      <Check className="w-3 h-3 text-amber-700 dark:text-amber-400 shrink-0" />
                      <span>{h}</span>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Action Buttons Section */}
            <div className="pt-4 border-t border-stone-100 dark:border-[#242F42] space-y-2.5">
              {isSoldOrReserved ? (
                <div className="p-3 rounded-xl bg-red-50 dark:bg-rose-950/40 border border-red-200 dark:border-rose-800/60 text-red-800 dark:text-rose-300 text-xs text-center font-semibold">
                  This property is currently {property.status}. Inquire to check future releases.
                </div>
              ) : null}

              <div className="grid grid-cols-2 gap-2.5">
                <Button
                  variant="outline"
                  size="md"
                  onClick={handleEnquiryClick}
                  leftIcon={<PhoneCall className="w-4 h-4 text-stone-600 dark:text-slate-300" />}
                  className="w-full text-xs font-semibold bg-white dark:bg-[#1A2230] border-stone-300 dark:border-[#242F42] text-stone-800 dark:text-slate-200 hover:text-stone-950 dark:hover:text-white hover:bg-stone-50 dark:hover:bg-slate-800"
                >
                  Enquire Now
                </Button>

                <Button
                  variant="primary"
                  size="md"
                  onClick={handleSiteVisitClick}
                  leftIcon={<CalendarCheck className="w-4 h-4" />}
                  className="w-full text-xs font-semibold bg-stone-900 hover:bg-stone-800 dark:bg-amber-500 dark:hover:bg-amber-600 text-white dark:text-slate-950 border-0 shadow-xs"
                >
                  Request Site Visit
                </Button>
              </div>

              {/* Save to Wishlist Toggle Button */}
              <button
                type="button"
                onClick={() => toggleSave(property)}
                className={`w-full py-2.5 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  isSavedInWishlist
                    ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-900 shadow-xs'
                    : 'bg-stone-50 dark:bg-[#101622] text-stone-700 dark:text-slate-300 hover:bg-stone-100 dark:hover:bg-[#1A2230] border-stone-200 dark:border-[#242F42]'
                }`}
              >
                <Heart className={`w-4 h-4 ${isSavedInWishlist ? 'fill-current text-rose-600' : ''}`} />
                <span>{isSavedInWishlist ? 'Saved in Wishlist ❤️' : 'Save to Wishlist'}</span>
              </button>

              {/* Internal Staff Inventory Link (Hidden from Customer) */}
              {!isCustomer && property.linkedProjectId && (
                <button
                  type="button"
                  onClick={() => navigate(`/inventory?project_id=${property.linkedProjectId}`)}
                  className="w-full py-2 px-3 rounded-xl bg-stone-50 dark:bg-[#101622] hover:bg-stone-100 dark:hover:bg-[#1A2230] border border-stone-200 dark:border-[#242F42] text-stone-700 dark:text-slate-300 hover:text-stone-900 dark:hover:text-slate-100 text-xs font-medium flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <Building2 className="w-3.5 h-3.5 text-stone-500 dark:text-slate-400" />
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
        <div className="bg-white dark:bg-[#141A24] p-5 sm:p-6 rounded-2xl border border-stone-200/90 dark:border-[#242F42] shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-stone-100 dark:border-[#242F42] pb-3">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-400 border border-amber-200/60 dark:border-amber-800/60">
                <Maximize2 className="w-4 h-4" />
              </span>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-stone-900 dark:text-slate-100">
                  Property Overview & Specifications
                </h3>
                <p className="text-[11px] text-stone-500 dark:text-slate-400">
                  Verified structural, architectural, and planning parameters
                </p>
              </div>
            </div>

            <span className="px-3 py-1 rounded-full bg-stone-100 dark:bg-[#101622] text-xs font-semibold text-stone-700 dark:text-slate-300 border border-stone-200 dark:border-[#242F42]">
              {property.subtype}
            </span>
          </div>

          {/* DYNAMIC CASE 1: RESIDENTIAL APARTMENT / FLAT / STUDIO */}
          {property.residentialSpecs &&
            (property.subtype === 'Apartment' ||
              property.subtype === 'Flat' ||
              property.subtype === 'Studio') && (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 text-xs">
                <div className="p-3 bg-stone-50 dark:bg-[#101622] rounded-xl border border-stone-200/80 dark:border-[#242F42] space-y-1">
                  <span className="text-[10px] text-stone-500 dark:text-slate-400 font-bold uppercase block">Configuration</span>
                  <span className="font-bold text-stone-900 dark:text-slate-100 text-sm block">{property.residentialSpecs.bhk}</span>
                </div>
                <div className="p-3 bg-stone-50 dark:bg-[#101622] rounded-xl border border-stone-200/80 dark:border-[#242F42] space-y-1">
                  <span className="text-[10px] text-stone-500 dark:text-slate-400 font-bold uppercase block">Carpet Area</span>
                  <span className="font-bold text-stone-900 dark:text-slate-100 text-sm block">{property.residentialSpecs.carpetArea} sq.ft</span>
                </div>
                {property.residentialSpecs.builtUpArea && (
                  <div className="p-3 bg-stone-50 dark:bg-[#101622] rounded-xl border border-stone-200/80 dark:border-[#242F42] space-y-1">
                    <span className="text-[10px] text-stone-500 dark:text-slate-400 font-bold uppercase block">Built-Up Area</span>
                    <span className="font-semibold text-stone-800 dark:text-slate-200 text-sm block">{property.residentialSpecs.builtUpArea} sq.ft</span>
                  </div>
                )}
                {property.residentialSpecs.floor !== undefined && (
                  <div className="p-3 bg-stone-50 dark:bg-[#101622] rounded-xl border border-stone-200/80 dark:border-[#242F42] space-y-1">
                    <span className="text-[10px] text-stone-500 dark:text-slate-400 font-bold uppercase block">Floor Level</span>
                    <span className="font-semibold text-stone-800 dark:text-slate-200 text-sm block">
                      Floor {property.residentialSpecs.floor} of {property.residentialSpecs.totalFloors}
                    </span>
                  </div>
                )}
                <div className="p-3 bg-stone-50 dark:bg-[#101622] rounded-xl border border-stone-200/80 dark:border-[#242F42] space-y-1">
                  <span className="text-[10px] text-stone-500 dark:text-slate-400 font-bold uppercase block">Parking Provision</span>
                  <span className="font-semibold text-stone-800 dark:text-slate-200 text-sm block truncate">{property.residentialSpecs.parking}</span>
                </div>
                <div className="p-3 bg-stone-50 dark:bg-[#101622] rounded-xl border border-stone-200/80 dark:border-[#242F42] space-y-1">
                  <span className="text-[10px] text-stone-500 dark:text-slate-400 font-bold uppercase block">Orientation / Facing</span>
                  <span className="font-semibold text-stone-800 dark:text-slate-200 text-sm block">{property.residentialSpecs.facing || 'East Facing Vastu'}</span>
                </div>
                {property.residentialSpecs.societyOrProject && (
                  <div className="p-3 bg-stone-50 dark:bg-[#101622] rounded-xl border border-stone-200/80 dark:border-[#242F42] space-y-1 col-span-2">
                    <span className="text-[10px] text-stone-500 dark:text-slate-400 font-bold uppercase block">Development Name</span>
                    <span className="font-bold text-amber-900 dark:text-amber-400 text-sm block truncate">{property.residentialSpecs.societyOrProject}</span>
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
                <div className="p-3 bg-stone-50 dark:bg-[#101622] rounded-xl border border-stone-200/80 dark:border-[#242F42] space-y-1">
                  <span className="text-[10px] text-stone-500 dark:text-slate-400 font-bold uppercase block">Estate Layout</span>
                  <span className="font-bold text-amber-900 dark:text-amber-400 text-sm block">{property.residentialSpecs.bhk}</span>
                </div>
                <div className="p-3 bg-stone-50 dark:bg-[#101622] rounded-xl border border-stone-200/80 dark:border-[#242F42] space-y-1">
                  <span className="text-[10px] text-stone-500 dark:text-slate-400 font-bold uppercase block">Bedrooms & Baths</span>
                  <span className="font-bold text-stone-900 dark:text-slate-100 text-sm block">
                    {property.residentialSpecs.bedrooms} Beds • {property.residentialSpecs.bathrooms} Baths
                  </span>
                </div>
                <div className="p-3 bg-stone-50 dark:bg-[#101622] rounded-xl border border-stone-200/80 dark:border-[#242F42] space-y-1">
                  <span className="text-[10px] text-stone-500 dark:text-slate-400 font-bold uppercase block">Built-Up Area</span>
                  <span className="font-bold text-stone-900 dark:text-slate-100 text-sm block">{property.residentialSpecs.builtUpArea} sq.ft</span>
                </div>
                {property.residentialSpecs.plotArea && (
                  <div className="p-3 bg-stone-50 dark:bg-[#101622] rounded-xl border border-stone-200/80 dark:border-[#242F42] space-y-1">
                    <span className="text-[10px] text-stone-500 dark:text-slate-400 font-bold uppercase block">Freehold Plot Parcel</span>
                    <span className="font-semibold text-emerald-800 dark:text-emerald-400 text-sm block">{property.residentialSpecs.plotArea} sq.ft Plot</span>
                  </div>
                )}
                <div className="p-3 bg-stone-50 dark:bg-[#101622] rounded-xl border border-stone-200/80 dark:border-[#242F42] space-y-1">
                  <span className="text-[10px] text-stone-500 dark:text-slate-400 font-bold uppercase block">Structure Level</span>
                  <span className="font-semibold text-stone-800 dark:text-slate-200 text-sm block">{property.residentialSpecs.floor}</span>
                </div>
                <div className="p-3 bg-stone-50 dark:bg-[#101622] rounded-xl border border-stone-200/80 dark:border-[#242F42] space-y-1">
                  <span className="text-[10px] text-stone-500 dark:text-slate-400 font-bold uppercase block">Private Parking</span>
                  <span className="font-semibold text-stone-800 dark:text-slate-200 text-sm block truncate">{property.residentialSpecs.parking}</span>
                </div>
                <div className="p-3 bg-stone-50 dark:bg-[#101622] rounded-xl border border-stone-200/80 dark:border-[#242F42] space-y-1">
                  <span className="text-[10px] text-stone-500 dark:text-slate-400 font-bold uppercase block">Orientation / Facing</span>
                  <span className="font-semibold text-stone-800 dark:text-slate-200 text-sm block">{property.residentialSpecs.facing}</span>
                </div>
                {property.residentialSpecs.terraceArea && (
                  <div className="p-3 bg-stone-50 dark:bg-[#101622] rounded-xl border border-stone-200/80 dark:border-[#242F42] space-y-1">
                    <span className="text-[10px] text-stone-500 dark:text-slate-400 font-bold uppercase block">Private Lawn / Terrace</span>
                    <span className="font-semibold text-stone-800 dark:text-slate-200 text-sm block">{property.residentialSpecs.terraceArea} sq.ft Deck</span>
                  </div>
                )}
              </div>
            )}

          {/* DYNAMIC CASE 3: PENTHOUSE */}
          {property.residentialSpecs && property.subtype === 'Penthouse' && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 text-xs">
              <div className="p-3 bg-stone-50 dark:bg-[#101622] rounded-xl border border-stone-200/80 dark:border-[#242F42] space-y-1">
                <span className="text-[10px] text-stone-500 dark:text-slate-400 font-bold uppercase block">Sky Penthouse Suite</span>
                <span className="font-bold text-amber-900 dark:text-amber-400 text-sm block">{property.residentialSpecs.bhk}</span>
              </div>
              <div className="p-3 bg-stone-50 dark:bg-[#101622] rounded-xl border border-stone-200/80 dark:border-[#242F42] space-y-1">
                <span className="text-[10px] text-stone-500 dark:text-slate-400 font-bold uppercase block">Carpet Living Space</span>
                <span className="font-bold text-stone-900 dark:text-slate-100 text-sm block">{property.residentialSpecs.carpetArea} sq.ft</span>
              </div>
              {property.residentialSpecs.terraceArea && (
                <div className="p-3 bg-stone-50 dark:bg-[#101622] rounded-xl border border-stone-200/80 dark:border-[#242F42] space-y-1">
                  <span className="text-[10px] text-stone-500 dark:text-slate-400 font-bold uppercase block">Private Sky Terrace</span>
                  <span className="font-bold text-amber-900 dark:text-amber-400 text-sm block">{property.residentialSpecs.terraceArea} sq.ft Deck</span>
                </div>
              )}
              <div className="p-3 bg-stone-50 dark:bg-[#101622] rounded-xl border border-stone-200/80 dark:border-[#242F42] space-y-1">
                <span className="text-[10px] text-stone-500 dark:text-slate-400 font-bold uppercase block">Tower Floor Level</span>
                <span className="font-semibold text-stone-800 dark:text-slate-200 text-sm block">{property.residentialSpecs.floor}</span>
              </div>
              <div className="p-3 bg-stone-50 dark:bg-[#101622] rounded-xl border border-stone-200/80 dark:border-[#242F42] space-y-1">
                <span className="text-[10px] text-stone-500 dark:text-slate-400 font-bold uppercase block">Reserved Parking</span>
                <span className="font-semibold text-stone-800 dark:text-slate-200 text-sm block truncate">{property.residentialSpecs.parking}</span>
              </div>
              <div className="p-3 bg-stone-50 dark:bg-[#101622] rounded-xl border border-stone-200/80 dark:border-[#242F42] space-y-1">
                <span className="text-[10px] text-stone-500 dark:text-slate-400 font-bold uppercase block">Horizon View Facing</span>
                <span className="font-semibold text-stone-800 dark:text-slate-200 text-sm block">{property.residentialSpecs.facing}</span>
              </div>
            </div>
          )}

          {/* DYNAMIC CASE 4: LAND & PLOTS (STRICTLY NO BHK) */}
          {property.landSpecs && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 text-xs">
              <div className="p-3 bg-stone-50 dark:bg-[#101622] rounded-xl border border-stone-200/80 dark:border-[#242F42] space-y-1">
                <span className="text-[10px] text-stone-500 dark:text-slate-400 font-bold uppercase block">Total Plot Area</span>
                <span className="font-bold text-emerald-800 dark:text-emerald-400 text-sm block">{property.landSpecs.plotArea}</span>
              </div>
              {property.landSpecs.dimensions && (
                <div className="p-3 bg-stone-50 dark:bg-[#101622] rounded-xl border border-stone-200/80 dark:border-[#242F42] space-y-1">
                  <span className="text-[10px] text-stone-500 dark:text-slate-400 font-bold uppercase block">Plot Dimensions</span>
                  <span className="font-bold text-stone-900 dark:text-slate-100 text-sm block">{property.landSpecs.dimensions}</span>
                </div>
              )}
              {property.landSpecs.roadWidth && (
                <div className="p-3 bg-stone-50 dark:bg-[#101622] rounded-xl border border-stone-200/80 dark:border-[#242F42] space-y-1">
                  <span className="text-[10px] text-stone-500 dark:text-slate-400 font-bold uppercase block">Road Frontage / Width</span>
                  <span className="font-semibold text-stone-800 dark:text-slate-200 text-sm block">{property.landSpecs.roadWidth}</span>
                </div>
              )}
              {property.landSpecs.zoning && (
                <div className="p-3 bg-stone-50 dark:bg-[#101622] rounded-xl border border-stone-200/80 dark:border-[#242F42] space-y-1">
                  <span className="text-[10px] text-stone-500 dark:text-slate-400 font-bold uppercase block">Zoning & Title</span>
                  <span className="font-bold text-amber-900 dark:text-amber-400 text-sm block truncate">{property.landSpecs.zoning}</span>
                </div>
              )}
              {property.landSpecs.facing && (
                <div className="p-3 bg-stone-50 dark:bg-[#101622] rounded-xl border border-stone-200/80 dark:border-[#242F42] space-y-1">
                  <span className="text-[10px] text-stone-500 dark:text-slate-400 font-bold uppercase block">Plot Orientation</span>
                  <span className="font-semibold text-stone-800 dark:text-slate-200 text-sm block">{property.landSpecs.facing}</span>
                </div>
              )}
              {property.landSpecs.roadAccess && (
                <div className="p-3 bg-stone-50 dark:bg-[#101622] rounded-xl border border-stone-200/80 dark:border-[#242F42] space-y-1">
                  <span className="text-[10px] text-stone-500 dark:text-slate-400 font-bold uppercase block">Access Corridor</span>
                  <span className="font-semibold text-stone-800 dark:text-slate-200 text-sm block truncate">{property.landSpecs.roadAccess}</span>
                </div>
              )}
              {property.landSpecs.utilities && (
                <div className="p-3 bg-stone-50 dark:bg-[#101622] rounded-xl border border-stone-200/80 dark:border-[#242F42] space-y-1 col-span-2">
                  <span className="text-[10px] text-stone-500 dark:text-slate-400 font-bold uppercase block">Utilities & Infrastructure</span>
                  <span className="font-semibold text-stone-800 dark:text-slate-200 text-sm block">{property.landSpecs.utilities}</span>
                </div>
              )}
            </div>
          )}

          {/* DYNAMIC CASE 5: COMMERCIAL (STRICTLY NO RESIDENTIAL BHK) */}
          {property.commercialSpecs && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 text-xs">
              <div className="p-3 bg-stone-50 dark:bg-[#101622] rounded-xl border border-stone-200/80 dark:border-[#242F42] space-y-1">
                <span className="text-[10px] text-stone-500 dark:text-slate-400 font-bold uppercase block">Commercial Carpet Area</span>
                <span className="font-bold text-stone-900 dark:text-slate-100 text-sm block">
                  {property.commercialSpecs.commercialArea.toLocaleString('en-IN')} sq.ft
                </span>
              </div>
              <div className="p-3 bg-stone-50 dark:bg-[#101622] rounded-xl border border-stone-200/80 dark:border-[#242F42] space-y-1">
                <span className="text-[10px] text-stone-500 dark:text-slate-400 font-bold uppercase block">Building & Floor</span>
                <span className="font-bold text-stone-900 dark:text-slate-100 text-sm block">
                  {property.commercialSpecs.floor || property.commercialSpecs.building}
                </span>
              </div>
              <div className="p-3 bg-stone-50 dark:bg-[#101622] rounded-xl border border-stone-200/80 dark:border-[#242F42] space-y-1">
                <span className="text-[10px] text-stone-500 dark:text-slate-400 font-bold uppercase block">Fitout / Furnishing</span>
                <span className="font-bold text-amber-900 dark:text-amber-400 text-sm block">
                  {property.commercialSpecs.furnishing || 'Fitted Grade-A Space'}
                </span>
              </div>
              {property.commercialSpecs.ceilingHeight && (
                <div className="p-3 bg-stone-50 dark:bg-[#101622] rounded-xl border border-stone-200/80 dark:border-[#242F42] space-y-1">
                  <span className="text-[10px] text-stone-500 dark:text-slate-400 font-bold uppercase block">Clear Finished Height</span>
                  <span className="font-semibold text-stone-800 dark:text-slate-200 text-sm block">{property.commercialSpecs.ceilingHeight}</span>
                </div>
              )}
              {property.commercialSpecs.loadingDocks && (
                <div className="p-3 bg-stone-50 dark:bg-[#101622] rounded-xl border border-stone-200/80 dark:border-[#242F42] space-y-1">
                  <span className="text-[10px] text-stone-500 dark:text-slate-400 font-bold uppercase block">Hydraulic Loading Docks</span>
                  <span className="font-semibold text-stone-800 dark:text-slate-200 text-sm block">{property.commercialSpecs.loadingDocks}</span>
                </div>
              )}
              <div className="p-3 bg-stone-50 dark:bg-[#101622] rounded-xl border border-stone-200/80 dark:border-[#242F42] space-y-1 col-span-2">
                <span className="text-[10px] text-stone-500 dark:text-slate-400 font-bold uppercase block">Parking & Vehicle Ingress</span>
                <span className="font-semibold text-stone-800 dark:text-slate-200 text-sm block truncate">{property.commercialSpecs.parking}</span>
              </div>
            </div>
          )}

          {/* DYNAMIC CASE 6: MASTER TOWNSHIP & PROJECTS */}
          {property.projectSpecs && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 text-xs">
              <div className="p-3 bg-stone-50 dark:bg-[#101622] rounded-xl border border-stone-200/80 dark:border-[#242F42] space-y-1">
                <span className="text-[10px] text-stone-500 dark:text-slate-400 font-bold uppercase block">Master Land Parcel</span>
                <span className="font-bold text-amber-900 dark:text-amber-400 text-sm block">{property.projectSpecs.landParcel}</span>
              </div>
              <div className="p-3 bg-stone-50 dark:bg-[#101622] rounded-xl border border-stone-200/80 dark:border-[#242F42] space-y-1">
                <span className="text-[10px] text-stone-500 dark:text-slate-400 font-bold uppercase block">Total Towers / Wings</span>
                <span className="font-bold text-stone-900 dark:text-slate-100 text-sm block">{property.projectSpecs.totalWings} Towers</span>
              </div>
              <div className="p-3 bg-stone-50 dark:bg-[#101622] rounded-xl border border-stone-200/80 dark:border-[#242F42] space-y-1">
                <span className="text-[10px] text-stone-500 dark:text-slate-400 font-bold uppercase block">Active Ready Units</span>
                <span className="font-semibold text-emerald-800 dark:text-emerald-400 text-sm block">
                  {property.projectSpecs.availableUnits} of {property.projectSpecs.totalUnits} Units Ready
                </span>
              </div>
              <div className="p-3 bg-stone-50 dark:bg-[#101622] rounded-xl border border-stone-200/80 dark:border-[#242F42] space-y-1">
                <span className="text-[10px] text-stone-500 dark:text-slate-400 font-bold uppercase block">Phase / Delivery</span>
                <span className="font-semibold text-stone-800 dark:text-slate-200 text-sm block">{property.projectSpecs.phase}</span>
              </div>
              {property.projectSpecs.configurations && (
                <div className="p-3 bg-stone-50 dark:bg-[#101622] rounded-xl border border-stone-200/80 dark:border-[#242F42] space-y-1 col-span-2">
                  <span className="text-[10px] text-stone-500 dark:text-slate-400 font-bold uppercase block">Available Layout Configurations</span>
                  <span className="font-bold text-amber-900 dark:text-amber-400 text-sm block">{property.projectSpecs.configurations}</span>
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
          <div className="md:col-span-7 bg-white dark:bg-[#141A24] p-5 sm:p-6 rounded-2xl border border-stone-200/90 dark:border-[#242F42] shadow-xs space-y-3">
            <h3 className="text-sm sm:text-base font-bold text-stone-900 dark:text-slate-100">
              About This Property
            </h3>
            <p className="text-stone-700 dark:text-slate-300 leading-relaxed text-xs sm:text-sm whitespace-pre-line font-normal">
              {property.description || 'Description not available.'}
            </p>
          </div>

          {/* Highlights Cards */}
          <div className="md:col-span-5 bg-white dark:bg-[#141A24] p-5 sm:p-6 rounded-2xl border border-stone-200/90 dark:border-[#242F42] shadow-xs space-y-3">
            <h3 className="text-sm sm:text-base font-bold text-stone-900 dark:text-slate-100">
              Key Property Highlights
            </h3>
            <div className="space-y-2">
              {property.highlights.map((h: string, i: number) => (
                <div
                  key={i}
                  className="flex items-center gap-2.5 p-2.5 bg-stone-50 dark:bg-[#101622] rounded-xl border border-stone-200 dark:border-[#242F42] text-stone-800 dark:text-slate-200 text-xs"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 dark:text-emerald-400 shrink-0" />
                  <span className="font-medium">{h}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 5. COMPLETE ADDRESS & LOCATION SECTION */}
        {/* ========================================================================= */}
        <div className="bg-white dark:bg-[#141A24] p-5 sm:p-6 rounded-2xl border border-stone-200/90 dark:border-[#242F42] shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-stone-100 dark:border-[#242F42] pb-3">
            <span className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-400 border border-amber-200/60 dark:border-amber-800/60">
              <MapPin className="w-4 h-4" />
            </span>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-stone-900 dark:text-slate-100">
                Complete Property Address & Connectivity
              </h3>
              <p className="text-[11px] text-stone-500 dark:text-slate-400">
                Official real estate title and micro-market location
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 bg-stone-50 dark:bg-[#101622] rounded-xl border border-stone-200 dark:border-[#242F42] space-y-2">
              <span className="text-[10px] text-stone-500 dark:text-slate-400 font-bold uppercase tracking-wider block">
                Verified Address
              </span>
              <div className="space-y-1 text-stone-700 dark:text-slate-300 leading-relaxed font-medium">
                <p className="text-stone-900 dark:text-slate-100 font-bold text-sm">{property.title}</p>
                <p>Property Code: {property.code}</p>
                <p>Area / Corridor: {property.location}</p>
                <p>City & State: {property.city}, {property.state}</p>
                <p>Developer: {property.developer}</p>
              </div>
            </div>

            <div className="p-4 bg-stone-50 dark:bg-[#101622] rounded-xl border border-stone-200 dark:border-[#242F42] space-y-2">
              <span className="text-[10px] text-stone-500 dark:text-slate-400 font-bold uppercase tracking-wider block">
                Corridor Connectivity & Access
              </span>
              <div className="space-y-1.5 text-stone-700 dark:text-slate-300 text-xs">
                <p className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-stone-500 dark:text-slate-400" />
                  <span>Prime arterial access road with direct transit connectivity</span>
                </p>
                <p className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-stone-500 dark:text-slate-400" />
                  <span>Proximity to business centers, tech corridors & lifestyle amenities</span>
                </p>
                <p className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-stone-500 dark:text-slate-400" />
                  <span>RERA compliant & clear-title ownership documentation</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 6. YOUR PROPERTY ADVISOR SECTION */}
        {/* ========================================================================= */}
        <div className="bg-white dark:bg-[#141A24] p-5 sm:p-6 rounded-2xl border border-stone-200/90 dark:border-[#242F42] shadow-xs space-y-4 text-left">
          <div className="flex items-center justify-between border-b border-stone-100 dark:border-[#242F42] pb-3">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-400 border border-amber-200/60 dark:border-amber-800/60">
                <UserCheck className="w-4 h-4" />
              </span>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-stone-900 dark:text-slate-100 uppercase tracking-wider">
                  YOUR PROPERTY ADVISOR
                </h3>
                <p className="text-[11px] text-stone-500 dark:text-slate-400">
                  Dedicated real estate advisor for {property.title}
                </p>
              </div>
            </div>

            <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-[10px] font-bold text-emerald-800 dark:text-emerald-300">
              Verified Advisor
            </span>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 bg-stone-50 dark:bg-[#101622] rounded-xl border border-stone-200/80 dark:border-[#242F42]">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-full bg-stone-900 dark:bg-amber-600 text-white flex items-center justify-center font-bold text-base uppercase shadow-xs shrink-0">
                {advisorName.charAt(0) || 'A'}
              </div>
              <div className="space-y-0.5">
                <h4 className="font-bold text-stone-900 dark:text-slate-100 text-sm sm:text-base">
                  {advisorName}
                </h4>
                <p className="text-xs text-amber-800 dark:text-amber-400 font-semibold">
                  Real Estate Specialist • SKYLINE Advisory Team
                </p>
                <div className="flex items-center gap-3 text-xs text-stone-500 dark:text-slate-400 pt-0.5">
                  <a href={`tel:${advisorPhone}`} className="hover:underline flex items-center gap-1">
                    <PhoneCall className="w-3 h-3" />
                    <span>{advisorPhone}</span>
                  </a>
                  <span>•</span>
                  <a href={`mailto:${advisorEmail}`} className="hover:underline flex items-center gap-1">
                    <Mail className="w-3 h-3" />
                    <span>{advisorEmail}</span>
                  </a>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <a
                href={`tel:${advisorPhone}`}
                className="px-3.5 py-2 rounded-xl bg-white dark:bg-[#1A2230] text-stone-800 dark:text-slate-200 hover:bg-stone-100 dark:hover:bg-slate-800 border border-stone-300 dark:border-[#242F42] text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <PhoneCall className="w-3.5 h-3.5 text-stone-500 dark:text-slate-400" />
                <span>Contact Agent</span>
              </a>

              <Button
                variant="outline"
                size="md"
                onClick={handleEnquiryClick}
                className="text-xs font-semibold"
              >
                Enquire Now
              </Button>

              <Button
                variant="primary"
                size="md"
                onClick={handleSiteVisitClick}
                leftIcon={<CalendarCheck className="w-3.5 h-3.5" />}
                className="text-xs font-semibold"
              >
                Request Site Visit
              </Button>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 7. MODALS: SITE VISIT, ENQUIRY & AUTH GATE WORKFLOWS */}
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

        {/* Auth Gate Prompt Modal for Unauthenticated Visitors */}
        <Modal
          isOpen={isAuthGateModalOpen}
          onClose={() => setIsAuthGateModalOpen(false)}
          title={authGateAction === 'visit' ? 'Sign In to Schedule Site Visit' : 'Sign In to Submit Enquiry'}
          description="Connect with our dedicated real estate advisors and track your property interactions."
          maxWidth="md"
          footer={
            <div className="flex items-center justify-end gap-2 w-full">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsAuthGateModalOpen(false)}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  sessionStorage.setItem('skyline_pending_intent', JSON.stringify({
                    action: authGateAction,
                    property,
                    returnTo: location.pathname,
                  }));
                  navigate('/customer/register', { state: { from: location.pathname } });
                }}
                className="text-xs"
              >
                Create Free Account
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  sessionStorage.setItem('skyline_pending_intent', JSON.stringify({
                    action: authGateAction,
                    property,
                    returnTo: location.pathname,
                  }));
                  navigate('/customer/login', { state: { from: location.pathname } });
                }}
                className="text-xs font-semibold bg-stone-900 hover:bg-stone-800 dark:bg-amber-500 dark:hover:bg-amber-600 text-white dark:text-slate-950 border-0"
              >
                Sign In
              </Button>
            </div>
          }
        >
          <div className="py-2 space-y-3 text-xs text-left">
            <div className="p-3.5 bg-amber-50 dark:bg-amber-950/30 rounded-xl border border-amber-200/80 dark:border-amber-800/50 flex items-start gap-3">
              <div className="p-2 rounded-lg bg-amber-500/20 text-amber-700 dark:text-amber-400 shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-stone-900 dark:text-slate-100">
                  {property.title}
                </h4>
                <p className="text-stone-600 dark:text-slate-300 leading-relaxed text-[11px]">
                  {authGateAction === 'visit'
                    ? 'Scheduling a guided on-site tour requires a customer account so our advisory team can arrange gate passes and dedicated property viewings.'
                    : 'Submitting an enquiry connects you directly with the assigned specialist for this property to receive verified floor plans and developer pricing.'}
                </p>
              </div>
            </div>
            <p className="text-stone-500 dark:text-slate-400 text-[11px]">
              Already registered? Sign in to continue seamlessly, or create a free account in 30 seconds.
            </p>
          </div>
        </Modal>
      </div>
    </AppShell>
  );
};
