import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DiscoveryProperty } from '../../types/discovery.types';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import {
  MapPin,
  CalendarCheck,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';

interface PropertyDiscoveryDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  property: DiscoveryProperty | null;
}

export const PropertyDiscoveryDetailModal: React.FC<PropertyDiscoveryDetailModalProps> = ({
  isOpen,
  onClose,
  property,
}) => {
  const navigate = useNavigate();
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  if (!property) return null;

  const gallery = property.images.gallery || [];
  const currentImage = gallery[activeImageIndex] || {
    url: property.images.cover,
    label: property.title,
    category: 'Exterior',
    altText: property.title,
  };

  const handleScheduleVisit = () => {
    onClose();
    navigate('/site-visits');
  };

  const handleOpenInventory = () => {
    onClose();
    if (property.linkedProjectId) {
      navigate(`/inventory?project_id=${property.linkedProjectId}`);
    } else {
      navigate('/inventory');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={property.title}
      description={`Property Code: ${property.code} • ${property.subtype} • ${property.location}, ${property.city}`}
      maxWidth="xl"
      footer={
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 w-full">
          <div className="flex items-center gap-2">
            <span className="text-sm font-extrabold text-slate-900 font-sans">
              {property.priceLabel}
            </span>
            <Badge projectStatus={property.status} size="sm" />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button variant="outline" size="sm" onClick={onClose} className="w-1/3 sm:w-auto text-xs">
              Close
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleScheduleVisit}
              leftIcon={<CalendarCheck className="w-3.5 h-3.5 text-amber-500" />}
              className="w-1/3 sm:w-auto text-xs"
            >
              Tour Site
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleOpenInventory}
              rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
              className="w-1/3 sm:w-auto text-xs font-bold"
            >
              Inventory
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-4 text-left text-xs">
        {/* 1. Photo Gallery Carousel Viewer */}
        <div className="space-y-2.5">
          <div className="relative h-60 sm:h-72 w-full rounded-2xl overflow-hidden bg-slate-950 shadow-md">
            <img
              src={currentImage.url}
              alt={currentImage.altText}
              className="w-full h-full object-cover object-center transition-all duration-300"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-transparent to-black/30" />

            {/* Top Badges */}
            <div className="absolute top-3 left-3 flex items-center gap-2 z-10">
              <span className="px-2.5 py-0.5 rounded-full bg-slate-900/85 backdrop-blur-md text-[11px] font-bold text-white border border-white/20">
                {currentImage.category}
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 backdrop-blur-md text-[11px] font-semibold text-amber-300 border border-amber-400/30 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-400" />
                {property.subtype}
              </span>
            </div>

            {/* Bottom Details */}
            <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between text-white z-10">
              <div>
                <p className="text-sm font-bold drop-shadow-sm text-white">{currentImage.label}</p>
                <p className="text-[11px] text-slate-300 mt-0.5">{property.location}, {property.city}</p>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-black/70 text-slate-300">
                {activeImageIndex + 1} / {gallery.length || 1}
              </span>
            </div>
          </div>

          {/* Thumbnail Selector Strip */}
          {gallery.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {gallery.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveImageIndex(idx)}
                  className={`relative h-16 rounded-xl overflow-hidden border-2 transition-all group ${
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
          )}
        </div>

        {/* 2. Overview & Developer Bar */}
        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-2 text-slate-700">
              <MapPin className="w-4 h-4 text-brand-600 shrink-0" />
              <span>
                <strong>Location:</strong> {property.location}, {property.city}, {property.state}
              </span>
            </div>
            <div className="flex items-center gap-2 text-slate-700">
              <ShieldCheck className="w-4 h-4 text-amber-500 shrink-0" />
              <span>
                <strong>Developer:</strong> {property.developer}
              </span>
            </div>
          </div>
          <p className="text-slate-600 leading-relaxed text-xs pt-1 border-t border-slate-200/80">
            {property.description}
          </p>
        </div>

        {/* 3. Detailed Specifications Grid */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
            Property Specifications
          </h4>

          {/* Residential Specifications */}
          {property.residentialSpecs && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <div className="p-2.5 bg-white border border-slate-200 rounded-lg">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Configuration</span>
                <span className="font-bold text-slate-800 text-xs mt-0.5 block">{property.residentialSpecs.bhk}</span>
              </div>
              <div className="p-2.5 bg-white border border-slate-200 rounded-lg">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Carpet Area</span>
                <span className="font-bold text-slate-800 text-xs mt-0.5 block">{property.residentialSpecs.carpetArea} sq.ft</span>
              </div>
              {property.residentialSpecs.builtUpArea && (
                <div className="p-2.5 bg-white border border-slate-200 rounded-lg">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Built-Up Area</span>
                  <span className="font-bold text-slate-800 text-xs mt-0.5 block">{property.residentialSpecs.builtUpArea} sq.ft</span>
                </div>
              )}
              {property.residentialSpecs.plotArea && (
                <div className="p-2.5 bg-white border border-slate-200 rounded-lg">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Plot Parcel</span>
                  <span className="font-bold text-slate-800 text-xs mt-0.5 block">{property.residentialSpecs.plotArea} sq.ft</span>
                </div>
              )}
              {property.residentialSpecs.floor !== undefined && (
                <div className="p-2.5 bg-white border border-slate-200 rounded-lg">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Floor Level</span>
                  <span className="font-bold text-slate-800 text-xs mt-0.5 block">Floor {property.residentialSpecs.floor}</span>
                </div>
              )}
              <div className="p-2.5 bg-white border border-slate-200 rounded-lg">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Dedicated Parking</span>
                <span className="font-bold text-slate-800 text-xs mt-0.5 block truncate">{property.residentialSpecs.parking}</span>
              </div>
            </div>
          )}

          {/* Land Specifications */}
          {property.landSpecs && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <div className="p-2.5 bg-white border border-slate-200 rounded-lg">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Plot Area</span>
                <span className="font-bold text-slate-800 text-xs mt-0.5 block">{property.landSpecs.plotArea}</span>
              </div>
              {property.landSpecs.dimensions && (
                <div className="p-2.5 bg-white border border-slate-200 rounded-lg">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Dimensions</span>
                  <span className="font-bold text-slate-800 text-xs mt-0.5 block">{property.landSpecs.dimensions}</span>
                </div>
              )}
              {property.landSpecs.roadWidth && (
                <div className="p-2.5 bg-white border border-slate-200 rounded-lg">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Road Access</span>
                  <span className="font-bold text-slate-800 text-xs mt-0.5 block">{property.landSpecs.roadWidth}</span>
                </div>
              )}
              {property.landSpecs.zoning && (
                <div className="p-2.5 bg-white border border-slate-200 rounded-lg">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Zoning</span>
                  <span className="font-bold text-slate-800 text-xs mt-0.5 block">{property.landSpecs.zoning}</span>
                </div>
              )}
              {property.landSpecs.utilities && (
                <div className="p-2.5 bg-white border border-slate-200 rounded-lg col-span-2">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Utilities Ready</span>
                  <span className="font-bold text-slate-800 text-xs mt-0.5 block">{property.landSpecs.utilities}</span>
                </div>
              )}
            </div>
          )}

          {/* Commercial Specifications */}
          {property.commercialSpecs && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <div className="p-2.5 bg-white border border-slate-200 rounded-lg">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Commercial Area</span>
                <span className="font-bold text-slate-800 text-xs mt-0.5 block">
                  {property.commercialSpecs.commercialArea.toLocaleString('en-IN')} sq.ft
                </span>
              </div>
              <div className="p-2.5 bg-white border border-slate-200 rounded-lg">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Building & Floor</span>
                <span className="font-bold text-slate-800 text-xs mt-0.5 block">
                  {property.commercialSpecs.floor || property.commercialSpecs.building}
                </span>
              </div>
              <div className="p-2.5 bg-white border border-slate-200 rounded-lg">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Furnishing</span>
                <span className="font-bold text-slate-800 text-xs mt-0.5 block">
                  {property.commercialSpecs.furnishing || 'Fitted Space'}
                </span>
              </div>
              {property.commercialSpecs.ceilingHeight && (
                <div className="p-2.5 bg-white border border-slate-200 rounded-lg">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Clear Height</span>
                  <span className="font-bold text-slate-800 text-xs mt-0.5 block">{property.commercialSpecs.ceilingHeight}</span>
                </div>
              )}
              <div className="p-2.5 bg-white border border-slate-200 rounded-lg col-span-2">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Parking & Access</span>
                <span className="font-bold text-slate-800 text-xs mt-0.5 block">{property.commercialSpecs.parking}</span>
              </div>
            </div>
          )}

          {/* Project Specifications */}
          {property.projectSpecs && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <div className="p-2.5 bg-white border border-slate-200 rounded-lg">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Master Land Parcel</span>
                <span className="font-bold text-slate-800 text-xs mt-0.5 block">{property.projectSpecs.landParcel}</span>
              </div>
              <div className="p-2.5 bg-white border border-slate-200 rounded-lg">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Towers / Wings</span>
                <span className="font-bold text-slate-800 text-xs mt-0.5 block">{property.projectSpecs.totalWings} Buildings</span>
              </div>
              <div className="p-2.5 bg-white border border-slate-200 rounded-lg">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Ready Inventory</span>
                <span className="font-bold text-emerald-700 text-xs mt-0.5 block">
                  {property.projectSpecs.availableUnits} of {property.projectSpecs.totalUnits} Units
                </span>
              </div>
            </div>
          )}
        </div>

        {/* 4. Highlights Chips */}
        <div className="space-y-1.5 pt-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
            Key Real Estate Highlights
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
            {property.highlights.map((h, i) => (
              <div key={i} className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg border border-slate-100 text-slate-700">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span className="text-[11px] font-medium">{h}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
};
