'use client';

import { Submission, ResponseTime, FollowUpDepth, PatientValue, AfterHoursCoverage } from '@/types';
import Modal from '../shared/Modal';

interface SubmissionDetailModalProps {
  submission: Submission | null;
  onClose: () => void;
  onEdit: (submission: Submission) => void;
}

export default function SubmissionDetailModal({
  submission,
  onClose,
  onEdit,
}: SubmissionDetailModalProps) {
  if (!submission) return null;

  const RESPONSE_TIME_LABELS: Record<ResponseTime, string> = {
    under5: 'Under 5 min',
    '5-30': '5-30 min',
    '30-2h': '30 min - 2 hrs',
    sameday: 'Same day',
    nextday: 'Next day+',
  };

  const FOLLOW_UP_LABELS: Record<FollowUpDepth, string> = {
    '4-6': '4-6 touches',
    '2-3': '2-3 touches',
    '1': '1 touch',
    notsure: 'Not sure',
  };

  const PATIENT_VALUE_LABELS: Record<PatientValue, string> = {
    under250: 'Under $250',
    '250-500': '$250-$500',
    '500-1000': '$500-$1,000',
    '1000+': '$1,000+',
  };

  const AFTER_HOURS_LABELS: Record<AfterHoursCoverage, string> = {
    yes: 'Yes',
    sometimes: 'Sometimes',
    no: 'No',
  };

  const getGradeColor = (grade: string) => {
    if (grade.startsWith('A')) return 'bg-emerald-100 text-emerald-700';
    if (grade.startsWith('B')) return 'bg-teal-100 text-teal-700';
    if (grade.startsWith('C')) return 'bg-amber-100 text-amber-700';
    return 'bg-rose-100 text-rose-700';
  };

  return (
    <Modal isOpen={!!submission} onClose={onClose} title="Submission Details">
      <div className="space-y-4">
        <div>
          <p className="text-sm text-black">Date</p>
          <p className="text-navy font-medium">
            {new Date(submission.created_at).toLocaleString()}
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-black">Monthly Patient Inquiries</p>
            <p className="text-navy font-medium">{submission.monthly_inquiries}</p>
          </div>
          <div>
            <p className="text-sm text-black">Grade</p>
            <span
              className={`inline-flex px-2 py-1 rounded text-sm font-medium ${getGradeColor(submission.grade)}`}
            >
              {submission.grade}
            </span>
          </div>
          <div>
            <p className="text-sm text-black">
              How fast do you typically respond to new patient inquiries?
            </p>
            <p className="text-navy font-medium">
              {RESPONSE_TIME_LABELS[submission.response_time]}
            </p>
          </div>
          <div>
            <p className="text-sm text-black">
              How many follow-up touches do you make before giving up?
            </p>
            <p className="text-navy font-medium">
              {FOLLOW_UP_LABELS[submission.follow_up_depth]}
            </p>
          </div>
          <div>
            <p className="text-sm text-black">What&apos;s your average patient lifetime value?</p>
            <p className="text-navy font-medium">
              {PATIENT_VALUE_LABELS[submission.patient_value]}
            </p>
          </div>
          <div>
            <p className="text-sm text-black">
              Do you respond to inquiries after hours (evenings/weekends)?
            </p>
            <p className="text-navy font-medium">
              {AFTER_HOURS_LABELS[submission.after_hours]}
            </p>
          </div>
          <div>
            <p className="text-sm text-black">Loss Rate</p>
            <p className="text-navy font-medium">{(submission.loss_rate * 100).toFixed(1)}%</p>
          </div>
          <div>
            <p className="text-sm text-black">Drop-off %</p>
            <p className="text-navy font-medium">{submission.dropoff_pct}%</p>
          </div>
          <div>
            <p className="text-sm text-black">Revenue at Risk (Low)</p>
            <p className="text-navy font-medium">${submission.risk_low.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-sm text-black">Revenue at Risk (High)</p>
            <p className="text-navy font-medium">${submission.risk_high.toLocaleString()}</p>
          </div>
          <div className="col-span-1 sm:col-span-2">
            <p className="text-sm text-black">Email</p>
            <p className="text-navy font-medium">{submission.email || 'No email provided'}</p>
          </div>
          <div className="col-span-1 sm:col-span-2">
            <p className="text-sm text-black">Drivers</p>
            <div className="flex flex-wrap gap-2 mt-1">
              {submission.drivers.map((driver, idx) => (
                <span
                  key={idx}
                  className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm"
                >
                  {driver}
                </span>
              ))}
            </div>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 pt-4 border-t">
          <button
            onClick={() => {
              onEdit(submission);
              onClose();
            }}
            className="px-4 py-2 bg-teal text-white rounded-lg hover:bg-teal-600 transition-colors"
          >
            Edit
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white border border-gray-200 text-black rounded-lg hover:bg-gray-50 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
}
