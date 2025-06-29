
import React, { useState } from 'react';
import { ChatSession, UserData, KhitmahProgress, HadithProgress } from '../types';
import { formatDateForDisplay } from '../utils/dateUtils';
import PlusIcon from './icons/PlusIcon';
import TrashIcon from './icons/TrashIcon';
import PencilIcon from './icons/PencilIcon';
import CheckIcon from './icons/CheckIcon';
import CloseIcon from './icons/CloseIcon';
import SparklesIcon from './icons/SparklesIcon';
import PrayerTimesWidget from './PrayerTimesWidget';
import KhitmahProgressWidget from './KhitmahProgressWidget';
import HadithExplorerWidget from './HadithProgressWidget';


interface ChatListSidebarProps {
  isOpen: boolean;
  chatSessions: ChatSession[];
  currentSessionId: string | null;
  onSwitchSession: (sessionId: string) => void;
  onNewSession: () => void;
  onRenameSession: (sessionId: string, newName: string) => void;
  onDeleteSession: (sessionId: string) => void;
  onToggleSidebar: () => void;
  userData: UserData | null;
  khitmahProgress: KhitmahProgress | null;
  hadithProgress: HadithProgress | null;
  onContinueReading: (type: 'quran' | 'hadith') => void;
  bookmarkedHadithsCount: number;
}

const ChatListSidebar: React.FC<ChatListSidebarProps> = ({
  isOpen,
  chatSessions,
  currentSessionId,
  onSwitchSession,
  onNewSession,
  onRenameSession,
  onDeleteSession,
  onToggleSidebar,
  userData,
  khitmahProgress,
  hadithProgress,
  onContinueReading,
  bookmarkedHadithsCount,
}) => {
  const [renamingSessionId, setRenamingSessionId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState<string>('');

  const handleStartRename = (session: ChatSession) => {
    setRenamingSessionId(session.id);
    setEditingName(session.name);
  };

  const handleConfirmRename = () => {
    if (renamingSessionId && editingName.trim()) {
      onRenameSession(renamingSessionId, editingName.trim());
    }
    setRenamingSessionId(null);
    setEditingName('');
  };

  const handleCancelRename = () => {
    setRenamingSessionId(null);
    setEditingName('');
  };

  const sortedSessions = [...chatSessions].sort((a, b) => new Date(b.lastActivityAt).getTime() - new Date(a.lastActivityAt).getTime());

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-20 bg-black bg-opacity-50 md:hidden dark:bg-opacity-70"
          onClick={onToggleSidebar}
        ></div>
      )}
      <aside
        className={`fixed top-0 left-0 z-30 h-full shadow-lg transform transition-transform duration-300 ease-in-out flex flex-col 
                    glass-primary 
                    w-64 lg:w-72 
                    ${isOpen ? 'translate-x-0' : '-translate-x-full'}
                    md:translate-x-0 md:static md:shadow-none md:w-64 lg:md-72`}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-200/50 dark:border-slate-700/50">
          <div className="flex-grow">
            <h2 className="text-lg font-semibold text-theme-primary">Your Journey</h2>
            {userData && (
              <div className="flex items-center text-xs text-purple-600 dark:text-purple-300 mt-0.5">
                <SparklesIcon className="w-3.5 h-3.5 mr-1 text-purple-500 dark:text-purple-400" />
                {userData.hikmahPoints} Hikmah Points
              </div>
            )}
          </div>
          <button
            onClick={onToggleSidebar}
            className="p-1 rounded-md text-gray-500 hover:bg-gray-200/50 md:hidden
                       dark:text-slate-400 dark:hover:bg-slate-700/50"
            aria-label="Close chat list"
          >
            <CloseIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="p-3 border-b border-gray-200/50 dark:border-slate-700/50">
           {userData?.location && userData.location !== "Location Not Provided" && (
              <PrayerTimesWidget />
            )}
           <KhitmahProgressWidget progress={khitmahProgress} onContinue={() => onContinueReading('quran')} />
           <HadithExplorerWidget 
              progress={hadithProgress} 
              bookmarkedCount={bookmarkedHadithsCount}
              onContinue={() => onContinueReading('hadith')} 
            />
        </div>
        
        <div className="p-3 border-b border-gray-200/50 dark:border-slate-700/50">
          <h3 className="text-base font-semibold text-theme-primary mb-2">Chats</h3>
          <button
            onClick={onNewSession}
            className="w-full flex items-center justify-center px-4 py-2.5 text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-colors duration-150 shadow btn-accent"
          >
            <PlusIcon className="w-4 h-4 mr-2" />
            Start New Chat
          </button>
        </div>

        <nav className="flex-grow overflow-y-auto custom-scrollbar p-3 space-y-1.5">
          {sortedSessions.map((session) => (
            <div
              key={session.id}
              className={`group rounded-md transition-all duration-150 ease-in-out
                          ${session.id === currentSessionId 
                            ? 'bg-blue-500/80 text-white dark:bg-blue-600/80'
                            : 'text-theme-secondary hover:bg-gray-200/60 hover:text-theme-primary dark:hover:bg-slate-700/60 dark:hover:text-slate-100'}`}
              style={session.id === currentSessionId ? { backgroundColor: 'var(--accent-primary)', color: 'var(--button-text-primary)' } : {}}
            >
              {renamingSessionId === session.id ? (
                <div className="p-2.5 space-y-2">
                  <input
                    type="text"
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleConfirmRename()}
                    className="w-full px-2 py-1.5 text-sm bg-white/90 text-gray-800 border border-gray-300/70 rounded-md focus:ring-1 focus:ring-blue-400 outline-none
                               dark:bg-slate-600/90 dark:text-slate-100 dark:border-slate-500/70 dark:focus:ring-blue-500"
                    autoFocus
                  />
                  <div className="flex justify-end space-x-2">
                    <button onClick={handleCancelRename} className={`p-1.5 rounded-md ${session.id === currentSessionId ? 'hover:bg-white/20' : 'hover:bg-gray-300/50 dark:hover:bg-slate-600/50'}`} title="Cancel rename">
                      <CloseIcon className="w-4 h-4" />
                    </button>
                    <button onClick={handleConfirmRename} className={`p-1.5 rounded-md ${session.id === currentSessionId ? 'hover:bg-white/20' : 'hover:bg-gray-300/50 dark:hover:bg-slate-600/50'}`} title="Confirm rename">
                      <CheckIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between p-2.5 cursor-pointer" onClick={() => onSwitchSession(session.id)}>
                  <div className="flex-grow truncate">
                    <span className="block text-sm font-medium truncate" title={session.name}>{session.name}</span>
                    <span className={`block text-xs ${session.id === currentSessionId ? 'text-blue-100 dark:text-blue-200' : 'text-gray-500 group-hover:text-gray-600 dark:text-slate-400 dark:group-hover:text-slate-300'} transition-colors duration-150`}>
                      {formatDateForDisplay(session.lastActivityAt.toISOString(), true)}
                    </span>
                  </div>
                  <div className="flex-shrink-0 flex items-center opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity duration-150 ml-2">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleStartRename(session); }}
                      className={`p-1.5 rounded-md ${session.id === currentSessionId ? 'hover:bg-white/20' : 'hover:bg-gray-300/50 dark:hover:bg-slate-600/50'}`}
                      title="Rename chat"
                    >
                      <PencilIcon className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); onDeleteSession(session.id); }}
                      className={`p-1.5 rounded-md ${session.id === currentSessionId ? 'hover:bg-white/20' : 'hover:bg-gray-300/50 dark:hover:bg-slate-600/50'}`}
                      title="Delete chat"
                    >
                      <TrashIcon className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
          {chatSessions.length === 0 && (
            <p className="px-3 py-2 text-sm text-theme-secondary italic">No chats yet. Start one!</p>
          )}
        </nav>
      </aside>
    </>
  );
};

export default ChatListSidebar;
