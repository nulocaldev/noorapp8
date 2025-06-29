import React, { useState, useEffect, useCallback } from 'react';
import {
  UserData, ChatMessage, MessageSender, SponsorApplication, ApprovedSponsor, SponsorLink, ManagedUrlConfig, ChatSession,
  UnlockedWisdomCard, CardBackground, InteractiveActivitySuggestion, QuizData,
  UnlockedAchievementCard, InlineQuizState, ReflectionCard, KhitmahProgress, 
  InlineKhitmahReaderState, CardBackgroundPack, WordSearchData, InlineWordSearchState,
  FlipBookData, InlineFlipBookState, InlineHadithExplorerState, HadithProgress, SponsorTier, AppSkin, ThemeOverrides, BehaviorOverrides, BookmarkedHadith, BookmarkedAyah, AyahWithTranslation, BrandingAssets
} from './types';
import * as geminiService from './geminiService';
import * as contentService from './services/contentService';
import {
  ADMIN_EMAIL, ADMIN_PASSWORD, LANGUAGES,
  APPROVED_SPONSORS_KEY, ADMIN_AUTH_KEY, MANAGED_URL_CONFIG_KEY, USER_DATA_KEY,
  CHAT_SESSIONS_KEY, CURRENT_CHAT_SESSION_ID_KEY, THEME_KEY, SKIN_KEY,
  POINTS_PER_AI_MESSAGE, INITIAL_CARD_BACKGROUNDS, SYSTEM_PROMPT_BASE_TEMPLATE,
  UNLOCKED_WISDOM_CARDS_KEY, UNLOCKED_CARD_BACKGROUNDS_KEY,
  POINTS_PER_ACTIVITY_COMPLETED_BASE, POINTS_PER_QUIZ_CORRECT_ANSWER, POINTS_PER_WORD_FOUND,
  UNLOCKED_ACHIEVEMENT_CARDS_KEY, UNLOCKED_ACTIVITY_BACKGROUNDS_KEY,
  UNLOCKED_REFLECTION_CARDS_KEY, POINTS_PER_REFLECTION_GENERATED,
  KHITMAH_PROGRESS_KEY, POINTS_PER_KHITMAH_PAGE_READ, POINTS_PER_FLIPBOOK_PAGE_TURNED,
  CARD_BACKGROUNDS_STORE_KEY, CARD_BACKGROUND_PACKS_KEY, UNLOCKED_PACKS_KEY,
  initialApprovedSponsors, HADITH_PROGRESS_KEY, POINTS_PER_HADITH_READ,
  THEME_OVERRIDES_KEY, BEHAVIOR_OVERRIDES_KEY, CUSTOM_SYSTEM_PROMPT_KEY, BOOKMARKED_HADITHS_KEY, BOOKMARKED_AYAH_KEY,
  BRANDING_ASSETS_KEY, INITIAL_BRANDING_ASSETS
} from './constants';
import { extractSpecialContent } from './utils/aiUtils';
import { isLocationMatch } from './utils/locationUtils';
import { calculateEndDate, isSponsorshipActive, formatDateForDisplay } from './utils/dateUtils';
import { PrayerTimesProvider } from './contexts/PrayerTimesContext';

import UserDataForm from './components/UserDataForm';
import ChatInterface from './components/ChatInterface';
import NavigationBar, { AppView } from './components/NavigationBar';
import SponsorApplicationForm from './components/SponsorApplicationForm';
import AdminDashboard from './components/AdminDashboard';
import AdminLogin from './components/AdminLogin';
import ChatListSidebar from './components/ChatListSidebar';
import LanguageSelectionModal from './components/LanguageSelectionModal';
import HikmahGallery from './components/HikmahGallery';
// import InteractiveActivityModal from './components/InteractiveActivityModal';
// import PrayerReminderPopup from './components/PrayerReminderPopup';
import SplashScreen from './components/SplashScreen';

export type Theme = 'light' | 'dark' | 'auto';

// Helper to safely save to localStorage and handle quota errors
const safeSaveToLocalStorage = (key: string, data: any): boolean => {
    try {
        const stringifiedData = JSON.stringify(data);
        localStorage.setItem(key, stringifiedData);
        return true;
    } catch (e) {
        if (e instanceof DOMException && (e.name === 'QuotaExceededError' || e.name === 'NS_ERROR_DOM_QUOTA_REACHED')) {
            console.error(`LocalStorage quota exceeded while saving to key "${key}".`, e);
            alert(`Error: Could not save changes. Your browser's storage is full. Please try reducing data size (e.g., using smaller images) or clearing some chat history.`);
        } else {
            console.error(`Failed to save to localStorage key "${key}":`, e);
            alert(`An unexpected error occurred while saving data.`);
        }
        return false;
    }
};

const safeLoadFromLocalStorage = <T,>(key: string, fallback: T): T => {
    const stored = localStorage.getItem(key);
    if (!stored) return fallback;
    try {
        const parsed = JSON.parse(stored);
        // Basic check to ensure it's not null/undefined if a fallback object is expected.
        if (parsed === null && typeof fallback !== 'undefined' && fallback !== null) {
            return fallback;
        }
        return parsed as T;
    } catch (e) {
        console.error(`Failed to parse localStorage item with key "${key}". Returning fallback.`, e);
        return fallback;
    }
};

const DEFAULT_BEHAVIORS: BehaviorOverrides = {
    pointsPerAiMessage: POINTS_PER_AI_MESSAGE,
    pointsPerActivityCompletedBase: POINTS_PER_ACTIVITY_COMPLETED_BASE,
    pointsPerQuizCorrectAnswer: POINTS_PER_QUIZ_CORRECT_ANSWER,
    pointsPerWordFound: POINTS_PER_WORD_FOUND,
    pointsPerReflectionGenerated: POINTS_PER_REFLECTION_GENERATED,
    pointsPerKhitmahPageRead: POINTS_PER_KHITMAH_PAGE_READ,
    pointsPerHadithRead: POINTS_PER_HADITH_READ,
    pointsPerFlipbookPageTurned: POINTS_PER_FLIPBOOK_PAGE_TURNED,
};

interface AppContentProps {
  userData: UserData | null;
  setUserData: React.Dispatch<React.SetStateAction<UserData | null>>;
  onUserDataSubmit: (data: { age: string; location: string; preferredLanguageCode: string; hikmahPoints: number }) => void;
  isInitializingChat: boolean;
}

const AppContent: React.FC<AppContentProps> = ({ userData, setUserData, onUserDataSubmit, isInitializingChat }) => {
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [currentChatSessionId, setCurrentChatSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [, setError] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<AppView>('userDataForm');
  
  const [pendingSponsorApplications, setPendingSponsorApplications] = useState<SponsorApplication[]>([]);
  const [approvedSponsors, setApprovedSponsors] = useState<ApprovedSponsor[]>(() => {
    const sponsors = safeLoadFromLocalStorage<ApprovedSponsor[]>(APPROVED_SPONSORS_KEY, initialApprovedSponsors);
    return sponsors.map(p => ({ ...p, clickCount: p.clickCount || 0 }));
  });
  
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(false);
  const [managedUrlConfig, setManagedUrlConfig] = useState<ManagedUrlConfig | null>(() => safeLoadFromLocalStorage(MANAGED_URL_CONFIG_KEY, null));
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [showLanguageModal, setShowLanguageModal] = useState<boolean>(false);
  const [theme, setTheme] = useState<Theme>(() => (localStorage.getItem(THEME_KEY) as Theme | null) || 'auto');
  const [skin, setSkin] = useState<AppSkin>(() => (localStorage.getItem(SKIN_KEY) as AppSkin | null) || 'default');

  // State for admin customizations
  const [themeOverrides, setThemeOverrides] = useState<ThemeOverrides>(() => safeLoadFromLocalStorage(THEME_OVERRIDES_KEY, {}));
  const [behaviorOverrides, setBehaviorOverrides] = useState<BehaviorOverrides>(() => safeLoadFromLocalStorage(BEHAVIOR_OVERRIDES_KEY, DEFAULT_BEHAVIORS));
  const [customSystemPrompt, setCustomSystemPrompt] = useState<string>(() => safeLoadFromLocalStorage(CUSTOM_SYSTEM_PROMPT_KEY, SYSTEM_PROMPT_BASE_TEMPLATE));
  const [brandingAssets, setBrandingAssets] = useState<BrandingAssets>(() => safeLoadFromLocalStorage(BRANDING_ASSETS_KEY, INITIAL_BRANDING_ASSETS));

  // Dynamic Card Backgrounds State
  const [cardBackgrounds, setCardBackgrounds] = useState<CardBackground[]>([]);
  const [cardBackgroundPacks, setCardBackgroundPacks] = useState<CardBackgroundPack[]>([]);

  const [unlockedWisdomCards, setUnlockedWisdomCards] = useState<UnlockedWisdomCard[]>(() => safeLoadFromLocalStorage(UNLOCKED_WISDOM_CARDS_KEY, []));
  const [unlockedCardBackgroundIds, setUnlockedCardBackgroundIds] = useState<string[]>(() => safeLoadFromLocalStorage(UNLOCKED_CARD_BACKGROUNDS_KEY, []));
  const [unlockedPackIds, setUnlockedPackIds] = useState<string[]>(() => safeLoadFromLocalStorage(UNLOCKED_PACKS_KEY, []));
  const [unlockedAchievementCards, setUnlockedAchievementCards] = useState<UnlockedAchievementCard[]>(() => safeLoadFromLocalStorage(UNLOCKED_ACHIEVEMENT_CARDS_KEY, []));
  const [unlockedActivityBackgroundIds, setUnlockedActivityBackgroundIds] = useState<string[]>(() => safeLoadFromLocalStorage(UNLOCKED_ACTIVITY_BACKGROUNDS_KEY, []));
  const [unlockedReflectionCards, setUnlockedReflectionCards] = useState<ReflectionCard[]>(() => safeLoadFromLocalStorage(UNLOCKED_REFLECTION_CARDS_KEY, []));
  const [bookmarkedHadiths, setBookmarkedHadiths] = useState<BookmarkedHadith[]>(() => safeLoadFromLocalStorage(BOOKMARKED_HADITHS_KEY, []));
  const [bookmarkedAyahs, setBookmarkedAyahs] = useState<BookmarkedAyah[]>(() => safeLoadFromLocalStorage(BOOKMARKED_AYAH_KEY, []));
  const [isLoadingReflection, setIsLoadingReflection] = useState<boolean>(false);
  const [reflectionError, setReflectionError] = useState<string | null>(null);
  
  const [khitmahProgress, setKhitmahProgress] = useState<KhitmahProgress | null>(() => safeLoadFromLocalStorage(KHITMAH_PROGRESS_KEY, null));
  const [hadithProgress, setHadithProgress] = useState<HadithProgress | null>(() => safeLoadFromLocalStorage(HADITH_PROGRESS_KEY, null));
  
  const [isRateLimited, setIsRateLimited] = useState<boolean>(false);
  // const { prayerAlert, clearPrayerAlert } = usePrayerTimes();
  const prayerAlert = null;
  const clearPrayerAlert = () => {};
  
  const [isAppInitialized, setIsAppInitialized] = useState<boolean>(false);

  // Load admin customizations from localStorage on initial load
  useEffect(() => {
    setThemeOverrides(safeLoadFromLocalStorage(THEME_OVERRIDES_KEY, {}));
    setCustomSystemPrompt(safeLoadFromLocalStorage(CUSTOM_SYSTEM_PROMPT_KEY, SYSTEM_PROMPT_BASE_TEMPLATE));
  }, []);

  // Apply dynamic theme overrides to the document
  useEffect(() => {
    const root = document.documentElement;
    Object.keys(themeOverrides).forEach(key => {
        root.style.setProperty(key, themeOverrides[key]);
    });
  }, [themeOverrides]);

  // Apply skin changes to HTML element
  useEffect(() => {
    document.documentElement.setAttribute('data-skin', skin);
    localStorage.setItem(SKIN_KEY, skin);
  }, [skin]);

  // Load and seed card backgrounds and packs
  useEffect(() => {
      const storedBgs = safeLoadFromLocalStorage<CardBackground[] | null>(CARD_BACKGROUNDS_STORE_KEY, null);
      if (storedBgs) {
        const sanitizedBgs = storedBgs.map((bg: any) => ({
            ...bg,
            unlockCount: bg.unlockCount || 0,
            limit: bg.limit !== undefined ? bg.limit : null,
        }));
        setCardBackgrounds(sanitizedBgs);
      } else {
        setCardBackgrounds(INITIAL_CARD_BACKGROUNDS);
        safeSaveToLocalStorage(CARD_BACKGROUNDS_STORE_KEY, INITIAL_CARD_BACKGROUNDS);
      }

      const storedPacks = safeLoadFromLocalStorage<CardBackgroundPack[] | null>(CARD_BACKGROUND_PACKS_KEY, null);
      if(storedPacks) {
        const sanitizedPacks = storedPacks.map((pack: any) => ({
            ...pack,
            unlockCount: pack.unlockCount || 0,
            limit: pack.limit !== undefined ? pack.limit : null,
        }));
        setCardBackgroundPacks(sanitizedPacks);
      } else {
        setCardBackgroundPacks([]); // Start with no packs
        safeSaveToLocalStorage(CARD_BACKGROUND_PACKS_KEY, []);
      }

     setUnlockedCardBackgroundIds(prev => {
        const defaultIds = INITIAL_CARD_BACKGROUNDS.filter(bg => bg.cost === 0).map(bg => bg.id);
        const newUnlocked = [...new Set([...prev, ...defaultIds])];
        safeSaveToLocalStorage(UNLOCKED_CARD_BACKGROUNDS_KEY, newUnlocked);
        return newUnlocked;
      });
  }, []);

  // Load chat sessions from localStorage
  useEffect(() => {
    const sessions = safeLoadFromLocalStorage<ChatSession[]>(CHAT_SESSIONS_KEY, []);
    setChatSessions(sessions);
    
    const currentId = safeLoadFromLocalStorage<string | null>(CURRENT_CHAT_SESSION_ID_KEY, null);
    if (currentId && sessions.find(s => s.id === currentId)) {
      setCurrentChatSessionId(currentId);
    } else if (sessions.length > 0) {
      const mostRecent = sessions.sort((a, b) => new Date(b.lastActivityAt).getTime() - new Date(a.lastActivityAt).getTime())[0];
      setCurrentChatSessionId(mostRecent.id);
      safeSaveToLocalStorage(CURRENT_CHAT_SESSION_ID_KEY, mostRecent.id);
    }
  }, []);

  // Check URL parameters for admin access
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('admin') === 'true') {
      setCurrentView('adminLogin');
    }
  }, []);

  // Check for admin authentication
  useEffect(() => {
    const adminAuth = localStorage.getItem(ADMIN_AUTH_KEY);
    if (adminAuth === 'true') {
      setIsAdminAuthenticated(true);
    }
  }, []);

  // Initialize app after user data is available
  useEffect(() => {
    if (userData && !isInitializingChat) {
      const timer = setTimeout(() => {
        setIsAppInitialized(true);
      }, 2000); // Show splash for 2 seconds
      return () => clearTimeout(timer);
    }
  }, [userData, isInitializingChat]);

  // Auto-switch to chat view when user data is available and app is initialized
  useEffect(() => {
    if (userData && isAppInitialized && currentView === 'userDataForm') {
      setCurrentView('chat');
    }
  }, [userData, isAppInitialized, currentView]);

  const handleSendMessage = useCallback(async (content: string) => {
    if (!userData || !currentChatSessionId) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content,
      sender: MessageSender.User,
      timestamp: new Date().toISOString(),
    };

    // Update the current session with the new user message
    setChatSessions(prev => {
      const updated = prev.map(session => 
        session.id === currentChatSessionId 
          ? { 
              ...session, 
              messages: [...session.messages, userMessage],
              lastActivityAt: new Date().toISOString()
            }
          : session
      );
      safeSaveToLocalStorage(CHAT_SESSIONS_KEY, updated);
      return updated;
    });

    setIsLoading(true);
    setError(null);

    try {
      const currentSession = chatSessions.find(s => s.id === currentChatSessionId);
      const conversationHistory = currentSession ? [...currentSession.messages, userMessage] : [userMessage];
      
      const response = await geminiService.sendMessage(content, userData, conversationHistory, customSystemPrompt);
      
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: response,
        sender: MessageSender.AI,
        timestamp: new Date().toISOString(),
      };

      // Update session with AI response
      setChatSessions(prev => {
        const updated = prev.map(session => 
          session.id === currentChatSessionId 
            ? { 
                ...session, 
                messages: [...session.messages, aiMessage],
                lastActivityAt: new Date().toISOString()
              }
            : session
        );
        safeSaveToLocalStorage(CHAT_SESSIONS_KEY, updated);
        return updated;
      });

      // Award points for AI interaction
      const pointsToAdd = behaviorOverrides.pointsPerAiMessage;
      const updatedUserData = { ...userData, hikmahPoints: userData.hikmahPoints + pointsToAdd };
      setUserData(updatedUserData);
      safeSaveToLocalStorage(USER_DATA_KEY, updatedUserData);

      // Extract and handle special content
      const specialContent = extractSpecialContent(response);
      await handleSpecialContent(specialContent);

    } catch (error: any) {
      console.error('Error sending message:', error);
      if (error.message?.includes('rate limit') || error.message?.includes('429')) {
        setIsRateLimited(true);
        setError('Rate limit reached. Please wait a moment before sending another message.');
        setTimeout(() => setIsRateLimited(false), 60000); // Reset after 1 minute
      } else {
        setError('Failed to send message. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [userData, currentChatSessionId, chatSessions, customSystemPrompt, behaviorOverrides.pointsPerAiMessage]);

  const handleSpecialContent = async (specialContent: any) => {
    if (!userData) return;

    // Handle wisdom cards
    if (specialContent.wisdomCards && specialContent.wisdomCards.length > 0) {
      const newCards = specialContent.wisdomCards.map((card: any) => ({
        ...card,
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        unlockedAt: new Date().toISOString(),
      }));
      
      setUnlockedWisdomCards(prev => {
        const updated = [...prev, ...newCards];
        safeSaveToLocalStorage(UNLOCKED_WISDOM_CARDS_KEY, updated);
        return updated;
      });
    }

    // Handle achievement cards
    if (specialContent.achievementCards && specialContent.achievementCards.length > 0) {
      const newAchievements = specialContent.achievementCards.map((card: any) => ({
        ...card,
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        unlockedAt: new Date().toISOString(),
      }));
      
      setUnlockedAchievementCards(prev => {
        const updated = [...prev, ...newAchievements];
        safeSaveToLocalStorage(UNLOCKED_ACHIEVEMENT_CARDS_KEY, updated);
        return updated;
      });
    }

    // Handle reflection cards
    if (specialContent.reflectionCards && specialContent.reflectionCards.length > 0) {
      const newReflections = specialContent.reflectionCards.map((card: any) => ({
        ...card,
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        unlockedAt: new Date().toISOString(),
      }));
      
      setUnlockedReflectionCards(prev => {
        const updated = [...prev, ...newReflections];
        safeSaveToLocalStorage(UNLOCKED_REFLECTION_CARDS_KEY, updated);
        return updated;
      });
    }
  };

  const requestAiFollowUp = useCallback(async (prompt: string) => {
    if (!userData || !currentChatSessionId) return;

    setIsLoading(true);
    try {
      const currentSession = chatSessions.find(s => s.id === currentChatSessionId);
      const conversationHistory = currentSession ? currentSession.messages : [];
      
      const response = await geminiService.sendMessage(prompt, userData, conversationHistory, customSystemPrompt);
      
      const aiMessage: ChatMessage = {
        id: Date.now().toString(),
        content: response,
        sender: MessageSender.AI,
        timestamp: new Date().toISOString(),
      };

      setChatSessions(prev => {
        const updated = prev.map(session => 
          session.id === currentChatSessionId 
            ? { 
                ...session, 
                messages: [...session.messages, aiMessage],
                lastActivityAt: new Date().toISOString()
              }
            : session
        );
        safeSaveToLocalStorage(CHAT_SESSIONS_KEY, updated);
        return updated;
      });

      const specialContent = extractSpecialContent(response);
      await handleSpecialContent(specialContent);

    } catch (error) {
      console.error('Error in AI follow-up:', error);
    } finally {
      setIsLoading(false);
    }
  }, [userData, currentChatSessionId, chatSessions, customSystemPrompt]);

  const handleStartNewChat = useCallback((userData: UserData) => {
    const newSession: ChatSession = {
      id: Date.now().toString(),
      name: `Chat ${chatSessions.length + 1}`,
      messages: [],
      createdAt: new Date().toISOString(),
      lastActivityAt: new Date().toISOString(),
    };

    setChatSessions(prev => {
      const updated = [...prev, newSession];
      safeSaveToLocalStorage(CHAT_SESSIONS_KEY, updated);
      return updated;
    });

    setCurrentChatSessionId(newSession.id);
    safeSaveToLocalStorage(CURRENT_CHAT_SESSION_ID_KEY, newSession.id);
    setCurrentView('chat');
  }, [chatSessions.length]);

  const handleSwitchSession = useCallback((sessionId: string) => {
    setCurrentChatSessionId(sessionId);
    safeSaveToLocalStorage(CURRENT_CHAT_SESSION_ID_KEY, sessionId);
    setCurrentView('chat');
  }, []);

  const handleRenameSession = useCallback((id: string, newName: string) => {
    setChatSessions(prev => {
      const updated = prev.map(session => 
        session.id === id ? { ...session, name: newName } : session
      );
      safeSaveToLocalStorage(CHAT_SESSIONS_KEY, updated);
      return updated;
    });
  }, []);

  const handleDeleteSession = useCallback((id: string) => {
    if (!window.confirm("Are you sure you want to delete this chat session?")) return;
    
    setChatSessions(prev => {
      const updated = prev.filter(s => s.id !== id);
      safeSaveToLocalStorage(CHAT_SESSIONS_KEY, updated);
      return updated;
    });

    if (currentChatSessionId === id) {
      const remainingSessions = chatSessions.filter(s => s.id !== id);
      if (remainingSessions.length > 0) {
        const mostRecent = remainingSessions.sort((a, b) => new Date(b.lastActivityAt).getTime() - new Date(a.lastActivityAt).getTime())[0];
        setCurrentChatSessionId(mostRecent.id);
        safeSaveToLocalStorage(CURRENT_CHAT_SESSION_ID_KEY, mostRecent.id);
      } else {
        setCurrentChatSessionId(null);
        safeSaveToLocalStorage(CURRENT_CHAT_SESSION_ID_KEY, null);
      }
    }
  }, [currentChatSessionId, chatSessions]);

  const handleNavigation = useCallback((view: AppView) => {
    setCurrentView(view);
    if (view === 'chat' && !currentChatSessionId && userData) {
      handleStartNewChat(userData);
    }
  }, [currentChatSessionId, userData, handleStartNewChat]);

  const handleSponsorApplicationSubmit = useCallback((application: SponsorApplication) => {
    setPendingSponsorApplications(prev => [...prev, application]);
    setCurrentView('chat');
  }, []);

  const handleApproveApplication = useCallback((application: SponsorApplication, tier: SponsorTier, duration: number) => {
    const approvedSponsor: ApprovedSponsor = {
      id: Date.now().toString(),
      ...application,
      tier,
      duration,
      startDate: new Date().toISOString(),
      endDate: calculateEndDate(duration),
      clickCount: 0,
    };

    setApprovedSponsors(prev => {
      const updated = [...prev, approvedSponsor];
      safeSaveToLocalStorage(APPROVED_SPONSORS_KEY, updated);
      return updated;
    });

    setPendingSponsorApplications(prev => prev.filter(app => app.id !== application.id));
  }, []);

  const handleRejectApplication = useCallback((applicationId: string) => {
    setPendingSponsorApplications(prev => prev.filter(app => app.id !== applicationId));
  }, []);

  const handleUpdateSponsor = useCallback((updatedSponsor: ApprovedSponsor) => {
    setApprovedSponsors(prev => {
      const updated = prev.map(sponsor => 
        sponsor.id === updatedSponsor.id ? updatedSponsor : sponsor
      );
      safeSaveToLocalStorage(APPROVED_SPONSORS_KEY, updated);
      return updated;
    });
  }, []);

  const handleDeleteSponsor = useCallback((sponsorId: string) => {
    setApprovedSponsors(prev => {
      const updated = prev.filter(sponsor => sponsor.id !== sponsorId);
      safeSaveToLocalStorage(APPROVED_SPONSORS_KEY, updated);
      return updated;
    });
  }, []);

  const handleAdminLogin = useCallback(() => {
    setIsAdminAuthenticated(true);
    localStorage.setItem(ADMIN_AUTH_KEY, 'true');
    setCurrentView('adminDashboard');
  }, []);

  const handleLanguageChange = useCallback((code: string) => {
    if (!userData) return;
    
    const lang = LANGUAGES.find(l => l.code === code);
    if (lang) {
      const updatedUserData = { 
        ...userData, 
        preferredLanguageCode: lang.code, 
        preferredLanguageName: lang.name 
      };
      setUserData(updatedUserData);
      safeSaveToLocalStorage(USER_DATA_KEY, updatedUserData);
      setShowLanguageModal(false);

      // Send language change notification to AI
      if (currentChatSessionId) {
        requestAiFollowUp(`[SYSTEM_COMMAND] The user has just changed their preferred language to ${lang.name}. Acknowledge this change in ${lang.name} and confirm you will now converse in this language.`);
      }
    }
  }, [userData, currentChatSessionId, requestAiFollowUp]);

  const handleSponsorLinkClick = useCallback((id: string, link: SponsorLink) => {
    setApprovedSponsors(prev => {
      const updated = prev.map(s => 
        s.id === id ? { ...s, clickCount: (s.clickCount || 0) + 1 } : s
      );
      safeSaveToLocalStorage(APPROVED_SPONSORS_KEY, updated);
      return updated;
    });

    if (link.linkUrl) {
      window.open(link.linkUrl, '_blank', 'noopener,noreferrer');
    }
  }, []);

  const handleUpdateCardBackgrounds = useCallback((bgs: CardBackground[]) => {
    setCardBackgrounds(bgs);
    safeSaveToLocalStorage(CARD_BACKGROUNDS_STORE_KEY, bgs);
  }, []);

  const handleUpdateCardBackgroundPacks = useCallback((packs: CardBackgroundPack[]) => {
    setCardBackgroundPacks(packs);
    safeSaveToLocalStorage(CARD_BACKGROUND_PACKS_KEY, packs);
  }, []);

  const handleUnlockBackground = useCallback((backgroundId: string, cost: number) => {
    if (!userData || userData.hikmahPoints < cost) return false;

    const background = cardBackgrounds.find(bg => bg.id === backgroundId);
    if (!background) return false;

    // Check if already unlocked
    if (unlockedCardBackgroundIds.includes(backgroundId)) return false;

    // Check unlock limit
    if (background.limit !== null && background.unlockCount >= background.limit) return false;

    // Deduct points and unlock
    const updatedUserData = { ...userData, hikmahPoints: userData.hikmahPoints - cost };
    setUserData(updatedUserData);
    safeSaveToLocalStorage(USER_DATA_KEY, updatedUserData);

    // Add to unlocked backgrounds
    setUnlockedCardBackgroundIds(prev => {
      const updated = [...prev, backgroundId];
      safeSaveToLocalStorage(UNLOCKED_CARD_BACKGROUNDS_KEY, updated);
      return updated;
    });

    // Update unlock count
    setCardBackgrounds(prev => {
      const updated = prev.map(bg => 
        bg.id === backgroundId ? { ...bg, unlockCount: bg.unlockCount + 1 } : bg
      );
      safeSaveToLocalStorage(CARD_BACKGROUNDS_STORE_KEY, updated);
      return updated;
    });

    return true;
  }, [userData, cardBackgrounds, unlockedCardBackgroundIds]);

  const handleUnlockPack = useCallback((packId: string, cost: number) => {
    if (!userData || userData.hikmahPoints < cost) return false;

    const pack = cardBackgroundPacks.find(p => p.id === packId);
    if (!pack) return false;

    // Check if already unlocked
    if (unlockedPackIds.includes(packId)) return false;

    // Check unlock limit
    if (pack.limit !== null && pack.unlockCount >= pack.limit) return false;

    // Deduct points and unlock pack
    const updatedUserData = { ...userData, hikmahPoints: userData.hikmahPoints - cost };
    setUserData(updatedUserData);
    safeSaveToLocalStorage(USER_DATA_KEY, updatedUserData);

    // Add to unlocked packs
    setUnlockedPackIds(prev => {
      const updated = [...prev, packId];
      safeSaveToLocalStorage(UNLOCKED_PACKS_KEY, updated);
      return updated;
    });

    // Unlock all backgrounds in the pack
    setUnlockedCardBackgroundIds(prev => {
      const updated = [...prev, ...pack.backgroundIds];
      safeSaveToLocalStorage(UNLOCKED_CARD_BACKGROUNDS_KEY, updated);
      return updated;
    });

    // Update pack unlock count
    setCardBackgroundPacks(prev => {
      const updated = prev.map(p => 
        p.id === packId ? { ...p, unlockCount: p.unlockCount + 1 } : p
      );
      safeSaveToLocalStorage(CARD_BACKGROUND_PACKS_KEY, updated);
      return updated;
    });

    return true;
  }, [userData, cardBackgroundPacks, unlockedPackIds]);

  const handleGenerateReflection = useCallback(async (prompt: string) => {
    if (!userData) return;

    setIsLoadingReflection(true);
    setReflectionError(null);

    try {
      const response = await geminiService.generateReflection(prompt, userData);
      
      const newReflection: ReflectionCard = {
        id: Date.now().toString(),
        title: "Personal Reflection",
        content: response,
        prompt,
        unlockedAt: new Date().toISOString(),
      };

      setUnlockedReflectionCards(prev => {
        const updated = [...prev, newReflection];
        safeSaveToLocalStorage(UNLOCKED_REFLECTION_CARDS_KEY, updated);
        return updated;
      });

      // Award points for reflection
      const pointsToAdd = behaviorOverrides.pointsPerReflectionGenerated;
      const updatedUserData = { ...userData, hikmahPoints: userData.hikmahPoints + pointsToAdd };
      setUserData(updatedUserData);
      safeSaveToLocalStorage(USER_DATA_KEY, updatedUserData);

    } catch (error) {
      console.error('Error generating reflection:', error);
      setReflectionError('Failed to generate reflection. Please try again.');
    } finally {
      setIsLoadingReflection(false);
    }
  }, [userData, behaviorOverrides.pointsPerReflectionGenerated]);

  const handleUpdateThemeOverrides = useCallback((overrides: ThemeOverrides) => {
    setThemeOverrides(overrides);
    safeSaveToLocalStorage(THEME_OVERRIDES_KEY, overrides);
  }, []);

  const handleUpdateBehaviorOverrides = useCallback((overrides: BehaviorOverrides) => {
    setBehaviorOverrides(overrides);
    safeSaveToLocalStorage(BEHAVIOR_OVERRIDES_KEY, overrides);
  }, []);

  const handleUpdateSystemPrompt = useCallback((prompt: string) => {
    setCustomSystemPrompt(prompt);
    safeSaveToLocalStorage(CUSTOM_SYSTEM_PROMPT_KEY, prompt);
  }, []);

  // Activity and interactive content handlers
  const [currentActivity, setCurrentActivity] = useState<InteractiveActivitySuggestion | null>(null);
  const [inlineQuizStates, setInlineQuizStates] = useState<{ [key: string]: InlineQuizState }>({});
  const [inlineKhitmahStates, setInlineKhitmahStates] = useState<{ [key: string]: InlineKhitmahReaderState }>({});
  const [inlineWordSearchStates, setInlineWordSearchStates] = useState<{ [key: string]: InlineWordSearchState }>({});
  const [inlineFlipBookStates, setInlineFlipBookStates] = useState<{ [key: string]: InlineFlipBookState }>({});
  const [inlineHadithStates, setInlineHadithStates] = useState<{ [key: string]: InlineHadithExplorerState }>({});

  const handleStartActivity = useCallback((activity: InteractiveActivitySuggestion) => {
    setCurrentActivity(activity);
  }, []);

  const handleCompleteActivity = useCallback((activityId: string, score?: number) => {
    if (!userData) return;

    const basePoints = behaviorOverrides.pointsPerActivityCompletedBase;
    const bonusPoints = score ? Math.floor(score * 10) : 0;
    const totalPoints = basePoints + bonusPoints;

    const updatedUserData = { ...userData, hikmahPoints: userData.hikmahPoints + totalPoints };
    setUserData(updatedUserData);
    safeSaveToLocalStorage(USER_DATA_KEY, updatedUserData);

    setCurrentActivity(null);
  }, [userData, behaviorOverrides.pointsPerActivityCompletedBase]);

  const handleInlineQuizInteraction = useCallback((quizId: string, action: string, data?: any) => {
    if (!userData) return;

    setInlineQuizStates(prev => {
      const currentState = prev[quizId] || { currentQuestionIndex: 0, score: 0, isCompleted: false, userAnswers: [] };
      let newState = { ...currentState };

      switch (action) {
        case 'answer':
          if (data.isCorrect) {
            newState.score += behaviorOverrides.pointsPerQuizCorrectAnswer;
            const updatedUserData = { ...userData, hikmahPoints: userData.hikmahPoints + behaviorOverrides.pointsPerQuizCorrectAnswer };
            setUserData(updatedUserData);
            safeSaveToLocalStorage(USER_DATA_KEY, updatedUserData);
          }
          newState.userAnswers = [...newState.userAnswers, data.answer];
          break;
        case 'next':
          newState.currentQuestionIndex += 1;
          break;
        case 'complete':
          newState.isCompleted = true;
          break;
      }

      return { ...prev, [quizId]: newState };
    });
  }, [userData, behaviorOverrides.pointsPerQuizCorrectAnswer]);

  const handleKhitmahInteraction = useCallback((action: string, data?: any) => {
    if (!userData) return;

    switch (action) {
      case 'read_page':
        const pointsToAdd = behaviorOverrides.pointsPerKhitmahPageRead;
        const updatedUserData = { ...userData, hikmahPoints: userData.hikmahPoints + pointsToAdd };
        setUserData(updatedUserData);
        safeSaveToLocalStorage(USER_DATA_KEY, updatedUserData);

        setKhitmahProgress(prev => {
          const newProgress = prev ? {
            ...prev,
            currentPage: data.pageNumber,
            lastReadAt: new Date().toISOString(),
            totalPagesRead: prev.totalPagesRead + 1,
          } : {
            currentSurah: data.surah,
            currentPage: data.pageNumber,
            lastReadAt: new Date().toISOString(),
            totalPagesRead: 1,
            startedAt: new Date().toISOString(),
          };
          safeSaveToLocalStorage(KHITMAH_PROGRESS_KEY, newProgress);
          return newProgress;
        });
        break;
      case 'bookmark_ayah':
        const newBookmark: BookmarkedAyah = {
          id: Date.now().toString(),
          surah: data.surah,
          ayah: data.ayah,
          translation: data.translation,
          bookmarkedAt: new Date().toISOString(),
        };
        setBookmarkedAyahs(prev => {
          const updated = [...prev, newBookmark];
          safeSaveToLocalStorage(BOOKMARKED_AYAH_KEY, updated);
          return updated;
        });
        break;
    }
  }, [userData, behaviorOverrides.pointsPerKhitmahPageRead]);

  const handleHadithExplorerInteraction = useCallback((action: string, data?: any) => {
    if (!userData) return;

    switch (action) {
      case 'read_hadith':
        const pointsToAdd = behaviorOverrides.pointsPerHadithRead;
        const updatedUserData = { ...userData, hikmahPoints: userData.hikmahPoints + pointsToAdd };
        setUserData(updatedUserData);
        safeSaveToLocalStorage(USER_DATA_KEY, updatedUserData);

        setHadithProgress(prev => {
          const newProgress = prev ? {
            ...prev,
            currentHadithIndex: data.hadithIndex,
            lastReadAt: new Date().toISOString(),
            totalHadithsRead: prev.totalHadithsRead + 1,
          } : {
            currentCollection: data.collection,
            currentHadithIndex: data.hadithIndex,
            lastReadAt: new Date().toISOString(),
            totalHadithsRead: 1,
            startedAt: new Date().toISOString(),
          };
          safeSaveToLocalStorage(HADITH_PROGRESS_KEY, newProgress);
          return newProgress;
        });
        break;
      case 'bookmark_hadith':
        const newBookmark: BookmarkedHadith = {
          id: Date.now().toString(),
          collection: data.collection,
          hadithNumber: data.hadithNumber,
          text: data.text,
          translation: data.translation,
          bookmarkedAt: new Date().toISOString(),
        };
        setBookmarkedHadiths(prev => {
          const updated = [...prev, newBookmark];
          safeSaveToLocalStorage(BOOKMARKED_HADITHS_KEY, updated);
          return updated;
        });
        break;
    }
  }, [userData, behaviorOverrides.pointsPerHadithRead]);

  const handleFlipBookInteraction = useCallback((flipBookId: string, action: string, data?: any) => {
    if (!userData) return;

    setInlineFlipBookStates(prev => {
      const currentState = prev[flipBookId] || { currentPageIndex: 0, isCompleted: false };
      let newState = { ...currentState };

      switch (action) {
        case 'turn_page':
          newState.currentPageIndex = data.pageIndex;
          const pointsToAdd = behaviorOverrides.pointsPerFlipbookPageTurned;
          const updatedUserData = { ...userData, hikmahPoints: userData.hikmahPoints + pointsToAdd };
          setUserData(updatedUserData);
          safeSaveToLocalStorage(USER_DATA_KEY, updatedUserData);
          break;
        case 'complete':
          newState.isCompleted = true;
          break;
      }

      return { ...prev, [flipBookId]: newState };
    });
  }, [userData, behaviorOverrides.pointsPerFlipbookPageTurned]);

  const handleInlineWordSearchInteraction = useCallback((wordSearchId: string, action: string, data?: any) => {
    if (!userData) return;

    setInlineWordSearchStates(prev => {
      const currentState = prev[wordSearchId] || { foundWords: [], score: 0, isCompleted: false };
      let newState = { ...currentState };

      switch (action) {
        case 'find_word':
          if (!newState.foundWords.includes(data.word)) {
            newState.foundWords = [...newState.foundWords, data.word];
            newState.score += behaviorOverrides.pointsPerWordFound;
            const updatedUserData = { ...userData, hikmahPoints: userData.hikmahPoints + behaviorOverrides.pointsPerWordFound };
            setUserData(updatedUserData);
            safeSaveToLocalStorage(USER_DATA_KEY, updatedUserData);
          }
          break;
        case 'complete':
          newState.isCompleted = true;
          break;
      }

      return { ...prev, [wordSearchId]: newState };
    });
  }, [userData, behaviorOverrides.pointsPerWordFound]);

  const handleContinueReading = useCallback((type: 'khitmah' | 'hadith') => {
    if (type === 'khitmah' && khitmahProgress) {
      requestAiFollowUp(`[SYSTEM_COMMAND] The user wants to continue reading the Quran from where they left off. Their last position was Surah ${khitmahProgress.currentSurah}, page ${khitmahProgress.currentPage}. Please provide them with a Khitmah reader starting from this position.`);
    } else if (type === 'hadith' && hadithProgress) {
      requestAiFollowUp(`[SYSTEM_COMMAND] The user wants to continue reading Hadith from where they left off. Their last position was ${hadithProgress.currentCollection}, hadith index ${hadithProgress.currentHadithIndex}. Please provide them with a Hadith explorer starting from this position.`);
    }
    setCurrentView('chat');
  }, [khitmahProgress, hadithProgress, requestAiFollowUp]);

  const currentSession = chatSessions.find(s => s.id === currentChatSessionId);

  if (!isAppInitialized && userData) return <SplashScreen isVisible={true} />;

  const mainContent = () => {
      switch (currentView) {
          case 'userDataForm': return <UserDataForm onSubmit={onUserDataSubmit} isInitializing={isInitializingChat} formLogo={brandingAssets.formLogo} />;
          case 'chat': return currentSession && userData ? <ChatInterface messages={currentSession.messages} onSendMessage={handleSendMessage} isLoadingAIResponse={isLoading} isRateLimited={isRateLimited} userData={userData} chatSessionName={currentSession.name} theme={theme} onStartActivity={handleStartActivity} onInlineQuizInteraction={handleInlineQuizInteraction} onKhitmahInteraction={handleKhitmahInteraction} onHadithInteraction={handleHadithExplorerInteraction} onFlipBookInteraction={handleFlipBookInteraction} onInlineWordSearchInteraction={handleInlineWordSearchInteraction} onSponsorLinkClick={handleSponsorLinkClick} /> : <div className="flex items-center justify-center h-full text-theme-secondary">Select or start a new chat.</div>;
          case 'sponsorApplication': return <SponsorApplicationForm onSubmit={handleSponsorApplicationSubmit} onCancel={() => setCurrentView('chat')} />;
          case 'adminLogin': return <AdminLogin onLogin={(email, password) => { if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) handleAdminLogin(); }} />;
          case 'adminDashboard': return <AdminDashboard pendingApplications={pendingSponsorApplications} approvedSponsors={approvedSponsors} onApproveApplication={handleApproveApplication} onRejectApplication={handleRejectApplication} onUpdateApprovedSponsor={handleUpdateSponsor} onDeleteApprovedSponsor={handleDeleteSponsor} managedUrlConfig={managedUrlConfig} onUpdateManagedUrl={setManagedUrlConfig} cardBackgrounds={cardBackgrounds} onUpdateCardBackgrounds={handleUpdateCardBackgrounds} cardBackgroundPacks={cardBackgroundPacks} onUpdateCardBackgroundPacks={handleUpdateCardBackgroundPacks} skin={skin} onUpdateSkin={setSkin} themeOverrides={themeOverrides} onUpdateThemeOverrides={handleUpdateThemeOverrides} behaviorOverrides={behaviorOverrides} onUpdateBehaviorOverrides={handleUpdateBehaviorOverrides} systemPrompt={customSystemPrompt} onUpdateSystemPrompt={handleUpdateSystemPrompt} brandingAssets={brandingAssets} onUpdateBrandingAssets={setBrandingAssets}/>;
          case 'hikmahGallery': return userData ? <HikmahGallery unlockedWisdomCards={unlockedWisdomCards} cardBackgrounds={cardBackgrounds} cardBackgroundPacks={cardBackgroundPacks} unlockedCardBackgroundIds={unlockedCardBackgroundIds} unlockedPackIds={unlockedPackIds} onUnlockBackground={handleUnlockBackground} onUnlockPack={handleUnlockPack} unlockedAchievementCards={unlockedAchievementCards} unlockedActivityBackgroundIds={unlockedActivityBackgroundIds} onUnlockActivityBackground={handleUnlockBackground} unlockedReflectionCards={unlockedReflectionCards} onGenerateReflection={handleGenerateReflection} isLoadingReflection={isLoadingReflection} reflectionError={reflectionError} bookmarkedHadiths={bookmarkedHadiths} bookmarkedAyahs={bookmarkedAyahs} hikmahPoints={userData.hikmahPoints} managedUrlConfig={managedUrlConfig} /> : null;
          default: return <UserDataForm onSubmit={onUserDataSubmit} isInitializing={isInitializingChat} formLogo={brandingAssets.formLogo} />;
      }
  };

  if (!userData && !['adminLogin', 'adminDashboard', 'sponsorApplication'].includes(currentView)) {
    return <UserDataForm onSubmit={onUserDataSubmit} isInitializing={isInitializingChat} formLogo={brandingAssets.formLogo} />;
  }
  
  return (
      <div className="flex h-screen overflow-hidden bg-body text-theme-primary">
          {currentView !== 'userDataForm' && currentView !== 'adminLogin' && (
              <ChatListSidebar isOpen={isSidebarOpen} chatSessions={chatSessions} currentSessionId={currentChatSessionId} onSwitchSession={handleSwitchSession} onNewSession={() => handleStartNewChat(userData!)} onRenameSession={handleRenameSession} onDeleteSession={handleDeleteSession} onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} userData={userData!} khitmahProgress={khitmahProgress} hadithProgress={hadithProgress} onContinueReading={handleContinueReading} bookmarkedHadithsCount={bookmarkedHadiths.length} />
          )}
          <div className="flex-grow flex flex-col relative">
               {currentView !== 'userDataForm' && (
                  <NavigationBar currentView={currentView} onNavigate={handleNavigation} hasPendingSponsorApplications={pendingSponsorApplications.length > 0} isAdminAuthenticated={isAdminAuthenticated} showMenuButton={currentView === 'chat'} onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} isSidebarOpen={isSidebarOpen} onOpenLanguageModal={() => setShowLanguageModal(true)} currentTheme={theme} onChangeTheme={setTheme} userDataAvailable={!!userData} />
               )}
              <main className="flex-grow overflow-y-auto custom-scrollbar">
                  {mainContent()}
              </main>
          </div>
          {showLanguageModal && userData && (
              <LanguageSelectionModal isOpen={showLanguageModal} currentLanguageCode={userData.preferredLanguageCode} onSelectLanguage={handleLanguageChange} onClose={() => setShowLanguageModal(false)} />
          )}
          {/* {prayerAlert && <PrayerReminderPopup alert={prayerAlert} onClose={clearPrayerAlert} />} */}
      </div>
  );
}

const App: React.FC = () => {
  const [userData, setUserData] = useState<UserData | null>(() => safeLoadFromLocalStorage<UserData | null>(USER_DATA_KEY, null));
  const [isInitializingChat, setIsInitializingChat] = useState<boolean>(true);

  const handleUserDataSubmit = (data: { age: string; location: string; preferredLanguageCode: string; hikmahPoints: number }) => {
    const lang = LANGUAGES.find(l => l.code === data.preferredLanguageCode);
    const fullUserData: UserData = {
      ...data,
      preferredLanguageName: lang ? lang.name : 'Unknown',
    };
    safeSaveToLocalStorage(USER_DATA_KEY, fullUserData);
    setUserData(fullUserData);
  };
  
  useEffect(() => {
    // Vite uses import.meta.env for environment variables.
    // The main chat proxy doesn't need the key on the frontend anymore,
    // but direct calls (like for activities) still do.
    geminiService.initializeChat()
      .catch(err => console.error("Initial chat service connection failed:", err))
      .finally(() => setIsInitializingChat(false));

  }, []);


  return (
    <PrayerTimesProvider>
      <AppContent 
        userData={userData}
        setUserData={setUserData}
        onUserDataSubmit={handleUserDataSubmit}
        isInitializingChat={isInitializingChat}
      />
    </PrayerTimesProvider>
  );
};

export default App;