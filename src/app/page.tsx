'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import InputsPanel from '@/components/InputsPanel';
import ResultsDashboard from '@/components/ResultsDashboard';
import { CalculatorInputs } from '@/types';
import { calculateResults } from '@/lib/scoring';

const DEFAULT_INPUTS: CalculatorInputs = {
  monthlyInquiries: 100,
  responseTime: '5-30',
  followUpDepth: '2-3',
  patientValue: '250-500',
  afterHours: 'sometimes',
};

export default function CalculatorPage() {
  const [inputs, setInputs] = useState<CalculatorInputs>(DEFAULT_INPUTS);
  const [hasInteracted, setHasInteracted] = useState(false);
  const resultsRef = useRef<HTMLDivElement>(null);

  const results = useMemo(() => calculateResults(inputs), [inputs]);

  const handleInputChange = (newInputs: CalculatorInputs) => {
    setInputs(newInputs);
    if (!hasInteracted) {
      setHasInteracted(true);
    }
  };

  // Auto-scroll to results on first interaction (mobile only)
  useEffect(() => {
    if (hasInteracted && resultsRef.current && window.innerWidth < 768) {
      resultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [hasInteracted]);

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-navy">
                Follow-Up Health Dashboard
              </h1>
              <p className="text-xs text-black hidden sm:block">
                Assess your clinic&apos;s follow-up operations
              </p>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-teal-50 rounded-full">
              <span className="w-1.5 h-1.5 bg-teal rounded-full animate-pulse"></span>
              <span className="text-xs font-medium text-teal">Live Results</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 items-start">
            {/* Left Column - Inputs */}
            <div className="lg:col-span-5 lg:sticky lg:top-[4rem] border-r border-gray-200">
              <InputsPanel inputs={inputs} onChange={handleInputChange} />
            </div>

            {/* Right Column - Results */}
            <div ref={resultsRef} className="lg:col-span-7 p-5">
              <ResultsDashboard inputs={inputs} results={results} />
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 mt-6">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <p className="text-xs text-black text-center">
            © {new Date().getFullYear()} Follow-Up Health Dashboard. All calculations are estimates based on industry benchmarks.
          </p>
        </div>
      </footer>
    </div>
  );
}
