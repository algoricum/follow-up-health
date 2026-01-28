'use client';

import { Submission } from '@/types';
import Modal from '../shared/Modal';
import Spinner from '../shared/Spinner';

interface DeleteSubmissionModalProps {
  submission: Submission | null;
  onClose: () => void;
  onConfirm: () => void;
  isDeleting: boolean;
}

export default function DeleteSubmissionModal({
  submission,
  onClose,
  onConfirm,
  isDeleting,
}: DeleteSubmissionModalProps) {
  return (
    <Modal isOpen={!!submission} onClose={onClose} title="Delete Submission" maxWidth="md">
      <div>
        <p className="text-black mb-6">
          Are you sure you want to delete this submission? This action cannot be undone.
        </p>
        <div className="flex flex-col sm:flex-row gap-2">
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="px-4 py-2 bg-red-600 text-white rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isDeleting ? (
              <span className="inline-flex items-center gap-2">
                <Spinner size={16} color="#ffffff" />
                Deleting...
              </span>
            ) : (
              'Delete'
            )}
          </button>
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="px-4 py-2 bg-white border border-gray-200 text-black rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
        </div>
      </div>
    </Modal>
  );
}
