'use client';

import Spinner from '../shared/Spinner';

interface SubmissionsFiltersProps {
  filterGrade: string;
  filterEmail: string;
  onGradeChange: (grade: string) => void;
  onEmailChange: (hasEmail: string) => void;
  onApplyFilters: () => void;
  onExportCSV: () => void;
  onAddSubmission: () => void;
  isLoading: boolean;
}

export default function SubmissionsFilters({
  filterGrade,
  filterEmail,
  onGradeChange,
  onEmailChange,
  onApplyFilters,
  onExportCSV,
  onAddSubmission,
  isLoading,
}: SubmissionsFiltersProps) {
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-4">
      {/* Mobile: Action buttons at top */}
      <div className="flex gap-2 mb-4 md:hidden">
        <button
          onClick={onAddSubmission}
          className="flex-1 px-4 py-2.5 bg-teal text-white rounded-lg hover:bg-teal-600 transition-colors text-sm font-medium"
        >
          + Add New
        </button>
        <button
          onClick={onExportCSV}
          className="px-4 py-2.5 bg-white border border-gray-200 text-navy rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
        >
          Export
        </button>
      </div>

      {/* Filters row */}
      <div className="flex flex-col md:flex-row gap-3 md:gap-4 md:items-end md:justify-between">
        <div className="flex flex-col sm:flex-row gap-3 sm:items-end flex-1">
          <div className="flex gap-3 flex-1 sm:flex-none items-end">
            <div className="flex-1 sm:flex-none">
              <label className="block text-xs font-medium text-black mb-1">Grade</label>
              <select
                value={filterGrade}
                onChange={(e) => onGradeChange(e.target.value)}
                className="w-full sm:w-28 h-[38px] px-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal text-sm bg-white"
              >
                <option value="">All</option>
                <option value="A">A</option>
                <option value="B">B</option>
                <option value="C">C</option>
                <option value="D">D</option>
                <option value="F">F</option>
              </select>
            </div>
            <div className="flex-1 sm:flex-none">
              <label className="block text-xs font-medium text-black mb-1">Email</label>
              <select
                value={filterEmail}
                onChange={(e) => onEmailChange(e.target.value)}
                className="w-full sm:w-32 h-[38px] px-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal text-sm bg-white"
              >
                <option value="">All</option>
                <option value="true">Has Email</option>
                <option value="false">No Email</option>
              </select>
            </div>
          </div>
          <button
            onClick={onApplyFilters}
            disabled={isLoading}
            className="w-full sm:w-auto h-[38px] px-4 bg-teal text-white rounded-lg hover:bg-teal-600 transition-colors text-sm font-medium disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <span className="inline-flex items-center justify-center gap-2">
                <Spinner size={14} color="#ffffff" />
                Filtering...
              </span>
            ) : (
              'Apply Filters'
            )}
          </button>
        </div>

        {/* Desktop: Action buttons */}
        <div className="hidden md:flex gap-2 items-end">
          <button
            onClick={onExportCSV}
            className="h-[38px] px-4 bg-white border border-gray-200 text-navy rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
          >
            Export CSV
          </button>
          <button
            onClick={onAddSubmission}
            className="h-[38px] px-4 bg-teal text-white rounded-lg hover:bg-teal-600 transition-colors text-sm font-medium"
          >
            + Add
          </button>
        </div>
      </div>
    </div>
  );
}
