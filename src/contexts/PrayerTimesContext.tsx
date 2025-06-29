import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface PrayerTime {
  name: string;
  time: string;
}

interface PrayerTimesContextType {
  prayerTimes: PrayerTime[];
  isLoading: boolean;
  error: string | null;
  refreshPrayerTimes: () => void;
}

const PrayerTimesContext = createContext<PrayerTimesContextType | undefined>(undefined);

export const usePrayerTimes = () => {
  const context = useContext(PrayerTimesContext);
  if (context === undefined) {
    throw new Error('usePrayerTimes must be used within a PrayerTimesProvider');
  }
  return context;
};

interface PrayerTimesProviderProps {
  children: ReactNode;
}

export const PrayerTimesProvider: React.FC<PrayerTimesProviderProps> = ({ children }) => {
  const [prayerTimes, setPrayerTimes] = useState<PrayerTime[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPrayerTimes = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Mock prayer times for now
      const mockPrayerTimes: PrayerTime[] = [
        { name: 'Fajr', time: '5:30 AM' },
        { name: 'Dhuhr', time: '12:15 PM' },
        { name: 'Asr', time: '3:45 PM' },
        { name: 'Maghrib', time: '6:20 PM' },
        { name: 'Isha', time: '7:45 PM' },
      ];
      
      setPrayerTimes(mockPrayerTimes);
    } catch (err) {
      setError('Failed to fetch prayer times');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPrayerTimes();
  }, []);

  const refreshPrayerTimes = () => {
    fetchPrayerTimes();
  };

  const value = {
    prayerTimes,
    isLoading,
    error,
    refreshPrayerTimes,
  };

  return (
    <PrayerTimesContext.Provider value={value}>
      {children}
    </PrayerTimesContext.Provider>
  );
};
