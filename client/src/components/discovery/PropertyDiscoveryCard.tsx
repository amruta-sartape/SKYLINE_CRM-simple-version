import React, { useState } from 'react';
import { DiscoveryProperty } from '../../types/discovery.types';
import { Badge } from '../ui/Badge';
import { useWishlist } from '../../context/WishlistContext';
import {
  MapPin,
  Sparkles,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Heart,
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
  const { isSaved, toggleSave } = useWishlist();
  const saved = isSaved(property.id);

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

  const handleCardClick = () => {
    if (onInquire) {
      onInquire(property);
    } else {
      onViewDetails(property);
    }
  };

  // Extract concise specification line
  const getSpecsSummary = () => {
    if (property.residentialSpecs) {
      const bhk = property.residentialSpecs.bhk || '';
      const area = property.residentialSpecs.carpetArea || property.residentialSpecs.builtUpArea;
      if (property.subtype === 'Villa' || property.subtype === 'Bungalow' || property.subtype === 'Row House') {
        return `${area ? `${area} sq.ft Built` : ''} • ${bhk || `${property.residentialSpecs.bedrooms} Beds`} • ${property.availability}`;
      }
      if (property.subtype === 'Penthouse') {
        return `${area ? `${area} sq.ft` : ''} • Sky Suite • ${property.residentialSpecs.terraceArea ? `${property.residentialSpecs.terraceArea} sq.ft Terrace` : 'Top Floor'}`;
      }
      return `${area ? `${area} sq.ft` : ''} • ${bhk} • ${property.availability}`;
    }

    if (property.landSpecs) {
      const area = property.landSpecs.plotArea || '';
      const dim = property.landSpecs.dimensions ? `(${property.landSpecs.dimensions})` : '';
      const facing = property.landSpecs.facing ? `• ${property.landSpecs.facing}` : '';
      return `${area} ${dim} ${facing} • ${property.availability}`;
    }

    if (property.commercialSpecs) {
      const area = property.commercialSpecs.commercialArea ? `${property.commercialSpecs.commercialArea.toLocaleString('en-IN')} sq.ft` : '';
      const fn = property.commercialSpecs.furnishing || 'Fitted Space';
      return `${area} • ${fn} • ${property.availability}`;
    }

    if (property.projectSpecs) {
      const land = property.projectSpecs.landParcel || '';
      const towers = property.projectSpecs.totalWings ? `${property.projectSpecs.totalWings} Towers` : '';
      return `${land} • ${towers} • ${property.availability}`;
    }

    return `${property.availability}`;
  };

  return (
    <div className="bg-white dark:bg-[#141A24] rounded-2xl border border-slate-200/90 dark:border-[#242F42] hover:border-blue-400/80 dark:hover:border-blue-500 hover:shadow-md transition-all duration-300 flex flex-col justify-between overflow-hidden group text-left relative">
      {/* 1. High-Quality Daylight Real-Estate Image Header */}
      <div
        className="relative h-48 sm:h-52 w-full overflow-hidden bg-slate-100 dark:bg-slate-900 shrink-0 cursor-pointer"
        onClick={() => onViewDetails(property)}
      >
        <img
          src={activeImage.url}
          alt={activeImage.altText || property.title}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-black/20" />

        {/* Top Badges */}
        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 z-10">
          <span className="px-2.5 py-0.5 rounded-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-md text-[11px] font-bold text-slate-800 dark:text-slate-100 border border-slate-200/80 dark:border-[#242F42] shadow-xs flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-blue-600 dark:text-blue-400" />
            {property.subtype}
          </span>
          <Badge projectStatus={property.status} size="xs" />
        </div>

        <div className="absolute top-2.5 right-2.5 z-10 flex items-center gap-1.5">
          {gallery.length > 1 && (
            <span className="px-2 py-0.5 rounded-full bg-slate-900/80 backdrop-blur-md text-[10px] font-mono font-bold text-white border border-white/20">
              {activeImageIdx + 1} / {gallery.length}
            </span>
          )}
          {property.code && !property.code.startsWith('TEST_') && (
            <span className="px-2 py-0.5 rounded-md bg-slate-900/80 backdrop-blur-md text-[10px] font-bold uppercase tracking-wider text-slate-200 border border-slate-700/60">
              {property.code}
            </span>
          )}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggleSave(property);
            }}
            className={`p-1.5 rounded-full backdrop-blur-md transition-transform hover:scale-110 cursor-pointer shadow-md ${
              saved
                ? 'bg-rose-500 text-white'
                : 'bg-slate-900/80 hover:bg-slate-900 text-white/90 hover:text-rose-400 border border-white/20'
            }`}
            title={saved ? 'Remove from Wishlist' : 'Save to Wishlist'}
            aria-label={saved ? 'Remove from Wishlist' : 'Save to Wishlist'}
          >
            <Heart className={`w-3.5 h-3.5 ${saved ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* Gallery Carousel Navigation on Hover */}
        {gallery.length > 1 && (
          <div className="absolute inset-y-0 left-1.5 right-1.5 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity z-20 pointer-events-none">
            <button
              type="button"
              onClick={handlePrevImage}
              className="pointer-events-auto p-1.5 rounded-full bg-slate-900/80 hover:bg-slate-900 text-white transition-colors cursor-pointer shadow-xs"
              title="Previous Photo"
              aria-label="Previous photo"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={handleNextImage}
              className="pointer-events-auto p-1.5 rounded-full bg-slate-900/80 hover:bg-slate-900 text-white transition-colors cursor-pointer shadow-xs"
              title="Next Photo"
              aria-label="Next photo"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Bottom Banner Image Info: Price & Availability */}
        <div className="absolute bottom-2.5 left-3.5 right-3.5 flex items-end justify-between text-white z-10">
          <div>
            <span className="text-[10px] text-slate-300 block font-medium uppercase tracking-wider">
              Investment Price
            </span>
            <span className="text-base sm:text-lg font-extrabold text-white tracking-tight font-sans drop-shadow-xs">
              {property.priceLabel}
            </span>
          </div>

          <div className="text-right">
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-300 bg-slate-900/60 backdrop-blur-xs px-2 py-0.5 rounded-md border border-emerald-500/30">
              <CheckCircle2 className="w-3 h-3" />
              {property.availability}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Card Content: Title, Location, Specs & Highlights */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3.5">
        <div className="space-y-2">
          {/* Subtype micro-header */}
          <div className="flex items-center justify-between text-[11px] font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
            <span>{property.subtype}</span>
            <span className="text-slate-400 dark:text-slate-500 font-normal truncate max-w-[120px]">{property.developer}</span>
          </div>

          {/* Title & Location */}
          <div>
            <h3
              onClick={() => onViewDetails(property)}
              className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-1 cursor-pointer"
            >
              {property.title}
            </h3>
            <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 mt-1">
              <MapPin className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
              <span className="truncate font-medium">
                {property.location}, {property.city}
              </span>
            </div>
          </div>

          {/* 3. Concise Relevant Specifications */}
          <div className="py-2 px-2.5 bg-slate-50 dark:bg-[#101622] rounded-xl border border-slate-200/80 dark:border-[#242F42] text-xs text-slate-700 dark:text-slate-300 font-medium">
            <span className="line-clamp-1">{getSpecsSummary()}</span>
          </div>

          {/* 4. Short Highlight / Description */}
          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed font-normal">
            {property.highlights[0] ? `${property.highlights[0]}. ${property.description}` : property.description}
          </p>
        </div>

        {/* 5. Footer Action: View Details */}
        <div className="pt-2 border-t border-slate-100 dark:border-[#242F42]">
          <button
            type="button"
            onClick={handleCardClick}
            className="w-full py-2.5 px-4 bg-slate-900 dark:bg-[#1A2230] hover:bg-blue-600 dark:hover:bg-blue-600 text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition-all duration-200 shadow-xs cursor-pointer group-hover:bg-blue-600"
          >
            <span>View Details</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
