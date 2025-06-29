
import React, { useState } from 'react';
import { ManagedUrlConfig } from '../types.ts';
import { MEMORABLE_URL_BASE_DISPLAY } from '../constants.ts';

interface ShareScreenProps {
  onDismiss: () => void;
  managedUrlConfig: ManagedUrlConfig | null;
}

const ShareScreen: React.FC<ShareScreenProps> = ({ onDismiss, managedUrlConfig }) => {
  const [copyButtonText, setCopyButtonText] = useState('Copy Link');
  
  let displayUrl = window.location.origin + window.location.pathname;
  let copyableUrl = window.location.origin + window.location.pathname;

  if (managedUrlConfig) {
    if (managedUrlConfig.slug && managedUrlConfig.slug.trim() !== '') {
      displayUrl = `https://${MEMORABLE_URL_BASE_DISPLAY}/${managedUrlConfig.slug.trim()}`;
    } else {
      displayUrl = managedUrlConfig.targetUrl || displayUrl;
    }
    copyableUrl = managedUrlConfig.targetUrl || copyableUrl;
  }


  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(copyableUrl);
      setCopyButtonText('Copied!');
      setTimeout(() => setCopyButtonText('Copy Link'), 2000);
    } catch (err) {
      console.error('Failed to copy URL: ', err);
      setCopyButtonText('Copy Failed');
      setTimeout(() => setCopyButtonText('Copy Link'), 2000);
    }
  };

  return (
    <div className="w-full max-w-lg p-8 rounded-xl shadow-2xl space-y-6 glass-primary">
      <div className="text-center">
        <svg className="w-16 h-16 text-gray-500 dark:text-slate-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
        </svg>
        <h1 className="text-3xl font-bold text-gray-800 dark:text-slate-100">Help Noor App Grow!</h1>
        <p className="mt-3 text-gray-600 dark:text-slate-300">
          If you find Noor App helpful, please share it with your friends and family.
          Your support helps us reach and assist more people on their journey. JazakAllah Khair!
        </p>
      </div>

      <div className="space-y-4">
        <p className="text-sm text-gray-500 dark:text-slate-400">Share this link (displays as memorable URL, copies target URL):</p>
        <input
          type="text"
          readOnly
          value={displayUrl}
          className="w-full p-3 border border-gray-300/50 dark:border-slate-600/50 rounded-md text-center text-gray-700 dark:text-slate-200 bg-gray-50/70 dark:bg-slate-700/70 focus:outline-none focus:ring-1 focus:ring-blue-500"
          aria-label="Application memorable URL"
        />
        <button
          onClick={handleCopyLink}
          className="w-full py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-500 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500
                     dark:bg-slate-600 dark:hover:bg-slate-500"
        >
          {copyButtonText} (Copies: {copyableUrl.length > 30 ? copyableUrl.substring(0,27) + '...' : copyableUrl})
        </button>
      </div>

      <div>
        <button
          onClick={onDismiss}
          className="w-full py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
                     dark:bg-blue-700 dark:hover:bg-blue-800"
        >
          Continue Chatting
        </button>
      </div>
       <p className="text-xs text-gray-500 dark:text-slate-400 pt-2 text-center">
          Thank you for considering sharing! You can now continue your conversation.
        </p>
    </div>
  );
};

export default ShareScreen;
