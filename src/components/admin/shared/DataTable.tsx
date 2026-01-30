'use client';

import { ReactNode, useState } from 'react';
import Spinner from './Spinner';

interface Column<T> {
  header: string;
  accessor: keyof T | ((row: T) => ReactNode);
  className?: string;
  /** Hide this column on mobile (card view will still show it) */
  hideOnMobile?: boolean;
  /** Show this column prominently in mobile card view */
  mobileHighlight?: boolean;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  emptyMessage?: string;
  onRowClick?: (row: T) => void;
  /** Use card layout on mobile instead of horizontal scroll table */
  mobileCardView?: boolean;
  /** Enable pagination */
  pagination?: boolean;
  /** Number of items per page (default: 10) */
  pageSize?: number;
}

export default function DataTable<T extends { id: string }>({
  columns,
  data,
  loading = false,
  emptyMessage = 'No data available',
  onRowClick,
  mobileCardView = true,
  pagination = false,
  pageSize = 10,
}: DataTableProps<T>) {
  const [currentPage, setCurrentPage] = useState(1);

  // Pagination calculations
  const totalPages = Math.ceil(data.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedData = pagination ? data.slice(startIndex, endIndex) : data;

  // Reset to page 1 if current page exceeds total pages (e.g., after filtering)
  if (currentPage > totalPages && totalPages > 0) {
    setCurrentPage(1);
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-8 flex items-center justify-center text-black">
          <Spinner size={24} color="#0f766e" />
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-8 text-center text-black">{emptyMessage}</div>
      </div>
    );
  }

  const getCellContent = (row: T, column: Column<T>) => {
    return typeof column.accessor === 'function'
      ? column.accessor(row)
      : String(row[column.accessor]);
  };

  // Mobile card view
  const MobileCardView = () => (
    <div className="md:hidden space-y-3">
      {paginatedData.map((row) => (
        <div
          key={row.id}
          onClick={() => onRowClick?.(row)}
          className={`bg-white rounded-xl shadow-sm border border-gray-100 p-4 ${
            onRowClick ? 'cursor-pointer active:bg-gray-50' : ''
          }`}
        >
          {/* Highlighted columns at top */}
          <div className="flex flex-wrap items-center gap-2 mb-3">
            {columns
              .filter((col) => col.mobileHighlight)
              .map((column, index) => (
                <div key={index} className="font-medium">
                  {getCellContent(row, column)}
                </div>
              ))}
          </div>
          {/* Other columns in grid */}
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
            {columns
              .filter((col) => !col.mobileHighlight && col.header !== 'Actions')
              .map((column, index) => (
                <div key={index}>
                  <span className="text-black text-xs">{column.header}</span>
                  <div className="text-navy">{getCellContent(row, column)}</div>
                </div>
              ))}
          </div>
          {/* Actions at bottom */}
          {columns.some((col) => col.header === 'Actions') && (
            <div className="mt-3 pt-3 border-t border-gray-100">
              {getCellContent(
                row,
                columns.find((col) => col.header === 'Actions')!
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );

  // Desktop table view
  const DesktopTableView = () => (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden ${mobileCardView ? 'hidden md:block' : ''}`}>
      <div className="overflow-x-auto">
        <div className="inline-block min-w-full align-middle">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50">
              <tr>
                {columns.map((column, index) => (
                  <th
                    key={index}
                    className={`px-3 sm:px-4 py-3 text-left text-xs sm:text-sm font-medium text-navy ${
                      column.className || ''
                    } ${column.hideOnMobile ? 'hidden md:table-cell' : ''}`}
                  >
                    {column.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {paginatedData.map((row) => (
                <tr
                  key={row.id}
                  onClick={() => onRowClick?.(row)}
                  className={`hover:bg-gray-50 transition-colors ${onRowClick ? 'cursor-pointer' : ''}`}
                >
                  {columns.map((column, index) => (
                    <td
                      key={index}
                      className={`px-3 sm:px-4 py-3 text-xs sm:text-sm text-black ${
                        column.className || ''
                      } ${column.hideOnMobile ? 'hidden md:table-cell' : ''}`}
                    >
                      {getCellContent(row, column)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  // Pagination controls
  const PaginationControls = () => {
    if (!pagination || totalPages <= 1) return null;

    const getPageNumbers = () => {
      const pages: (number | string)[] = [];
      const maxVisiblePages = 5;

      if (totalPages <= maxVisiblePages) {
        for (let i = 1; i <= totalPages; i++) pages.push(i);
      } else {
        if (currentPage <= 3) {
          for (let i = 1; i <= 4; i++) pages.push(i);
          pages.push('...');
          pages.push(totalPages);
        } else if (currentPage >= totalPages - 2) {
          pages.push(1);
          pages.push('...');
          for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
        } else {
          pages.push(1);
          pages.push('...');
          for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
          pages.push('...');
          pages.push(totalPages);
        }
      }
      return pages;
    };

    return (
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-4 px-2">
        <p className="text-sm text-gray-600">
          Showing {startIndex + 1} to {Math.min(endIndex, data.length)} of {data.length} entries
        </p>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setCurrentPage(1)}
            disabled={currentPage === 1}
            className="px-2 py-1 text-sm rounded border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="First page"
          >
            ««
          </button>
          <button
            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="px-2 py-1 text-sm rounded border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Previous page"
          >
            «
          </button>
          {getPageNumbers().map((page, index) =>
            page === '...' ? (
              <span key={`ellipsis-${index}`} className="px-2 py-1 text-sm text-gray-400">
                ...
              </span>
            ) : (
              <button
                key={page}
                onClick={() => setCurrentPage(page as number)}
                className={`px-3 py-1 text-sm rounded border ${
                  currentPage === page
                    ? 'bg-teal text-white border-teal'
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                {page}
              </button>
            )
          )}
          <button
            onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            className="px-2 py-1 text-sm rounded border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Next page"
          >
            »
          </button>
          <button
            onClick={() => setCurrentPage(totalPages)}
            disabled={currentPage === totalPages}
            className="px-2 py-1 text-sm rounded border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Last page"
          >
            »»
          </button>
        </div>
      </div>
    );
  };

  return (
    <>
      {mobileCardView && <MobileCardView />}
      <DesktopTableView />
      <PaginationControls />
    </>
  );
}
