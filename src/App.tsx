import React, { useState, useEffect } from 'react';
import './index.css';

// Basic App component for MyNoor Islamic AI Companion
function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate app initialization
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-emerald-800">Loading MyNoor...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-emerald-800 mb-4">
            🌙 MyNoor
          </h1>
          <p className="text-lg text-emerald-700 max-w-2xl mx-auto">
            Your Islamic AI Companion for spiritual guidance, prayer times, and Islamic knowledge
          </p>
        </header>

        <main className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Prayer Times Card */}
            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="text-center">
                <div className="text-3xl mb-3">🕌</div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Prayer Times</h3>
                <p className="text-gray-600">Get accurate prayer times for your location</p>
              </div>
            </div>

            {/* Quran Study Card */}
            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="text-center">
                <div className="text-3xl mb-3">📖</div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Quran Study</h3>
                <p className="text-gray-600">Read, listen, and understand the Holy Quran</p>
              </div>
            </div>

            {/* Islamic Knowledge Card */}
            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="text-center">
                <div className="text-3xl mb-3">🤲</div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Islamic Guidance</h3>
                <p className="text-gray-600">Ask questions and get Islamic guidance</p>
              </div>
            </div>

            {/* Dhikr Counter Card */}
            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="text-center">
                <div className="text-3xl mb-3">📿</div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Dhikr Counter</h3>
                <p className="text-gray-600">Keep track of your daily dhikr and remembrance</p>
              </div>
            </div>

            {/* Qibla Direction Card */}
            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="text-center">
                <div className="text-3xl mb-3">🧭</div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Qibla Direction</h3>
                <p className="text-gray-600">Find the direction to Mecca from anywhere</p>
              </div>
            </div>

            {/* Islamic Calendar Card */}
            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="text-center">
                <div className="text-3xl mb-3">📅</div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Islamic Calendar</h3>
                <p className="text-gray-600">Stay updated with Islamic dates and events</p>
              </div>
            </div>
          </div>

          {/* Welcome Message */}
          <div className="mt-12 text-center">
            <div className="bg-white rounded-lg shadow-md p-8 max-w-2xl mx-auto">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                Welcome to MyNoor
              </h2>
              <p className="text-gray-600 leading-relaxed">
                MyNoor is your comprehensive Islamic companion app, designed to help you in your spiritual journey. 
                Whether you need prayer times, want to study the Quran, seek Islamic guidance, or track your daily worship, 
                MyNoor is here to assist you with authentic Islamic knowledge and tools.
              </p>
              <div className="mt-6">
                <button className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors">
                  Get Started
                </button>
              </div>
            </div>
          </div>
        </main>

        <footer className="mt-16 text-center text-gray-600">
          <p>© 2025 MyNoor - Islamic AI Companion</p>
          <p className="mt-2 text-sm">May Allah guide us all on the straight path</p>
        </footer>
      </div>
    </div>
  );
}

export default App;