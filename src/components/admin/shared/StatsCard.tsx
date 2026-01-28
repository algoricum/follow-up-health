interface StatsCardProps {
  label: string;
  value: string | number;
  valueColor?: 'navy' | 'teal';
}

export default function StatsCard({ label, value, valueColor = 'navy' }: StatsCardProps) {
  const colorClasses = {
    navy: 'text-navy',
    teal: 'text-teal',
  };

  return (
    <div className="bg-white rounded-xl p-4 sm:p-5 shadow-sm border border-gray-100">
      <p className="text-xs sm:text-sm text-black mb-1">{label}</p>
      <p className={`text-2xl sm:text-3xl font-bold ${colorClasses[valueColor]}`}>{value}</p>
    </div>
  );
}
