
import React from 'react';

interface PrayerTimesWidgetProps {
  // Add any props that might be expected
}

const PrayerTimesWidget: React.FC<PrayerTimesWidgetProps> = () => {
  return (
    <div className="p-4 bg-blue-50 rounded-lg shadow-sm">
      <h3 className="text-sm font-semibold mb-2">Prayer Times</h3>
      <div className="text-xs text-gray-600 space-y-1">
        <div>Fajr: 05:30</div>
        <div>Dhuhr: 12:30</div>
        <div>Asr: 15:45</div>
        <div>Maghrib: 18:15</div>
        <div>Isha: 19:30</div>
      </div>
    </div>
  );
};

export default PrayerTimesWidget;
