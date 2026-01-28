// Input Types
export type ResponseTime = 'under5' | '5-30' | '30-2h' | 'sameday' | 'nextday';
export type FollowUpDepth = '4-6' | '2-3' | '1' | 'notsure';
export type PatientValue = 'under250' | '250-500' | '500-1000' | '1000+';
export type AfterHoursCoverage = 'yes' | 'sometimes' | 'no';

export interface CalculatorInputs {
  monthlyInquiries: number;
  responseTime: ResponseTime;
  followUpDepth: FollowUpDepth;
  patientValue: PatientValue;
  afterHours: AfterHoursCoverage;
}

// Scoring Types
export interface RevenueAtRisk {
  low: number;
  high: number;
}

export type SeverityLevel = 'Quiet Leak' | 'Slow Leak' | 'Active Leak';

export interface ComponentScores {
  speed: number;
  persistence: number;
  coverage: number;
}

export interface CalculationResults {
  grade: string;
  gradeScore: number;
  revenueAtRisk: RevenueAtRisk;
  severity: SeverityLevel;
  dropoffPercent: number;
  lossRate: number;
  scores: ComponentScores;
}

// Driver Types
export type DriverCode = 'slowResponse' | 'followUpEarly' | 'afterHoursGaps' | 'limitedVisibility';

export interface Driver {
  code: DriverCode;
  title: string;
  description: string;
}

// Submission Types
export interface Submission {
  id: string;
  created_at: string;
  monthly_inquiries: number;
  response_time: ResponseTime;
  follow_up_depth: FollowUpDepth;
  patient_value: PatientValue;
  after_hours: AfterHoursCoverage;
  grade: string;
  loss_rate: number;
  dropoff_pct: number;
  risk_low: number;
  risk_high: number;
  drivers: DriverCode[];
  email: string | null;
}

// Email Template Types
export type GradeRange = 'A' | 'BC' | 'DF';

export interface EmailTemplate {
  id: string;
  grade_range: GradeRange;
  subject: string;
  body: string;
  config?: string | null;
  updated_at: string;
}
