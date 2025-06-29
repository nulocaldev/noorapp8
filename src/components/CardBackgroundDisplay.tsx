
import React from 'react';
import { CardBackground } from '../types';

interface CardBackgroundDisplayProps {
  background: CardBackground;
  className?: string;
}

const CardBackgroundDisplay: React.FC<CardBackgroundDisplayProps> = ({ background, className = '' }) => {
  if (background.type === 'gradient') {
    return (
      <div 
        className={`${className}`}
        style={{ background: background.value }}
      />
    );
  }

  if (background.type === 'image') {
    return (
      <div 
        className={`bg-cover bg-center ${className}`}
        style={{ backgroundImage: `url(${background.value})` }}
      />
    );
  }

  // Default solid color
  return (
    <div 
      className={`${className}`}
      style={{ backgroundColor: background.value }}
    />
  );
};

export default CardBackgroundDisplay;
