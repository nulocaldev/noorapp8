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
    setUnlockedActivityBackgroundIds(prev => {
        const defaultIds = INITIAL_CARD_BACKGROUNDS.filter(bg => bg.cost === 0).map(bg => bg.id);
        const newUnlocked = [...new Set([...prev, ...defaultIds])];
        safeSaveToLocalStorage(UNLOCKED_ACTIVITY_BACKGROUNDS_KEY, newUnlocked);
        return newUnlocked;
    });
  }, []);
  
  // Save data to local storage whenever it changes
  useEffect(() => { safeSaveToLocalStorage(MANAGED_URL_CONFIG_KEY, managedUrlConfig); }, [managedUrlConfig]);
  useEffect(() => { if (khitmahProgress) safeSaveToLocalStorage(KHITMAH_PROGRESS_KEY, khitmahProgress); }, [khitmahProgress]);
  useEffect(() => { if (hadithProgress) safeSaveToLocalStorage(HADITH_PROGRESS_KEY, hadithProgress); }, [hadithProgress]);
  useEffect(() => { safeSaveToLocalStorage(BRANDING_ASSETS_KEY, brandingAssets); }, [brandingAssets]);
  useEffect(() => { const root = window.document.documentElement; const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const applyTheme = (ct: Theme) => { if (ct === 'dark') root.classList.add('dark'); else if (ct === 'light') root.classList.remove('dark'); else { if (mediaQuery.matches) root.classList.add('dark'); else root.classList.remove('dark'); }};
    applyTheme(theme); localStorage.setItem(THEME_KEY, theme);
    const hS = (e: MediaQueryListEvent) => { if (theme === 'auto') { if (e.matches) root.classList.add('dark'); else root.classList.remove('dark'); }};
    mediaQuery.addEventListener('change', hS); return () => mediaQuery.removeEventListener('change', hS);
  }, [theme]);

  useEffect(() => { safeSaveToLocalStorage(APPROVED_SPONSORS_KEY, approvedSponsors); }, [approvedSponsors]);
  useEffect(() => { if (userData && chatSessions.length > 0) safeSaveToLocalStorage(CHAT_SESSIONS_KEY, chatSessions); }, [chatSessions, userData]);
  useEffect(() => { if (currentChatSessionId) localStorage.setItem(CURRENT_CHAT_SESSION_ID_KEY, currentChatSessionId); }, [currentChatSessionId]);
  useEffect(() => { safeSaveToLocalStorage(UNLOCKED_WISDOM_CARDS_KEY, unlockedWisdomCards); }, [unlockedWisdomCards]);
  useEffect(() => { safeSaveToLocalStorage(UNLOCKED_CARD_BACKGROUNDS_KEY, unlockedCardBackgroundIds); }, [unlockedCardBackgroundIds]);
  useEffect(() => { safeSaveToLocalStorage(UNLOCKED_ACHIEVEMENT_CARDS_KEY, unlockedAchievementCards); }, [unlockedAchievementCards]);
  useEffect(() => { safeSaveToLocalStorage(UNLOCKED_ACTIVITY_BACKGROUNDS_KEY, unlockedActivityBackgroundIds); }, [unlockedActivityBackgroundIds]);
  useEffect(() => { safeSaveToLocalStorage(UNLOCKED_REFLECTION_CARDS_KEY, unlockedReflectionCards); }, [unlockedReflectionCards]);
  useEffect(() => { safeSaveToLocalStorage(BOOKMARKED_HADITHS_KEY, bookmarkedHadiths); }, [bookmarkedHadiths]);
  useEffect(() => { safeSaveToLocalStorage(BOOKMARKED_AYAH_KEY, bookmarkedAyahs); }, [bookmarkedAyahs]);
  useEffect(() => { safeSaveToLocalStorage(UNLOCKED_PACKS_KEY, unlockedPackIds); }, [unlockedPackIds]);

  const updateChatSession = useCallback((sessionId: string, updateFn: (session: ChatSession) => ChatSession) => {
    setChatSessions(prevSessions => prevSessions.map(s => s.id === sessionId ? updateFn(s) : s));
  }, []);
  
  const updateMessageInSession = useCallback((sessionId: string, messageId: string, updateFn: (message: ChatMessage) => ChatMessage) => {
    updateChatSession(sessionId, session => ({
      ...session,
      messages: session.messages.map(msg => msg.id === messageId ? updateFn(msg) : msg),
      lastActivityAt: new Date(),
    }));
  }, [updateChatSession]);

  const addHikmahPoints = useCallback((points: number) => {
      setUserData(prevUserData => {
          if (!prevUserData) return null;
          const newTotal = (prevUserData.hikmahPoints || 0) + points;
          const updatedUserData = { ...prevUserData, hikmahPoints: newTotal };
          safeSaveToLocalStorage(USER_DATA_KEY, updatedUserData);
          return updatedUserData;
      });
  }, [setUserData]);

  const addWisdomCardToGallery = useCallback((message: ChatMessage, sessionId: string) => {
    if (message.shareableTakeaway && message.id && sessionId) {
        const newWisdomCard: UnlockedWisdomCard = {
            id: `wisdom-${message.id}-${Date.now()}`,
            originalMessageId: message.id,
            takeaway: message.shareableTakeaway,
            timestamp: message.timestamp || new Date(),
            chatSessionId: sessionId,
        };
        setUnlockedWisdomCards(prev => [newWisdomCard, ...prev]);
    }
  }, []);
  
  const addAchievementCard = useCallback((card: UnlockedAchievementCard) => {
    setUnlockedAchievementCards(prev => [card, ...prev]);
  }, []);

  const selectSponsorForMessage = useCallback((): ApprovedSponsor | null => {
    if (!userData) return null;

    const tierWeights: Record<SponsorTier, number> = { 'Gold': 3, 'Silver': 2, 'Bronze': 1 };
    
    const eligibleSponsors = approvedSponsors.filter(p => isSponsorshipActive(p.endDate) && isLocationMatch(userData.location, p));

    if (eligibleSponsors.length === 0) return null;

    const weightedList: ApprovedSponsor[] = [];
    eligibleSponsors.forEach(sponsor => {
      const weight = tierWeights[sponsor.tier] || 1;
      for (let i = 0; i < weight; i++) {
        weightedList.push(sponsor);
      }
    });

    if (weightedList.length === 0) return null;
    
    const randomIndex = Math.floor(Math.random() * weightedList.length);
    return weightedList[randomIndex];
  }, [approvedSponsors, userData]);

  const processAndDisplayAIResponse = useCallback(async (prompt: string, sessionId: string) => {
    if (!userData) return;
  
    setIsLoading(true);
    setError(null);
  
    const aiMsgId = 'ai-' + Date.now();
    const placeholderMessage: ChatMessage = { id: aiMsgId, text: '', sender: MessageSender.AI, timestamp: new Date() };
    updateChatSession(sessionId, s => ({ ...s, messages: [...s.messages, placeholderMessage] }));
  
    const histForAI = chatSessions.find(s => s.id === sessionId)?.messages.filter(m => m.id !== aiMsgId) || [];
  
    try {
      const rawRes = await geminiService.sendMessageToAI(prompt, histForAI, userData, customSystemPrompt);
      if (rawRes.includes("I'm currently experiencing high demand")) {
        setIsRateLimited(true);
        setTimeout(() => setIsRateLimited(false), 60000);
      }
      const { displayText, ...rest } = extractSpecialContent(rawRes);
      
      const fullMessage: ChatMessage = { 
        ...placeholderMessage, 
        text: displayText, 
        ...rest,
      };
      
      if (displayText && !displayText.toLowerCase().includes('error')) {
        addHikmahPoints(behaviorOverrides.pointsPerAiMessage);
        
        updateChatSession(sessionId, session => {
            const totalAiMessages = (session.sessionState.totalAiMessagesSentInSession || 0) + 1;
            const shouldAttachSponsor = totalAiMessages > 0 && totalAiMessages % 3 === 0;
            let finalMessage = { ...fullMessage };

            if(shouldAttachSponsor) {
                const sponsor = selectSponsorForMessage();
                if (sponsor) {
                    finalMessage.sponsorAttribution = {
                      sponsorId: sponsor.id, sponsorName: sponsor.companyName, tier: sponsor.tier,
                      link: { linkType: sponsor.linkType, linkUrl: sponsor.linkUrl },
                    };
                }
            }

            let newMessages = session.messages.map(msg => msg.id === aiMsgId ? finalMessage : msg);
            if (rest.shareableTakeaway) {
                addWisdomCardToGallery(finalMessage, session.id);
            }

            return {
                ...session,
                messages: newMessages,
                sessionState: {
                    ...session.sessionState,
                    totalAiMessagesSentInSession: totalAiMessages
                }
            };
        });

      } else {
         updateMessageInSession(sessionId, aiMsgId, () => fullMessage);
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Unknown err.";
      updateMessageInSession(sessionId, aiMsgId, m => ({ ...m, text: `Error: ${msg}` }));
      setError(`Fail get AI response: ${msg}`);
    } finally {
      setIsLoading(false);
    }
  }, [userData, chatSessions, addHikmahPoints, addWisdomCardToGallery, updateChatSession, updateMessageInSession, selectSponsorForMessage, customSystemPrompt, behaviorOverrides]);

  const triggerInitialAIGreeting = useCallback(async (sessionId: string, cUD: UserData) => {
    const initPrompt = `[SYSTEM_COMMAND] This is a one-time instruction. Generate your initial greeting message as Noor App, your AI companion. Acknowledge the user's age and preferred language context. After this greeting, proceed with the normal conversation. Do not repeat this greeting in subsequent responses.`; 
    await processAndDisplayAIResponse(initPrompt, sessionId);
  }, [processAndDisplayAIResponse]);

  const handleStartNewChat = useCallback(async (cUD: UserData, makeActive: boolean = true): Promise<string> => {
    setIsLoading(true); setError(null); const newSId = 'chat-' + Date.now(); const now = new Date();
    const newS: ChatSession = { id: newSId, name: `Chat - ${formatDateForDisplay(now.toISOString(), true)}`, createdAt: now, lastActivityAt: now, messages: [], sessionState: { totalAiMessagesSentInSession: 0, lastDisplayedSponsorIndex: -1 }};
    setChatSessions(prev => [newS, ...prev]);
    try { await geminiService.initializeChat(); if (makeActive) { setCurrentChatSessionId(newSId); await triggerInitialAIGreeting(newSId, cUD); }} 
    catch (initError) { const msg = initError instanceof Error ? initError.message : String(initError); setError(`Fail new chat: ${msg}`); throw new Error(`Fail new chat: ${msg}`); }
    if (!makeActive) setIsLoading(false); return newSId;
  }, [triggerInitialAIGreeting]);

  useEffect(() => {
    const storedAuth = localStorage.getItem(ADMIN_AUTH_KEY) === 'true';
    if (storedAuth) setIsAdminAuthenticated(true);
    const adminParamPresent = new URLSearchParams(window.location.search).get('admin') === 'true';

    if (adminParamPresent) {
      setCurrentView(storedAuth ? 'adminDashboard' : 'adminLogin');
      setIsAppInitialized(true);
    } else if (userData) {
        if (!isAppInitialized) {
            geminiService.initializeChat().then(() => {
                const storedSessions = safeLoadFromLocalStorage<any[] | null>(CHAT_SESSIONS_KEY, null);
                let loadedSessions: ChatSession[] = [];
                if(storedSessions) {
                    loadedSessions = storedSessions.map((s: any) => ({ 
                        ...s, 
                        createdAt: new Date(s.createdAt), 
                        lastActivityAt: new Date(s.lastActivityAt), 
                        messages: s.messages.map((m: ChatMessage) => ({ ...m, timestamp: new Date(m.timestamp) })) 
                    }));
                }
                
                if (loadedSessions.length > 0) {
                    setChatSessions(loadedSessions);
                    const lastSessionId = localStorage.getItem(CURRENT_CHAT_SESSION_ID_KEY);
                    const validLastSession = loadedSessions.find(s => s.id === lastSessionId);
                    setCurrentChatSessionId(validLastSession ? validLastSession.id : loadedSessions.sort((a,b) => new Date(b.lastActivityAt).getTime() - new Date(a.lastActivityAt).getTime())[0].id);
                } else {
                    handleStartNewChat(userData, true);
                }
                setCurrentView('chat');
                setIsAppInitialized(true);
            }).catch(initError => {
                console.error("Chat init failed on load:", initError);
                setError(`Could not initialize chat session: ${initError instanceof Error ? initError.message : String(initError)}.`);
            });
        }
    } else {
        setCurrentView('userDataForm');
        setIsAppInitialized(false);
    }
  }, [userData, handleStartNewChat, isAppInitialized, isAdminAuthenticated]);
  
  const requestAiFollowUp = useCallback(async (prompt: string) => {
    if (!currentChatSessionId) return;
    await processAndDisplayAIResponse(prompt, currentChatSessionId);
  }, [currentChatSessionId, processAndDisplayAIResponse]);
  
  const handleSendMessage = async (text: string) => {
    if (!userData || !currentChatSessionId) return;
  
    const currentSession = chatSessions.find(s => s.id === currentChatSessionId);
    const isFirstUserMessage = currentSession ? currentSession.messages.filter(msg => msg.sender === MessageSender.USER).length === 0 : false;
  
    const userMsg: ChatMessage = { id: 'user-' + Date.now(), text, sender: MessageSender.USER, timestamp: new Date() };
  
    updateChatSession(currentChatSessionId, s => {
      const newName = isFirstUserMessage
        ? (text.length > 40 ? text.substring(0, 37) + '...' : text)
        : s.name;
  
      return { ...s, name: newName, messages: [...s.messages, userMsg], lastActivityAt: new Date() };
    });
  
    await processAndDisplayAIResponse(text, currentChatSessionId);
  };
  
  const handleStartActivity = useCallback(async (messageIdToUpdate: string | null, activitySuggestion: InteractiveActivitySuggestion) => {
    if (!userData || !currentChatSessionId || !messageIdToUpdate) return;
    setError(null);

    const baseUpdateFn = (msg: ChatMessage) => ({ ...msg, activitySuggestion: undefined });

    if (activitySuggestion.type === 'quiz') {
        updateMessageInSession(currentChatSessionId, messageIdToUpdate, msg => ({ ...baseUpdateFn(msg), inlineQuizState: { status: 'loading', quizData: null, currentQuestionIndex: 0, selectedAnswers: {} } }));
        try {
            const quizContent = await geminiService.generateActivityContent('quiz', activitySuggestion.topic, userData) as QuizData;
            updateMessageInSession(currentChatSessionId, messageIdToUpdate, msg => ({ ...msg, inlineQuizState: { ...(msg.inlineQuizState as InlineQuizState), status: 'playing', quizData: quizContent } }));
        } catch (e) {
            const errorMsg = e instanceof Error ? e.message : "Failed to load quiz.";
            updateMessageInSession(currentChatSessionId, messageIdToUpdate, msg => ({ ...msg, inlineQuizState: { ...(msg.inlineQuizState as InlineQuizState), status: 'error', errorMsg } }));
        }
    } else if (activitySuggestion.type === 'word_search') {
        updateMessageInSession(currentChatSessionId, messageIdToUpdate, msg => ({ ...baseUpdateFn(msg), inlineWordSearchState: { status: 'loading', wordSearchData: null, foundWords: [], currentSelection: [], startTime: null, elapsedTime: 0 } }));
        try {
            const wordSearchContent = await geminiService.generateActivityContent('word_search', activitySuggestion.topic, userData) as WordSearchData;
            updateMessageInSession(currentChatSessionId, messageIdToUpdate, msg => ({ ...msg, inlineWordSearchState: { ...(msg.inlineWordSearchState as InlineWordSearchState), status: 'playing', wordSearchData: wordSearchContent, startTime: Date.now() } }));
        } catch (e) {
            const errorMsg = e instanceof Error ? e.message : "Failed to load word search.";
            updateMessageInSession(currentChatSessionId, messageIdToUpdate, msg => ({ ...msg, inlineWordSearchState: { ...(msg.inlineWordSearchState as InlineWordSearchState), status: 'error', errorMsg } }));
        }
    } else if (activitySuggestion.type === 'khitmah_reader') {
        const startPage = khitmahProgress?.currentPageNumber || 1;
        const initialState: InlineKhitmahReaderState = { status: 'loading', pageData: null, bookmarkedVerseKeys: [] };
        updateMessageInSession(currentChatSessionId, messageIdToUpdate, msg => ({ ...baseUpdateFn(msg), inlineKhitmahReaderState: initialState }));
        try {
            const pageData = await contentService.fetchQuranPage(startPage);
            const bookmarkedKeysForPage = bookmarkedAyahs.filter(b => b.pageNumber === startPage).map(b => b.verse_key);
            updateMessageInSession(currentChatSessionId, messageIdToUpdate, msg => ({
                ...msg, inlineKhitmahReaderState: {
                    status: 'ready',
                    pageData: { pageNumber: startPage, verses: pageData },
                    bookmarkedVerseKeys: bookmarkedKeysForPage
                }
            }));
        } catch(e) {
             const errorMsg = e instanceof Error ? e.message : "Failed to load Quran page.";
            updateMessageInSession(currentChatSessionId, messageIdToUpdate, msg => ({ ...msg, inlineKhitmahReaderState: { status: 'error', pageData: null, bookmarkedVerseKeys: [], errorMsg } }));
        }
    } else if (activitySuggestion.type === 'hadith_explorer' && activitySuggestion.topic) {
        const initialState: InlineHadithExplorerState = { status: 'loading', bookData: null, currentPageIndex: 0, bookmarkedPageIndexes: [] };
        updateMessageInSession(currentChatSessionId, messageIdToUpdate, msg => ({ ...baseUpdateFn(msg), inlineHadithExplorerState: initialState }));
        try {
            const bookContent = await geminiService.generateActivityContent('hadith_explorer', activitySuggestion.topic, userData) as FlipBookData;
            updateMessageInSession(currentChatSessionId, messageIdToUpdate, msg => ({ ...msg, inlineHadithExplorerState: { ...initialState, status: 'ready', bookData: bookContent } }));
        } catch(e) {
            const errorMsg = e instanceof Error ? e.message : "Failed to generate the Hadith collection.";
            updateMessageInSession(currentChatSessionId, messageIdToUpdate, msg => ({ ...msg, inlineHadithExplorerState: { ...initialState, status: 'error', errorMsg } }));
        }
    } else if (activitySuggestion.type === 'flip_book_reader' && activitySuggestion.topic) {
        const initialState: InlineFlipBookState = { status: 'loading', bookData: null, currentPageIndex: 0 };
        updateMessageInSession(currentChatSessionId, messageIdToUpdate, msg => ({ ...baseUpdateFn(msg), inlineFlipBookState: initialState }));
        try {
            const bookContent = await geminiService.generateActivityContent('flip_book_reader', activitySuggestion.topic, userData) as FlipBookData;
            updateMessageInSession(currentChatSessionId, messageIdToUpdate, msg => ({ ...msg, inlineFlipBookState: { ...initialState, status: 'ready', bookData: bookContent } }));
        } catch(e) {
            const errorMsg = e instanceof Error ? e.message : "Failed to generate the book.";
            updateMessageInSession(currentChatSessionId, messageIdToUpdate, msg => ({ ...msg, inlineFlipBookState: { ...initialState, status: 'error', errorMsg } }));
        }
    }
  }, [userData, currentChatSessionId, updateMessageInSession, khitmahProgress, bookmarkedAyahs]);
  
  const handleInlineQuizInteraction = useCallback((messageId: string, action: 'next' | 'prev' | 'select_option' | 'submit', payload?: { optionIndex?: number }) => {
    if (!currentChatSessionId) return;
  
    if (action === 'submit') {
      updateMessageInSession(currentChatSessionId, messageId, msg => ({ ...msg, inlineQuizState: { ...msg.inlineQuizState!, status: 'submitting' } }));
  
      setTimeout(() => {
        let completedMessage: ChatMessage | null = null;
        setChatSessions(prevSessions => {
            return prevSessions.map(session => {
                if (session.id === currentChatSessionId) {
                    const updatedMessages = session.messages.map(msg => {
                        if (msg.id === messageId) {
                            if (!msg.inlineQuizState?.quizData) return msg;
                            let score = 0;
                            const totalQuestions = msg.inlineQuizState.quizData.questions.length;
                            msg.inlineQuizState.quizData.questions.forEach((q, index) => {
                                if (msg.inlineQuizState!.selectedAnswers[index] === q.correctAnswerIndex) {
                                    score++;
                                }
                            });

                            const updatedQuizState: InlineQuizState = {
                                ...(msg.inlineQuizState as InlineQuizState),
                                score,
                                status: 'completed',
                            };
                            const completedQuizMsg = { ...msg, inlineQuizState: updatedQuizState };
                            completedMessage = completedQuizMsg;
                            return completedQuizMsg;
                        }
                        return msg;
                    });
                    return { ...session, messages: updatedMessages };
                }
                return session;
            });
        });
  
        if (completedMessage?.inlineQuizState && completedMessage.activitySuggestion) {
          const { score, quizData } = completedMessage.inlineQuizState;
          if (score === undefined || !quizData) return;
  
          const totalQuestions = quizData.questions.length;
          const pointsEarned = behaviorOverrides.pointsPerActivityCompletedBase + (score * behaviorOverrides.pointsPerQuizCorrectAnswer);
          addHikmahPoints(pointsEarned);
  
          const newAchievementCard: UnlockedAchievementCard = {
            id: `achieve-${Date.now()}`,
            activityType: 'quiz',
            activityTitle: quizData.title,
            activityTopic: completedMessage.activitySuggestion.topic,
            originalSuggestionText: completedMessage.activitySuggestion.displayText,
            score: score,
            maxScore: totalQuestions,
            pointsEarned: pointsEarned,
            timestamp: new Date(),
          };
          addAchievementCard(newAchievementCard);
  
          const achievementSystemMessage: ChatMessage = {
            id: `achievement-${newAchievementCard.id}`,
            sender: MessageSender.SYSTEM,
            text: '',
            timestamp: new Date(),
            unlockedAchievementCard: newAchievementCard,
          };
          updateChatSession(currentChatSessionId, s => ({ ...s, messages: [...s.messages, achievementSystemMessage] }));
  
          const followUpPrompt = `The user just completed the quiz "${newAchievementCard.activityTitle}" and scored ${newAchievementCard.score} out of ${newAchievementCard.maxScore}. Please provide some brief, encouraging feedback and suggest a relevant follow-up conversation topic.`;
          requestAiFollowUp(followUpPrompt);
        }
      }, 500);
      return;
    }
  
    updateMessageInSession(currentChatSessionId, messageId, msg => {
      if (!msg.inlineQuizState || !msg.inlineQuizState.quizData) return msg;
      const state = msg.inlineQuizState;
      let newState = { ...state };
      switch (action) {
        case 'select_option':
          if (payload?.optionIndex !== undefined) {
            newState.selectedAnswers = { ...state.selectedAnswers, [state.currentQuestionIndex]: payload.optionIndex };
          }
          break;
        case 'next':
          if (state.currentQuestionIndex < state.quizData.questions.length - 1) {
            newState.currentQuestionIndex++;
          }
          break;
        case 'prev':
          if (state.currentQuestionIndex > 0) {
            newState.currentQuestionIndex--;
          }
          break;
      }
      return { ...msg, inlineQuizState: newState };
    });
  }, [currentChatSessionId, updateMessageInSession, addHikmahPoints, addAchievementCard, requestAiFollowUp, updateChatSession, setChatSessions, behaviorOverrides]);

  const handleKhitmahInteraction = useCallback(async (messageId: string, action: 'turn_page' | 'bookmark_verse', payload: { newPageNumber?: number, ayah?: AyahWithTranslation }) => {
    if (!currentChatSessionId) return;

    if (action === 'turn_page' && payload.newPageNumber) {
        const { newPageNumber } = payload;
        if (newPageNumber < 1 || newPageNumber > 604) return;
        
        const currentMessage = chatSessions.find(s => s.id === currentChatSessionId)?.messages.find(m => m.id === messageId);
        const currentPage = currentMessage?.inlineKhitmahReaderState?.pageData?.pageNumber;
        if (currentPage && newPageNumber > currentPage) {
            addHikmahPoints(behaviorOverrides.pointsPerKhitmahPageRead);
        }
        setKhitmahProgress({ currentPageNumber: newPageNumber });
        
        updateMessageInSession(currentChatSessionId, messageId, msg => ({
          ...msg,
          inlineKhitmahReaderState: { ...msg.inlineKhitmahReaderState!, status: 'loading' }
        }));
        
        try {
            const pageData = await contentService.fetchQuranPage(newPageNumber);
            const bookmarkedKeysForPage = bookmarkedAyahs.filter(b => b.pageNumber === newPageNumber).map(b => b.verse_key);
            updateMessageInSession(currentChatSessionId, messageId, msg => ({
                ...msg, inlineKhitmahReaderState: {
                    status: 'ready',
                    pageData: { pageNumber: newPageNumber, verses: pageData },
                    bookmarkedVerseKeys: bookmarkedKeysForPage,
                }
            }));
        } catch(e) {
            const errorMsg = e instanceof Error ? e.message : "Failed to load Quran page.";
            updateMessageInSession(currentChatSessionId, messageId, msg => ({ ...msg, inlineKhitmahReaderState: { ...msg.inlineKhitmahReaderState!, status: 'error', pageData: null, errorMsg } }));
        }
    } else if (action === 'bookmark_verse' && payload.ayah) {
        const { ayah } = payload;
        const verseKey = ayah.verse_key;
        const pageNumber = chatSessions.find(s => s.id === currentChatSessionId)?.messages.find(m => m.id === messageId)?.inlineKhitmahReaderState?.pageData?.pageNumber;

        if (!pageNumber) return;

        updateMessageInSession(currentChatSessionId, messageId, msg => {
            if (!msg.inlineKhitmahReaderState) return msg;
            
            const currentBookmarks = msg.inlineKhitmahReaderState.bookmarkedVerseKeys;
            const isBookmarked = currentBookmarks.includes(verseKey);
            const newBookmarks = isBookmarked ? currentBookmarks.filter(k => k !== verseKey) : [...currentBookmarks, verseKey];
            
            if (isBookmarked) {
                setBookmarkedAyahs(prev => prev.filter(b => b.verse_key !== verseKey));
            } else {
                const newBookmark: BookmarkedAyah = {
                    id: `ayah-${verseKey}`,
                    verse_key: verseKey,
                    text_uthmani: ayah.text_uthmani,
                    translation: ayah.translation,
                    pageNumber: pageNumber,
                    timestamp: new Date(),
                    chatSessionId: currentChatSessionId,
                    originalMessageId: messageId,
                };
                setBookmarkedAyahs(prev => [...prev, newBookmark]);
            }

            return {
                ...msg,
                inlineKhitmahReaderState: { ...msg.inlineKhitmahReaderState, bookmarkedVerseKeys: newBookmarks }
            };
        });
    }
  }, [currentChatSessionId, updateMessageInSession, addHikmahPoints, behaviorOverrides, chatSessions, bookmarkedAyahs]);


  const handleFlipBookInteraction = useCallback((messageId: string, action: 'turn_page', payload: { newPageIndex: number }) => {
    if (!currentChatSessionId) return;
    updateMessageInSession(currentChatSessionId, messageId, msg => {
      if (!msg.inlineFlipBookState || !msg.inlineFlipBookState.bookData) return msg;
      
      const { currentPageIndex } = msg.inlineFlipBookState;
      const newIndex = payload.newPageIndex;

      if (newIndex > currentPageIndex) {
        addHikmahPoints(behaviorOverrides.pointsPerFlipbookPageTurned);
      }

      const newState: InlineFlipBookState = {
        ...msg.inlineFlipBookState,
        currentPageIndex: newIndex,
      };
      return { ...msg, inlineFlipBookState: newState };
    });
  }, [currentChatSessionId, updateMessageInSession, addHikmahPoints, behaviorOverrides]);

  const handleHadithExplorerInteraction = useCallback((messageId: string, action: 'turn_page' | 'bookmark_page', payload: { newPageIndex?: number; pageIndex?: number }) => {
    if (!currentChatSessionId) return;
    updateMessageInSession(currentChatSessionId, messageId, msg => {
        if (!msg.inlineHadithExplorerState || !msg.inlineHadithExplorerState.bookData) return msg;

        const state = msg.inlineHadithExplorerState;
        let newState = { ...state };

        if (action === 'turn_page' && payload.newPageIndex !== undefined) {
            const { newPageIndex } = payload;
            if (newPageIndex > state.currentPageIndex) {
                addHikmahPoints(behaviorOverrides.pointsPerHadithRead);
                setHadithProgress({
                    collectionName: state.bookData?.title || 'Hadith',
                    bookName: msg.activitySuggestion?.topic || 'Collection',
                    hadithNumber: newPageIndex + 1,
                    totalHadithsInBook: state.bookData.pages.length,
                });
            }
            newState.currentPageIndex = newPageIndex;
        }
        
        if (action === 'bookmark_page' && payload.pageIndex !== undefined) {
            const { pageIndex } = payload;
            const alreadyBookmarked = state.bookmarkedPageIndexes.includes(pageIndex);
            
            if (alreadyBookmarked) {
                newState.bookmarkedPageIndexes = state.bookmarkedPageIndexes.filter(i => i !== pageIndex);
                setBookmarkedHadiths(prev => prev.filter(b => !(b.originalMessageId === messageId && b.id.endsWith(`-${pageIndex}`))));
            } else {
                newState.bookmarkedPageIndexes = [...state.bookmarkedPageIndexes, pageIndex];
                const pageData = state.bookData?.pages[pageIndex];
                if (pageData) {
                    const newBookmark: BookmarkedHadith = {
                        id: `hadith-${messageId}-${pageIndex}`,
                        originalMessageId: messageId,
                        chatSessionId: currentChatSessionId,
                        title: pageData.title,
                        content: pageData.content,
                        source: pageData.source,
                        timestamp: new Date(),
                    };
                    setBookmarkedHadiths(prev => [...prev, newBookmark]);
                }
            }
        }

        return { ...msg, inlineHadithExplorerState: newState };
    });
  }, [currentChatSessionId, updateMessageInSession, addHikmahPoints, setHadithProgress, behaviorOverrides]);


  const handleInlineWordSearchInteraction = useCallback((messageId: string, action: 'found_word', payload: { word: string }) => {
    if (!currentChatSessionId) return;

    let isCompleted = false;
    let completedMessage: ChatMessage | null = null;
    
    updateMessageInSession(currentChatSessionId, messageId, msg => {
      if (!msg.inlineWordSearchState || !msg.inlineWordSearchState.wordSearchData) return msg;
      const state = msg.inlineWordSearchState;
      if (state.foundWords.includes(payload.word)) return msg;
      addHikmahPoints(behaviorOverrides.pointsPerWordFound);
      const newFoundWords = [...state.foundWords, payload.word];
      
      let newState: InlineWordSearchState = { ...state, foundWords: newFoundWords };
      if (newFoundWords.length === state.wordSearchData.words.length) {
        const finalTime = state.startTime ? Math.round((Date.now() - state.startTime) / 1000) : state.elapsedTime;
        newState.status = 'completed';
        newState.elapsedTime = finalTime;
        newState.startTime = null;
        isCompleted = true;
        completedMessage = { ...msg, inlineWordSearchState: newState };
      }
      return { ...msg, inlineWordSearchState: newState };
    });

    if (isCompleted && completedMessage?.inlineWordSearchState?.wordSearchData && completedMessage.activitySuggestion) {
        const { wordSearchData, elapsedTime } = completedMessage.inlineWordSearchState;
        const totalWords = wordSearchData.words.length;
        const pointsEarned = behaviorOverrides.pointsPerActivityCompletedBase + (totalWords * behaviorOverrides.pointsPerWordFound);
        addHikmahPoints(behaviorOverrides.pointsPerActivityCompletedBase); 

        const newAchievementCard: UnlockedAchievementCard = {
            id: `achieve-${Date.now()}`, activityType: 'word_search', activityTitle: wordSearchData.title,
            activityTopic: completedMessage.activitySuggestion.topic, originalSuggestionText: completedMessage.activitySuggestion.displayText,
            score: totalWords, maxScore: totalWords, pointsEarned: pointsEarned, timestamp: new Date(), timeTakenSeconds: elapsedTime,
        };
        addAchievementCard(newAchievementCard);

        const achievementSystemMessage: ChatMessage = {
            id: `achievement-${newAchievementCard.id}`, sender: MessageSender.SYSTEM, text: '', timestamp: new Date(), unlockedAchievementCard: newAchievementCard,
        };
        updateChatSession(currentChatSessionId, s => ({ ...s, messages: [...s.messages, achievementSystemMessage] }));
        
        const followUpPrompt = `The user just completed the word search game "${newAchievementCard.activityTitle}" in ${elapsedTime} seconds. Please provide some brief, encouraging feedback and suggest a relevant follow-up conversation topic.`;
        requestAiFollowUp(followUpPrompt);
    }
  }, [currentChatSessionId, updateMessageInSession, addHikmahPoints, addAchievementCard, requestAiFollowUp, updateChatSession, behaviorOverrides]);

  const handleContinueReading = useCallback((type: 'quran' | 'hadith') => {
      if(!userData) return;
      let prompt = '';
      if (type === 'quran') {
          if (khitmahProgress) {
            prompt = `The user wants to continue their Quran Khitmah. Please open the reader for them at page ${khitmahProgress.currentPageNumber}.`;
          } else {
            prompt = `The user wants to start their Quran Khitmah. Please suggest opening the reader to begin.`;
          }
      } else if (type === 'hadith') {
          if (hadithProgress) {
            prompt = `The user wants to continue their Hadith study. Please open the Hadith explorer for them. They were last studying the collection "${hadithProgress.collectionName}".`;
          } else {
            prompt = `The user wants to start studying Hadith. Please suggest a collection of Hadith to start with, for example on the topic of patience.`;
          }
      }
      if (prompt) handleSendMessage(prompt);
  }, [userData, khitmahProgress, hadithProgress, handleSendMessage]);

  const handleGenerateReflection = useCallback(async (date: string) => {
    if (!userData) { setReflectionError("User data is not available."); return; }
    setIsLoadingReflection(true);
    setReflectionError(null);

    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);

      const todaysUserMessages = chatSessions.flatMap(s => s.messages).filter(m => new Date(m.timestamp) >= today && new Date(m.timestamp) < tomorrow && m.sender === MessageSender.USER).map(m => m.text).slice(-5);
      const todaysAchievements = unlockedAchievementCards.filter(c => new Date(c.timestamp) >= today && new Date(c.timestamp) < tomorrow).map(c => `completed a quiz on "${c.activityTopic}"`);
      const todaysWisdom = unlockedWisdomCards.filter(c => new Date(c.timestamp) >= today && new Date(c.timestamp) < tomorrow).map(c => c.takeaway.text).slice(-3);
      let contextSummary = "";
      if (todaysUserMessages.length > 0) contextSummary += `\n- Recent conversation topics included: "${todaysUserMessages.join('", "')}".`;
      if (todaysAchievements.length > 0) contextSummary += `\n- Today, they ${[...new Set(todaysAchievements)].join(', and ')}.`;
      if (todaysWisdom.length > 0) contextSummary += `\n- They reflected on wisdom such as: "${todaysWisdom.join('", "')}".`;
      
      const prompt = contextSummary
        ? `Generate a short, personal, and uplifting Islamic reflection... Here is the user's activity context:${contextSummary}\n\nThe reflection must be in the language: ${userData.preferredLanguageCode}.`
        : `The user hasn't had much activity today. Generate a short, general, uplifting, and insightful Islamic reflection... The reflection must be in the language: ${userData.preferredLanguageCode}.`;

      const reflectionContent = await geminiService.generateReflectionContent(prompt, userData);
      
      const newReflection: ReflectionCard = { id: `reflection-${date}`, date: date, content: reflectionContent, timestamp: new Date() };
      setUnlockedReflectionCards(prev => [newReflection, ...prev.filter(r => r.date !== date)]);
      addHikmahPoints(behaviorOverrides.pointsPerReflectionGenerated);

    } catch (e) {
      setReflectionError(e instanceof Error ? e.message : "An unknown error occurred.");
    } finally {
      setIsLoadingReflection(false);
    }
  }, [userData, chatSessions, unlockedAchievementCards, unlockedWisdomCards, addHikmahPoints, behaviorOverrides]);

  const handleUnlockBackground = useCallback((backgroundId: string) => {
    if (!userData) return;
    
    const bgToUnlock = cardBackgrounds.find(b => b.id === backgroundId);
    if (!bgToUnlock) { alert("Error: Background not found."); return; }
    if (bgToUnlock.limit !== null && (bgToUnlock.unlockCount || 0) >= bgToUnlock.limit) { alert("Sorry, this background is a limited edition and is no longer available."); return; }
    if (userData.hikmahPoints < bgToUnlock.cost) { alert(`You need ${bgToUnlock.cost} Hikmah Points to unlock this background.`); return; }

    if (window.confirm(`Unlock "${bgToUnlock.name}" for ${bgToUnlock.cost} Hikmah Points?`)) {
        addHikmahPoints(-bgToUnlock.cost);
        setCardBackgrounds(prevBgs => prevBgs.map(bg => bg.id === backgroundId ? { ...bg, unlockCount: (bg.unlockCount || 0) + 1 } : bg));
        setUnlockedCardBackgroundIds(prev => [...new Set([...prev, backgroundId])]);
        setUnlockedActivityBackgroundIds(prev => [...new Set([...prev, backgroundId])]);
        alert(`Successfully unlocked "${bgToUnlock.name}"!`);
    }
  }, [userData, cardBackgrounds, addHikmahPoints]);

  const handleUnlockPack = useCallback((packId: string) => {
    if (!userData) return;

    const packToUnlock = cardBackgroundPacks.find(p => p.id === packId);
    if (!packToUnlock) { alert("Error: Pack not found."); return; }
    if (packToUnlock.limit !== null && (packToUnlock.unlockCount || 0) >= packToUnlock.limit) { alert("Sorry, this pack is a limited edition and is no longer available."); return; }
    if (userData.hikmahPoints < packToUnlock.cost) { alert(`You need ${packToUnlock.cost} Hikmah Points to unlock this pack.`); return; }
    
    if (window.confirm(`Unlock the "${packToUnlock.name}" pack for ${packToUnlock.cost} Hikmah Points?`)) {
      addHikmahPoints(-packToUnlock.cost);
      setCardBackgroundPacks(prevPacks => prevPacks.map(p => p.id === packId ? { ...p, unlockCount: (p.unlockCount || 0) + 1 } : p));
      setUnlockedPackIds(prev => [...new Set([...prev, packId])]);

      const bgIdsToUnlock = packToUnlock.backgroundIds;
      setCardBackgrounds(prevBgs => prevBgs.map(bg => bgIdsToUnlock.includes(bg.id) ? { ...bg, unlockCount: (bg.unlockCount || 0) + 1 } : bg));
      setUnlockedCardBackgroundIds(prev => [...new Set([...prev, ...bgIdsToUnlock])]);
      setUnlockedActivityBackgroundIds(prev => [...new Set([...prev, ...bgIdsToUnlock])]);
      alert(`Successfully unlocked the "${packToUnlock.name}" pack!`);
    }
  }, [userData, cardBackgroundPacks, addHikmahPoints, cardBackgrounds]);


  const handleNavigation = (view: AppView) => {
    if (view === 'userDataForm' && window.confirm("This will clear current user profile and ALL chat history. Start fresh?")) {
        localStorage.clear();
        setUserData(null); setChatSessions([]); setCurrentChatSessionId(null); setError(null);
        setUnlockedWisdomCards([]); setUnlockedCardBackgroundIds([]); setUnlockedAchievementCards([]);
        setUnlockedActivityBackgroundIds([]); setUnlockedReflectionCards([]); setBookmarkedHadiths([]);
        setBookmarkedAyahs([]); setKhitmahProgress(null); setHadithProgress(null);
        setCardBackgrounds(INITIAL_CARD_BACKGROUNDS); setCardBackgroundPacks([]); setUnlockedPackIds([]);
    }
    if ((view === 'hikmahGallery') && !userData) { alert("Please set up your user profile first."); return; }
    if (view === 'adminDashboard' && !isAdminAuthenticated) { setCurrentView('adminLogin'); return; }
    setCurrentView(view);
  };
  
  const handleSponsorApplicationSubmit = (appData: Omit<SponsorApplication, 'id' | 'status'>) => {
      const newApplication: SponsorApplication = { ...appData, id: `app-${Date.now()}`, status: 'pending' };
      setPendingSponsorApplications(prev => [...prev, newApplication]);
      alert("Application submitted for review. Thank you!");
      setCurrentView('chat'); 
  };
  
  const handleApproveApplication = (appId: string, radiusKm: number, isGlobal: boolean, startDate: string, durationDays: number, companyName: string, contactEmail: string, linkType: SponsorLink['linkType'] | undefined, linkUrl: string | undefined, businessType: 'local' | 'online', businessCategory: string, tier: SponsorTier) => {
      const appToApprove = pendingSponsorApplications.find(a => a.id === appId); if (!appToApprove) return;
      const newApproved: ApprovedSponsor = { ...appToApprove, status: 'approved', radiusKm, isGlobal, startDate, durationDays, endDate: calculateEndDate(startDate, durationDays), clickCount: 0, companyName, contactEmail, linkType, linkUrl, businessType, businessCategory, tier };
      setApprovedSponsors(prev => [...prev, newApproved]); setPendingSponsorApplications(prev => prev.filter(a => a.id !== appId));
  };

  const handleRejectApplication = (appId: string) => setPendingSponsorApplications(prev => prev.filter(a => a.id !== appId));
  const handleUpdateSponsor = (id: string, startDate: string, durationDays: number, radiusKm: number, isGlobal: boolean, linkType: SponsorLink['linkType'] | undefined, linkUrl: string | undefined, tier: SponsorTier) => {
      setApprovedSponsors(prev => prev.map(s => s.id === id ? { ...s, startDate, durationDays, endDate: calculateEndDate(startDate, durationDays), radiusKm, isGlobal, linkType, linkUrl, tier } : s));
  };
  const handleDeleteSponsor = (id: string) => setApprovedSponsors(prev => prev.filter(s => s.id !== id));
  const handleUpdateThemeOverrides = (overrides: ThemeOverrides) => { setThemeOverrides(overrides); safeSaveToLocalStorage(THEME_OVERRIDES_KEY, overrides); };
  const handleUpdateBehaviorOverrides = (overrides: BehaviorOverrides) => { setBehaviorOverrides(overrides); safeSaveToLocalStorage(BEHAVIOR_OVERRIDES_KEY, overrides); };
  const handleUpdateSystemPrompt = (prompt: string) => { setCustomSystemPrompt(prompt); safeSaveToLocalStorage(CUSTOM_SYSTEM_PROMPT_KEY, prompt); };
  const handleAdminLogin = () => { localStorage.setItem(ADMIN_AUTH_KEY, 'true'); setIsAdminAuthenticated(true); setCurrentView('adminDashboard'); };
  const handleSwitchSession = (id: string) => { setCurrentChatSessionId(id); setIsSidebarOpen(false); };
  const handleRenameSession = (id: string, name: string) => updateChatSession(id, s => ({ ...s, name }));
  const handleDeleteSession = (id: string) => {
      if (!window.confirm("Are you sure you want to delete this chat session?")) return;
      const newSessions = chatSessions.filter(s => s.id !== id); setChatSessions(newSessions);
      if (currentChatSessionId === id) setCurrentChatSessionId(newSessions.length > 0 ? newSessions.sort((a,b) => new Date(b.lastActivityAt).getTime() - new Date(a.lastActivityAt).getTime())[0].id : null);
  };
  const handleLanguageChange = (code: string) => {
      if (!userData) return;
      const lang = LANGUAGES.find(l => l.code === code);
      if (lang) {
          const updatedUserData = { ...userData, preferredLanguageCode: lang.code, preferredLanguageName: lang.name };
          setUserData(updatedUserData); safeSaveToLocalStorage(USER_DATA_KEY, updatedUserData); setShowLanguageModal(false);
          if (currentChatSessionId) requestAiFollowUp(`[SYSTEM_COMMAND] The user has just changed their preferred language to ${lang.name}. Acknowledge this change in ${lang.name} and confirm you will now converse in this language.`);
      }
  };
  const handleSponsorLinkClick = (id: string, link: SponsorLink) => {
      setApprovedSponsors(prev => prev.map(s => s.id === id ? { ...s, clickCount: (s.clickCount || 0) + 1 } : s));
      if (link.linkUrl) window.open(link.linkUrl, '_blank', 'noopener,noreferrer');
  };
  const handleUpdateCardBackgrounds = (bgs: CardBackground[]) => { setCardBackgrounds(bgs); safeSaveToLocalStorage(CARD_BACKGROUNDS_STORE_KEY, bgs); };
  const handleUpdateCardBackgroundPacks = (packs: CardBackgroundPack[]) => { setCardBackgroundPacks(packs); safeSaveToLocalStorage(CARD_BACKGROUND_PACKS_KEY, packs); };

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
