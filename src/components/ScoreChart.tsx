'use client';

import { ComponentScores } from '@/types';

interface ScoreChartProps {
  scores: ComponentScores;
}

interface ScoreBarProps {
  label: string;
  value: number;
}

function ScoreBar({ label, value }: ScoreBarProps) {
  const getColor = (score: number) => {
    if (score >= 80) return 'bg-emerald';
    if (score >= 60) return 'bg-amber';
    return 'bg-rose';
  };

  return (
    <div className="space-y-0.5">
      <div className="flex justify-between text-xs">
        <span className="font-medium text-navy">{label}</span>
        <span className="text-black">{value}/100</span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full ${getColor(value)} rounded-full transition-all duration-500 ease-out`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

export default function ScoreChart({ scores }: ScoreChartProps) {
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold text-navy">Your Follow-Up Reality</h3>
      <div className="space-y-2.5 p-3 bg-white rounded-lg border border-gray-100">
        <ScoreBar label="Speed" value={scores.speed} />
        <ScoreBar label="Persistence" value={scores.persistence} />
        <ScoreBar label="Coverage" value={scores.coverage} />
      </div>
    </div>
  );
}
