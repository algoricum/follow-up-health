'use client';

import { Driver } from '@/types';

interface LeakageDriversProps {
  drivers: Driver[];
}

const driverIcons: Record<string, string> = {
  slowResponse: '⏱️',
  followUpEarly: '📉',
  afterHoursGaps: '🌙',
};

export default function LeakageDrivers({ drivers }: LeakageDriversProps) {
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold text-navy">The 3 Places Momentum Usually Dies</h3>
      <div className="grid gap-2">
        {drivers.map((driver, index) => {
          const isWorking = driver.title.includes('(Working)');

          return (
            <div
              key={driver.code}
              className={`flex items-start gap-2 p-2.5 rounded-lg border shadow-sm ${
                isWorking
                  ? 'bg-emerald-50 border-emerald-100'
                  : 'bg-rose-50 border-rose-100'
              }`}
            >
              <div className={`flex-shrink-0 w-6 h-6 flex items-center justify-center rounded text-sm ${
                isWorking ? 'bg-emerald-100' : 'bg-rose-50'
              }`}>
                {isWorking ? '✓' : driverIcons[driver.code] || '⚠️'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${
                    isWorking
                      ? 'text-emerald bg-emerald-100'
                      : 'text-rose bg-rose-100'
                  }`}>
                    #{index + 1}
                  </span>
                  <h4 className="text-xs font-medium text-navy truncate">{driver.title}</h4>
                </div>
                <p className="text-[10px] text-black mt-0.5 leading-tight">{driver.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
