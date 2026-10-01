import React from 'react';
import { Button } from '../ui/Button';
import { Building2, RotateCcw } from 'lucide-react';

interface PropertyEmptyStateProps {
  onReset: () => void;
  searchTerm?: string;
  selectedSubtype?: string | null;
  selectedCategory?: string;
}

export const PropertyEmptyState: React.FC<PropertyEmptyStateProps> = ({
  onReset,
  searchTerm,
  selectedSubtype,
  selectedCategory,
}) => {
  return (
    <div className="p-12 sm:p-16 text-center bg-white rounded-2xl border border-stone-200/90 shadow-xs space-y-4 max-w-xl mx-auto">
      <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200/60 flex items-center justify-center mx-auto text-amber-800 shadow-xs">
        <Building2 className="w-7 h-7" />
      </div>

      <div className="space-y-1.5">
        <h3 className="text-base sm:text-lg font-bold text-stone-900">
          No Properties Found
        </h3>
        <p className="text-xs text-stone-500 leading-relaxed max-w-md mx-auto">
          {searchTerm ? (
            <>
              No properties matched your search term <strong className="text-stone-800">"{searchTerm}"</strong> in{' '}
              {selectedSubtype || selectedCategory || 'the catalog'}.
            </>
          ) : (
            <>
              There are currently no active listings under{' '}
              <strong className="text-amber-900">{selectedSubtype || selectedCategory}</strong>. Try browsing another real estate category or clearing filters.
            </>
          )}
        </p>
      </div>

      <div className="pt-2 flex items-center justify-center gap-3">
        <Button
          variant="primary"
          size="sm"
          onClick={onReset}
          leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
          className="text-xs font-semibold bg-stone-900 hover:bg-stone-800 text-white border-0 shadow-xs"
        >
          Browse All Properties
        </Button>
      </div>
    </div>
  );
};
