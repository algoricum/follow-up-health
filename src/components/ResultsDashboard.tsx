'use client';

import { useMemo } from 'react';
import KPICard from './KPICard';
import LeakageDrivers from './LeakageDrivers';
import ScoreChart from './ScoreChart';
import EmailCapture from './EmailCapture';
import { CalculatorInputs, CalculationResults, SeverityLevel } from '@/types';
import { getTopDrivers, getTopDriverCodes } from '@/lib/drivers';

interface ResultsDashboardProps {
  inputs: CalculatorInputs;
  results: CalculationResults;
}

function getSeverityVariant(severity: SeverityLevel): 'success' | 'warning' | 'danger' {
  switch (severity) {
    case 'Quiet Leak':
      return 'success';
    case 'Slow Leak':
      return 'warning';
    case 'Active Leak':
      return 'danger';
  }
}

function getGradeVariant(grade: string): 'success' | 'warning' | 'danger' {
  if (grade.startsWith('A') || grade.startsWith('B')) return 'success';
  if (grade.startsWith('C')) return 'warning';
  return 'danger';
}

export default function ResultsDashboard({ inputs, results }: ResultsDashboardProps) {
  const drivers = useMemo(() => getTopDrivers(inputs), [inputs]);
  const driverCodes = useMemo(() => getTopDriverCodes(inputs), [inputs]);

  const formatCurrency = (value: number) => {
    return '$' + value.toLocaleString();
  };

  return (
    <div className="space-y-4">
      {/* Results header */}
      <h2 className="text-base font-semibold text-navy">Results</h2>

      {/* KPI Cards */}
      <div className="grid grid-cols-3 gap-3">
        <KPICard
          title="Your Grade (So Far)"
          value={results.grade}
          subtitle={`Score: ${results.gradeScore}/100`}
          description="This is the obvious part. The next part is where it breaks."
          variant={getGradeVariant(results.grade)}
        />
        <KPICard
          title="Revenue at Risk"
          value={
            <span className="text-base sm:text-lg">
              {formatCurrency(results.revenueAtRisk.low)} - {formatCurrency(results.revenueAtRisk.high)}
            </span>
          }
          subtitle="Monthly estimate"
          description="This isn't lost. It's the money that gets decided somewhere else."
          variant="danger"
        />
        <KPICard
          title="Severity"
          value={results.severity}
          subtitle={`${results.dropoffPercent}% drop-off rate`}
          description="The kind that doesn't show up… until it does."
          variant={getSeverityVariant(results.severity)}
        />
      </div>

      {/* Leakage Drivers */}
      <LeakageDrivers drivers={drivers} />

      {/* Score Chart */}
      <ScoreChart scores={results.scores} />

      {/* Recommendations */}
      <div className="p-3 bg-teal-50 rounded-lg border border-teal-100">
        <h3 className="text-sm font-semibold text-navy mb-2">
          3 Fixes That Feel Too Small (But Aren&apos;t)
        </h3>
        <ul className="space-y-1.5 text-xs text-black">
          <li className="flex items-start gap-1.5">
            <span className="text-teal">•</span>
            <span>The second reply matters more than the first.</span>
          </li>
          <li className="flex items-start gap-1.5">
            <span className="text-teal">•</span>
            <span>4-6 touches isn&apos;t pushy - it&apos;s how decisions actually form.</span>
          </li>
          <li className="flex items-start gap-1.5">
            <span className="text-teal">•</span>
            <span>After-hours doesn&apos;t need perfection. It needs continuity.</span>
          </li>
        </ul>
      </div>

      {/* Email Capture */}
      <EmailCapture inputs={inputs} results={results} drivers={driverCodes} />
    </div>
  );
}
