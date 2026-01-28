'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import {
  Submission,
  EmailTemplate,
  GradeRange,
  ResponseTime,
  FollowUpDepth,
  PatientValue,
  AfterHoursCoverage,
} from '@/types';
import AdminHeader from '@/components/admin/layout/AdminHeader';
import AdminSidebar from '@/components/admin/layout/AdminSidebar';
import MobileNav from '@/components/admin/layout/MobileNav';
import SubmissionsStats from '@/components/admin/submissions/SubmissionsStats';
import SubmissionsFilters from '@/components/admin/submissions/SubmissionsFilters';
import SubmissionsTable from '@/components/admin/submissions/SubmissionsTable';
import SubmissionDetailModal from '@/components/admin/submissions/SubmissionDetailModal';
import SubmissionFormModal from '@/components/admin/submissions/SubmissionFormModal';
import DeleteSubmissionModal from '@/components/admin/submissions/DeleteSubmissionModal';
import Pagination from '@/components/admin/submissions/Pagination';
import TemplatesList from '@/components/admin/templates/TemplatesList';
import Spinner from '@/components/admin/shared/Spinner';

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface Stats {
  total: number;
  withEmail: number;
}

interface User {
  id: string;
  email: string;
  name: string;
}

interface SubmissionFormData {
  monthly_inquiries: number;
  response_time: ResponseTime;
  follow_up_depth: FollowUpDepth;
  patient_value: PatientValue;
  after_hours: AfterHoursCoverage;
  email: string;
}

export default function AdminPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [stats, setStats] = useState<Stats>({ total: 0, withEmail: 0 });
  const [loading, setLoading] = useState(false);
  const [isSavingSubmission, setIsSavingSubmission] = useState(false);
  const [isDeletingSubmission, setIsDeletingSubmission] = useState(false);

  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [editingTemplate, setEditingTemplate] = useState<GradeRange | null>(null);
  const [templateSubject, setTemplateSubject] = useState('');
  const [templateBody, setTemplateBody] = useState('');
  const [savingTemplateRange, setSavingTemplateRange] = useState<GradeRange | null>(null);

  // Filters
  const [filterGrade, setFilterGrade] = useState('');
  const [filterEmail, setFilterEmail] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Active module (default to submissions)
  const [activeModule, setActiveModule] = useState<'submissions' | 'templates'>('submissions');

  // Submission management state
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [showSubmissionModal, setShowSubmissionModal] = useState(false);
  const [editingSubmission, setEditingSubmission] = useState<Submission | null>(null);
  const [deletingSubmission, setDeletingSubmission] = useState<Submission | null>(null);
  const [submissionForm, setSubmissionForm] = useState<SubmissionFormData>({
    monthly_inquiries: 100,
    response_time: '5-30',
    follow_up_depth: '2-3',
    patient_value: '250-500',
    after_hours: 'sometimes',
    email: '',
  });

  // Check authentication on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me');
        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
        } else {
          router.push('/admin/login');
        }
      } catch {
        router.push('/admin/login');
      } finally {
        setCheckingAuth(false);
      }
    };
    checkAuth();
  }, [router]);

  const fetchSubmissions = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(currentPage),
        limit: '20',
      });

      if (filterGrade) params.set('grade', filterGrade);
      if (filterEmail) params.set('hasEmail', filterEmail);

      const response = await fetch(`/api/submissions?${params}`);

      if (!response.ok) throw new Error('Failed to fetch');

      const data = await response.json();
      setSubmissions(data.submissions);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Failed to fetch submissions:', error);
    } finally {
      setLoading(false);
    }
  }, [user, currentPage, filterGrade, filterEmail]);

  const fetchStats = useCallback(async () => {
    if (!user) return;

    try {
      const response = await fetch('/api/submissions', { method: 'HEAD' });

      setStats({
        total: parseInt(response.headers.get('X-Total-Submissions') || '0'),
        withEmail: parseInt(response.headers.get('X-With-Email') || '0'),
      });
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  }, [user]);

  const fetchTemplates = useCallback(async () => {
    if (!user) return;

    try {
      const response = await fetch('/api/email-templates');

      if (!response.ok) throw new Error('Failed to fetch');

      const data = await response.json();
      setTemplates(data.templates || []);
    } catch (error) {
      console.error('Failed to fetch templates:', error);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchSubmissions();
      fetchStats();
      fetchTemplates();
    }
  }, [user, fetchSubmissions, fetchStats, fetchTemplates]);

  const exportToCSV = () => {
    if (!submissions.length) return;

    const RESPONSE_TIME_LABELS: Record<Submission['response_time'], string> = {
      under5: 'Under 5 min',
      '5-30': '5-30 min',
      '30-2h': '30 min - 2 hrs',
      sameday: 'Same day',
      nextday: 'Next day+',
    };

    const FOLLOW_UP_LABELS: Record<Submission['follow_up_depth'], string> = {
      '4-6': '4-6 touches',
      '2-3': '2-3 touches',
      '1': '1 touch',
      notsure: 'Not sure',
    };

    const PATIENT_VALUE_LABELS: Record<Submission['patient_value'], string> = {
      under250: 'Under $250',
      '250-500': '$250-$500',
      '500-1000': '$500-$1,000',
      '1000+': '$1,000+',
    };

    const AFTER_HOURS_LABELS: Record<Submission['after_hours'], string> = {
      yes: 'Yes',
      sometimes: 'Sometimes',
      no: 'No',
    };

    const csvEscape = (value: string) => `"${value.replace(/"/g, '""')}"`;

    const headers = [
      'Date',
      'Monthly Patient Inquiries',
      'Response Time',
      'Follow-up Depth',
      'Patient Value',
      'After Hours',
      'Grade',
      'Loss Rate',
      'Risk Low',
      'Risk High',
      'Email',
    ];

    const rows = submissions.map((s) => [
      new Date(s.created_at).toLocaleString(),
      s.monthly_inquiries,
      RESPONSE_TIME_LABELS[s.response_time],
      FOLLOW_UP_LABELS[s.follow_up_depth],
      PATIENT_VALUE_LABELS[s.patient_value],
      AFTER_HOURS_LABELS[s.after_hours],
      s.grade,
      s.loss_rate,
      s.risk_low,
      s.risk_high,
      s.email || '',
    ]);

    const csv = [
      headers.map(csvEscape).join(','),
      ...rows.map((row) =>
        row
          .map((value) => csvEscape(String(value ?? '')))
          .join(',')
      ),
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `submissions-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const openAddModal = () => {
    setEditingSubmission(null);
    setSubmissionForm({
      monthly_inquiries: 100,
      response_time: '5-30',
      follow_up_depth: '2-3',
      patient_value: '250-500',
      after_hours: 'sometimes',
      email: '',
    });
    setShowSubmissionModal(true);
  };

  const openEditModal = (submission: Submission) => {
    setEditingSubmission(submission);
    setSubmissionForm({
      monthly_inquiries: submission.monthly_inquiries,
      response_time: submission.response_time,
      follow_up_depth: submission.follow_up_depth,
      patient_value: submission.patient_value,
      after_hours: submission.after_hours,
      email: submission.email || '',
    });
    setShowSubmissionModal(true);
  };

  const handleSaveSubmission = async (formData: SubmissionFormData) => {
    if (isSavingSubmission) return;
    setIsSavingSubmission(true);
    try {
      const url = '/api/submissions';
      const method = editingSubmission ? 'PUT' : 'POST';
      const body = editingSubmission
        ? { id: editingSubmission.id, ...formData }
        : formData;

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!response.ok) throw new Error('Failed to save');

      setShowSubmissionModal(false);
      setEditingSubmission(null);
      fetchSubmissions();
      fetchStats();
      toast.success(
        editingSubmission ? 'Submission updated successfully' : 'Submission created successfully'
      );
    } catch (error) {
      console.error('Failed to save submission:', error);
      toast.error('Failed to save submission. Please try again.');
    } finally {
      setIsSavingSubmission(false);
    }
  };

  const handleDeleteSubmission = async () => {
    if (!deletingSubmission) return;

    if (isDeletingSubmission) return;
    setIsDeletingSubmission(true);
    try {
      const response = await fetch(`/api/submissions?id=${deletingSubmission.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete');

      setDeletingSubmission(null);
      fetchSubmissions();
      fetchStats();
      toast.success('Submission deleted successfully');
    } catch (error) {
      console.error('Failed to delete submission:', error);
      toast.error('Failed to delete submission. Please try again.');
    } finally {
      setIsDeletingSubmission(false);
    }
  };

  const handleSaveTemplate = async (gradeRange: GradeRange) => {
    if (savingTemplateRange) return;
    setSavingTemplateRange(gradeRange);
    try {
      const response = await fetch('/api/email-templates', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          grade_range: gradeRange,
          subject: templateSubject,
          body: templateBody,
        }),
      });

      if (response.ok) {
        setEditingTemplate(null);
        fetchTemplates();
        toast.success('Template saved successfully');
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to save template');
      }
    } catch (error) {
      console.error('Failed to save template:', error);
      toast.error('Failed to save template. Please try again.');
    } finally {
      setSavingTemplateRange(null);
    }
  };

  const startEditingTemplate = (template: EmailTemplate | null, gradeRange: GradeRange) => {
    setEditingTemplate(gradeRange);
    setTemplateSubject(template?.subject || '');
    setTemplateBody(template?.body || '');
  };

  // Show loading while checking auth
  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <Spinner size={28} color="#0f766e" />
      </div>
    );
  }

  // If not authenticated, this will redirect (handled in useEffect)
  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
      <AdminHeader user={user} />
      <MobileNav activeModule={activeModule} onModuleChange={setActiveModule} />

      <div className="flex flex-1 overflow-hidden">
        <AdminSidebar activeModule={activeModule} onModuleChange={setActiveModule} />

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto pb-20 lg:pb-0">
          <div className="p-4 sm:p-6">
            {/* Module Header */}
            <div className="mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-navy mb-2">
                {activeModule === 'submissions' ? 'Submissions' : 'Email Templates'}
              </h2>
              <p className="text-sm text-black">
                {activeModule === 'submissions'
                  ? 'Manage and view all calculator submissions'
                  : 'Manage email templates for different grade ranges'}
              </p>
            </div>

            {/* Stats - Only show for Submissions module */}
            {activeModule === 'submissions' && (
              <SubmissionsStats total={stats.total} withEmail={stats.withEmail} />
            )}

            {/* Submissions Module */}
            {activeModule === 'submissions' && (
              <>
                <SubmissionsFilters
                  filterGrade={filterGrade}
                  filterEmail={filterEmail}
                  onGradeChange={setFilterGrade}
                  onEmailChange={setFilterEmail}
                  onApplyFilters={() => {
                    setCurrentPage(1);
                    fetchSubmissions();
                  }}
                  onExportCSV={exportToCSV}
                  onAddSubmission={openAddModal}
                  isLoading={loading}
                />

                <SubmissionsTable
                  submissions={submissions}
                  loading={loading}
                  onView={setSelectedSubmission}
                  onEdit={openEditModal}
                  onDelete={setDeletingSubmission}
                />

                {pagination && (
                  <Pagination
                    currentPage={pagination.page}
                    totalPages={pagination.totalPages}
                    total={pagination.total}
                    onPageChange={setCurrentPage}
                  />
                )}

                <SubmissionDetailModal
                  submission={selectedSubmission}
                  onClose={() => setSelectedSubmission(null)}
                  onEdit={openEditModal}
                />

                <SubmissionFormModal
                  isOpen={showSubmissionModal}
                  onClose={() => {
                    setShowSubmissionModal(false);
                    setEditingSubmission(null);
                  }}
                  onSubmit={handleSaveSubmission}
                  editingSubmission={editingSubmission}
                  formData={submissionForm}
                  onFormChange={setSubmissionForm}
                  isSaving={isSavingSubmission}
                />

                <DeleteSubmissionModal
                  submission={deletingSubmission}
                  onClose={() => setDeletingSubmission(null)}
                  onConfirm={handleDeleteSubmission}
                  isDeleting={isDeletingSubmission}
                />
              </>
            )}

            {/* Email Templates Module */}
            {activeModule === 'templates' && (
              <TemplatesList
                templates={templates}
                editingTemplate={editingTemplate}
                templateSubject={templateSubject}
                templateBody={templateBody}
                onStartEdit={startEditingTemplate}
                onSubjectChange={setTemplateSubject}
                onBodyChange={setTemplateBody}
                onSave={handleSaveTemplate}
                onCancel={() => setEditingTemplate(null)}
                  savingTemplate={savingTemplateRange}
              />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
