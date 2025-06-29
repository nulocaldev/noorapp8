
import React from 'react';

interface InlineHadithExplorerProps {
  state: any;
  onStateChange: (action: string, payload: any) => void;
  userData: any;
}

const InlineHadithExplorer: React.FC<InlineHadithExplorerProps> = ({ state, onStateChange, userData }) => {
  return (
    <div className="p-4 border rounded-lg bg-yellow-50">
      <h3 className="text-lg font-semibold mb-2">Hadith Explorer</h3>
      <p className="text-gray-600">Hadith explorer feature is currently being loaded...</p>
    </div>
  );
};

export default InlineHadithExplorer;
