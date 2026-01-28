'use client';

import { useState, useEffect } from 'react';
import Editor from 'react-simple-wysiwyg';
import { EmailTemplate, GradeRange } from '@/types';
import Spinner from '../shared/Spinner';

interface TemplateEditorProps {
  template: EmailTemplate | null;
  gradeRange: GradeRange;
  subject: string;
  body: string;
  isEditing: boolean;
  isSaving: boolean;
  onSubjectChange: (subject: string) => void;
  onBodyChange: (body: string) => void;
  onStartEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
}

export default function TemplateEditor({
  template,
  gradeRange,
  subject,
  body,
  isEditing,
  isSaving,
  onSubjectChange,
  onBodyChange,
  onStartEdit,
  onSave,
  onCancel,
}: TemplateEditorProps) {
  const [editorValue, setEditorValue] = useState(body);

  // Sync editor value when body prop changes (e.g., when starting to edit)
  useEffect(() => {
    if (isEditing) {
      setEditorValue(body);
    }
  }, [body, isEditing]);

  const getTemplateTitle = (range: GradeRange) => {
    if (range === 'A') return 'Grade A/A- Template';
    if (range === 'BC') return 'Grade B/C Template';
    return 'Grade D/F Template';
  };

  const handleEditorChange = (event: { target: { value: string } }) => {
    const nextValue = event.target.value;
    setEditorValue(nextValue);
    onBodyChange(nextValue);
  };

  return (
    <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base sm:text-lg font-semibold text-navy">{getTemplateTitle(gradeRange)}</h3>
        {!isEditing && (
          <button
            onClick={onStartEdit}
            className="text-sm text-teal hover:underline whitespace-nowrap font-medium"
          >
            Edit
          </button>
        )}
      </div>

      {isEditing ? (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-navy mb-1.5">Subject</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => onSubjectChange(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-navy mb-1.5">Body</label>
            {/* Custom styles for the WYSIWYG editor on mobile */}
            <style jsx global>{`
              .rsw-editor {
                font-size: 14px !important;
              }
              .rsw-toolbar {
                flex-wrap: wrap !important;
                gap: 2px !important;
                padding: 6px !important;
              }
              .rsw-toolbar button,
              .rsw-toolbar select {
                padding: 4px 6px !important;
                min-width: 28px !important;
                font-size: 12px !important;
              }
              @media (max-width: 640px) {
                .rsw-toolbar {
                  justify-content: flex-start !important;
                }
                .rsw-toolbar select {
                  max-width: 80px !important;
                }
              }
            `}</style>
            <div className="border border-gray-200 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-teal">
              <Editor
                value={editorValue}
                onChange={handleEditorChange}
                containerProps={{
                  style: {
                    minHeight: '120px',
                    fontFamily: 'inherit',
                    padding: '0.75rem',
                    fontSize: '14px',
                  },
                }}
              />
            </div>
            {/* <details className="mt-2">
              <summary className="text-xs text-black font-medium cursor-pointer py-2">
                View available placeholders
              </summary>
              <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                <div className="flex flex-wrap gap-1.5">
                  <code className="bg-gray-200 px-1.5 py-0.5 rounded text-xs">{`{{grade}}`}</code>
                  <code className="bg-gray-200 px-1.5 py-0.5 rounded text-xs">{`{{risk_low}}`}</code>
                  <code className="bg-gray-200 px-1.5 py-0.5 rounded text-xs">{`{{risk_high}}`}</code>
                </div>
              </div>
            </details> */}
          </div>
          <div className="flex flex-col-reverse sm:flex-row gap-2 pt-2">
            <button
              onClick={onCancel}
              disabled={isSaving}
              className="w-full sm:w-auto px-4 py-2.5 bg-white border border-gray-200 text-black rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed text-sm font-medium"
            >
              Cancel
            </button>
            <button
              onClick={onSave}
              disabled={isSaving}
              className="w-full sm:w-auto px-4 py-2.5 bg-teal text-white rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed text-sm font-medium"
            >
              {isSaving ? (
                <span className="inline-flex items-center justify-center gap-2">
                  <Spinner size={16} color="#ffffff" />
                  Saving...
                </span>
              ) : (
                'Save Template'
              )}
            </button>
          </div>
        </div>
      ) : (
        <div>
          {template ? (
            <>
              <div className="mb-3">
                <span className="text-xs text-black uppercase tracking-wide">Subject</span>
                <p className="text-sm text-navy font-medium mt-0.5">{template.subject}</p>
              </div>
              <div className="mb-3">
                <span className="text-xs text-black uppercase tracking-wide">Content</span>
                <div
                  className="text-sm text-black break-words prose prose-sm max-w-none mt-1 p-3 bg-gray-50 rounded-lg"
                  dangerouslySetInnerHTML={{ __html: template.body || '' }}
                />
              </div>
              <p className="text-xs text-black/60">
                Updated: {new Date(template.updated_at).toLocaleDateString()}
              </p>
            </>
          ) : (
            <p className="text-sm text-black">
              No template configured. Click Edit to create one.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
