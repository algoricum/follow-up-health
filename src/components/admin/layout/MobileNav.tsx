'use client';

interface MobileNavProps {
  activeModule: 'submissions' | 'templates';
  onModuleChange: (module: 'submissions' | 'templates') => void;
}

export default function MobileNav({ activeModule, onModuleChange }: MobileNavProps) {
  return (
    <div className="lg:hidden bg-white border-b border-gray-100">
      <nav className="flex justify-center gap-2 px-4 py-3">
        <button
          onClick={() => onModuleChange('submissions')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg transition-colors whitespace-nowrap ${
            activeModule === 'submissions'
              ? 'bg-teal text-white font-medium shadow-sm'
              : 'bg-gray-100 text-black hover:bg-gray-200'
          }`}
        >
          <svg
            className="w-4 h-4"
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
          <span className="text-sm">Submissions</span>
        </button>
        <button
          onClick={() => onModuleChange('templates')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg transition-colors whitespace-nowrap ${
            activeModule === 'templates'
              ? 'bg-teal text-white font-medium shadow-sm'
              : 'bg-gray-100 text-black hover:bg-gray-200'
          }`}
        >
          <svg
            className="w-4 h-4"
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
          <span className="text-sm">Templates</span>
        </button>
      </nav>
    </div>
  );
}
