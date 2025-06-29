
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface PrayerTimes {
  fajr: string;
  dhuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
}

interface PrayerTimesContextType {
  prayerTimes: PrayerTimes;
  loading: boolean;
  error: string | null;
  fetchPrayerTimes: (location: string) => void;
}

const PrayerTimesContext = createContext<PrayerTimesContextType | undefined>(undefined);

export const PrayerTimesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [prayerTimes, setPrayerTimes] = useState<PrayerTimes>({
    fajr: '05:30',
    dhuhr: '12:30',
    asr: '15:45',
    maghrib: '18:15',
    isha: '19:30'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPrayerTimes = (location: string) => {
    setLoading(true);
    setError(null);
    // Simple placeholder implementation
    setTimeout(() => {
      setPrayerTimes({
        fajr: '05:30',
        dhuhr: '12:30',
        asr: '15:45',
        maghrib: '18:15',
        isha: '19:30'
      });
      setLoading(false);
    }, 500);
  };

  return (
    <PrayerTimesContext.Provider value={{ prayerTimes, loading, error, fetchPrayerTimes }}>
      {children}
    </PrayerTimesContext.Provider>
  );
};

export const usePrayerTimes = () => {
  const context = useContext(PrayerTimesContext);
  if (context === undefined) {
    throw new Error('usePrayerTimes must be used within a PrayerTimesProvider');
  }
  return context;
};
