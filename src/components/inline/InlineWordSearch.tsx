
import React from 'react';

interface InlineWordSearchProps {
  state: any;
  onStateChange: (action: string, payload: any) => void;
  userData: any;
}

const InlineWordSearch: React.FC<InlineWordSearchProps> = ({ state, onStateChange, userData }) => {
  return (
    <div className="p-4 border rounded-lg bg-green-50">
      <h3 className="text-lg font-semibold mb-2">Word Search</h3>
      <p className="text-gray-600">Word search feature is currently being loaded...</p>
    </div>
  );
};

export default InlineWordSearch;
