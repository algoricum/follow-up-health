'use client';

import { ClipLoader } from 'react-spinners';

interface SpinnerProps {
  size?: number;
  color?: string;
  className?: string;
}

export default function Spinner({ size = 16, color = '#ffffff', className = '' }: SpinnerProps) {
  return (
    <span className={`inline-flex items-center ${className}`} aria-hidden="true">
      <ClipLoader size={size} color={color} />
    </span>
  );
}
