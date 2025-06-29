import React from 'react';
import { IconProps } from '../../types';

const PortraitTallIcon: React.FC<IconProps> = ({ size = 24, color = 'currentColor', className = '' }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect width="14" height="20" x="5" y="2" rx="2" />
      <circle cx="12" cy="8" r="2" />
      <path d="M15 14c-.5-1-1.5-2-3-2s-2.5 1-3 2" />
    </svg>
  );
};

export default PortraitTallIcon;
