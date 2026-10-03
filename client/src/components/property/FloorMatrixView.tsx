import React, { useState } from 'react';
import { FloorMatrixData, FloorMatrixUnit } from '../../types/property.types';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Layers, Eye, RefreshCw, Car } from 'lucide-react';

interface FloorMatrixViewProps {
  matrixData: FloorMatrixData | null;
  isLoading?: boolean;
  onSelectUnit: (unitId: string) => void;
  onChangeAvailability?: (unit: any) => void;
  canManage?: boolean;
}

export const FloorMatrixView: React.FC<FloorMatrixViewProps> = ({
  matrixData,
  isLoading = false,
  onSelectUnit,
  onChangeAvailability,
  canManage = false,
}) => {
  const [selectedUnitPreview, setSelectedUnitPreview] = useState<FloorMatrixUnit | null>(null);

  if (isLoading) {
    return (
      <div className="p-8 text-center bg-white dark:bg-[#141A24] rounded-xl border border-slate-200 dark:border-[#242F42]">
        <div className="animate-spin w-8 h-8 border-3 border-brand-600 dark:border-amber-400 border-t-transparent rounded-full mx-auto mb-3" />
        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Generating visual floor matrix...</p>
      </div>
    );
  }

  if (!matrixData || matrixData.floors.length === 0) {
    return (
      <div className="p-12 text-center bg-white dark:bg-[#141A24] rounded-xl border border-slate-200 dark:border-[#242F42] text-slate-400 dark:text-slate-500">
        <Layers className="w-8 h-8 mx-auto mb-2 text-slate-300 dark:text-slate-600" />
        <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">No Unit Matrix Found</p>
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
          Select a project and wing with registered units to display the graphical floor grid.
        </p>
      </div>
    );
  }

  const formatPrice = (price: number) => {
    if (price >= 10000000) return `₹${(price / 10000000).toFixed(2)} Cr`;
    if (price >= 100000) return `₹${(price / 100000).toFixed(1)} L`;
    return `₹${price.toLocaleString('en-IN')}`;
  };

  return (
    <div className="space-y-4">
      {/* Legend & Header */}
      <div className="bg-white dark:bg-[#141A24] p-4 rounded-xl border border-slate-200/90 dark:border-[#242F42] flex flex-wrap items-center justify-between gap-3 shadow-subtle">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-brand-50 dark:bg-amber-950/40 text-brand-700 dark:text-amber-400">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-xs sm:text-sm">
              {matrixData.project_name} • {matrixData.wing_name}
            </h3>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              {matrixData.floors.length} Active Floors • {matrixData.total_floors} Building Floors
            </span>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-emerald-500 inline-block" />
            <span className="text-slate-600 dark:text-slate-300 text-[11px] font-medium">Available</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-amber-400 inline-block" />
            <span className="text-slate-600 dark:text-slate-300 text-[11px] font-medium">Reserved</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-slate-400 dark:bg-slate-600 inline-block" />
            <span className="text-slate-600 dark:text-slate-300 text-[11px] font-medium">Sold Out</span>
          </div>
        </div>
      </div>

      {/* Floors Matrix Grid */}
      <div className="bg-white dark:bg-[#141A24] p-5 rounded-xl border border-slate-200/90 dark:border-[#242F42] shadow-subtle space-y-3 overflow-x-auto">
        {matrixData.floors.map((floorData) => (
          <div
            key={floorData.floor}
            className="flex items-center gap-3 pb-3 border-b border-slate-100 dark:border-[#242F42] last:border-0 last:pb-0"
          >
            {/* Floor Label */}
            <div className="w-20 shrink-0 text-right pr-2 border-r border-slate-200 dark:border-[#242F42]">
              <span className="text-[11px] font-extrabold uppercase text-slate-400 dark:text-slate-500 block tracking-wider">
                Floor
              </span>
              <span className="text-sm font-black text-slate-800 dark:text-slate-200">{floorData.floor}</span>
            </div>

            {/* Units on Floor */}
            <div className="flex flex-wrap items-center gap-2.5 flex-1">
              {floorData.units.map((u) => {
                const isAvail = u.availability_status === 'Available';
                const isRes = u.availability_status === 'Reserved';

                const tileColors = isAvail
                  ? 'border-emerald-300 dark:border-emerald-800/80 bg-emerald-50/50 dark:bg-emerald-950/30 hover:bg-emerald-100/70 dark:hover:bg-emerald-900/40 text-emerald-950 dark:text-emerald-200'
                  : isRes
                  ? 'border-amber-300 dark:border-amber-800/80 bg-amber-50/50 dark:bg-amber-950/30 hover:bg-amber-100/70 dark:hover:bg-amber-900/40 text-amber-950 dark:text-amber-200'
                  : 'border-slate-200 dark:border-slate-800 bg-slate-100/70 dark:bg-slate-900/60 hover:bg-slate-200/70 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300';

                const statusIndicator = isAvail
                  ? 'bg-emerald-500'
                  : isRes
                  ? 'bg-amber-400'
                  : 'bg-slate-400 dark:bg-slate-600';

                return (
                  <div
                    key={u.id}
                    onClick={() => onSelectUnit(u.id)}
                    onMouseEnter={() => setSelectedUnitPreview(u)}
                    className={`p-2.5 rounded-lg border transition-all cursor-pointer shadow-2xs hover:shadow-subtle min-w-[130px] flex flex-col justify-between ${tileColors}`}
                  >
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="font-extrabold text-xs tracking-tight">{u.unit_number}</span>
                      <span
                        className={`w-2 h-2 rounded-full shrink-0 ${statusIndicator}`}
                        title={u.availability_status}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[10px] opacity-85">
                      <span className="font-bold">{u.configuration}</span>
                      <span>{u.carpet_area} sqft</span>
                    </div>

                    <div className="text-[11px] font-extrabold mt-1 text-right">
                      {formatPrice(u.price)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Selected Unit Hover Inspector */}
      {selectedUnitPreview && (
        <div className="p-4 bg-slate-900 text-white rounded-xl shadow-card flex flex-wrap items-center justify-between gap-3 text-xs animate-in fade-in duration-200">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-slate-800 border border-slate-700 text-gold-400 font-bold">
              {selectedUnitPreview.unit_number}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-white">
                  {selectedUnitPreview.configuration} Residence
                </span>
                <Badge availability={selectedUnitPreview.availability_status} size="xs" />
              </div>
              <span className="text-slate-400 text-[11px]">
                Floor {selectedUnitPreview.floor} • {selectedUnitPreview.carpet_area} sq ft •{' '}
                {formatPrice(selectedUnitPreview.price)}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {selectedUnitPreview.parking_slot && (
              <span className="text-[11px] text-slate-300 flex items-center gap-1 bg-slate-800 px-2 py-1 rounded">
                <Car className="w-3 h-3 text-slate-400" />
                <span>{selectedUnitPreview.parking_slot}</span>
              </span>
            )}

            {canManage && onChangeAvailability && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onChangeAvailability(selectedUnitPreview)}
                leftIcon={<RefreshCw className="w-3 h-3" />}
                className="bg-slate-800 text-white border-slate-700 hover:bg-slate-700"
              >
                Status
              </Button>
            )}

            <Button
              variant="luxury"
              size="sm"
              onClick={() => onSelectUnit(selectedUnitPreview.id)}
              rightIcon={<Eye className="w-3 h-3" />}
            >
              Inspect
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
