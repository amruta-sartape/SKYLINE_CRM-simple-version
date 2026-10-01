import React, { useState } from 'react';
import { DiscoveryProperty } from '../../types/discovery.types';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import {
  MapPin,
  Sparkles,
  ArrowRight,
  Eye,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
} from 'lucide-react';

interface PropertyDiscoveryCardProps {
  property: DiscoveryProperty;
  onViewDetails: (property: DiscoveryProperty) => void;
  onInquire?: (property: DiscoveryProperty) => void;
}

export const PropertyDiscoveryCard: React.FC<PropertyDiscoveryCardProps> = ({
  property,
  onViewDetails,
  onInquire,
}) => {
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const gallery = property.images.gallery || [];
  const activeImage = gallery[activeImageIdx] || {
    url: property.images.cover,
    label: property.title,
    category: 'Exterior',
    altText: property.title,
  };

  const handlePrevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveImageIdx((prev) => (prev > 0 ? prev - 1 : gallery.length - 1));
  };

  const handleNextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveImageIdx((prev) => (prev < gallery.length - 1 ? prev + 1 : 0));
  };

  return (
    <div className="bg-slate-900/90 backdrop-blur-xl rounded-2xl border border-slate-800/90 hover:border-brand-500/50 shadow-xl hover:shadow-2xl transition-all duration-300 flex flex-col justify-between overflow-hidden group text-left relative">
      {/* 1. Photorealistic Real Estate Image Header & Gallery Controls */}
      <div
        className="relative h-48 sm:h-52 w-full overflow-hidden bg-slate-950 shrink-0 cursor-pointer"
        onClick={() => onViewDetails(property)}
      >
        <img
          src={activeImage.url}
          alt={activeImage.altText}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-black/40" />

        {/* Top Badges */}
        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 z-10">
          <span className="px-2.5 py-0.5 rounded-full bg-slate-950/85 backdrop-blur-md text-[10px] font-bold text-amber-300 border border-amber-400/30 shadow-xs flex items-center gap-1">
            <Sparkles className="w-2.5 h-2.5 text-amber-400" />
            {property.subtype}
          </span>
          <Badge projectStatus={property.status} size="xs" />
        </div>

        <div className="absolute top-2.5 right-2.5 z-10 flex items-center gap-1.5">
          {gallery.length > 1 && (
            <span className="px-2 py-0.5 rounded-full bg-black/70 backdrop-blur-md text-[9px] font-mono font-bold text-white border border-white/20">
              {activeImageIdx + 1} / {gallery.length}
            </span>
          )}
          <span className="px-2 py-0.5 rounded-md bg-slate-900/80 backdrop-blur-md text-[10px] font-bold uppercase tracking-wider text-slate-300 border border-slate-700">
            {property.code}
          </span>
        </div>

        {/* Gallery Carousel Arrows */}
        {gallery.length > 1 && (
          <div className="absolute inset-y-0 left-1 right-1 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity z-20 pointer-events-none">
            <button
              type="button"
              onClick={handlePrevImage}
              className="pointer-events-auto p-1.5 rounded-full bg-black/70 hover:bg-black text-white transition-colors"
              title="Previous Photo"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={handleNextImage}
              className="pointer-events-auto p-1.5 rounded-full bg-black/70 hover:bg-black text-white transition-colors"
              title="Next Photo"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Bottom Banner Image Info: Price & Area */}
        <div className="absolute bottom-2.5 left-3.5 right-3.5 flex items-end justify-between text-white z-10">
          <div>
            <span className="text-[10px] text-slate-300 block font-medium uppercase tracking-wider">
              Investment Price
            </span>
            <span className="text-lg font-extrabold text-white tracking-tight font-sans">
              {property.priceLabel}
            </span>
          </div>

          <div className="text-right">
            <span className="text-[10px] text-slate-300 block font-medium uppercase tracking-wider">
              Availability
            </span>
            <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-400">
              <CheckCircle2 className="w-3 h-3" />
              {property.availability}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Card Body: Name, Location & Developer */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3.5">
        <div className="space-y-2">
          {/* Title & Location */}
          <div>
            <h3
              onClick={() => onViewDetails(property)}
              className="text-sm sm:text-base font-extrabold text-white group-hover:text-brand-300 transition-colors line-clamp-1 cursor-pointer"
            >
              {property.title}
            </h3>
            <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1">
              <MapPin className="w-3.5 h-3.5 text-brand-400 shrink-0" />
              <span className="truncate">
                {property.location}, {property.city}
              </span>
              <span className="text-slate-600">•</span>
              <span className="text-[11px] text-slate-500 truncate">{property.developer}</span>
            </div>
          </div>

          {/* 3. TYPE-SPECIFIC SPECIFICATIONS (Strict field relevance rules) */}
          <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800 text-xs space-y-1.5">
            {/* A. RESIDENTIAL (Apartment, Flat, Studio) */}
            {property.residentialSpecs &&
              (property.subtype === 'Apartment' ||
                property.subtype === 'Flat' ||
                property.subtype === 'Studio') && (
                <>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Configuration:</span>
                    <span className="font-bold text-white">
                      {property.residentialSpecs.bhk} ({property.residentialSpecs.carpetArea} sq.ft)
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Floor Level:</span>
                    <span className="font-semibold text-slate-300">
                      Floor {property.residentialSpecs.floor} of {property.residentialSpecs.totalFloors}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Parking & Facing:</span>
                    <span className="text-slate-300">
                      {property.residentialSpecs.parking} • {property.residentialSpecs.facing}
                    </span>
                  </div>
                </>
              )}

            {/* B. VILLA, BUNGALOW, ROW HOUSE */}
            {property.residentialSpecs &&
              (property.subtype === 'Villa' ||
                property.subtype === 'Bungalow' ||
                property.subtype === 'Row House') && (
                <>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Layout:</span>
                    <span className="font-bold text-amber-300">
                      {property.residentialSpecs.bhk} ({property.residentialSpecs.bedrooms} Beds •{' '}
                      {property.residentialSpecs.bathrooms} Baths)
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Built-Up / Plot Area:</span>
                    <span className="font-semibold text-slate-300">
                      {property.residentialSpecs.builtUpArea} sq.ft Built •{' '}
                      {property.residentialSpecs.plotArea} sq.ft Plot
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Private Parking:</span>
                    <span className="text-slate-300">{property.residentialSpecs.parking}</span>
                  </div>
                </>
              )}

            {/* C. PENTHOUSE */}
            {property.residentialSpecs && property.subtype === 'Penthouse' && (
              <>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">Sky Residence:</span>
                  <span className="font-bold text-amber-300">
                    {property.residentialSpecs.bhk} ({property.residentialSpecs.carpetArea} sq.ft)
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">Private Sky Terrace:</span>
                  <span className="font-semibold text-slate-200">
                    {property.residentialSpecs.terraceArea} sq.ft Private Deck
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">Level & Podiums:</span>
                  <span className="text-slate-300">
                    Top Level • {property.residentialSpecs.parking}
                  </span>
                </div>
              </>
            )}

            {/* D. PLOTS & LAND (NO BHK DISPLAYED) */}
            {property.landSpecs && (
              <>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">Plot Dimension:</span>
                  <span className="font-bold text-emerald-300">
                    {property.landSpecs.plotArea} ({property.landSpecs.dimensions})
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">Road Frontage:</span>
                  <span className="font-semibold text-slate-300">
                    {property.landSpecs.roadWidth} • {property.landSpecs.facing}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">Zoning Title:</span>
                  <span className="text-slate-300 truncate max-w-[200px]">
                    {property.landSpecs.zoning || property.landSpecs.utilities}
                  </span>
                </div>
              </>
            )}

            {/* E. COMMERCIAL (Office, Shop, Showroom, Warehouse - NO RESIDENTIAL BHK) */}
            {property.commercialSpecs && (
              <>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">Commercial Space:</span>
                  <span className="font-bold text-blue-300">
                    {property.commercialSpecs.commercialArea.toLocaleString('en-IN')} sq.ft (
                    {property.commercialSpecs.furnishing || 'Fitted Space'})
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">Building / Level:</span>
                  <span className="font-semibold text-slate-300">
                    {property.commercialSpecs.floor || property.commercialSpecs.building}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">Frontage / Access:</span>
                  <span className="text-slate-300 truncate max-w-[200px]">
                    {property.commercialSpecs.frontage || property.commercialSpecs.parking}
                  </span>
                </div>
              </>
            )}

            {/* F. MASTER PROJECTS (Township, Gated Community, Mixed-Use) */}
            {property.projectSpecs && (
              <>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">Master Development:</span>
                  <span className="font-bold text-purple-300">
                    {property.projectSpecs.landParcel} ({property.projectSpecs.totalWings} Towers)
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">Configurations:</span>
                  <span className="font-semibold text-slate-300">
                    {property.projectSpecs.configurations}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">Active Inventory:</span>
                  <span className="text-emerald-400 font-bold">
                    {property.projectSpecs.availableUnits} of {property.projectSpecs.totalUnits} Units
                    Ready
                  </span>
                </div>
              </>
            )}
          </div>

          {/* Key Highlight Chips */}
          <div className="flex flex-wrap gap-1">
            {property.highlights.slice(0, 3).map((h, i) => (
              <span
                key={i}
                className="text-[10px] font-medium bg-slate-950 text-slate-300 px-2 py-0.5 rounded border border-slate-800 truncate"
              >
                {h}
              </span>
            ))}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onViewDetails(property)}
            leftIcon={<Eye className="w-3.5 h-3.5" />}
            className="w-1/2 text-xs font-bold text-slate-200 hover:text-white hover:bg-slate-800 border-slate-700 bg-slate-900/80"
          >
            Details
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => (onInquire ? onInquire(property) : onViewDetails(property))}
            rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
            className="w-1/2 text-xs font-bold shadow-md shadow-brand-600/20 bg-gradient-to-r from-brand-600 to-blue-600 border-0"
          >
            Explore
          </Button>
        </div>
      </div>
    </div>
  );
};
