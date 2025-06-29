
import React from 'react';

const PortraitTallIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <rect x="6" y="1" width="12" height="22" rx="2" ry="2" strokeWidth={2} />
  </svg>
);

export default PortraitTallIcon;
