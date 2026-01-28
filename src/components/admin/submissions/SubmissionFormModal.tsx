'use client';

import { Submission, ResponseTime, FollowUpDepth, PatientValue, AfterHoursCoverage } from '@/types';
import Modal from '../shared/Modal';
import Spinner from '../shared/Spinner';

interface SubmissionFormData {
  monthly_inquiries: number;
  response_time: ResponseTime;
  follow_up_depth: FollowUpDepth;
  patient_value: PatientValue;
  after_hours: AfterHoursCoverage;
  email: string;
}

interface SubmissionFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: SubmissionFormData) => void;
  editingSubmission: Submission | null;
  formData: SubmissionFormData;
  onFormChange: (data: SubmissionFormData) => void;
  isSaving: boolean;
}

export default function SubmissionFormModal({
  isOpen,
  onClose,
  onSubmit,
  editingSubmission,
  formData,
  onFormChange,
  isSaving,
}: SubmissionFormModalProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSaving) return;
    onSubmit(formData);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingSubmission ? 'Edit Submission' : 'Add Submission'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-navy mb-1">
            Monthly Patient Inquiries
          </label>
          <input
            type="number"
            value={formData.monthly_inquiries}
            onChange={(e) =>
              onFormChange({ ...formData, monthly_inquiries: parseInt(e.target.value) || 0 })
            }
            className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal"
            min="1"
            max="400"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-navy mb-1">
            How fast do you typically respond to new patient inquiries?
          </label>
          <select
            value={formData.response_time}
            onChange={(e) =>
              onFormChange({ ...formData, response_time: e.target.value as ResponseTime })
            }
            className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal"
            required
          >
            <option value="under5">Under 5 min</option>
            <option value="5-30">5-30 min</option>
            <option value="30-2h">30 min - 2 hrs</option>
            <option value="sameday">Same day</option>
            <option value="nextday">Next day+</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-navy mb-1">
            How many follow-up touches do you make before giving up?
          </label>
          <select
            value={formData.follow_up_depth}
            onChange={(e) =>
              onFormChange({ ...formData, follow_up_depth: e.target.value as FollowUpDepth })
            }
            className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal"
            required
          >
            <option value="4-6">4-6 touches</option>
            <option value="2-3">2-3 touches</option>
            <option value="1">1 touch</option>
            <option value="notsure">Not sure</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-navy mb-1">
            What&apos;s your average patient lifetime value?
          </label>
          <select
            value={formData.patient_value}
            onChange={(e) =>
              onFormChange({ ...formData, patient_value: e.target.value as PatientValue })
            }
            className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal"
            required
          >
            <option value="under250">Under $250</option>
            <option value="250-500">$250-$500</option>
            <option value="500-1000">$500-$1,000</option>
            <option value="1000+">$1,000+</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-navy mb-1">
            Do you respond to inquiries after hours (evenings/weekends)?
          </label>
          <select
            value={formData.after_hours}
            onChange={(e) =>
              onFormChange({ ...formData, after_hours: e.target.value as AfterHoursCoverage })
            }
            className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal"
            required
          >
            <option value="yes">Yes</option>
            <option value="sometimes">Sometimes</option>
            <option value="no">No</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-navy mb-1">Email (optional)</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => onFormChange({ ...formData, email: e.target.value })}
            className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal"
            placeholder="user@example.com"
          />
        </div>
        <div className="flex flex-col sm:flex-row gap-2 pt-4 border-t">
          <button
            type="submit"
            disabled={isSaving}
            className="px-4 py-2 bg-teal text-white rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <span className="inline-flex items-center gap-2">
                <Spinner size={16} color="#ffffff" />
                Saving...
              </span>
            ) : (
              'Save'
            )}
          </button>
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="px-4 py-2 bg-white border border-gray-200 text-black rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
        </div>
      </form>
    </Modal>
  );
}
