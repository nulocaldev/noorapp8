
import React, { useEffect, useState } from 'react';

interface SplashScreenProps {
  onComplete: () => void;
  duration?: number;
  logo?: string;
  appName?: string;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({
  onComplete,
  duration = 3000,
  logo,
  appName = 'MyNoor'
}) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onComplete, 300); // Allow fade out animation
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onComplete]);

  return (
    <div
      className={`
        fixed inset-0 bg-gradient-to-br from-blue-600 to-purple-700 flex items-center justify-center z-50
        transition-opacity duration-300
        ${isVisible ? 'opacity-100' : 'opacity-0'}
      `}
    >
      <div className="text-center">
        {/* Logo */}
        {logo ? (
          <img
            src={logo}
            alt={appName}
            className="w-24 h-24 mx-auto mb-6 animate-pulse"
          />
        ) : (
          <div className="w-24 h-24 mx-auto mb-6 bg-white rounded-full flex items-center justify-center animate-pulse">
            <span className="text-3xl font-bold text-blue-600">🌙</span>
          </div>
        )}

        {/* App Name */}
        <h1 className="text-4xl font-bold text-white mb-2 animate-fade-in">
          {appName}
        </h1>
        
        {/* Tagline */}
        <p className="text-xl text-blue-100 mb-8 animate-fade-in-delay">
          Your Islamic AI Companion
        </p>

        {/* Loading Animation */}
        <div className="flex justify-center space-x-2">
          <div className="w-3 h-3 bg-white rounded-full animate-bounce"></div>
          <div className="w-3 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-3 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>

        {/* Version or Additional Info */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
          <p className="text-blue-200 text-sm">
            Connecting hearts to Islamic wisdom
          </p>
        </div>
      </div>

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-fade-in {
          animation: fade-in 1s ease-out;
        }
        
        .animate-fade-in-delay {
          animation: fade-in 1s ease-out 0.5s both;
        }
      `}</style>
    </div>
  );
};

export default SplashScreen;
