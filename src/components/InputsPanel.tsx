'use client';

import Slider from './Slider';
import ChipSelect from './ChipSelect';
import {
  CalculatorInputs,
  ResponseTime,
  FollowUpDepth,
  PatientValue,
  AfterHoursCoverage,
} from '@/types';

interface InputsPanelProps {
  inputs: CalculatorInputs;
  onChange: (inputs: CalculatorInputs) => void;
}

const RESPONSE_TIME_OPTIONS: { value: ResponseTime; label: string }[] = [
  { value: 'under5', label: 'Under 5 min' },
  { value: '5-30', label: '5-30 min' },
  { value: '30-2h', label: '30 min - 2 hrs' },
  { value: 'sameday', label: 'Same day' },
  { value: 'nextday', label: 'Next day+' },
];

const FOLLOW_UP_OPTIONS: { value: FollowUpDepth; label: string }[] = [
  { value: '4-6', label: '4-6 touches' },
  { value: '2-3', label: '2-3 touches' },
  { value: '1', label: '1 touch' },
  { value: 'notsure', label: 'Not sure' },
];

const PATIENT_VALUE_OPTIONS: { value: PatientValue; label: string }[] = [
  { value: 'under250', label: 'Under $250' },
  { value: '250-500', label: '$250-$500' },
  { value: '500-1000', label: '$500-$1,000' },
  { value: '1000+', label: '$1,000+' },
];

const AFTER_HOURS_OPTIONS: { value: AfterHoursCoverage; label: string }[] = [
  { value: 'yes', label: 'Yes' },
  { value: 'sometimes', label: 'Sometimes' },
  { value: 'no', label: 'No' },
];

export default function InputsPanel({ inputs, onChange }: InputsPanelProps) {
  const updateInput = <K extends keyof CalculatorInputs>(
    key: K,
    value: CalculatorInputs[K]
  ) => {
    onChange({ ...inputs, [key]: value });
  };

  return (
    <div className="h-full">
      {/* Dark header */}
      <div className="bg-navy px-4 py-3">
        <h2 className="text-base font-semibold text-white">Your Follow-Up Reality Check.</h2>
      </div>

      {/* Questions */}
      <div className="space-y-4 p-4 bg-slate-50">
        <p className="text-xs text-black">
          5 questions. 30 seconds. One thing you&apos;ll probably wish you&apos;d seen sooner.
        </p>

        <Slider
          label="Monthly Patient Inquiries"
          min={25}
          max={400}
          step={5}
          value={inputs.monthlyInquiries}
          onChange={(v) => updateInput('monthlyInquiries', v)}
          formatValue={(v) => v.toString()}
        />

        <ChipSelect
          label="How fast do you typically respond to new patient inquiries?"
          options={RESPONSE_TIME_OPTIONS}
          value={inputs.responseTime}
          onChange={(v) => updateInput('responseTime', v)}
        />

        <ChipSelect
          label="How many follow-up touches do you make before giving up?"
          options={FOLLOW_UP_OPTIONS}
          value={inputs.followUpDepth}
          onChange={(v) => updateInput('followUpDepth', v)}
        />

        <ChipSelect
          label="What's your average patient lifetime value?"
          options={PATIENT_VALUE_OPTIONS}
          value={inputs.patientValue}
          onChange={(v) => updateInput('patientValue', v)}
        />

        <ChipSelect
          label="Do you respond to inquiries after hours (evenings/weekends)?"
          options={AFTER_HOURS_OPTIONS}
          value={inputs.afterHours}
          onChange={(v) => updateInput('afterHours', v)}
        />
      </div>
    </div>
  );
}
