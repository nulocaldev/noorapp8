
import React from 'react';

interface HadithProgressWidgetProps {
  // Add any props that might be expected
}

const HadithProgressWidget: React.FC<HadithProgressWidgetProps> = () => {
  return (
    <div className="p-4 bg-purple-50 rounded-lg shadow-sm">
      <h3 className="text-sm font-semibold mb-2">Hadith Progress</h3>
      <div className="text-xs text-gray-600">
        <div>Progress: Loading...</div>
      </div>
    </div>
  );
};

export default HadithProgressWidget;
