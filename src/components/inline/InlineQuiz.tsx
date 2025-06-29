
import React from 'react';

interface InlineQuizProps {
  state: any;
  onStateChange: (action: string, payload: any) => void;
  userData: any;
}

const InlineQuiz: React.FC<InlineQuizProps> = ({ state, onStateChange, userData }) => {
  return (
    <div className="p-4 border rounded-lg bg-blue-50">
      <h3 className="text-lg font-semibold mb-2">Interactive Quiz</h3>
      <p className="text-gray-600">Quiz feature is currently being loaded...</p>
    </div>
  );
};

export default InlineQuiz;
