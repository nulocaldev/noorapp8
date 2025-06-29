
import React from 'react';

interface PrayerReminderPopupProps {
  isOpen: boolean;
  onClose: () => void;
  prayerName: string;
  prayerTime: string;
}

const PrayerReminderPopup: React.FC<PrayerReminderPopupProps> = ({
  isOpen,
  onClose,
  prayerName,
  prayerTime
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-sm mx-4 text-center">
        <h3 className="text-lg font-semibold mb-2">Prayer Reminder</h3>
        <p className="text-gray-600 mb-4">
          It's time for {prayerName} prayer at {prayerTime}
        </p>
        <button
          onClick={onClose}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default PrayerReminderPopup;
