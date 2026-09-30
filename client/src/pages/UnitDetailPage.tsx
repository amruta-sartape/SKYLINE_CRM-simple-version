import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { unitService } from '../services/unit.service';
import { projectService } from '../services/project.service';
import type {
  PropertyUnit,
  PropertyActivity,
  PropertyProject,
  Amenity,
  UnitFormData,
  UpdateAvailabilityFormData,
} from '../types/property.types';
import { UnitAvailabilityModal } from '../components/property/UnitAvailabilityModal';
import { UnitFormModal } from '../components/property/UnitFormModal';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Alert } from '../components/ui/Alert';
import {
  Building2,
  Home,
  Car,
  Compass,
  Sparkles,
  ArrowLeft,
  Edit2,
  RefreshCw,
  ShieldCheck,
  CheckCircle2,
  Activity,
} from 'lucide-react';

export const UnitDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.roles?.includes('ADMIN' as any) || false;
  const userPrimaryRole = user?.roles?.[0] || 'AGENT';

  const [unit, setUnit] = useState<PropertyUnit | null>(null);
  const [activities, setActivities] = useState<PropertyActivity[]>([]);
  const [projects, setProjects] = useState<PropertyProject[]>([]);
  const [amenities, setAmenities] = useState<Amenity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modals
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const fetchUnitDetails = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    setError(null);
    try {
      const [unitData, projRes, amnRes] = await Promise.all([
        unitService.getById(id),
        projectService.list({ limit: 100 }),
        unitService.listAmenities(),
      ]);

      setUnit(unitData.unit);
      setActivities(unitData.activities);
      setProjects(projRes.projects);
      setAmenities(amnRes);
    } catch (err: any) {
      setError(err.message || 'Failed to retrieve unit specifications.');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchUnitDetails();
  }, [fetchUnitDetails]);

  const handleUpdateAvailability = async (unitId: string, data: UpdateAvailabilityFormData) => {
    await unitService.updateAvailability(unitId, data);
    await fetchUnitDetails();
  };

  const handleSaveUnit = async (formData: UnitFormData) => {
    if (!id) return;
    await unitService.update(id, formData);
    await fetchUnitDetails();
  };

  const formatPrice = (price: number) => {
    if (price >= 10000000) return `₹${(price / 10000000).toFixed(2)} Cr`;
    if (price >= 100000) return `₹${(price / 100000).toFixed(1)} Lakhs`;
    return `₹${price.toLocaleString('en-IN')}`;
  };

  if (isLoading) {
    return (
      <div className="p-16 text-center text-slate-400">
        <div className="animate-spin w-8 h-8 border-3 border-brand-600 border-t-transparent rounded-full mx-auto mb-3" />
        <p className="text-xs font-medium">Loading unit specification profile...</p>
      </div>
    );
  }

  if (error || !unit) {
    return (
      <div className="space-y-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/inventory')}
          leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}
        >
          Back to Inventory
        </Button>
        <Alert
          variant="error"
          title="Not Found"
          message={error || 'Unit specifications could not be found.'}
        />
      </div>
    );
  }

  const pricePerSqft = Math.round(unit.price / (unit.carpet_area || 1));
  const loadingFactor = Math.round(
    ((unit.built_up_area - unit.carpet_area) / (unit.carpet_area || 1)) * 100
  );

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200/90 shadow-subtle">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/inventory')}
            leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}
          >
            Inventory
          </Button>

          <div className="h-4 w-px bg-slate-200" />

          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-black text-slate-900 tracking-tight">
                Unit {unit.unit_number}
              </span>
              <Badge availability={unit.availability_status} size="sm" />
              <span className="px-2 py-0.5 text-[10px] font-bold bg-brand-50 text-brand-800 border border-brand-200 rounded">
                {unit.configuration}
              </span>
            </div>
            <span className="text-[11px] text-slate-500">
              {unit.project_name} • {unit.wing_name} • Floor {unit.floor}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsStatusModalOpen(true)}
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Update Status
          </Button>

          {isAdmin && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditModalOpen(true)}
              leftIcon={<Edit2 className="w-3.5 h-3.5" />}
            >
              Edit Specs
            </Button>
          )}
        </div>
      </div>

      {/* Main 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Specifications & Project Context (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Unit Specs Card */}
          <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-subtle space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                <Home className="w-4 h-4 text-brand-600" />
                <h3>Unit Architecture & Dimensions</h3>
              </div>
              <span className="text-base font-extrabold text-slate-900">
                {formatPrice(unit.price)}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Configuration</span>
                <span className="text-sm font-extrabold text-slate-900 mt-0.5 block">
                  {unit.configuration}
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Carpet Area</span>
                <span className="text-sm font-extrabold text-slate-900 mt-0.5 block">
                  {unit.carpet_area} sq ft
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Built-up Area</span>
                <span className="text-sm font-extrabold text-slate-900 mt-0.5 block">
                  {unit.built_up_area} sq ft
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Floor Number</span>
                <span className="text-sm font-extrabold text-slate-900 mt-0.5 block">
                  Floor {unit.floor}
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Price / SqFt</span>
                <span className="text-sm font-extrabold text-slate-900 mt-0.5 block">
                  ₹{pricePerSqft.toLocaleString('en-IN')}
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Loading Factor</span>
                <span className="text-sm font-extrabold text-slate-900 mt-0.5 block">
                  {loadingFactor}%
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg border border-slate-200/80">
                <Car className="w-4 h-4 text-slate-500 shrink-0" />
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Parking</span>
                  <span className="font-bold text-slate-800">
                    {unit.parking_slot ? `Slot ${unit.parking_slot}` : unit.parking_type}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg border border-slate-200/80">
                <Compass className="w-4 h-4 text-slate-500 shrink-0" />
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Orientation / Facing</span>
                  <span className="font-bold text-slate-800">{unit.facing || 'Standard View'}</span>
                </div>
              </div>
            </div>

            {unit.description && (
              <div className="p-3 bg-slate-50/70 border border-slate-200/70 rounded-lg">
                <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">
                  Unit Specification Notes
                </span>
                <p className="text-slate-700 leading-relaxed">{unit.description}</p>
              </div>
            )}
          </div>

          {/* Project Context Card */}
          <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-subtle space-y-3">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-sm border-b border-slate-100 pb-3">
              <Building2 className="w-4 h-4 text-brand-600" />
              <h3>Development Context</h3>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Project Name</span>
                <span className="font-bold text-slate-900 text-xs">{unit.project_name}</span>
                <span className="text-[11px] text-slate-500 block">Code: {unit.project_code}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Building / Wing</span>
                <span className="font-bold text-slate-900 text-xs">{unit.wing_name}</span>
                <span className="text-[11px] text-slate-500 block">City: {unit.project_city}</span>
              </div>
            </div>
          </div>

          {/* Amenities Card */}
          <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-subtle space-y-3">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-sm border-b border-slate-100 pb-3">
              <Sparkles className="w-4 h-4 text-gold-600" />
              <h3>Included Amenities ({unit.amenities?.length || 0})</h3>
            </div>

            {unit.amenities && unit.amenities.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {unit.amenities.map((a) => (
                  <div
                    key={a.id}
                    className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg flex items-center gap-2 text-[11px]"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span className="font-medium text-slate-800 truncate">{a.name}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-400 text-xs py-2">Standard project amenities applicable.</p>
            )}
          </div>
        </div>

        {/* Right Column: Availability Lifecycle & Audit Timeline (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Availability Status Card */}
          <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-subtle space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                <ShieldCheck className="w-4 h-4 text-brand-600" />
                <h3>Availability Status</h3>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsStatusModalOpen(true)}
              >
                Change
              </Button>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Current State</span>
                <Badge availability={unit.availability_status} size="md" className="mt-1" />
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Base Valuation</span>
                <span className="text-sm font-black text-slate-900 mt-1 block">
                  {formatPrice(unit.price)}
                </span>
              </div>
            </div>
          </div>

          {/* Audit & Activity Timeline */}
          <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-subtle space-y-4">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-sm border-b border-slate-100 pb-3">
              <Activity className="w-4 h-4 text-brand-600" />
              <h3>Activity & Transition Ledger ({activities.length})</h3>
            </div>

            {activities.length === 0 ? (
              <p className="text-slate-400 text-xs py-4 text-center">No activity entries recorded.</p>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                {activities.map((act) => (
                  <div
                    key={act.id}
                    className="p-3 bg-slate-50 rounded-lg border border-slate-200/80 space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 text-xs">{act.title}</span>
                      <span className="text-[10px] text-slate-400 font-medium">
                        {new Date(act.created_at).toLocaleDateString()}
                      </span>
                    </div>

                    {act.description && (
                      <p className="text-[11px] text-slate-600 leading-relaxed">
                        {act.description}
                      </p>
                    )}

                    <div className="flex items-center justify-between pt-1 text-[10px] text-slate-400 border-t border-slate-200/50">
                      <span>Performer: {act.performer_name || 'System'}</span>
                      <span className="font-mono text-[9px]">{act.activity_type}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Future Integration Preparation Section */}
          <div className="bg-amber-50/40 rounded-xl border border-amber-200/60 p-4 space-y-2 text-xs">
            <div className="flex items-center gap-1.5 text-amber-900 font-bold">
              <Sparkles className="w-4 h-4 text-gold-600" />
              <span>Future Phase Pipeline Links</span>
            </div>
            <p className="text-amber-800 text-[11px] leading-relaxed">
              This unit is prepared for direct linking with Phase 4 Site Visit Dispatches, Negotiation
              Proposals, Token Deposits, and Final Booking Agreements.
            </p>
          </div>
        </div>
      </div>

      {/* Modals */}
      <UnitAvailabilityModal
        isOpen={isStatusModalOpen}
        onClose={() => setIsStatusModalOpen(false)}
        unit={unit}
        onSubmit={handleUpdateAvailability}
        userRole={userPrimaryRole}
      />

      <UnitFormModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={handleSaveUnit}
        initialData={unit}
        projects={projects}
        amenities={amenities}
      />
    </div>
  );
};
