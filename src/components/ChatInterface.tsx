
import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, UserData, MessageSender, InteractiveActivitySuggestion, SponsorLink, AyahWithTranslation } from '../types';
import { Theme } from '../App';
import ChatMessageItem from './ChatMessageItem';
import LoadingSpinner from './LoadingSpinner';
import SendIcon from './icons/SendIcon';

interface ChatInterfaceProps {
  messages: ChatMessage[];
  onSendMessage: (text: string) => Promise<void>;
  onStartActivity: (messageId: string | null, activity: InteractiveActivitySuggestion) => void;
  onInlineQuizInteraction: (messageId: string, action: 'next' | 'prev' | 'select_option' | 'submit', payload?: { optionIndex?: number }) => void;
  onKhitmahInteraction: (messageId: string, action: 'turn_page' | 'bookmark_verse', payload: { newPageNumber?: number; ayah?: AyahWithTranslation }) => void;
  onHadithInteraction: (messageId: string, action: 'turn_page' | 'bookmark_page', payload: { newPageIndex?: number, pageIndex?: number }) => void;
  onFlipBookInteraction: (messageId: string, action: 'turn_page', payload: { newPageIndex: number }) => void;
  onInlineWordSearchInteraction: (messageId: string, action: 'found_word', payload: { word: string }) => void;
  onSponsorLinkClick: (sponsorId: string, link: SponsorLink) => void;
  isLoadingAIResponse: boolean; 
  isRateLimited: boolean;
  userData: UserData; 
  chatSessionName?: string;
  theme: Theme;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ 
  messages, 
  onSendMessage, 
  onStartActivity,
  onInlineQuizInteraction,
  onKhitmahInteraction,
  onHadithInteraction,
  onFlipBookInteraction,
  onInlineWordSearchInteraction,
  onSponsorLinkClick,
  isLoadingAIResponse, 
  isRateLimited,
  userData, 
  chatSessionName,
  theme
}) => {
  const [inputText, setInputText] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSendMessage = async () => {
    if (inputText.trim() === '' || isLoadingAIResponse || isRateLimited) return;
    const messageToSend = inputText;
    setInputText(''); 
    await onSendMessage(messageToSend);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  const lastMessage = messages.length > 0 ? messages[messages.length - 1] : null;
  
  const showAiThinkingIndicator = isLoadingAIResponse && messages.length > 0 && 
    ((lastMessage?.sender === MessageSender.USER) || (lastMessage?.sender === MessageSender.AI && lastMessage?.text === '' && !lastMessage.inlineKhitmahReaderState && !lastMessage.inlineHadithExplorerState && !lastMessage.inlineFlipBookState));

  return (
    <div className="flex flex-col h-full">
      <header className="p-4 shadow-md z-10 glass-primary">
        <div className="container mx-auto flex justify-between items-center">
            <div>
                <h1 className="text-xl font-semibold truncate pr-2 text-theme-primary" title={chatSessionName || 'Noor App'}>{chatSessionName || 'Noor App'}</h1>
                <p className="text-xs text-theme-secondary">Age: {userData.age} (Language: {userData.preferredLanguageName})</p> 
            </div>
        </div>
      </header>

      <div className="flex-grow overflow-y-auto p-6 space-y-4 custom-scrollbar bg-transparent">
        {messages.map((msg, index) => {
          let isEligibleForSuggestions = false;
          if (msg.sender === MessageSender.AI) {
            let subsequentUserOrActiveAIMessage = false;
            for (let j = index + 1; j < messages.length; j++) {
              if (messages[j].sender === MessageSender.USER || (messages[j].sender === MessageSender.AI && messages[j].text === '')) {
                subsequentUserOrActiveAIMessage = true;
                break;
              }
            }
            if (!subsequentUserOrActiveAIMessage) {
              isEligibleForSuggestions = true;
            }
          }

          return (
            <ChatMessageItem 
              key={msg.id} 
              message={msg} 
              isEligibleForSuggestions={isEligibleForSuggestions}
              onSuggestionClick={onSendMessage}
              onStartActivity={onStartActivity}
              onInlineQuizInteraction={onInlineQuizInteraction}
              onKhitmahInteraction={onKhitmahInteraction}
              onHadithInteraction={onHadithInteraction}
              onFlipBookInteraction={onFlipBookInteraction}
              onInlineWordSearchInteraction={onInlineWordSearchInteraction}
              onSponsorLinkClick={onSponsorLinkClick}
              isLoadingAIResponse={isLoadingAIResponse && msg.sender === MessageSender.AI && msg.text === ''} 
              theme={theme}
            />
          );
        })}
        {showAiThinkingIndicator && (
          <div className="flex justify-start mb-4">
             <div className="max-w-xs px-4 py-3 rounded-lg shadow-md flex items-center space-x-2 glass-secondary text-theme-secondary">
                <LoadingSpinner />
                <span>Noor is contemplating...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <footer className="p-4 shadow-sm glass-primary">
        <div className="container mx-auto">
          <div className="flex items-end space-x-3">
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={isRateLimited ? "Please wait a moment..." : "Ask Noor App for guidance..."}
              className="flex-grow p-3 border border-gray-300/50 rounded-lg resize-none min-h-[48px] max-h-[150px] focus:ring-blue-500 focus:border-blue-500 text-sm shadow-inner
                         text-theme-primary placeholder-gray-500 bg-white/80
                         dark:bg-slate-700/80 dark:text-slate-100 dark:placeholder-slate-400 dark:border-slate-600/50 dark:focus:ring-blue-500 dark:focus:border-blue-500"
              rows={1}
              disabled={isLoadingAIResponse || isRateLimited}
              aria-label="Chat input"
            />
            <button
              onClick={handleSendMessage}
              disabled={isLoadingAIResponse || inputText.trim() === '' || isRateLimited}
              className="p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex-shrink-0 shadow-md btn-accent"
              aria-label="Send message"
            >
              <SendIcon className="w-6 h-6" />
            </button>
          </div>
          {isRateLimited && (
            <p className="text-xs text-center text-orange-600 dark:text-orange-400 mt-2">
              You've sent many requests. Please wait a moment before sending more.
            </p>
          )}
        </div>
      </footer>
    </div>
  );
};

export default ChatInterface;
