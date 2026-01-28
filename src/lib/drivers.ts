import {
  ResponseTime,
  FollowUpDepth,
  AfterHoursCoverage,
  Driver,
  DriverCode,
  CalculatorInputs,
} from '@/types';

// Static driver definitions for API/email usage
export const DRIVERS: Record<DriverCode, { code: DriverCode; title: string; description: string }> = {
  slowResponse: {
    code: 'slowResponse',
    title: 'Response Speed',
    description: 'How quickly you respond to new inquiries.',
  },
  followUpEarly: {
    code: 'followUpEarly',
    title: 'Follow-Up Depth',
    description: 'How many follow-up touches you make.',
  },
  afterHoursGaps: {
    code: 'afterHoursGaps',
    title: 'After-Hours Coverage',
    description: 'Whether you respond outside business hours.',
  },
  limitedVisibility: {
    code: 'limitedVisibility',
    title: 'Limited Visibility',
    description: 'When follow-up isn\'t tracked, leakage becomes invisible.',
  },
};

// Speed driver text based on response time selection
const SPEED_DRIVERS: Record<ResponseTime, { title: string; description: string }> = {
  under5: {
    title: 'Fast Response Window (Working)',
    description: "You're winning attention early. This is rarely where momentum breaks.",
  },
  '5-30': {
    title: 'Response Window Is Tight',
    description: 'Replies still get read here. They just start competing for attention.',
  },
  '30-2h': {
    title: 'Slow Response Window',
    description: "Past 30 minutes, attention drops fast. There's no alert when it happens.",
  },
  sameday: {
    title: 'Delayed First Response',
    description: 'Same-day replies feel reasonable. They usually arrive after the decision window.',
  },
  nextday: {
    title: 'Missed Response Window',
    description: 'By the next day, momentum has already reset. Most conversations never fully recover.',
  },
};

// Follow-up depth driver text based on selection
const FOLLOWUP_DRIVERS: Record<FollowUpDepth, { title: string; description: string }> = {
  '4-6': {
    title: 'Sustained Follow-Up (Working)',
    description: 'This is where most decisions actually happen. The risk shows up in timing - not effort.',
  },
  '2-3': {
    title: 'Follow-Up Ends Early',
    description: 'Silence here usually means "not yet." It often gets treated like "no."',
  },
  '1': {
    title: 'Single-Touch Drop-Off',
    description: "The follow-up that closes is rarely the first one. Most conversations end before they begin.",
  },
  notsure: {
    title: 'Inconsistent Follow-Up',
    description: 'When follow-up isn\'t deliberate, momentum fades quietly. No one notices until decisions slow.',
  },
};

// After-hours coverage driver text based on selection
const AFTERHOURS_DRIVERS: Record<AfterHoursCoverage, { title: string; description: string }> = {
  yes: {
    title: 'After-Hours Coverage (Working)',
    description: 'This prevents overnight momentum loss. Most breakdowns happen later.',
  },
  sometimes: {
    title: 'After-Hours Gaps',
    description: 'One missed evening can reset the conversation. The next reply has to start over.',
  },
  no: {
    title: 'No After-Hours Coverage',
    description: "Momentum doesn't pause overnight. It moves on.",
  },
};

/**
 * Get the 3 drivers based on current inputs
 * Always returns exactly 3 drivers: Speed, Follow-up Depth, After-hours
 */
export function getTopDrivers(inputs: CalculatorInputs): Driver[] {
  const speedDriver = SPEED_DRIVERS[inputs.responseTime];
  const followUpDriver = FOLLOWUP_DRIVERS[inputs.followUpDepth];
  const afterHoursDriver = AFTERHOURS_DRIVERS[inputs.afterHours];

  return [
    {
      code: 'slowResponse',
      title: speedDriver.title,
      description: speedDriver.description,
    },
    {
      code: 'followUpEarly',
      title: followUpDriver.title,
      description: followUpDriver.description,
    },
    {
      code: 'afterHoursGaps',
      title: afterHoursDriver.title,
      description: afterHoursDriver.description,
    },
  ];
}

/**
 * Get driver codes only (for storage)
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function getTopDriverCodes(inputs: CalculatorInputs): DriverCode[] {
  return ['slowResponse', 'followUpEarly', 'afterHoursGaps'];
}
