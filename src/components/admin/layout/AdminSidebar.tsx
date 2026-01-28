'use client';

interface AdminSidebarProps {
  activeModule: 'submissions' | 'templates';
  onModuleChange: (module: 'submissions' | 'templates') => void;
}

export default function AdminSidebar({ activeModule, onModuleChange }: AdminSidebarProps) {
  return (
    <aside className="w-64 bg-white border-r border-gray-100 flex-shrink-0 hidden lg:block">
      <nav className="p-4 space-y-1">
        <button
          onClick={() => onModuleChange('submissions')}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
            activeModule === 'submissions'
              ? 'bg-teal-50 text-teal font-medium'
              : 'text-black hover:bg-gray-50'
          }`}
        >
          <svg
            className="w-5 h-5 flex-shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <span>Submissions</span>
        </button>
        <button
          onClick={() => onModuleChange('templates')}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
            activeModule === 'templates'
              ? 'bg-teal-50 text-teal font-medium'
              : 'text-black hover:bg-gray-50'
          }`}
        >
          <svg
            className="w-5 h-5 flex-shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
          <span>Email Templates</span>
        </button>
      </nav>
    </aside>
  );
}
