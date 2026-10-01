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
    <div className="p-12 sm:p-16 text-center bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-slate-800 shadow-xl space-y-4 max-w-xl mx-auto">
      <div className="w-14 h-14 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center mx-auto text-amber-400 shadow-md">
        <Building2 className="w-7 h-7" />
      </div>

      <div className="space-y-1.5">
        <h3 className="text-base sm:text-lg font-bold text-white">
          No Properties Found
        </h3>
        <p className="text-xs text-slate-400 leading-relaxed max-w-md mx-auto">
          {searchTerm ? (
            <>
              No properties matched your search term <strong className="text-slate-200">"{searchTerm}"</strong> in{' '}
              {selectedSubtype || selectedCategory || 'the catalog'}.
            </>
          ) : (
            <>
              There are currently no active listings under{' '}
              <strong className="text-amber-300">{selectedSubtype || selectedCategory}</strong>. Try browsing another real estate category or clearing filters.
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
          className="text-xs font-bold shadow-md shadow-brand-600/20 bg-gradient-to-r from-brand-600 to-blue-600 border-0"
        >
          Browse All Properties
        </Button>
      </div>
    </div>
  );
};
