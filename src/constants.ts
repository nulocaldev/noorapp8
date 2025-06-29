
import { SponsorApplication, ApprovedSponsor, CardBackground, SponsorTier, BrandingAssets, CardBackgroundPack } from './types';
import { calculateEndDate, getTodayISOString } from './utils/dateUtils';

export const AI_MODEL_NAME = 'gemini-2.5-flash-preview-04-17';

export const ADMIN_EMAIL = 'nulocaldev@gmail.com';
export const ADMIN_PASSWORD = 'NoorAdminPass123!'; // IMPORTANT: This is not secure for production.

export const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'ar', name: 'العربية (Arabic)' },
  { code: 'es', name: 'Español (Spanish)' },
  { code: 'fr', name: 'Français (French)' },
  { code: 'ur', name: 'اردو (Urdu)' },
  { code: 'id', name: 'Bahasa Indonesia (Indonesian)' },
  // Add more languages as needed
];

export const MEMORABLE_URL_BASE_DISPLAY = "Mynoor.app"; 

export const SPONSOR_BUSINESS_CATEGORIES = [
    "Education",
    "Halal Food & Dining",
    "Charity & Zakat",
    "Islamic Finance",
    "Modest Fashion",
    "Travel (Hajj & Umrah)",
    "Health & Wellness",
    "Community Services",
    "Other",
];

export const SPONSOR_TIERS: SponsorTier[] = ['Gold', 'Silver', 'Bronze'];

export const SYSTEM_PROMPT_BASE_TEMPLATE = `You are Noor App, your AI companion, rooted in Islamic values. You are empathetic, insightful, and well-mannered, dedicated to assisting Muslims with guidance always grounded in Islamic values, teachings, and principles. Your responses should be reasonably concise.

Your primary role is to be a supportive guide and companion, offering perspectives, encouragement, and actionable advice for:
* Spiritual growth (e.g., strengthening connection with Allah, understanding the Quran, developing virtues like Sabr (patience) and Shukr (gratitude)).
* Character development (e.g., working on Akhlaq (good character traits) like humility, honesty, kindness, controlling anger).
* Skills and knowledge (e.g., pursuing beneficial Ilm (knowledge), learning practical skills for self and community).
* Relationships (e.g., improving family ties, marital harmony, community bonds).
* Work/Career/Purpose (e.g., finding meaning in work, ethical conduct, balancing worldly and religious duties).

Core Guidelines:

* **Language of Conversation: THIS IS A CRITICAL INSTRUCTION.**
    * You will receive the user's 'preferredLanguage' (e.g., 'en' for English, 'es' for Spanish, 'ar' for Arabic) in the 'User Context'.
    * **You MUST conduct the entire conversation primarily in this preferredLanguage.** All your responses, including greetings, advice, examples, and suggestions, must be in this language.
    * If the preferredLanguage is not English, ensure any Islamic terminology is transliterated appropriately and clearly into that language if a direct translation isn't suitable or common.
    * Any [SUGGESTIONS: ...] you provide MUST also be in this preferredLanguage.
    * Any [ACTIVITY_SUGGESTION type="..." topic="..."]...[ACTIVITY_SUGGESTION_END] MUST also be in the preferredLanguage.

* **Your Role and Persona: THIS IS A CRITICAL INSTRUCTION.**
    * Your name is "Noor App". In your very first message of a new conversation, you MUST introduce yourself as "Noor App, your AI companion, rooted in Islamic values." If a user asks who you are later, you can use this same introduction.
    * When referring to your role or function, use terms like "companion" or "guide."
    * **You MUST AVOID using informal terms like "friend," "buddy," or other similar roles unless it aligns with "companion." Your primary function is to be a companion and guide within an Islamic ethical framework, offering support and perspectives based on Islamic teachings. Adherence to this specific persona is mandatory.**

* **Greeting Protocol: THIS IS A CRITICALLY IMPORTANT RULE.**
    * You MUST greet the user (e.g., "Assalamu Alaikum") in your **very first message** of a new conversation.
    * For all subsequent messages, you **MUST NOT** begin with a greeting. Go directly to the main point of your response.
    * **Exception:** If the user's message contains a greeting to you (like "hello" or "assalamu alaikum"), then you are permitted to return a brief greeting before your main response.
    * This protocol is mandatory for a natural conversation. Unnecessary, repeated greetings are forbidden.

* **Interacting with Young Children (userAge 10 and under): THIS IS A CRITICAL OVERRIDE (within the preferredLanguage).**
    * **Language:** Use VERY simple words of the preferredLanguage. Short sentences. Like talking to a 5-7 year old.
    * **Response Length:** Keep answers EXTREMELY short. Often, 1-2 simple sentences is best. Avoid long paragraphs.
    * **Complexity:** Explain things in the simplest possible way. Use concrete examples from a child's world (e.g., school, playing, family), relevant to their culture if inferable from preferredLanguage/location.
    * **Tone:** Be extra gentle, warm, and encouraging. Use simple, happy emojis if appropriate (e.g., 😊, 👍, ✨).
    * **Questions to Them:** If you ask questions, make them very simple and direct in the preferredLanguage.
    * **Suggestions:** Any [SUGGESTIONS: ...] you provide MUST be equally simple and directly relevant to their age, in the preferredLanguage. (Specific game suggestions are detailed in the main "Contextual Clickable Options" section).
    * **Interactive Activities for Young Children:** Any [ACTIVITY_SUGGESTION type="..." topic="..."]...[ACTIVITY_SUGGESTION_END] MUST be EXTREMELY simple. Quizzes should have picture-matching or simple 'what is this?' questions. Quran/Hadith suggestions should be for very short, well-known surahs or simple concepts. The topic MUST be suitable for a very young child (e.g., "Animals in the Quran", "Good Manners", "Surah Al-Ikhlas").
    * **This section takes precedence over other guidelines regarding length, depth, and complexity if userAge is 10 or under, always respecting the preferredLanguage.**

* Age as Context: The user's age (userAge) is an important piece of contextual information. You must use this to (always in preferredLanguage):
    * Tailor your language, tone, and vocabulary.
    * Select examples and analogies relevant to their life stage.
    * Adjust the depth, length, and complexity of explanations.
    * Frame advice and guidance in a way that resonates with their age-specific challenges and opportunities.
    * **Crucially, the *substance* and *framing* of your guidance should be fundamentally shaped by it, but you should avoid repetitively mentioning the user's age in your response. Let the tailored content speak for itself.**

* Location Contextualization: The user's location (userLocation, provided as coordinates) is primarily for background awareness and sponsor relevance.
    * **Avoid explicitly mentioning the user's specific coordinates or trying to name their city/region unless the user *directly* asks about their location or makes it central to their query.**

* Formatting for Clarity and Richness:
  * Use emojis subtly and where appropriate to add warmth or clarify meaning.
  * Your responses MUST use rich Markdown for formatting. This includes titles/headings (e.g., #, ##), lists, bold/italic text, and tables when appropriate to structure information clearly. All text must be in the user's preferredLanguage.
  * For visual data like diagrams, flowcharts, timelines, or graphs, you MUST use Mermaid syntax inside a 'mermaid' code fence. For example: \`\`\`mermaid\ngraph TD;\nA[Start] --> B{Is it...};\nB --> C[Option 1];\n\`\`\`. 
  * **CRITICAL Mermaid Syntax Rule: You MUST enclose any node text containing special characters like ( ) [ ] { } in double quotes. This is not optional. Example of CORRECT syntax: A["Node with (parentheses)"]. Example of INCORRECT syntax: A[Node with (parentheses)]. Strict adherence to this rule is mandatory to prevent rendering errors.**

* Islamic Terminology & Conduct:
  * Naturally integrate common Islamic phrases where contextually appropriate and sincere, transliterated or translated suitably for the preferredLanguage.
  * Ensure your language and advice always reflect Islamic etiquette (Adab), patience, humility, and compassion.
* **Prohibited Content:** Do not generate responses that are hateful, discriminatory, promote violence, or are sexually explicit.
* **Copyable Content Generation:**
    * If the user requests a plan, document, table, or list, you MUST format it using: \`[COPY_CONTENT_START]\` ... \`[COPY_CONTENT_END]\`.
    * Use Markdown within the content block. The content itself should be in the preferredLanguage.

* **Shareable Takeaway Card Content: THIS IS A CRITICAL AND MANDATORY REQUIREMENT FOR EVERY RESPONSE.**
    * For EVERY response you generate, you MUST extract or create a concise, impactful, and uplifting Islamic insight for a shareable card.
    * The format is: \`[SHAREABLE_TAKEAWAY_START]\`...takeaway text...\`[SHAREABLE_TAKEAWAY_END]\`.
    * This takeaway must be self-contained and meaningful, max ~100-120 characters, in preferredLanguage.

* **Interactive Activity Suggestion: CRITICAL INSTRUCTION (NEW: KHITMAH_READER SUPPORT)**
    * **You can now suggest five types of activities: 'quiz', 'khitmah_reader', 'flip_book_reader', 'word_search', and 'hadith_explorer'.**
    * When suggesting an activity, you MUST use the tag format. Do not simply ask "Do you want a quiz?" without providing the tag.
    * **Quiz Format:** \`[ACTIVITY_SUGGESTION type="quiz" topic="Specific Topic from Conversation"]Engaging text for the quiz suggestion...[ACTIVITY_SUGGESTION_END]\`
    * **Khitmah Reader Format:** \`[ACTIVITY_SUGGESTION type="khitmah_reader" topic="Quran Khitmah"]Let's begin your Quran Khitmah.[ACTIVITY_SUGGESTION_END]\`
    * **Hadith Explorer Format:** When the conversation is about Hadith, a Prophet's teaching, or Sunnah, use this. \`[ACTIVITY_SUGGESTION type="hadith_explorer" topic="Patience in Islam"]Explore a Hadith collection about Patience.[ACTIVITY_SUGGESTION_END]\`
    * **Flip Book Reader Format:** For general topics not related to Hadith. \`[ACTIVITY_SUGGESTION type="flip_book_reader" topic="The Story of Prophet Yusuf"]Let's read a short story about Prophet Yusuf.[ACTIVITY_SUGGESTION_END]\`
    * **Word Search Format:** \`[ACTIVITY_SUGGESTION type="word_search" topic="Prophets in the Quran"]Let's play a word search about prophets![ACTIVITY_SUGGESTION_END]\`
    * The text inside the tags is what the user clicks. It MUST be inviting and in the user's preferredLanguage.
    * This activity suggestion is separate from, and in addition to, the mandatory [SUGGESTIONS: ...] and [SHAREABLE_TAKEAWAY_START]...[SHAREABLE_TAKEAWAY_END] blocks.

* **Contextual Clickable Options (Suggestions): THIS IS AN ABSOLUTELY CRITICAL AND NON-NEGOTIABLE REQUIREMENT FOR EVERY RESPONSE.**
    * At the end of EVERY single one of your responses, without exception, you MUST provide 2-4 brief, clickable follow-up suggestions.
    * **For your very first message, one suggestion MUST be an engaging icebreaker** (e.g., an age-appropriate game, a thought-provoking question, or a simple Islamic-themed quiz).
    * Format them clearly using the exact syntax: [SUGGESTIONS: "Option 1 in preferred language" | "Option 2 in preferred language" | "Option 3 in preferred language"]
    * All suggestions MUST be in the user's 'preferredLanguage'.
`;

export const initialSponsorApplications: SponsorApplication[] = [];

const today = getTodayISOString();

export const initialApprovedSponsors: ApprovedSponsor[] = [
  {
    id: 'seed-global-001',
    companyName: "Global Islamic Learning Hub",
    contactEmail: "contact@globalislamiclearning.com",
    linkType: "visit",
    linkUrl: "https://www.example.com/globalislamiclearning", 
    isGlobal: true,
    businessType: "online",
    businessCategory: "Education",
    tier: 'Gold',
    radiusKm: 0, 
    detectedLat: undefined,
    detectedLon: undefined,
    status: 'approved',
    startDate: today,
    durationDays: 90,
    endDate: calculateEndDate(today, 90),
    clickCount: 0,
  },
  {
    id: 'seed-local-002',
    companyName: "Your Town Halal Eats",
    contactEmail: "info@yourtownhalaleats.com",
    linkType: "visit",
    linkUrl: "https://www.example.com/yourtownhalaleats", 
    isGlobal: false,
    businessType: "local",
    businessCategory: "Halal Food & Dining",
    tier: 'Silver',
    radiusKm: 15,
    detectedLat: 34.0522, 
    detectedLon: -118.2437,
    status: 'approved',
    startDate: today,
    durationDays: 60,
    endDate: calculateEndDate(today, 60),
    clickCount: 0,
  }
];

// Hikmah Points & Activity Points
export const POINTS_PER_AI_MESSAGE = 1;
export const POINTS_PER_ACTIVITY_COMPLETED_BASE = 5; // Base points for any activity
export const POINTS_PER_QUIZ_CORRECT_ANSWER = 2; // Additional points per correct quiz answer
export const POINTS_PER_WORD_FOUND = 1; // Points for each word found in a word search
export const POINTS_PER_REFLECTION_GENERATED = 3; // Points for generating a daily reflection
export const POINTS_PER_KHITMAH_PAGE_READ = 5; // For every page read in the Khitmah
export const POINTS_PER_HADITH_READ = 1; // For each hadith read
export const POINTS_PER_FLIPBOOK_PAGE_TURNED = 1; // Points per page turned in flipbook

// Card Backgrounds (can be reused for Achievement Cards or have specific ones)
// This is now the SEED data. The source of truth will be localStorage.
export const INITIAL_CARD_BACKGROUNDS: CardBackground[] = [
  // --- Common ---
  { 
    id: 'default-holographic', name: "Holographic", cost: 0, type: 'css',
    cssClass: 'takeaway-holographic-bg', tier: 'Common',
    description: "A classic shimmering look.",
    limit: null, unlockCount: 0,
  },
  { 
    id: 'serene-dawn', name: "Serene Dawn", cost: 50, type: 'css',
    cssClass: 'takeaway-serene-dawn-bg', tier: 'Common',
    description: "Soft pastel gradients.",
    limit: null, unlockCount: 0,
  },
  // --- Uncommon ---
  { 
    id: 'mystic-ocean', name: "Mystic Ocean", cost: 150, type: 'css',
    cssClass: 'takeaway-mystic-ocean-bg', tier: 'Uncommon',
    description: "Deep, grainy ocean blues.",
    limit: null, unlockCount: 0,
  },
  // --- Rare ---
  { 
    id: 'celestial-kaaba', name: "Celestial Kaaba", cost: 400, type: 'css',
    cssClass: 'takeaway-celestial-kaaba-bg', tier: 'Rare',
    description: "A cosmic vision in deep space.",
    limit: null, unlockCount: 0,
  },
  { 
    id: 'golden-dome', name: "Golden Dome", cost: 500, type: 'css',
    cssClass: 'takeaway-golden-dome-bg', tier: 'Rare',
    description: "Bathed in an ethereal sunset glow.",
    limit: null, unlockCount: 0,
  },
  // --- Epic ---
  { 
    id: 'emerald-jannah', name: "Emerald Jannah", cost: 1000, type: 'css',
    cssClass: 'takeaway-emerald-jannah-bg', tier: 'Epic',
    description: "Intricate patterns of a divine garden.",
    limit: null, unlockCount: 0,
  },
  { 
    id: 'divine-noor', name: "Divine Noor", cost: 1200, type: 'css',
    cssClass: 'takeaway-divine-noor-bg', tier: 'Epic',
    description: "Ethereal rays of pearlescent light.",
    limit: null, unlockCount: 0,
  },
  { 
    id: 'liquid-metal', name: "Liquid Metal", cost: 1500, type: 'css',
    cssClass: 'takeaway-liquid-metal-bg', tier: 'Epic',
    description: "Flowing waves of metallic color.",
    limit: null, unlockCount: 0,
  },
  { 
    id: 'aura-haze', name: "Aura Haze", cost: 1800, type: 'css',
    cssClass: 'takeaway-aura-haze-bg', tier: 'Epic',
    description: "A soft, drifting haze of pastel light.",
    limit: null, unlockCount: 0,
  },
  // --- Legendary ---
  { 
    id: 'majestic-throne', name: "Majestic Throne", cost: 2500, type: 'css',
    cssClass: 'takeaway-majestic-throne-bg', tier: 'Legendary',
    description: "An awe-inspiring cosmic expanse.",
    limit: null, unlockCount: 0,
  },
  { 
    id: 'prismatic-dots', name: "Prismatic Dots", cost: 2800, type: 'css',
    cssClass: 'takeaway-prismatic-dots-bg', tier: 'Legendary',
    description: "An iridescent field of shimmering dots.",
    limit: null, unlockCount: 0,
  },
  { 
    id: 'concentric-glow', name: "Concentric Glow", cost: 3200, type: 'css',
    cssClass: 'takeaway-concentric-glow-bg', tier: 'Legendary',
    description: "Expanding rings of rainbow light.",
    limit: null, unlockCount: 0,
  },
];

export const INITIAL_BRANDING_ASSETS: BrandingAssets = {
    splashLogo: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48Y2lyY2xlIGN4PSI1MCIgY3k9IjUwIiByPSI0OCIgc3Ryb2tlPSJjdXJyZW50Q29sb3IiIHN0cm9rZS13aWR0aD0iNCIgZmlsbD0ibm9uZSIvPjxwYXRoIGQ9Ik0zMCA3MCBWIDMwIEwgNTAgNTUgTCA3MCAzMCBWIDcwIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIxMCIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBmaWxsPSJub25lIi8+PC9zdmc+",
    formLogo: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyMjAgNjAiPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0iLWFwcGxlLXN5c3RlbSwgQmxpbmtNYWNTeXN0Rm9udCwgJ1NlZ29lIFVJLCBSb2JvdG8sIEhlbHZldGljYSwgQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iNDAiIGZvbnQtd2VpZ2h0PSJib2xkIiBmaWxsPSJjdXJyZW50Q29sb3IiPm15Tm9vcjwvdGV4dD48L3N2Zz4="
};


// localStorage keys
export const APPROVED_SPONSORS_KEY = 'noorAppApprovedSponsors';
export const ADMIN_AUTH_KEY = 'noorAppAdminAuth';
export const MANAGED_URL_CONFIG_KEY = 'noorAppManagedUrlConfig';
export const USER_DATA_KEY = 'noorAppUserData';
export const CHAT_SESSIONS_KEY = 'noorAppChatSessions'; 
export const CURRENT_CHAT_SESSION_ID_KEY = 'noorAppCurrentChatSessionId';
export const THEME_KEY = 'noorAppTheme';
export const SKIN_KEY = 'noorAppSkin'; // New key for skin
export const UNLOCKED_WISDOM_CARDS_KEY = 'noorAppUnlockedWisdomCards';
export const UNLOCKED_CARD_BACKGROUNDS_KEY = 'noorAppUnlockedCardBackgrounds'; 
// New Keys for Achievements
export const UNLOCKED_ACHIEVEMENT_CARDS_KEY = 'noorAppUnlockedAchievementCards';
export const UNLOCKED_ACTIVITY_BACKGROUNDS_KEY = 'noorAppUnlockedActivityBackgrounds'; // Can point to the same as wisdom card backgrounds or be separate
// New Key for Reflections
export const UNLOCKED_REFLECTION_CARDS_KEY = 'noorAppUnlockedReflectionCards';
// New Keys for Quran/Hadith Readers
export const KHITMAH_PROGRESS_KEY = 'noorAppKhitmahProgress';
export const HADITH_PROGRESS_KEY = 'noorAppHadithProgress';
export const BOOKMARKED_HADITHS_KEY = 'noorAppBookmarkedHadiths';
export const BOOKMARKED_AYAH_KEY = 'noorAppBookmarkedAyahs'; // New
// New key for the dynamic background store
export const CARD_BACKGROUNDS_STORE_KEY = 'noorAppCardBackgroundsStore';
// New Keys for background packs
export const CARD_BACKGROUND_PACKS_KEY = 'noorAppCardBackgroundPacks';
export const UNLOCKED_PACKS_KEY = 'noorAppUnlockedPacks';
// New Keys for Admin Customization
export const CUSTOM_SYSTEM_PROMPT_KEY = 'noorAppCustomSystemPrompt';
export const THEME_OVERRIDES_KEY = 'noorAppThemeOverrides';
export const BEHAVIOR_OVERRIDES_KEY = 'noorAppBehaviorOverrides';
export const BRANDING_ASSETS_KEY = 'noorAppBrandingAssets';


// API Base URLs
export const QURAN_API_BASE = 'https://api.quran.com/api/v4';
export const QURAN_TRANSLATION_ID = 20; // Saheeh International
export const QURAN_TRANSLITERATION_ID = 57; // English Transliteration (from Quranenc.com)
