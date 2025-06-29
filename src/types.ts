// Core type definitions for the MyNoor app

export interface User {
  id: string;
  name: string;
  email: string;
  preferredLanguage: string;
  location?: {
    latitude: number;
    longitude: number;
    city?: string;
    country?: string;
  };
  preferences: {
    notifications: boolean;
    prayerReminders: boolean;
    theme: 'light' | 'dark' | 'auto';
    fontSize: 'small' | 'medium' | 'large';
  };
  createdAt: string;
  lastActiveAt: string;
}

export interface ChatMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  sender?: MessageSender; // Alternative property for compatibility
  timestamp: string;
  metadata?: {
    suggestions?: string[];
    shareableContent?: string;
    activitySuggestion?: ActivitySuggestion;
  };
}

export interface ActivitySuggestion {
  type: 'quiz' | 'khitmah_reader' | 'flip_book_reader' | 'word_search' | 'hadith_explorer';
  topic: string;
  description: string;
}

export interface PrayerTime {
  name: string;
  time: string;
  isNext?: boolean;
}

export interface PrayerTimesData {
  date: string;
  location: string;
  times: PrayerTime[];
  nextPrayer?: {
    name: string;
    time: string;
    timeUntil: string;
  };
}

export interface QuranVerse {
  surah: number;
  verse: number;
  arabic: string;
  translation: string;
  transliteration?: string;
  surahName?: string;
}

export interface Hadith {
  id: string;
  narrator: string;
  arabic: string;
  translation: string;
  source: string;
  book: string;
  chapter?: string;
  number?: string;
  tags?: string[];
}

export interface DuaItem {
  id: string;
  title: string;
  arabic: string;
  transliteration: string;
  translation: string;
  category: string;
  occasion?: string;
  benefits?: string[];
}

export interface IslamicEvent {
  id: string;
  name: string;
  date: string;
  type: 'holiday' | 'observance' | 'historical';
  description: string;
  significance?: string;
}

export interface AppSettings {
  theme: 'light' | 'dark' | 'auto';
  language: string;
  fontSize: 'small' | 'medium' | 'large';
  notifications: {
    enabled: boolean;
    prayerReminders: boolean;
    dailyReminders: boolean;
    islamicEvents: boolean;
  };
  privacy: {
    shareLocation: boolean;
    shareUsageData: boolean;
  };
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
}

export interface QuizResult {
  score: number;
  totalQuestions: number;
  timeSpent: number;
  answers: {
    questionId: string;
    selectedAnswer: number;
    isCorrect: boolean;
  }[];
}

export interface WordSearchGame {
  id: string;
  title: string;
  grid: string[][];
  words: {
    word: string;
    found: boolean;
    positions?: { row: number; col: number }[];
  }[];
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface FlipBookPage {
  id: string;
  content: string;
  imageUrl?: string;
  audioUrl?: string;
}

export interface FlipBook {
  id: string;
  title: string;
  description: string;
  pages: FlipBookPage[];
  category: string;
  ageGroup: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  points: number;
  unlockedAt?: string;
  progress?: {
    current: number;
    target: number;
  };
}

export interface UserProgress {
  totalPoints: number;
  level: number;
  achievements: Achievement[];
  streaks: {
    daily: number;
    prayer: number;
    reading: number;
  };
  activities: {
    quizzesCompleted: number;
    booksRead: number;
    prayersTracked: number;
    conversationsHad: number;
  };
}

// Sponsor and Admin types
export interface SponsorApplication {
  id: string;
  companyName: string;
  contactEmail: string;
  businessType: 'local' | 'online';
  businessCategory: string;
  linkType: 'visit' | 'call' | 'email';
  linkUrl: string;
  isGlobal: boolean;
  radiusKm?: number;
  detectedLat?: number;
  detectedLon?: number;
  tier: SponsorTier;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  reviewedAt?: string;
  reviewNotes?: string;
}

export interface ApprovedSponsor {
  id: string;
  companyName: string;
  contactEmail: string;
  linkType: 'visit' | 'call' | 'email';
  linkUrl: string;
  isGlobal: boolean;
  businessType: 'local' | 'online';
  businessCategory: string;
  tier: SponsorTier;
  radiusKm: number;
  detectedLat?: number;
  detectedLon?: number;
  status: 'approved';
  startDate: string;
  duration?: number; // Duration in days (alternative property name)
  durationDays: number;
  endDate: string;
  clickCount: number;
}

export type SponsorTier = 'Gold' | 'Silver' | 'Bronze';

export interface CardBackground {
  id: string;
  name: string;
  cost: number;
  type: 'css' | 'image';
  cssClass?: string;
  imageUrl?: string;
  tier: 'Common' | 'Uncommon' | 'Rare' | 'Epic' | 'Legendary';
  description: string;
  limit: number | null;
  unlockCount: number;
}

export interface BrandingAssets {
  id: string;
  name: string;
  cost: number;
  type: 'logo' | 'watermark' | 'border';
  imageUrl: string;
  formLogo?: string;
  tier: 'Common' | 'Uncommon' | 'Rare' | 'Epic' | 'Legendary';
  description: string;
  limit: number | null;
  unlockCount: number;
}

export interface CardBackgroundPack {
  id: string;
  name: string;
  cost: number;
  backgrounds: string[]; // Array of CardBackground IDs
  backgroundIds?: string[]; // Alternative property name for compatibility
  tier: 'Common' | 'Uncommon' | 'Rare' | 'Epic' | 'Legendary';
  description: string;
  limit: number | null;
  unlockCount: number;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Error types
export interface AppError {
  code: string;
  message: string;
  details?: any;
}

// Navigation types
export interface NavigationItem {
  id: string;
  label: string;
  icon: string;
  path: string;
  badge?: number;
}

// Theme types
export interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  border: string;
  success: string;
  warning: string;
  error: string;
}

export interface Theme {
  name: string;
  colors: ThemeColors;
  fonts: {
    primary: string;
    secondary: string;
    arabic: string;
  };
}

// Utility types
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';
export type Language = 'en' | 'ar' | 'es' | 'fr' | 'ur' | 'id';
export type Direction = 'ltr' | 'rtl';

// Component prop types
export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
}

export interface IconProps extends BaseComponentProps {
  size?: number;
  color?: string;
}

export interface ButtonProps extends BaseComponentProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
}

export interface ModalProps extends BaseComponentProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

// Form types
export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'select' | 'textarea' | 'checkbox';
  required?: boolean;
  placeholder?: string;
  options?: { value: string; label: string }[];
  validation?: {
    pattern?: RegExp;
    minLength?: number;
    maxLength?: number;
    custom?: (value: any) => string | null;
  };
}

export interface FormData {
  [key: string]: any;
}

export interface FormErrors {
  [key: string]: string;
}

// Analytics types
export interface AnalyticsEvent {
  name: string;
  properties?: Record<string, any>;
  timestamp: string;
}

export interface UserAnalytics {
  userId: string;
  sessionId: string;
  events: AnalyticsEvent[];
  metadata: {
    userAgent: string;
    platform: string;
    language: string;
    timezone: string;
  };
}

// Additional types needed by App.tsx
export interface UserData {
  id: string;
  name: string;
  email: string;
  age?: number;
  location?: {
    latitude: number;
    longitude: number;
    city?: string;
    country?: string;
  };
  preferredLanguage: string;
  preferredLanguageCode?: string;
  preferredLanguageName?: string;
  hikmahPoints?: number;
  preferences: {
    notifications: boolean;
    prayerReminders: boolean;
    theme: 'light' | 'dark' | 'auto';
    fontSize: 'small' | 'medium' | 'large';
  };
  createdAt: string;
  lastActiveAt: string;
}

export type MessageSender = 'user' | 'assistant';

export interface SponsorLink {
  id: string;
  companyName: string;
  linkType: 'visit' | 'call' | 'email';
  linkUrl: string;
  businessCategory: string;
  tier: SponsorTier;
}

export interface ManagedUrlConfig {
  id: string;
  name: string;
  url: string;
  isActive: boolean;
  priority: number;
}

export interface ChatSession {
  id: string;
  title: string;
  name?: string;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
  lastActivityAt?: string;
  isActive: boolean;
}

export interface UnlockedWisdomCard {
  id: string;
  title: string;
  content: string;
  category: string;
  backgroundId?: string;
  unlockedAt: string;
}

export interface InteractiveActivitySuggestion {
  type: 'quiz' | 'khitmah_reader' | 'flip_book_reader' | 'word_search' | 'hadith_explorer';
  topic: string;
  description: string;
  data?: any;
}

export interface QuizData {
  id: string;
  title: string;
  questions: QuizQuestion[];
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface UnlockedAchievementCard {
  id: string;
  title: string;
  description: string;
  icon: string;
  points: number;
  unlockedAt: string;
  category: string;
}

export interface InlineQuizState {
  isActive: boolean;
  currentQuestion: number;
  currentQuestionIndex?: number;
  questions: QuizQuestion[];
  answers: number[];
  userAnswers?: number[];
  score: number;
  isCompleted?: boolean;
}

export interface ReflectionCard {
  id: string;
  title: string;
  content: string;
  prompt?: string;
  date: string;
  category: string;
  tags: string[];
}

export interface KhitmahProgress {
  currentSurah: number;
  currentVerse: number;
  currentPage?: number;
  totalVersesRead: number;
  totalPagesRead?: number;
  startDate: string;
  startedAt?: string;
  targetDate?: string;
  dailyGoal: number;
  lastReadAt?: string;
}

export interface InlineKhitmahReaderState {
  isActive: boolean;
  currentSurah: number;
  currentVerse: number;
  verses: QuranVerse[];
}

export interface WordSearchData {
  id: string;
  title: string;
  grid: string[][];
  words: string[];
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface InlineWordSearchState {
  isActive: boolean;
  grid: string[][];
  words: { word: string; found: boolean; positions?: { row: number; col: number }[] }[];
  selectedCells: { row: number; col: number }[];
  foundWords?: string[];
  score?: number;
  isCompleted?: boolean;
}

export interface FlipBookData {
  id: string;
  title: string;
  description: string;
  pages: FlipBookPage[];
  category: string;
  ageGroup: string;
}

export interface InlineFlipBookState {
  isActive: boolean;
  currentPage: number;
  currentPageIndex?: number;
  book: FlipBook;
  isCompleted?: boolean;
}

export interface InlineHadithExplorerState {
  isActive: boolean;
  currentHadith: number;
  hadiths: Hadith[];
  bookmarks: string[];
}

export interface HadithProgress {
  totalRead: number;
  bookmarked: number;
  categories: Record<string, number>;
  lastReadDate: string;
  currentCollection?: string;
  currentHadithIndex?: number;
  totalHadithsRead?: number;
  startedAt?: string;
  lastReadAt?: string;
}

export interface AppSkin {
  id: string;
  name: string;
  colors: ThemeColors;
  backgroundImage?: string;
  isUnlocked: boolean;
}

export interface ThemeOverrides {
  primaryColor?: string;
  secondaryColor?: string;
  backgroundColor?: string;
  textColor?: string;
}

export interface BehaviorOverrides {
  autoSave: boolean;
  notifications: boolean;
  animations: boolean;
  soundEffects: boolean;
  pointsPerAiMessage?: number;
  pointsPerActivityCompletedBase?: number;
  pointsPerQuizCorrectAnswer?: number;
  pointsPerWordFound?: number;
  pointsPerReflectionGenerated?: number;
  pointsPerKhitmahPageRead?: number;
  pointsPerFlipbookPageTurned?: number;
  pointsPerHadithRead?: number;
}

export interface BookmarkedHadith {
  id?: string;
  hadithId: string;
  hadith: Hadith;
  bookmarkedAt: string;
  notes?: string;
}

export interface BookmarkedAyah {
  id?: string;
  surah: number;
  verse: number;
  ayah: QuranVerse;
  bookmarkedAt: string;
  notes?: string;
}

export interface AyahWithTranslation {
  surah: number;
  verse: number;
  arabic: string;
  translation: string;
  transliteration?: string;
  surahName: string;
}
