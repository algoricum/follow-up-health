'use client';

import { EmailTemplate, GradeRange } from '@/types';
import TemplateEditor from './TemplateEditor';

interface TemplatesListProps {
  templates: EmailTemplate[];
  editingTemplate: GradeRange | null;
  templateSubject: string;
  templateBody: string;
  onStartEdit: (template: EmailTemplate | null, gradeRange: GradeRange) => void;
  onSubjectChange: (subject: string) => void;
  onBodyChange: (body: string) => void;
  onSave: (gradeRange: GradeRange) => void;
  onCancel: () => void;
  savingTemplate: GradeRange | null;
}

export default function TemplatesList({
  templates,
  editingTemplate,
  templateSubject,
  templateBody,
  onStartEdit,
  onSubjectChange,
  onBodyChange,
  onSave,
  onCancel,
  savingTemplate,
}: TemplatesListProps) {
  const gradeRanges: GradeRange[] = ['A', 'BC', 'DF'];

  return (
    <div className="space-y-4">
      {gradeRanges.map((range) => {
        const template = templates.find((t) => t.grade_range === range) || null;
        const isEditing = editingTemplate === range;

        return (
          <TemplateEditor
            key={range}
            template={template}
            gradeRange={range}
            subject={templateSubject}
            body={templateBody}
            isEditing={isEditing}
            isSaving={savingTemplate === range}
            onSubjectChange={onSubjectChange}
            onBodyChange={onBodyChange}
            onStartEdit={() => onStartEdit(template, range)}
            onSave={() => onSave(range)}
            onCancel={onCancel}
          />
        );
      })}
    </div>
  );
}
