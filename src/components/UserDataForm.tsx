
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { UserData } from '../types.ts';
import LoadingSpinner from './LoadingSpinner.tsx';
import { LANGUAGES } from '../constants.ts';
import ChevronDoubleRightIcon from './icons/ChevronDoubleRightIcon.tsx';

interface UserDataFormProps {
  onSubmit: (data: { age: string; location: string; preferredLanguageCode: string; hikmahPoints: number }) => void;
  isInitializing: boolean;
  formLogo: string;
}

const LOCATION_NOT_PROVIDED = "Location Not Provided";

const UserDataForm: React.FC<UserDataFormProps> = ({ onSubmit, isInitializing, formLogo }) => {
  const [age, setAge] = useState<string>('');
  const [location, setLocation] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isFetchingLocation, setIsFetchingLocation] = useState<boolean>(false);
  const [locationSkipped, setLocationSkipped] = useState<boolean>(false);
  const [locationDetectionAttempted, setLocationDetectionAttempted] = useState<boolean>(false);
  const [currentUserCount, setCurrentUserCount] = useState<number>(0);

  const getInitialLanguageCode = (): string => {
    const browserLang = navigator.language.split('-')[0];
    const foundLang = LANGUAGES.find(lang => lang.code === browserLang);
    return foundLang ? foundLang.code : 'en';
  };
  const [preferredLanguageCode, setPreferredLanguageCode] = useState<string>(getInitialLanguageCode());

  // --- Start of Swipe Button Logic ---
  const sliderContainerRef = useRef<HTMLDivElement>(null);
  const [sliderPosition, setSliderPosition] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const canSubmit = !isInitializing && (!isFetchingLocation || locationSkipped);

  const submitForm = useCallback(() => {
    if (!age.trim() || !preferredLanguageCode) {
      setError('Please fill in your age and select a language.');
      return false;
    }
    
    if (locationDetectionAttempted && !locationSkipped && !location.trim() && isFetchingLocation) {
        setError('Location detection is in progress. Please wait or skip location.');
        return false;
    }
    if (locationDetectionAttempted && !locationSkipped && !location.trim() && !isFetchingLocation) {
        setError('Location could not be detected. Please skip location or enable location services and refresh.');
        return false;
    }

    setError('');
    onSubmit({
      age,
      location: locationSkipped || !location.trim() ? LOCATION_NOT_PROVIDED : location,
      preferredLanguageCode,
      hikmahPoints: 0,
    });
    return true;
  }, [age, location, preferredLanguageCode, locationSkipped, isFetchingLocation, locationDetectionAttempted, onSubmit]);

  const handleSwipeStart = (e: React.MouseEvent | React.TouchEvent) => {
    if (!canSubmit) return;
    setIsDragging(true);
  };

  const handleSwipeMove = useCallback((clientX: number) => {
    if (!isDragging || !sliderContainerRef.current) return;

    const containerRect = sliderContainerRef.current.getBoundingClientRect();
    const handleWidth = 48; // from w-12
    
    let newX = clientX - containerRect.left - (handleWidth / 2);

    const maxX = containerRect.width - handleWidth - 8; // -8 for padding
    if (newX < 0) newX = 0;
    if (newX > maxX) newX = maxX;

    setSliderPosition(newX);

    if (newX >= maxX - 1) { // -1 for precision
        setIsDragging(false); 
        const success = submitForm();
        if (!success) {
            setSliderPosition(0); // Snap back on validation failure
        }
    }
  }, [isDragging, submitForm]);

  const handleSwipeEnd = useCallback(() => {
    if (!isDragging) return;
    setIsDragging(false);

    if (sliderContainerRef.current) {
      const handleWidth = 48;
      const maxX = sliderContainerRef.current.getBoundingClientRect().width - handleWidth - 8;
      if (sliderPosition < maxX - 1) {
        setSliderPosition(0); // Snap back if not completed
      }
    }
  }, [isDragging, sliderPosition]);
  
  useEffect(() => {
    const onMove = (e: MouseEvent | TouchEvent) => {
      if ('touches' in e && e.cancelable) {
        e.preventDefault();
      }
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      handleSwipeMove(clientX);
    };

    if (isDragging) {
      window.addEventListener('mousemove', onMove);
      window.addEventListener('touchmove', onMove, { passive: false });
      window.addEventListener('mouseup', handleSwipeEnd);
      window.addEventListener('touchend', handleSwipeEnd);
    }

    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('mouseup', handleSwipeEnd);
      window.removeEventListener('touchend', handleSwipeEnd);
    };
  }, [isDragging, handleSwipeMove, handleSwipeEnd]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitForm();
  };
  // --- End of Swipe Button Logic ---

  useEffect(() => {
    if (!locationSkipped && navigator.geolocation) {
      setIsFetchingLocation(true);
      setLocationDetectionAttempted(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
          const approxLocation = `Approx. Lat: ${lat.toFixed(3)}, Lon: ${lon.toFixed(3)}`;
          setLocation(approxLocation);
          setError(''); 
          setIsFetchingLocation(false);
        },
        (geoError) => {
          let statusMessage = 'Could not automatically detect location. ';
          switch (geoError.code) {
            case geoError.PERMISSION_DENIED:
              statusMessage += 'Permission denied by browser.';
              break;
            case geoError.POSITION_UNAVAILABLE:
              statusMessage += 'Location information is unavailable.';
              break;
            case geoError.TIMEOUT:
              statusMessage += 'Request timed out.';
              break;
            default:
              statusMessage += 'An unknown error occurred.';
              break;
          }
          setError(statusMessage + ' You can skip providing location or enable location services and refresh.');
          setLocation(''); 
          setIsFetchingLocation(false);
        },
        { timeout: 10000 }
      );
    } else if (locationSkipped) {
      setIsFetchingLocation(false);
      setLocation('');
      setError(''); 
    } else if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser. You can skip providing location.');
      setIsFetchingLocation(false);
      setLocationDetectionAttempted(true);
    }
  }, [locationSkipped]);

  useEffect(() => {
    const initialCount = Math.floor(Math.random() * (350 - 75 + 1)) + 75;
    setCurrentUserCount(initialCount);

    const updateCount = () => {
      setCurrentUserCount(prevCount => {
        const change = Math.floor(Math.random() * 5) - 2;
        let newCount = prevCount + change;
        if (newCount < 50) newCount = 50 + Math.floor(Math.random() * 5);
        return newCount;
      });
    };

    let intervalId: number;
    const setRandomInterval = () => {
      const randomDelay = Math.random() * (5500 - 2500) + 2500;
      intervalId = window.setInterval(() => {
        updateCount();
        clearInterval(intervalId);
        setRandomInterval();
      }, randomDelay);
    };
    setRandomInterval();
    return () => clearInterval(intervalId);
  }, []);

  const textOpacity = Math.max(0, 1 - (sliderPosition / 70));

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-md p-8 rounded-xl shadow-2xl space-y-6 glass-primary">
        <div className="text-center mb-6">
          <img src={formLogo} alt="myNoor Logo" className="w-60 mx-auto" />
          <p className="mt-4 text-theme-secondary">Your AI companion, rooted in Islamic values. Begin your journey of guidance. 🙏</p>
        </div>

        {currentUserCount > 0 && (
          <div className="text-center p-2.5 my-4 bg-blue-500/10 dark:bg-blue-400/20 rounded-lg border border-blue-500/20 dark:border-blue-400/30">
            <div className="flex items-center justify-center text-sm text-blue-700 dark:text-blue-300">
              <span className="relative flex h-2.5 w-2.5 mr-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
              </span>
              <span className="font-semibold mr-1">{currentUserCount}</span> community users online
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="age" className="block text-sm font-medium text-theme-secondary">
              Your Age
            </label>
            <input
              type="text"
              id="age"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              className="mt-1 block w-full px-4 py-3 border border-gray-300/70 dark:border-slate-600/80 rounded-md shadow-sm sm:text-sm focus:ring-blue-500 focus:border-blue-500 bg-white/70 dark:bg-slate-700/70 text-theme-primary placeholder-gray-500 dark:placeholder-slate-400"
              placeholder="e.g., 25"
              disabled={isInitializing}
              required
            />
          </div>
          <div>
            <label htmlFor="language" className="block text-sm font-medium text-theme-secondary">
              Preferred Language
            </label>
            <select
              id="language"
              value={preferredLanguageCode}
              onChange={(e) => setPreferredLanguageCode(e.target.value)}
              className="mt-1 block w-full px-4 py-3 border border-gray-300/70 dark:border-slate-600/80 rounded-md shadow-sm sm:text-sm bg-white/70 dark:bg-slate-700/70 text-theme-primary focus:ring-blue-500 focus:border-blue-500"
              disabled={isInitializing}
              required
            >
              {LANGUAGES.map(lang => (
                <option key={lang.code} value={lang.code} className="text-gray-800 bg-white dark:text-slate-200 dark:bg-slate-700">{lang.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label htmlFor="location" className="block text-sm font-medium text-theme-secondary">
              Location (Optional)
            </label>
            {isFetchingLocation && !locationSkipped && (
              <div className="mt-1 flex items-center text-xs text-theme-secondary">
                <LoadingSpinner />
                <span className="ml-2">Detecting location...</span>
              </div>
            )}
            {!isFetchingLocation && location.trim() && !locationSkipped && (
              <p className="text-xs text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-700/30 p-2 rounded-md">Location detected: {location}</p>
            )}
             {!isFetchingLocation && !location.trim() && locationDetectionAttempted && !locationSkipped && (
                <p className="text-xs text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-700/30 p-2 rounded-md">Could not detect location. You can skip or try again by refreshing.</p>
            )}
             <div className="flex items-center">
              <input
                id="skip-location"
                type="checkbox"
                checked={locationSkipped}
                onChange={(e) => {
                  setLocationSkipped(e.target.checked);
                  if (e.target.checked) {
                    setLocation(''); 
                    setError(''); 
                  } else {
                    setLocationDetectionAttempted(false); 
                  }
                }}
                className="h-4 w-4 text-blue-600 border-gray-300 dark:border-slate-500 rounded focus:ring-blue-500"
              />
              <label htmlFor="skip-location" className="ml-2 block text-sm text-theme-secondary">
                Proceed without location for now
              </label>
            </div>
          </div>
          
          <input type="hidden" value={locationSkipped || !location.trim() ? LOCATION_NOT_PROVIDED : location} />


          {error && <p className="text-sm text-red-700 dark:text-red-300 bg-red-100 dark:bg-red-700/30 p-2 rounded-md">{error}</p>}
          <div>
            <div
              ref={sliderContainerRef}
              className={`relative w-full h-14 rounded-full p-1 overflow-hidden transition-opacity duration-300 ${!canSubmit ? 'opacity-50 cursor-not-allowed' : 'cursor-grab'}`}
            >
                <div className="absolute inset-0 bg-gray-200/50 dark:bg-slate-700/50 rounded-full"></div>
                <div
                    className="absolute top-1 left-1 w-12 h-12 rounded-full shadow-lg flex items-center justify-center z-10 transition-transform duration-75 ease-linear"
                    style={{ 
                        transform: `translateX(${sliderPosition}px)`, 
                        backgroundColor: 'var(--accent-primary)',
                        cursor: isDragging ? 'grabbing' : 'grab'
                    }}
                    onMouseDown={handleSwipeStart}
                    onTouchStart={handleSwipeStart}
                >
                    <ChevronDoubleRightIcon className="w-6 h-6 text-white animate-pulse-right" />
                </div>
                <span
                    className="absolute inset-0 flex items-center justify-center text-sm font-medium text-theme-secondary select-none transition-opacity"
                    style={{ opacity: textOpacity }}
                >
                    <span className="shimmer-text relative overflow-hidden">
                        {isInitializing ? 'Initializing...' : 'Swipe to Start Chatting'}
                    </span>
                </span>
            </div>
          </div>
        </form>
        <p className="text-xs text-theme-secondary text-center">Your information helps tailor guidance and is handled with care. Location is optional but enhances personalization and certain features.</p>
      </div>
    </div>
  );
};

export default UserDataForm;
