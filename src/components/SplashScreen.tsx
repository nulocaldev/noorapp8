
import React from 'react';

interface SplashScreenProps {
  isVisible: boolean;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ isVisible }) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-blue-600 to-green-600 flex items-center justify-center z-50">
      <div className="text-center text-white">
        <h1 className="text-4xl font-bold mb-4">MyNoor</h1>
        <p className="text-xl mb-8">Your daily guide to peace and reflection</p>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
      </div>
    </div>
  );
};

export default SplashScreen;
