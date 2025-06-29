// Constants for the MyNoor app

export const APP_CONFIG = {
  name: 'MyNoor',
  version: '1.0.0',
  description: 'Islamic AI Companion',
  defaultLanguage: 'en',
  supportedLanguages: ['en', 'ar', 'es', 'fr', 'ur', 'id'],
};

export const API_ENDPOINTS = {
  gemini: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent',
  prayerTimes: 'https://api.aladhan.com/v1/timings',
  quran: 'https://api.quran.com/api/v4',
  hadith: 'https://api.hadith.gading.dev',
};

export const STORAGE_KEYS = {
  userData: 'mynoor_user_data',
  chatSessions: 'mynoor_chat_sessions',
  preferences: 'mynoor_preferences',
  achievements: 'mynoor_achievements',
  bookmarks: 'mynoor_bookmarks',
  geminiApiKey: 'mynoor_gemini_api_key',
};

export const PRAYER_NAMES = {
  en: ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'],
  ar: ['الفجر', 'الظهر', 'العصر', 'المغرب', 'العشاء'],
};

export const THEMES = {
  light: {
    primary: '#2563eb',
    secondary: '#64748b',
    accent: '#059669',
    background: '#ffffff',
    surface: '#f8fafc',
    text: '#1e293b',
    textSecondary: '#64748b',
    border: '#e2e8f0',
    success: '#059669',
    warning: '#d97706',
    error: '#dc2626',
  },
  dark: {
    primary: '#3b82f6',
    secondary: '#94a3b8',
    accent: '#10b981',
    background: '#0f172a',
    surface: '#1e293b',
    text: '#f1f5f9',
    textSecondary: '#94a3b8',
    border: '#334155',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
  },
};

export const QUIZ_CATEGORIES = [
  'Quran',
  'Hadith',
  'Islamic History',
  'Fiqh',
  'Aqeedah',
  'Seerah',
  'General Knowledge',
];

export const HADITH_COLLECTIONS = [
  'sahih-bukhari',
  'sahih-muslim',
  'sunan-abudawud',
  'jami-tirmidhi',
  'sunan-nasai',
  'sunan-ibnmajah',
];

export const ACHIEVEMENT_TYPES = {
  FIRST_CHAT: 'first_chat',
  DAILY_STREAK: 'daily_streak',
  QUIZ_MASTER: 'quiz_master',
  BOOK_READER: 'book_reader',
  PRAYER_TRACKER: 'prayer_tracker',
  WISDOM_COLLECTOR: 'wisdom_collector',
};

export const SPONSOR_TIERS = {
  GOLD: { name: 'Gold', priority: 1, color: '#ffd700' },
  SILVER: { name: 'Silver', priority: 2, color: '#c0c0c0' },
  BRONZE: { name: 'Bronze', priority: 3, color: '#cd7f32' },
};

export const DEFAULT_SETTINGS = {
  theme: 'auto' as const,
  language: 'en' as const,
  fontSize: 'medium' as const,
  notifications: {
    enabled: true,
    prayerReminders: true,
    dailyReminders: true,
    islamicEvents: true,
  },
  privacy: {
    shareLocation: false,
    shareUsageData: false,
  },
};

export const CARD_TIERS = {
  COMMON: { name: 'Common', color: '#6b7280', rarity: 1 },
  UNCOMMON: { name: 'Uncommon', color: '#059669', rarity: 2 },
  RARE: { name: 'Rare', color: '#2563eb', rarity: 3 },
  EPIC: { name: 'Epic', color: '#7c3aed', rarity: 4 },
  LEGENDARY: { name: 'Legendary', color: '#dc2626', rarity: 5 },
};

export const ACTIVITY_TYPES = {
  QUIZ: 'quiz',
  KHITMAH_READER: 'khitmah_reader',
  FLIP_BOOK_READER: 'flip_book_reader',
  WORD_SEARCH: 'word_search',
  HADITH_EXPLORER: 'hadith_explorer',
} as const;

export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network connection error. Please check your internet connection.',
  API_ERROR: 'Service temporarily unavailable. Please try again later.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  PERMISSION_ERROR: 'Permission denied. Please check your credentials.',
  NOT_FOUND: 'The requested resource was not found.',
  GENERIC_ERROR: 'An unexpected error occurred. Please try again.',
};

export const SUCCESS_MESSAGES = {
  DATA_SAVED: 'Data saved successfully!',
  PROFILE_UPDATED: 'Profile updated successfully!',
  ACHIEVEMENT_UNLOCKED: 'Achievement unlocked!',
  BOOKMARK_ADDED: 'Bookmark added successfully!',
  QUIZ_COMPLETED: 'Quiz completed successfully!',
};

// Admin credentials (in production, these should be environment variables)
export const ADMIN_EMAIL = 'admin@mynoor.app';
export const ADMIN_PASSWORD = 'admin123';

// Languages configuration
export const LANGUAGES = {
  en: { name: 'English', nativeName: 'English', rtl: false },
  ar: { name: 'Arabic', nativeName: 'العربية', rtl: true },
  es: { name: 'Spanish', nativeName: 'Español', rtl: false },
  fr: { name: 'French', nativeName: 'Français', rtl: false },
  ur: { name: 'Urdu', nativeName: 'اردو', rtl: true },
  id: { name: 'Indonesian', nativeName: 'Bahasa Indonesia', rtl: false },
};

// Storage keys for localStorage
export const APPROVED_SPONSORS_KEY = 'mynoor_approved_sponsors';
export const ADMIN_AUTH_KEY = 'mynoor_admin_auth';
export const MANAGED_URL_CONFIG_KEY = 'mynoor_managed_urls';
export const USER_DATA_KEY = 'mynoor_user_data';
export const CHAT_SESSIONS_KEY = 'mynoor_chat_sessions';
export const CURRENT_CHAT_SESSION_ID_KEY = 'mynoor_current_session';
export const THEME_KEY = 'mynoor_theme';
export const SKIN_KEY = 'mynoor_skin';
export const UNLOCKED_WISDOM_CARDS_KEY = 'mynoor_wisdom_cards';
export const UNLOCKED_CARD_BACKGROUNDS_KEY = 'mynoor_card_backgrounds';
export const UNLOCKED_ACHIEVEMENT_CARDS_KEY = 'mynoor_achievements';
export const UNLOCKED_ACTIVITY_BACKGROUNDS_KEY = 'mynoor_activity_backgrounds';
export const UNLOCKED_REFLECTION_CARDS_KEY = 'mynoor_reflections';
export const KHITMAH_PROGRESS_KEY = 'mynoor_khitmah_progress';
export const CARD_BACKGROUNDS_STORE_KEY = 'mynoor_bg_store';
export const CARD_BACKGROUND_PACKS_KEY = 'mynoor_bg_packs';
export const UNLOCKED_PACKS_KEY = 'mynoor_unlocked_packs';
export const HADITH_PROGRESS_KEY = 'mynoor_hadith_progress';
export const THEME_OVERRIDES_KEY = 'mynoor_theme_overrides';
export const BEHAVIOR_OVERRIDES_KEY = 'mynoor_behavior_overrides';
export const CUSTOM_SYSTEM_PROMPT_KEY = 'mynoor_custom_prompt';
export const BOOKMARKED_HADITHS_KEY = 'mynoor_bookmarked_hadiths';
export const BOOKMARKED_AYAH_KEY = 'mynoor_bookmarked_ayahs';
export const BRANDING_ASSETS_KEY = 'mynoor_branding_assets';

// Points system
export const POINTS_PER_AI_MESSAGE = 10;
export const POINTS_PER_ACTIVITY_COMPLETED_BASE = 50;
export const POINTS_PER_QUIZ_CORRECT_ANSWER = 20;
export const POINTS_PER_WORD_FOUND = 15;
export const POINTS_PER_REFLECTION_GENERATED = 25;
export const POINTS_PER_KHITMAH_PAGE_READ = 30;
export const POINTS_PER_FLIPBOOK_PAGE_TURNED = 10;
export const POINTS_PER_HADITH_READ = 20;

// System prompt template
export const SYSTEM_PROMPT_BASE_TEMPLATE = `You are a knowledgeable and compassionate Islamic AI assistant. 
Provide helpful, accurate, and respectful guidance based on Islamic teachings. 
Always cite sources when possible and encourage further learning.
Be mindful of different schools of thought and present balanced perspectives.
Respond in a warm, supportive manner that reflects Islamic values of kindness and wisdom.`;

// Initial data
export const INITIAL_CARD_BACKGROUNDS = [
  {
    id: 'default',
    name: 'Default',
    cost: 0,
    type: 'css' as const,
    cssClass: 'bg-gradient-to-br from-blue-500 to-purple-600',
    tier: 'Common' as const,
    description: 'Default gradient background',
    limit: null,
    unlockCount: 0,
  },
  {
    id: 'green',
    name: 'Islamic Green',
    cost: 100,
    type: 'css' as const,
    cssClass: 'bg-gradient-to-br from-green-500 to-emerald-600',
    tier: 'Common' as const,
    description: 'Traditional Islamic green',
    limit: null,
    unlockCount: 0,
  },
];

export const INITIAL_BRANDING_ASSETS = [
  {
    id: 'default_logo',
    name: 'MyNoor Logo',
    cost: 0,
    type: 'logo' as const,
    imageUrl: '/logo.png',
    formLogo: '/logo-form.png',
    tier: 'Common' as const,
    description: 'Default MyNoor logo',
    limit: null,
    unlockCount: 0,
  },
];

export const initialApprovedSponsors = [
  {
    id: 'sponsor1',
    companyName: 'Islamic Bookstore',
    contactEmail: 'contact@islamicbooks.com',
    linkType: 'visit' as const,
    linkUrl: 'https://islamicbooks.com',
    isGlobal: true,
    businessType: 'online' as const,
    businessCategory: 'Books & Education',
    tier: 'Gold' as const,
    radiusKm: 0,
    status: 'approved' as const,
    startDate: new Date().toISOString(),
    duration: 30,
    durationDays: 30,
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    clickCount: 0,
  },
];
