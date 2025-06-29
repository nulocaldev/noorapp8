import React, { useState } from 'react';
import { LANGUAGES } from '../constants';
import CloseIcon from './icons/CloseIcon';

interface LanguageSelectionModalProps {
  isOpen: boolean;
  currentLanguageCode: string;
  onSelectLanguage: (languageCode: string) => void;
  onClose: () => void;
}

const LanguageSelectionModal: React.FC<LanguageSelectionModalProps> = ({
  isOpen,
  currentLanguageCode,
  onSelectLanguage,
  onClose,
}) => {
  const [selectedLanguage, setSelectedLanguage] = useState(currentLanguageCode);

  const handleConfirm = () => {
    onSelectLanguage(selectedLanguage);
  };

  if (!isOpen) return null;

  return (
    <>
    <div 
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-60 dark:bg-opacity-70 animate-fadeIn"
        aria-labelledby="language-modal-title"
        role="dialog"
        aria-modal="true"
    >
      <div className="rounded-lg shadow-xl w-full max-w-md p-6 space-y-6 transform transition-all animate-slideUp glass-primary">
        <div className="flex justify-between items-center">
          <h2 id="language-modal-title" className="text-xl font-semibold text-theme-primary">
            Change Preferred Language
          </h2>
          <button
            onClick={onClose}
            className="p-1 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100/50
                       dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-700/50"
            aria-label="Close language selection modal"
          >
            <CloseIcon className="w-5 h-5" />
          </button>
        </div>
        
        <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar pr-2">
          {LANGUAGES.map(lang => (
            <button
              key={lang.code}
              onClick={() => setSelectedLanguage(lang.code)}
              className={`w-full text-left p-3 rounded-md border text-sm transition-colors duration-150
                ${selectedLanguage === lang.code
                  ? 'bg-blue-500 text-white border-blue-600 ring-2 ring-blue-300 dark:bg-blue-600 dark:border-blue-700'
                  : 'bg-white/80 hover:bg-gray-100/80 border-gray-300/70 dark:bg-slate-600/70 dark:hover:bg-slate-500/70 dark:border-slate-500/70 text-theme-primary'
                }`}
            >
              {lang.name}
            </button>
          ))}
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-md shadow-sm dark:text-slate-200 dark:bg-slate-600 dark:hover:bg-slate-500"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="px-4 py-2 text-sm font-medium rounded-md shadow-sm btn-accent"
          >
            Confirm & Save
          </button>
        </div>
      </div>
    </div>
    </>
  );
};

export default LanguageSelectionModal;
