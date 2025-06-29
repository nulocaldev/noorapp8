
import React from 'react';

interface NavigationItem {
  id: string;
  label: string;
  icon: string;
  onClick: () => void;
  isActive?: boolean;
  badge?: number;
}

interface NavigationBarProps {
  items: NavigationItem[];
  orientation?: 'horizontal' | 'vertical';
  className?: string;
}

export const NavigationBar: React.FC<NavigationBarProps> = ({
  items,
  orientation = 'horizontal',
  className = ''
}) => {
  const baseClasses = orientation === 'horizontal' 
    ? 'flex flex-row space-x-1' 
    : 'flex flex-col space-y-1';

  return (
    <nav className={`${baseClasses} ${className}`}>
      {items.map((item) => (
        <button
          key={item.id}
          onClick={item.onClick}
          className={`
            relative flex items-center justify-center px-3 py-2 rounded-md text-sm font-medium transition-colors
            ${item.isActive 
              ? 'bg-blue-600 text-white' 
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }
          `}
        >
          <span className="mr-2">{item.icon}</span>
          <span>{item.label}</span>
          {item.badge && item.badge > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {item.badge > 99 ? '99+' : item.badge}
            </span>
          )}
        </button>
      ))}
    </nav>
  );
};

export default NavigationBar;
