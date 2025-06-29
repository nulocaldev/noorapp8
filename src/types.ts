import { GoogleGenAI, GenerateContentResponse, Content } from "@google/genai";
export type { GoogleGenAI, GenerateContentResponse, Content };

export interface UserData {
  age: string;
  location: string; // Can be "City, Country" or "Approx. Lat: X, Lon: Y"
  preferredLanguageCode: string; // e.g., 'en'
  preferredLanguageName: string; // e.g., 'English'
  hikmahPoints: number; 
}

export enum MessageSender {
  USER = 'user',
  AI = 'ai',
  SYSTEM = 'system',
}

export interface SponsorLink {
  linkType?: 'visit' | 'call' | 'follow';
  linkUrl?: string;
}

export interface ShareableTakeaway {
  text: string;
}

// For AI-suggested interactive activities
export interface InteractiveActivitySuggestion {
  type: 'quiz' | 'khitmah_reader' | 'flip_book_reader' | 'word_search' | 'hadith_explorer'; // Expanded activity types
  topic: string; // e.g., "Pillars of Islam", "Quran Khitmah", "Patience"
  displayText: string; // The text AI suggests for the button
}

// State for an inline quiz within a message
export interface InlineQuizState {
  status: 'idle' | 'loading' | 'playing' | 'submitting' | 'error' | 'completed';
  quizData: QuizData | null;
  currentQuestionIndex: number;
  selectedAnswers: Record<number, number | null>; // questionIndex: selectedOptionIndex
  score?: number; // Calculated upon completion
  errorMsg?: string;
}

// State for inline Quran Khitmah Reader
export interface InlineKhitmahReaderState {
    status: 'loading' | 'ready' | 'error';
    pageData: {
        pageNumber: number;
        verses: AyahWithTranslation[];
    } | null;
    bookmarkedVerseKeys: string[]; // New: To track bookmarks on the current page
    errorMsg?: string;
}


// State for inline Flip Book Reader
export interface InlineFlipBookState {
    status: 'loading' | 'ready' | 'error';
    bookData: FlipBookData | null;
    currentPageIndex: number;
    errorMsg?: string;
}


// State for inline Word Search Game
export interface InlineWordSearchState {
  status: 'loading' | 'playing' | 'error' | 'completed';
  wordSearchData: WordSearchData | null;
  foundWords: string[];
  currentSelection: { row: number, col: number }[]; // Path of currently selected letters
  errorMsg?: string;
  startTime: number | null; // Timestamp when the game starts
  elapsedTime: number; // in seconds
}

// State for inline Hadith Explorer
export interface InlineHadithExplorerState {
    status: 'loading' | 'ready' | 'error';
    bookData: FlipBookData | null;
    currentPageIndex: number;
    bookmarkedPageIndexes: number[];
    errorMsg?: string;
}

export type SponsorTier = 'Gold' | 'Silver' | 'Bronze';

export interface ChatMessage {
  id: string;
  text: string;
  sender: MessageSender;
  timestamp: Date;
  suggestions?: string[];
  sponsorAttribution?: {
    sponsorId: string;
    sponsorName: string;
    tier: SponsorTier;
    link: SponsorLink;
  };
  copyableContent?: { 
    content: string;
  };
  shareableTakeaway?: ShareableTakeaway;
  activitySuggestion?: InteractiveActivitySuggestion;
  inlineQuizState?: InlineQuizState | null;
  inlineKhitmahReaderState?: InlineKhitmahReaderState | null;
  inlineFlipBookState?: InlineFlipBookState | null;
  inlineWordSearchState?: InlineWordSearchState | null;
  inlineHadithExplorerState?: InlineHadithExplorerState | null;
  unlockedAchievementCard?: UnlockedAchievementCard;
}

export interface SponsorApplication extends SponsorLink {
  id:string;
  companyName: string;
  contactEmail: string;
  status: 'pending' | 'approved' | 'rejected';
  detectedLat?: number;
  detectedLon?: number;
  radiusKm: number; 
  isGlobal: boolean;  
  businessType: 'local' | 'online';
  businessCategory: string; // New field
}

export type ApprovedSponsor = Omit<SponsorApplication, 'status' | 'radiusKm' | 'isGlobal' | 'businessType'> & {
  status: 'approved';
  tier: SponsorTier;
  radiusKm: number;
  isGlobal: boolean;
  businessType: 'local' | 'online';
  businessCategory: string; // New field
  detectedLat?: number; 
  detectedLon?: number;
  linkType?: 'visit' | 'call' | 'follow';
  linkUrl?: string;
  companyName: string;
  contactEmail: string;
  id: string;
  startDate: string; 
  durationDays: number;
  endDate: string; 
  clickCount: number; 
};

export interface ManagedUrlConfig {
  slug: string;         
  targetUrl: string;    
}

export interface ChatSessionState {
  totalAiMessagesSentInSession: number;
  lastDisplayedSponsorIndex: number;
}

export interface ChatSession {
  id: string;
  name: string; 
  createdAt: Date;
  lastActivityAt: Date; 
  messages: ChatMessage[];
  sessionState: ChatSessionState; 
}

export interface UnlockedWisdomCard {
  id: string; 
  originalMessageId: string; 
  takeaway: ShareableTakeaway;
  timestamp: Date; 
  chatSessionId: string; 
}

// New type for bookmarked Hadith
export interface BookmarkedHadith {
    id: string; // e.g., hadith-msgId-pageIndex
    originalMessageId: string;
    chatSessionId: string;
    title: string;
    content: string;
    source: string;
    timestamp: Date;
}

// New type for bookmarked Ayah
export interface BookmarkedAyah {
    id: string; // e.g., ayah-1:7
    verse_key: string;
    text_uthmani: string;
    translation: string;
    pageNumber: number;
    timestamp: Date;
    chatSessionId: string;
    originalMessageId: string;
}


export type CardBackgroundType = 'css' | 'image' | 'lottie';
export type CardTier = 'Common' | 'Uncommon' | 'Rare' | 'Epic' | 'Legendary';

export interface CardBackground {
  id: string;
  name: string;
  cost: number;
  description: string;
  type: CardBackgroundType;
  tier: CardTier;
  // Make properties optional to support different types
  cssClass?: string;
  imageUrl?: string; // For type 'image', stores a Data URL or path
  lottieUrl?: string; // For type 'lottie', stores a Data URL or path
  limit: number | null;
  unlockCount: number;
}

export interface CardBackgroundPack {
  id: string;
  name: string;
  description: string;
  cost: number;
  coverImageUrl: string; // data URL
  backgroundIds: string[]; // array of CardBackground ids
  limit: number | null;
  unlockCount: number;
}

export type UnlockedPackIds = string[];


// For Quiz Activity
export interface QuizOption {
  text: string;
  image_url?: string; // Optional image for the option
}

export interface QuizQuestion {
  text: string;
  image_url?: string; // Optional image for the question itself
  options: [QuizOption, QuizOption, QuizOption]; // Exactly 3 options, each an object
  correctAnswerIndex: 0 | 1 | 2;
}

export interface QuizData {
  title: string;
  questions: QuizQuestion[];
}

// For Word Search Activity
export interface WordSearchSolution {
    word: string;
    start: { row: number; col: number };
    direction: 'horizontal' | 'vertical' | 'diagonal_down_right' | 'diagonal_up_right' | 'horizontal_reverse' | 'vertical_reverse' | 'diagonal_down_left' | 'diagonal_up_left';
}

export interface WordSearchData {
    title: string;
    grid: string[][];
    words: string[];
    solutions: WordSearchSolution[];
}

// For Flip Book Reader
export interface FlipBookPage {
    title: string;
    content: string; // Main text of the page (e.g., Hadith)
    source: string;  // Source citation
}

export interface FlipBookData {
    title: string;
    introduction: string;
    pages: FlipBookPage[];
}


// For Unlocked Achievement Cards
export interface UnlockedAchievementCard {
  id: string; // Unique ID for this achievement instance
  activityType: string; // e.g., 'quiz'
  activityTitle: string; // Specific title of the quiz/activity e.g. "Introduction to Islamic History"
  activityTopic: string; // The broader topic, e.g., "Islamic History"
  originalSuggestionText: string; // The text of the button user clicked to start
  score: number;
  maxScore: number;
  pointsEarned: number;
  timestamp: Date;
  timeTakenSeconds?: number; // Optional: Time taken for timed activities
}

// For Daily Reflection Cards
export interface ReflectionCard {
  id: string; // Unique ID, e.g., "reflection-YYYY-MM-DD"
  date: string; // YYYY-MM-DD format, the day being reflected upon
  content: string; // The AI-generated reflection text
  timestamp: Date; // When this reflection was generated or last updated
}

// For top-level progress tracking for widgets
export interface KhitmahProgress {
  currentPageNumber: number;
}


export interface HadithProgress {
  collectionName: string;
  bookName: string;
  hadithNumber: number;
  totalHadithsInBook: number;
}


// Types for API content
export interface Surah {
  id: number;
  revelation_place: string;
  revelation_order: number;
  name_simple: string;
  name_arabic: string;
  verses_count: number;
}

export interface Ayah {
  id: number;
  verse_key: string; // e.g., "1:1"
  text_uthmani: string;
}

export interface AyahWithTranslation extends Ayah {
  translation: string;
  transliteration?: string;
}


// Types for Quran Audio Player (DEPRECATED but kept for reference if needed)
export interface Reciter {
    id: number;
    name: string;
    style: string;
    translated_name: {
        name: string;
        language_name: string;
    };
}

export interface AudioFile {
    url: string;
    duration: number;
    format: string;
}

export interface VerseTiming {
    verse_key: string;
    timestamp_from: number;
    timestamp_to: number;
}

// New Types for Skinning/Theming
export type AppSkin = 'default' | 'noctis';

// New types for admin customization
export type ThemeOverrides = Record<string, string>;

export interface BehaviorOverrides {
  pointsPerAiMessage: number;
  pointsPerActivityCompletedBase: number;
  pointsPerQuizCorrectAnswer: number;
  pointsPerWordFound: number;
  pointsPerReflectionGenerated: number;
  pointsPerKhitmahPageRead: number;
  pointsPerHadithRead: number;
  pointsPerFlipbookPageTurned: number;
}

// New type for Branding Assets
export interface BrandingAssets {
  splashLogo: string; // data URL
  formLogo: string; // data URL
}
