'use client';

import { Submission } from '@/types';
import DataTable from '../shared/DataTable';

interface SubmissionsTableProps {
  submissions: Submission[];
  loading: boolean;
  onView: (submission: Submission) => void;
  onEdit: (submission: Submission) => void;
  onDelete: (submission: Submission) => void;
}

export default function SubmissionsTable({
  submissions,
  loading,
  onView,
  onEdit,
  onDelete,
}: SubmissionsTableProps) {
  const getGradeColor = (grade: string) => {
    if (grade.startsWith('A')) return 'bg-emerald-100 text-emerald-700';
    if (grade.startsWith('B')) return 'bg-teal-100 text-teal-700';
    if (grade.startsWith('C')) return 'bg-amber-100 text-amber-700';
    return 'bg-rose-100 text-rose-700';
  };

  const columns = [
    {
      header: 'Date',
      accessor: (row: Submission) => (
        <span className="text-sm text-black">
          {new Date(row.created_at).toLocaleDateString()}
        </span>
      ),
    },
    {
      header: 'Grade',
      accessor: (row: Submission) => (
        <span className={`inline-flex px-2 py-1 rounded text-sm font-medium ${getGradeColor(row.grade)}`}>
          {row.grade}
        </span>
      ),
      mobileHighlight: true,
    },
    {
      header: 'Inquiries',
      accessor: (row: Submission) => (
        <span className="text-sm text-black">{row.monthly_inquiries}</span>
      ),
    },
    {
      header: 'Revenue at Risk',
      accessor: (row: Submission) => (
        <span className="text-sm text-black font-medium">
          ${row.risk_low.toLocaleString()} - ${row.risk_high.toLocaleString()}
        </span>
      ),
      mobileHighlight: true,
    },
    {
      header: 'Email',
      accessor: (row: Submission) => (
        <span className="text-sm text-black truncate max-w-[150px] block">{row.email || '-'}</span>
      ),
      hideOnMobile: true,
    },
    {
      header: 'Actions',
      accessor: (row: Submission) => (
        <div className="flex flex-wrap gap-3">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onView(row);
            }}
            className="text-sm text-teal hover:underline font-medium"
          >
            View
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(row);
            }}
            className="text-sm text-navy hover:underline font-medium"
          >
            Edit
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(row);
            }}
            className="text-sm text-red-600 hover:underline font-medium"
          >
            Delete
          </button>
        </div>
      ),
      className: 'whitespace-nowrap',
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={submissions}
      loading={loading}
      emptyMessage="No submissions found"
      mobileCardView={true}
    />
  );
}
