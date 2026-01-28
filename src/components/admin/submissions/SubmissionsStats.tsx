import StatsCard from '../shared/StatsCard';

interface SubmissionsStatsProps {
  total: number;
  withEmail: number;
}

export default function SubmissionsStats({ total, withEmail }: SubmissionsStatsProps) {
  const conversionRate = total > 0 ? ((withEmail / total) * 100).toFixed(1) : 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
      <StatsCard label="Total Submissions" value={total} valueColor="navy" />
      <StatsCard label="With Email" value={withEmail} valueColor="teal" />
      <StatsCard label="Conversion Rate" value={`${conversionRate}%`} valueColor="navy" />
    </div>
  );
}
