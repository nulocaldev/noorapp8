
import React, { useState, useEffect } from 'react';
import { SponsorApplication, SponsorLink } from '../types.ts';
import LoadingSpinner from './LoadingSpinner.tsx';
import { SPONSOR_BUSINESS_CATEGORIES } from '../constants.ts';

interface SponsorApplicationFormProps {
  onSubmit: (applicationData: Omit<SponsorApplication, 'id' | 'status'>) => void;
  onCancel: () => void;
}

const SponsorApplicationForm: React.FC<SponsorApplicationFormProps> = ({ onSubmit, onCancel }) => {
  const [companyName, setCompanyName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [linkType, setLinkType] = useState<SponsorLink['linkType'] | ''>('');
  const [linkUrl, setLinkUrl] = useState('');
  const [businessType, setBusinessType] = useState<'local' | 'online'>('local'); 
  const [businessCategory, setBusinessCategory] = useState<string>(SPONSOR_BUSINESS_CATEGORIES[0]);

  const [detectedLat, setDetectedLat] = useState<number | undefined>(undefined);
  const [detectedLon, setDetectedLon] = useState<number | undefined>(undefined);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [locationDetectionStatus, setLocationDetectionStatus] = useState(''); 

  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (navigator.geolocation) {
      setIsDetectingLocation(true);
      setLocationDetectionStatus('Attempting to detect your location for the application...');
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setDetectedLat(parseFloat(position.coords.latitude.toFixed(5)));
          setDetectedLon(parseFloat(position.coords.longitude.toFixed(5)));
          setLocationDetectionStatus(`Location detected (Lat: ${position.coords.latitude.toFixed(3)}, Lon: ${position.coords.longitude.toFixed(3)}). This will be submitted with your application.`);
          setIsDetectingLocation(false);
        },
        (geoError) => {
          setLocationDetectionStatus(`Could not auto-detect location (${geoError.message}). Your application can still be submitted.`);
          setIsDetectingLocation(false);
        },
        { timeout: 10000 }
      );
    } else {
      setLocationDetectionStatus('Geolocation is not supported by your browser.');
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName || !contactEmail || !businessCategory) {
      setError('Please fill in Company Name, Contact Email, and Business Category.');
      return;
    }
    setError('');
    setSuccessMessage('');

    onSubmit({
      companyName,
      contactEmail,
      linkType: linkType || undefined,
      linkUrl: linkUrl || undefined,
      businessType,
      businessCategory,
      detectedLat,
      detectedLon,
      radiusKm: 5, // default value
      isGlobal: businessType === 'online',
    });
    setSuccessMessage('Your application has been submitted successfully! We will get back to you soon.');
  };
  
  const inputBaseClasses = "mt-1 w-full p-2 border border-gray-300/70 dark:border-slate-600/80 rounded-md shadow-sm sm:text-sm focus:ring-blue-500 focus:border-blue-500 bg-white/70 dark:bg-slate-700/70 text-theme-primary placeholder-gray-500 dark:placeholder-slate-400";
  const optionBaseClasses = "bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100";

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-120px)] p-4 bg-slate-50/70 dark:bg-slate-900/70">
      <div className="w-full max-w-2xl p-6 sm:p-8 rounded-xl shadow-2xl space-y-6 glass-primary">
        <div className="text-center">
          <h1 className="text-2xl sm:text-3xl font-semibold text-gradient-accent">Sponsor myNoor App</h1>
          <p className="mt-2 text-sm sm:text-base text-theme-secondary">Support our efforts and connect with a dedicated community. JazakumAllah Khair for your interest.</p>
        </div>
        
        {successMessage ? (
            <div className="text-center p-6 bg-green-500/10 dark:bg-green-400/20 rounded-lg">
                <p className="font-semibold text-green-700 dark:text-green-300">{successMessage}</p>
                <button onClick={onCancel} className="mt-4 px-6 py-2 text-sm font-medium rounded-md shadow-sm btn-accent">
                    Back to Chat
                </button>
            </div>
        ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                 <div>
                    <label htmlFor="companyName" className="block text-sm font-medium text-theme-secondary">Company Name*</label>
                    <input type="text" id="companyName" value={companyName} onChange={(e) => setCompanyName(e.target.value)} required className={inputBaseClasses} />
                 </div>
                 <div>
                    <label htmlFor="contactEmail" className="block text-sm font-medium text-theme-secondary">Contact Email*</label>
                    <input type="email" id="contactEmail" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} required className={inputBaseClasses} />
                 </div>
                 <div>
                    <label htmlFor="businessType" className="block text-sm font-medium text-theme-secondary">Business Type*</label>
                    <select id="businessType" value={businessType} onChange={(e) => setBusinessType(e.target.value as 'local' | 'online')} className={inputBaseClasses}>
                        <option value="local" className={optionBaseClasses}>Local Business</option>
                        <option value="online" className={optionBaseClasses}>Online Business</option>
                    </select>
                 </div>
                 <div>
                    <label htmlFor="businessCategory" className="block text-sm font-medium text-theme-secondary">Business Category*</label>
                    <select id="businessCategory" value={businessCategory} onChange={(e) => setBusinessCategory(e.target.value)} required className={inputBaseClasses}>
                        {SPONSOR_BUSINESS_CATEGORIES.map(cat => (
                            <option key={cat} value={cat} className={optionBaseClasses}>{cat}</option>
                        ))}
                    </select>
                 </div>
                 <div>
                    <label htmlFor="linkType" className="block text-sm font-medium text-theme-secondary">Call to Action Type (Optional)</label>
                    <select id="linkType" value={linkType} onChange={(e) => setLinkType(e.target.value as SponsorLink['linkType'] | '')} className={inputBaseClasses}>
                        <option value="" className={optionBaseClasses}>None</option>
                        <option value="visit" className={optionBaseClasses}>Visit Website</option>
                        <option value="call" className={optionBaseClasses}>Call Now</option>
                        <option value="follow" className={optionBaseClasses}>Follow Us</option>
                    </select>
                 </div>
                 <div>
                    <label htmlFor="linkUrl" className="block text-sm font-medium text-theme-secondary">Call to Action URL (Optional)</label>
                    <input type="url" id="linkUrl" value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} className={inputBaseClasses} placeholder="https://example.com" />
                 </div>
              </div>
              <div className="text-xs text-theme-secondary p-3 rounded-md bg-gray-500/10 border border-gray-500/20">
                {isDetectingLocation ? <LoadingSpinner /> : <p>{locationDetectionStatus}</p>}
              </div>

              {error && <p className="text-sm text-red-700 dark:text-red-300 bg-red-100 dark:bg-red-700/30 p-3 rounded-md text-center">{error}</p>}

              <div className="flex flex-col sm:flex-row-reverse gap-3 pt-2">
                <button type="submit" className="w-full sm:w-auto flex-grow justify-center py-3 px-6 border border-transparent rounded-md shadow-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 btn-accent">
                    Submit Application
                </button>
                <button type="button" onClick={onCancel} className="w-full sm:w-auto justify-center py-3 px-6 border border-gray-300/50 dark:border-slate-600/50 rounded-md shadow-sm text-sm font-medium text-theme-primary bg-white/80 dark:bg-slate-700/80 hover:bg-gray-100/80 dark:hover:bg-slate-600/80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                    Cancel
                </button>
              </div>
            </form>
        )}
      </div>
    </div>
  );
};

export default SponsorApplicationForm;
