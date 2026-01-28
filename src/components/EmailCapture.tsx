'use client';

import { useState, useRef } from 'react';
import { CalculatorInputs, CalculationResults, DriverCode } from '@/types';

interface EmailCaptureProps {
  inputs: CalculatorInputs;
  results: CalculationResults;
  drivers: DriverCode[];
}

export default function EmailCapture({ inputs, results, drivers }: EmailCaptureProps) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const emailInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !email.includes('@')) {
      setErrorMessage('Please enter a valid email address');
      setStatus('error');
      return;
    }

    setStatus('loading');
    setErrorMessage('');

    try {
      const response = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          inputs,
          results,
          drivers,
          email,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit');
      }

      setStatus('success');
      setEmail('');
    } catch {
      setStatus('error');
      setErrorMessage('Failed to send. Please try again.');
    }
  };

  const scrollToEmail = () => {
    emailInputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    emailInputRef.current?.focus();
  };

  if (status === 'success') {
    return (
      <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 flex items-center justify-center bg-emerald rounded-full text-white text-sm">
            ✓
          </div>
          <div>
            <p className="text-sm font-semibold text-navy">Snapshot Sent!</p>
            <p className="text-xs text-black">Check your inbox for your personalized report.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* You Passed the Obvious Part section */}
      <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-center">
        <h3 className="text-sm font-semibold text-navy mb-1">
          You Passed the Obvious Part
        </h3>
        <p className="text-xs text-black mb-2">
          Almost everyone does.<br />
          The next part is where it breaks.
        </p>
        <p className="text-xs text-black mb-2">If you&apos;re curious:</p>
        <button
          onClick={scrollToEmail}
          className="text-sm font-medium text-teal hover:text-teal-600 underline underline-offset-2 transition-colors"
        >
          I want to see it
        </button>
      </div>

      {/* Email Capture Form */}
      <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
        <h3 className="text-sm font-semibold text-navy mb-1">
          What Happens After the First Reply
        </h3>
        <p className="text-xs text-black mb-3">
          Receive a personalized report with actionable recommendations.
        </p>

        <form onSubmit={handleSubmit} className="flex gap-2">
          <div className="flex-1">
            <input
              ref={emailInputRef}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal focus:border-transparent transition-all"
              disabled={status === 'loading'}
            />
            {status === 'error' && errorMessage && (
              <p className="text-xs text-rose mt-1">{errorMessage}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={status === 'loading'}
            className="py-2 px-4 bg-teal text-white text-sm font-medium rounded-lg hover:bg-teal-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
          >
            {status === 'loading' ? 'Sending...' : 'Send Snapshot'}
          </button>
        </form>

        <p className="text-[10px] text-black mt-2 text-center">
          We&apos;ll never share your email with third parties.
        </p>
      </div>
    </div>
  );
}
