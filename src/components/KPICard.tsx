'use client';

import { ReactNode } from 'react';

interface KPICardProps {
  title: string;
  value: ReactNode;
  subtitle?: string;
  description?: string;
  variant?: 'default' | 'success' | 'warning' | 'danger';
}

const variantStyles = {
  default: {
    value: 'text-navy',
    bg: 'bg-white',
  },
  success: {
    value: 'text-emerald',
    bg: 'bg-emerald-50',
  },
  warning: {
    value: 'text-amber',
    bg: 'bg-amber-50',
  },
  danger: {
    value: 'text-rose',
    bg: 'bg-rose-50',
  },
};

export default function KPICard({
  title,
  value,
  subtitle,
  description,
  variant = 'default',
}: KPICardProps) {
  const styles = variantStyles[variant];

  return (
    <div className={`${styles.bg} rounded-lg p-3 shadow-sm border border-gray-100`}>
      <p className="text-xs font-medium text-black mb-0.5">{title}</p>
      <p className={`text-xl font-bold ${styles.value}`}>{value}</p>
      {subtitle && (
        <p className="text-[10px] text-black mt-0.5">{subtitle}</p>
      )}
      {description && (
        <p className="text-[10px] text-black mt-1 italic leading-tight">{description}</p>
      )}
    </div>
  );
}
