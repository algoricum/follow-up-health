import {
  ResponseTime,
  FollowUpDepth,
  PatientValue,
  AfterHoursCoverage,
  CalculatorInputs,
  CalculationResults,
  SeverityLevel,
  ComponentScores,
  RevenueAtRisk,
} from '@/types';

// Response Time Multiplier
const RTM: Record<ResponseTime, number> = {
  under5: 0.9,
  '5-30': 1.0,
  '30-2h': 1.1,
  sameday: 1.25,
  nextday: 1.45,
};

// Follow-Up Multiplier
const FUM: Record<FollowUpDepth, number> = {
  '4-6': 0.9,
  '2-3': 1.0,
  '1': 1.25,
  notsure: 1.35,
};

// Coverage Multiplier
const CM: Record<AfterHoursCoverage, number> = {
  yes: 1.0,
  sometimes: 1.1,
  no: 1.2,
};

// Patient Value Midpoints
const PV: Record<PatientValue, number> = {
  under250: 200,
  '250-500': 375,
  '500-1000': 750,
  '1000+': 1500,
};

// Grade Deductions
const SPEED_DEDUCTIONS: Record<ResponseTime, number> = {
  under5: 0,
  '5-30': 5,
  '30-2h': 12,
  sameday: 20,
  nextday: 30,
};

const PERSISTENCE_DEDUCTIONS: Record<FollowUpDepth, number> = {
  '4-6': 0,
  '2-3': 8,
  '1': 18,
  notsure: 22,
};

const COVERAGE_DEDUCTIONS: Record<AfterHoursCoverage, number> = {
  yes: 0,
  sometimes: 6,
  no: 10,
};

// Base loss rate (8%)
const BASE_LOSS_RATE = 0.08;

/**
 * Calculate the loss rate based on multipliers
 * Clamped between 5% and 25%
 */
export function calculateLossRate(
  responseTime: ResponseTime,
  followUpDepth: FollowUpDepth,
  afterHours: AfterHoursCoverage
): number {
  const rtm = RTM[responseTime];
  const fum = FUM[followUpDepth];
  const cm = CM[afterHours];

  const rawLossRate = BASE_LOSS_RATE * rtm * fum * cm;

  // Clamp between 0.05 and 0.25
  return Math.max(0.05, Math.min(0.25, rawLossRate));
}

/**
 * Calculate revenue at risk with low and high estimates
 */
export function calculateRevenueAtRisk(
  monthlyInquiries: number,
  lossRate: number,
  patientValue: PatientValue
): RevenueAtRisk {
  const avgValue = PV[patientValue];
  const lostPatients = monthlyInquiries * lossRate;
  const midpoint = lostPatients * avgValue;

  // Low is 70% of midpoint, high is 130% of midpoint
  return {
    low: Math.round(midpoint * 0.7),
    high: Math.round(midpoint * 1.3),
  };
}

/**
 * Convert score to letter grade with +/-
 */
export function gradeFromScore(score: number): string {
  if (score >= 97) return 'A+';
  if (score >= 93) return 'A';
  if (score >= 90) return 'A-';
  if (score >= 87) return 'B+';
  if (score >= 83) return 'B';
  if (score >= 80) return 'B-';
  if (score >= 77) return 'C+';
  if (score >= 73) return 'C';
  if (score >= 70) return 'C-';
  if (score >= 67) return 'D+';
  if (score >= 63) return 'D';
  if (score >= 60) return 'D-';
  return 'F';
}

/**
 * Calculate overall grade based on deductions
 */
export function calculateGrade(
  responseTime: ResponseTime,
  followUpDepth: FollowUpDepth,
  afterHours: AfterHoursCoverage
): { grade: string; score: number } {
  const speedDed = SPEED_DEDUCTIONS[responseTime];
  const persistDed = PERSISTENCE_DEDUCTIONS[followUpDepth];
  const coverageDed = COVERAGE_DEDUCTIONS[afterHours];

  const totalDeductions = speedDed + persistDed + coverageDed;
  const score = Math.max(0, 100 - totalDeductions);

  return {
    grade: gradeFromScore(score),
    score,
  };
}

/**
 * Calculate severity level based on loss rate
 */
export function calculateSeverity(lossRate: number): SeverityLevel {
  const dropoffPercent = Math.round(lossRate * 100);

  if (dropoffPercent <= 7) return 'Quiet Leak';
  if (dropoffPercent <= 12) return 'Slow Leak';
  return 'Active Leak';
}

/**
 * Calculate component scores (0-100)
 */
export function getScores(inputs: CalculatorInputs): ComponentScores {
  const speedScore = 100 - SPEED_DEDUCTIONS[inputs.responseTime] * (100 / 30);
  const persistenceScore = 100 - PERSISTENCE_DEDUCTIONS[inputs.followUpDepth] * (100 / 22);
  const coverageScore = 100 - COVERAGE_DEDUCTIONS[inputs.afterHours] * (100 / 10);

  return {
    speed: Math.round(Math.max(0, Math.min(100, speedScore))),
    persistence: Math.round(Math.max(0, Math.min(100, persistenceScore))),
    coverage: Math.round(Math.max(0, Math.min(100, coverageScore))),
  };
}

/**
 * Main calculation function - compute all results from inputs
 */
export function calculateResults(inputs: CalculatorInputs): CalculationResults {
  const lossRate = calculateLossRate(
    inputs.responseTime,
    inputs.followUpDepth,
    inputs.afterHours
  );

  const { grade, score: gradeScore } = calculateGrade(
    inputs.responseTime,
    inputs.followUpDepth,
    inputs.afterHours
  );

  const revenueAtRisk = calculateRevenueAtRisk(
    inputs.monthlyInquiries,
    lossRate,
    inputs.patientValue
  );

  const severity = calculateSeverity(lossRate);
  const dropoffPercent = Math.round(lossRate * 100);
  const scores = getScores(inputs);

  return {
    grade,
    gradeScore,
    revenueAtRisk,
    severity,
    dropoffPercent,
    lossRate,
    scores,
  };
}

/**
 * Get grade range for email template selection
 */
export function getGradeRange(grade: string): 'A' | 'BC' | 'DF' {
  if (grade.startsWith('A')) return 'A';
  if (grade.startsWith('B') || grade.startsWith('C')) return 'BC';
  return 'DF';
}
