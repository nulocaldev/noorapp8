
import React from 'react';
import CloseIcon from '../icons/CloseIcon';

interface Language {
  code: string;
  name: string;
  nativeName: string;
}

interface LanguageSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectLanguage: (languageCode: string) => void;
  currentLanguage: string;
}

const LANGUAGES: Language[] = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية' },
  { code: 'es', name: 'Spanish', nativeName: 'Español' },
  { code: 'fr', name: 'French', nativeName: 'Français' },
  { code: 'ur', name: 'Urdu', nativeName: 'اردو' },
  { code: 'id', name: 'Indonesian', nativeName: 'Bahasa Indonesia' },
];

export const LanguageSelectionModal: React.FC<LanguageSelectionModalProps> = ({
  isOpen,
  onClose,
  onSelectLanguage,
  currentLanguage
}) => {
  if (!isOpen) return null;

  const handleLanguageSelect = (languageCode: string) => {
    onSelectLanguage(languageCode);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            Select Language
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <CloseIcon size={24} />
          </button>
        </div>

        {/* Language List */}
        <div className="p-6">
          <div className="space-y-2">
            {LANGUAGES.map((language) => (
              <button
                key={language.code}
                onClick={() => handleLanguageSelect(language.code)}
                className={`
                  w-full text-left p-3 rounded-md transition-colors
                  ${language.code === currentLanguage
                    ? 'bg-blue-100 text-blue-900 border border-blue-300'
                    : 'hover:bg-gray-100 border border-transparent'
                  }
                `}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{language.name}</div>
                    <div className="text-sm text-gray-500">{language.nativeName}</div>
                  </div>
                  {language.code === currentLanguage && (
                    <div className="text-blue-600">
                      ✓
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t bg-gray-50 rounded-b-lg">
          <p className="text-sm text-gray-600">
            Your language preference will be saved and used for AI responses.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LanguageSelectionModal;
