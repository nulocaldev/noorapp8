import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, MessageSender, ManagedUrlConfig, CardBackground, UserData, InteractiveActivitySuggestion, InlineQuizState, SponsorLink, InlineFlipBookState, InlineHadithExplorerState, UnlockedAchievementCard, InlineWordSearchState, InlineKhitmahReaderState, AyahWithTranslation } from '../types';
import { Theme } from '../App';
import html2canvas from 'html2canvas';
import QRCode from 'qrcode';
import CopyIcon from './icons/CopyIcon';
import DownloadIcon from './icons/DownloadIcon';
import SparklesIcon from './icons/SparklesIcon';
import LoadingSpinner from './LoadingSpinner';
import MarkdownRenderer from './MarkdownRenderer'; 
import InlineKhitmahReader from './inline/KhitmahReader';
import InlineQuiz from './inline/InlineQuiz';
import InlineWordSearch from './inline/InlineWordSearch';
import FlipBookReader from './inline/FlipBookReader';
import TrophyIcon from './icons/TrophyIcon';
import InlineHadithExplorer from './inline/InlineHadithExplorer';


interface ChatMessageItemProps {
  message: ChatMessage;
  isEligibleForSuggestions: boolean;
  onSuggestionClick: (suggestion: string) => void;
  onStartActivity: (messageId: string | null, activity: InteractiveActivitySuggestion) => void;
  onInlineQuizInteraction: (messageId: string, action: 'next' | 'prev' | 'select_option' | 'submit', payload?: { optionIndex?: number }) => void;
  onKhitmahInteraction: (messageId: string, action: 'turn_page' | 'bookmark_verse', payload: { newPageNumber?: number; ayah?: AyahWithTranslation }) => void;
  onHadithInteraction: (messageId: string, action: 'turn_page' | 'bookmark_page', payload: { newPageIndex?: number, pageIndex?: number }) => void;
  onFlipBookInteraction: (messageId: string, action: 'turn_page', payload: { newPageIndex: number }) => void;
  onInlineWordSearchInteraction: (messageId: string, action: 'found_word', payload: { word: string }) => void;
  onSponsorLinkClick: (sponsorId: string, link: SponsorLink) => void;
  isLoadingAIResponse: boolean;
  theme: Theme;
}

const ChatMessageItem: React.FC<ChatMessageItemProps> = ({
  message,
  isEligibleForSuggestions,
  onSuggestionClick,
  onStartActivity,
  onInlineQuizInteraction,
  onKhitmahInteraction,
  onHadithInteraction,
  onFlipBookInteraction,
  onInlineWordSearchInteraction,
  onSponsorLinkClick,
  isLoadingAIResponse,
  theme
}) => {
  const isUser = message.sender === MessageSender.USER;
  const isAI = message.sender === MessageSender.AI;
  const isSystem = message.sender === MessageSender.SYSTEM;

  const [mainCopyStatus, setMainCopyStatus] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);

  const aiMessageBubbleRef = useRef<HTMLDivElement>(null);

  const formatDate = (date: Date): string => date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const handleCopyMainMessageText = async () => {
    const textToCopy = message.text || '';
    if (!textToCopy) return;
    try {
      await navigator.clipboard.writeText(textToCopy);
      setMainCopyStatus('Copied!');
      setTimeout(() => setMainCopyStatus(null), 2000);
    } catch (err) {
      setMainCopyStatus('Copy Failed');
    }
  };

  const triggerDownload = (canvas: HTMLCanvasElement, filename: string) => {
    const image = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = image;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const handleDownloadBubbleAsPng = async () => {
    const node = aiMessageBubbleRef.current;
    if (!node) return;
    setIsCapturing(true);

    setTimeout(async () => {
        try {
            const canvas = await html2canvas(node, {
                useCORS: true,
                allowTaint: true,
                backgroundColor: null,
                scale: 2,
            });
            triggerDownload(canvas, `Noor_Response_${Date.now()}.png`);
        } catch (error) {
            console.error("Error generating bubble image:", error);
        } finally {
            setIsCapturing(false);
        }
    }, 100);
  };
  
  const renderInlineContent = () => {
    if (message.inlineKhitmahReaderState) {
        return (
            <InlineKhitmahReader
                state={message.inlineKhitmahReaderState}
                onInteraction={(action, payload) => onKhitmahInteraction(message.id, action, payload)}
                theme={theme}
            />
        );
    }
    if (message.inlineHadithExplorerState) {
        return (
            <InlineHadithExplorer
                state={message.inlineHadithExplorerState}
                onInteraction={(action, payload) => onHadithInteraction(message.id, action, payload as any)}
                theme={theme}
            />
        );
    }
    if (message.inlineFlipBookState) {
        return (
            <FlipBookReader
                state={message.inlineFlipBookState}
                onInteraction={(action, payload) => onFlipBookInteraction(message.id, action, payload)}
                theme={theme}
            />
        );
    }
    if (message.inlineQuizState && message.inlineQuizState.status !== 'idle') {
        return (
            <InlineQuiz
                state={message.inlineQuizState}
                onInteraction={(action, payload) => onInlineQuizInteraction(message.id, action, payload)}
                theme={theme}
            />
        );
    }
    if (message.inlineWordSearchState) {
        return (
            <InlineWordSearch
                state={message.inlineWordSearchState}
                onInteraction={(action, payload) => onInlineWordSearchInteraction(message.id, action, payload)}
                theme={theme}
            />
        );
    }
    return null;
  }

  if (isSystem && message.unlockedAchievementCard) {
    const card = message.unlockedAchievementCard;
    return (
        <div className="flex justify-center my-4 animate-fadeIn">
            <div className="p-4 rounded-xl shadow-lg glass-secondary w-full max-w-sm text-center border-2 border-yellow-400/50 dark:border-yellow-500/50 bg-gradient-to-br from-yellow-50/50 to-orange-100/50 dark:from-slate-700/50 dark:to-slate-800/50">
                <TrophyIcon className="w-10 h-10 text-yellow-500 dark:text-yellow-400 mx-auto mb-2" />
                <p className="text-sm font-semibold text-theme-secondary">Achievement Unlocked!</p>
                <h3 className="text-lg font-bold text-theme-primary">{card.activityTitle}</h3>
                <p className="text-2xl font-bold text-theme-primary my-2">{card.score}/{card.maxScore}</p>
                <p className="text-sm font-semibold text-purple-600 dark:text-purple-300">
                    +{card.pointsEarned} Hikmah Points
                </p>
                {card.timeTakenSeconds !== undefined && (
                    <p className="text-xs text-theme-secondary mt-1">
                        Completed in: {Math.floor(card.timeTakenSeconds / 60).toString().padStart(2, '0')}:{(card.timeTakenSeconds % 60).toString().padStart(2, '0')}
                    </p>
                )}
            </div>
        </div>
    );
  }
  
  const showActivitySuggestionButton = isAI && isEligibleForSuggestions && !isLoadingAIResponse && message.activitySuggestion;

  return (
    <div className={`flex flex-col mb-4 ${isUser ? 'items-end' : 'items-start'}`}>
      <div
        ref={isAI ? aiMessageBubbleRef : null}
        className={`max-w-xl lg:max-w-2xl px-4 py-2.5 rounded-xl shadow-lg relative 
          ${isUser
            ? 'bg-gray-200/60 text-gray-800 rounded-bl-xl dark:bg-slate-600/60 dark:text-slate-100 glass-secondary' 
            : 'ai-bubble-theme text-theme-primary rounded-br-xl glass-secondary' 
          }
        `}
        style={isAI ? { backgroundColor: 'var(--accent-primary)', color: 'var(--button-text-primary)' } : {}} 
      >
        <div className={`ai-message-bubble-content-wrapper ${isAI ? "pb-2 prose-on-accent-bg" : ""}`}>
            {message.text.trim() && (isAI ? <MarkdownRenderer content={message.text} theme={theme} /> : <p className="text-sm leading-relaxed" style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word', color: isUser ? 'var(--text-primary)' : 'inherit' }}>{message.text}</p>)}
        </div>

        {/* Inline Activity Area */}
        {isAI && (message.inlineKhitmahReaderState || message.inlineHadithExplorerState || message.inlineFlipBookState || message.inlineQuizState || message.inlineWordSearchState) && (
            <div className="mt-2 rounded-md bg-white/10 dark:bg-black/20 text-inherit">
                {renderInlineContent()}
            </div>
        )}

        <div className={`flex items-center justify-end space-x-1 mt-1.5 absolute bottom-1 right-1.5 z-10 ${isCapturing ? 'invisible' : ''}`}>
          {isAI && !isLoadingAIResponse && message.text.trim() && (
            <>
              {mainCopyStatus && <span className={`text-xs ${isAI ? 'text-gray-100/80' : 'text-theme-secondary'}`}>{mainCopyStatus}</span>}
              <button onClick={handleDownloadBubbleAsPng} title="Download as Image" className={`p-1.5 rounded-full ${isUser ? 'text-theme-secondary hover:bg-gray-300/50' : 'text-gray-100 hover:bg-white/20'}`}>
                <DownloadIcon className="w-3.5 h-3.5" />
              </button>
              <button onClick={handleCopyMainMessageText} title="Copy message" className={`p-1.5 rounded-full ${isUser ? 'text-theme-secondary hover:bg-gray-300/50' : 'text-gray-100 hover:bg-white/20'}`}>
                <CopyIcon className="w-3.5 h-3.5" />
              </button>
            </>
          )}
        </div>
        
        <p className={`text-xs mt-1 ${isUser ? 'text-theme-secondary' : 'text-gray-100/80 dark:text-gray-300/80'} text-right ${isAI && !isLoadingAIResponse && message.text.trim() ? 'pr-16' : ''}`}>
          {formatDate(message.timestamp)}
        </p>

        {(isEligibleForSuggestions && (message.suggestions || message.activitySuggestion)) && (
          <div className={`mt-2 pt-2 ${isUser ? 'border-t border-gray-300/20' : 'border-t border-white/20'} flex flex-wrap gap-2`}>
            {showActivitySuggestionButton && message.activitySuggestion && (
              <button 
                onClick={() => onStartActivity!(message.id, message.activitySuggestion!)} 
                className={`px-3 py-1.5 text-xs rounded-full shadow-md flex items-center space-x-1.5 text-white hover:brightness-110`}
                style={{ background: 'linear-gradient(to right, var(--accent-primary-hover), var(--accent-primary))', filter: 'saturate(1.2)'}}
              >
                <SparklesIcon className="w-3.5 h-3.5" />
                <span>{message.activitySuggestion.displayText}</span>
              </button>
            )}
            {message.suggestions?.map((suggestion, index) => (
              <button key={index} onClick={() => onSuggestionClick(suggestion)} className={`px-3 py-1 text-xs rounded-full shadow-sm glass-secondary hover:brightness-110 bg-white/20 text-white`}>
                {suggestion}
              </button>
            ))}
          </div>
        )}
      </div>

      {isAI && message.sponsorAttribution && (
        <div className="mt-1.5 ml-2 text-xs text-theme-secondary animate-fadeIn">
          JazakumAllah Kheir{' '}
          <a
            href={message.sponsorAttribution.link.linkUrl || '#'}
            onClick={(e) => {
              if (message.sponsorAttribution?.link.linkUrl) {
                  e.preventDefault();
                  onSponsorLinkClick(message.sponsorAttribution.sponsorId, message.sponsorAttribution.link);
              }
            }}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-blue-600 dark:text-blue-400 hover:underline"
          >
            {message.sponsorAttribution.sponsorName}
          </a>
          {' '} - our {message.sponsorAttribution.tier} sponsor - for supporting our efforts at myNoor app.
        </div>
      )}
    </div>
  );
};

export default ChatMessageItem;
