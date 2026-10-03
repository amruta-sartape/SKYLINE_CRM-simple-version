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
    <div className="p-12 sm:p-16 text-center bg-white dark:bg-[#141A24] rounded-2xl border border-slate-200/90 dark:border-[#242F42] shadow-xs space-y-4 max-w-xl mx-auto">
      <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-950/50 border border-blue-200/60 dark:border-blue-900/50 flex items-center justify-center mx-auto text-blue-700 dark:text-blue-400 shadow-xs">
        <Building2 className="w-7 h-7" />
      </div>

      <div className="space-y-1.5">
        <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
          No Properties Found
        </h3>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed max-w-md mx-auto">
          {searchTerm ? (
            <>
              No properties matched your search query <strong className="text-slate-800 dark:text-slate-200">"{searchTerm}"</strong>. Try changing your search keywords or clearing filters.
            </>
          ) : (
            <>
              There are currently no active listings matching your filter criteria under{' '}
              <strong className="text-blue-900 dark:text-blue-300">{selectedSubtype || selectedCategory}</strong>. Try browsing another real estate category or resetting filters.
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
          className="text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white border-0 shadow-xs"
        >
          Reset All Filters
        </Button>
      </div>
    </div>
  );
};
