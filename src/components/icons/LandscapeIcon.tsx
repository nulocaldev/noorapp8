
import React from 'react';

const LandscapeIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <rect x="2" y="4" width="20" height="16" rx="2" ry="2" strokeWidth={2} />
  </svg>
);

export default LandscapeIcon;
