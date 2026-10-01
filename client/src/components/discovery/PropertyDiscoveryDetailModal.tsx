import React from 'react';
import { useNavigate } from 'react-router-dom';
import { DiscoveryProperty } from '../../types/discovery.types';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { PropertyGallery } from './PropertyGallery';
import {
  MapPin,
  CalendarCheck,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
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

  if (!property) return null;

  const handleScheduleVisit = () => {
    onClose();
    navigate('/site-visits');
  };

  const handleOpenFullProfile = () => {
    onClose();
    navigate(`/discovery/${property.id}`);
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
            <span className="text-sm font-bold text-stone-900 font-sans">
              {property.priceLabel}
            </span>
            <Badge projectStatus={property.status} size="sm" />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button variant="outline" size="sm" onClick={onClose} className="w-1/3 sm:w-auto text-xs border-stone-300 text-stone-700">
              Close
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleScheduleVisit}
              leftIcon={<CalendarCheck className="w-3.5 h-3.5 text-amber-700" />}
              className="w-1/3 sm:w-auto text-xs border-stone-300 text-stone-700"
            >
              Tour Site
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleOpenFullProfile}
              rightIcon={<ExternalLink className="w-3.5 h-3.5" />}
              className="w-1/3 sm:w-auto text-xs font-semibold bg-stone-900 hover:bg-stone-800 text-white border-0 shadow-xs"
            >
              Full Profile
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-4 text-left text-xs">
        {/* 1. Property Photo Gallery with Lightbox */}
        <PropertyGallery
          coverImage={property.images.cover}
          gallery={property.images.gallery}
          propertyTitle={property.title}
          propertyCode={property.code}
          propertySubtype={property.subtype}
        />

        {/* 2. Overview & Developer Bar */}
        <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200 space-y-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-2 text-stone-700">
              <MapPin className="w-4 h-4 text-stone-400 shrink-0" />
              <span>
                <strong className="text-stone-900">Location:</strong> {property.location}, {property.city}, {property.state}
              </span>
            </div>
            <div className="flex items-center gap-2 text-stone-700">
              <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0" />
              <span>
                <strong className="text-stone-900">Developer:</strong> {property.developer}
              </span>
            </div>
          </div>
          <p className="text-stone-600 leading-relaxed text-xs pt-1 border-t border-stone-200">
            {property.description}
          </p>
        </div>

        {/* 3. Detailed Specifications Grid */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">
            Property Specifications
          </h4>

          {/* Residential Specifications */}
          {property.residentialSpecs && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <div className="p-2.5 bg-white border border-stone-200 rounded-lg">
                <span className="text-[10px] text-stone-500 uppercase font-bold block">Configuration</span>
                <span className="font-bold text-stone-900 text-xs mt-0.5 block">{property.residentialSpecs.bhk}</span>
              </div>
              <div className="p-2.5 bg-white border border-stone-200 rounded-lg">
                <span className="text-[10px] text-stone-500 uppercase font-bold block">Carpet Area</span>
                <span className="font-bold text-stone-900 text-xs mt-0.5 block">{property.residentialSpecs.carpetArea} sq.ft</span>
              </div>
              {property.residentialSpecs.builtUpArea && (
                <div className="p-2.5 bg-white border border-stone-200 rounded-lg">
                  <span className="text-[10px] text-stone-500 uppercase font-bold block">Built-Up Area</span>
                  <span className="font-bold text-stone-900 text-xs mt-0.5 block">{property.residentialSpecs.builtUpArea} sq.ft</span>
                </div>
              )}
              {property.residentialSpecs.plotArea && (
                <div className="p-2.5 bg-white border border-stone-200 rounded-lg">
                  <span className="text-[10px] text-stone-500 uppercase font-bold block">Plot Parcel</span>
                  <span className="font-bold text-stone-900 text-xs mt-0.5 block">{property.residentialSpecs.plotArea} sq.ft</span>
                </div>
              )}
              {property.residentialSpecs.floor !== undefined && (
                <div className="p-2.5 bg-white border border-stone-200 rounded-lg">
                  <span className="text-[10px] text-stone-500 uppercase font-bold block">Floor Level</span>
                  <span className="font-bold text-stone-900 text-xs mt-0.5 block">Floor {property.residentialSpecs.floor}</span>
                </div>
              )}
              <div className="p-2.5 bg-white border border-stone-200 rounded-lg">
                <span className="text-[10px] text-stone-500 uppercase font-bold block">Dedicated Parking</span>
                <span className="font-bold text-stone-900 text-xs mt-0.5 block truncate">{property.residentialSpecs.parking}</span>
              </div>
            </div>
          )}

          {/* Land Specifications */}
          {property.landSpecs && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <div className="p-2.5 bg-white border border-stone-200 rounded-lg">
                <span className="text-[10px] text-stone-500 uppercase font-bold block">Plot Area</span>
                <span className="font-bold text-emerald-800 text-xs mt-0.5 block">{property.landSpecs.plotArea}</span>
              </div>
              {property.landSpecs.dimensions && (
                <div className="p-2.5 bg-white border border-stone-200 rounded-lg">
                  <span className="text-[10px] text-stone-500 uppercase font-bold block">Dimensions</span>
                  <span className="font-bold text-stone-900 text-xs mt-0.5 block">{property.landSpecs.dimensions}</span>
                </div>
              )}
              {property.landSpecs.roadWidth && (
                <div className="p-2.5 bg-white border border-stone-200 rounded-lg">
                  <span className="text-[10px] text-stone-500 uppercase font-bold block">Road Access</span>
                  <span className="font-bold text-stone-900 text-xs mt-0.5 block">{property.landSpecs.roadWidth}</span>
                </div>
              )}
              {property.landSpecs.zoning && (
                <div className="p-2.5 bg-white border border-stone-200 rounded-lg">
                  <span className="text-[10px] text-stone-500 uppercase font-bold block">Zoning</span>
                  <span className="font-bold text-amber-900 text-xs mt-0.5 block">{property.landSpecs.zoning}</span>
                </div>
              )}
              {property.landSpecs.utilities && (
                <div className="p-2.5 bg-white border border-stone-200 rounded-lg col-span-2">
                  <span className="text-[10px] text-stone-500 uppercase font-bold block">Utilities Ready</span>
                  <span className="font-bold text-stone-900 text-xs mt-0.5 block">{property.landSpecs.utilities}</span>
                </div>
              )}
            </div>
          )}

          {/* Commercial Specifications */}
          {property.commercialSpecs && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <div className="p-2.5 bg-white border border-stone-200 rounded-lg">
                <span className="text-[10px] text-stone-500 uppercase font-bold block">Commercial Area</span>
                <span className="font-bold text-stone-900 text-xs mt-0.5 block">
                  {property.commercialSpecs.commercialArea.toLocaleString('en-IN')} sq.ft
                </span>
              </div>
              <div className="p-2.5 bg-white border border-stone-200 rounded-lg">
                <span className="text-[10px] text-stone-500 uppercase font-bold block">Building & Floor</span>
                <span className="font-bold text-stone-900 text-xs mt-0.5 block">
                  {property.commercialSpecs.floor || property.commercialSpecs.building}
                </span>
              </div>
              <div className="p-2.5 bg-white border border-stone-200 rounded-lg">
                <span className="text-[10px] text-stone-500 uppercase font-bold block">Furnishing</span>
                <span className="font-bold text-amber-900 text-xs mt-0.5 block">
                  {property.commercialSpecs.furnishing || 'Fitted Space'}
                </span>
              </div>
              {property.commercialSpecs.ceilingHeight && (
                <div className="p-2.5 bg-white border border-stone-200 rounded-lg">
                  <span className="text-[10px] text-stone-500 uppercase font-bold block">Clear Height</span>
                  <span className="font-bold text-stone-900 text-xs mt-0.5 block">{property.commercialSpecs.ceilingHeight}</span>
                </div>
              )}
              <div className="p-2.5 bg-white border border-stone-200 rounded-lg col-span-2">
                <span className="text-[10px] text-stone-500 uppercase font-bold block">Parking & Access</span>
                <span className="font-bold text-stone-900 text-xs mt-0.5 block">{property.commercialSpecs.parking}</span>
              </div>
            </div>
          )}

          {/* Project Specifications */}
          {property.projectSpecs && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <div className="p-2.5 bg-white border border-stone-200 rounded-lg">
                <span className="text-[10px] text-stone-500 uppercase font-bold block">Master Land Parcel</span>
                <span className="font-bold text-amber-900 text-xs mt-0.5 block">{property.projectSpecs.landParcel}</span>
              </div>
              <div className="p-2.5 bg-white border border-stone-200 rounded-lg">
                <span className="text-[10px] text-stone-500 uppercase font-bold block">Towers / Wings</span>
                <span className="font-bold text-stone-900 text-xs mt-0.5 block">{property.projectSpecs.totalWings} Buildings</span>
              </div>
              <div className="p-2.5 bg-white border border-stone-200 rounded-lg">
                <span className="text-[10px] text-stone-500 uppercase font-bold block">Ready Inventory</span>
                <span className="font-bold text-emerald-800 text-xs mt-0.5 block">
                  {property.projectSpecs.availableUnits} of {property.projectSpecs.totalUnits} Units
                </span>
              </div>
            </div>
          )}
        </div>

        {/* 4. Highlights Chips */}
        <div className="space-y-1.5 pt-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block">
            Key Real Estate Highlights
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
            {property.highlights.map((h, i) => (
              <div key={i} className="flex items-center gap-2 p-2 bg-stone-50 rounded-lg border border-stone-200 text-stone-700">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                <span className="text-[11px] font-medium">{h}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
};
