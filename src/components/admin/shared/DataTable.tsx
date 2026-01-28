import { ReactNode } from 'react';
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
}

export default function DataTable<T extends { id: string }>({
  columns,
  data,
  loading = false,
  emptyMessage = 'No data available',
  onRowClick,
  mobileCardView = true,
}: DataTableProps<T>) {
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
      {data.map((row) => (
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
              {data.map((row) => (
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

  return (
    <>
      {mobileCardView && <MobileCardView />}
      <DesktopTableView />
    </>
  );
}
