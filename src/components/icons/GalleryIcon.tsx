import React from 'react';
import { IconProps } from '../../types';

const GalleryIcon: React.FC<IconProps> = ({ size = 24, color = 'currentColor', className = '' }) => {
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
      <path d="m21 16-4-4-4 4" />
      <path d="M21 21H3a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h18a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2Z" />
      <circle cx="9" cy="9" r="2" />
    </svg>
  );
};

export default GalleryIcon;
