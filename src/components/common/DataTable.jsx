import React, { useState, useMemo } from 'react';
import { Search, Filter, Download, ChevronLeft, ChevronRight, SlidersHorizontal } from 'lucide-react';
import { EmptyState } from './EmptyState';

export const DataTable = ({
  columns = [],
  data = [],
  searchPlaceholder = 'Search records...',
  filterKey,
  filterOptions = [],
  itemsPerPage = 10,
  onRowClick,
  actions,
  title
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);

  // Normalized filter options
  const normalizedFilterOptions = useMemo(() => {
    if (!Array.isArray(filterOptions)) return [];
    return filterOptions.map((opt) => {
      if (typeof opt === 'object' && opt !== null) {
        return {
          label: String(opt.label || opt.value || ''),
          value: String(opt.value !== undefined ? opt.value : opt.label || '')
        };
      }
      return {
        label: String(opt || ''),
        value: String(opt || '')
      };
    });
  }, [filterOptions]);

  // Filtered and searched data
  const filteredData = useMemo(() => {
    let result = Array.isArray(data) ? [...data] : [];

    // Status / Category filter
    if (filterKey && selectedFilter && selectedFilter !== 'ALL') {
      result = result.filter((row) => {
        if (!row || typeof row !== 'object') return false;
        const val = row[filterKey];
        return String(val ?? '').toLowerCase() === String(selectedFilter).toLowerCase();
      });
    }

    // Free text search
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter((row) => {
        if (!row || typeof row !== 'object') return false;
        return Object.values(row).some((val) => {
          if (val == null) return false;
          if (typeof val === 'object') return false;
          return String(val).toLowerCase().includes(term);
        });
      });
    }

    return result;
  }, [data, filterKey, selectedFilter, searchTerm]);

  // Pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage) || 1;
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(start, start + itemsPerPage);
  }, [filteredData, currentPage, itemsPerPage]);

  const handleExportCSV = () => {
    if (!filteredData.length) return;
    const headers = columns.map((c) => `"${c.header || ''}"`).join(',');
    const rows = filteredData.map((row) =>
      columns
        .map((c) => {
          const val = c.accessor
            ? typeof c.accessor === 'function'
              ? c.accessor(row)
              : row[c.accessor]
            : '';
          return `"${String(val || '').replace(/"/g, '""')}"`;
        })
        .join(',')
    );
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${title || 'skyline-crm-report'}-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const hasAllOption = normalizedFilterOptions.some((opt) => opt.value === 'ALL');

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-card overflow-hidden">
      {/* Top Table Control Bar */}
      <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50/50">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
          />
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto justify-between sm:justify-end">
          {normalizedFilterOptions.length > 0 && filterKey && (
            <div className="relative flex items-center">
              <SlidersHorizontal className="absolute left-3 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
              <select
                value={selectedFilter}
                onChange={(e) => {
                  setSelectedFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-8 pr-7 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all appearance-none cursor-pointer"
              >
                {!hasAllOption && <option value="ALL">All Categories</option>}
                {normalizedFilterOptions.map((opt, idx) => (
                  <option key={opt.value || idx} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          <button
            onClick={handleExportCSV}
            title="Export to CSV"
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-xs"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden sm:inline">Export</span>
          </button>

          {actions}
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/75 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              {columns.map((col, idx) => (
                <th
                  key={idx}
                  className={`py-3.5 px-4 ${col.className || ''}`}
                  style={{ width: col.width }}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {paginatedData.length > 0 ? (
              paginatedData.map((row, rowIdx) => (
                <tr
                  key={row.id || rowIdx}
                  onClick={() => onRowClick && onRowClick(row)}
                  className={`transition-colors ${
                    onRowClick
                      ? 'cursor-pointer hover:bg-brand-50/40'
                      : 'hover:bg-slate-50/70'
                  }`}
                >
                  {columns.map((col, colIdx) => (
                    <td
                      key={colIdx}
                      className={`py-3 px-4 text-slate-700 ${col.cellClassName || ''}`}
                    >
                      {col.render
                        ? col.render(row)
                        : col.accessor
                        ? typeof col.accessor === 'function'
                          ? col.accessor(row)
                          : row[col.accessor]
                        : null}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={Math.max(columns.length, 1)}>
                  <EmptyState
                    title="No records found"
                    description={
                      searchTerm
                        ? `No results match "${searchTerm}". Try adjusting your search or filter.`
                        : 'No records exist for this view yet.'
                    }
                  />
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="p-3.5 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between text-xs text-slate-500">
        <div>
          Showing <span className="font-semibold text-slate-700">{filteredData.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1}</span> to{' '}
          <span className="font-semibold text-slate-700">
            {Math.min(currentPage * itemsPerPage, filteredData.length)}
          </span>{' '}
          of <span className="font-semibold text-slate-700">{filteredData.length}</span> records
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
            className="p-1.5 rounded-md border border-slate-200 bg-white text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="px-2 font-medium">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="p-1.5 rounded-md border border-slate-200 bg-white text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
