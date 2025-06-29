
import React from 'react';

const PortraitIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <rect x="4" y="2" width="16" height="20" rx="2" ry="2" strokeWidth={2} />
  </svg>
);

export default PortraitIcon;
