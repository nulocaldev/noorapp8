import { UserData, ChatMessage as AppChatMessage, MessageSender, QuizData, WordSearchData, FlipBookData } from './types';
import { AI_MODEL_NAME } from './constants';
import { GoogleGenAI, GenerateContentResponse } from '@google/genai';

// This service now communicates with our backend for chat, not Google's directly.
const getApiUrl = (): string => {
  const apiUrl = import.meta.env.VITE_API_URL;
  if (!apiUrl) {
    console.error("VITE_API_URL is not set in the environment.");
    // Fallback for local dev if not set, but better to set it.
    return "http://localhost:8080/api";
  }
  return apiUrl;
};

export const initializeChat = async (): Promise<void> => { 
  console.log("Frontend chat initialization is now managed via backend proxy.");
  return Promise.resolve();
};

const formatHistoryForProxy = (appMessages: AppChatMessage[]): {role: string, parts: {text: string}[]}[] => {
  const maxHistoryMessages = 20;
  const recentMessages = appMessages.length > maxHistoryMessages
    ? appMessages.slice(-maxHistoryMessages)
    : appMessages;

  const history: {role: string, parts: {text: string}[]}[] = [];
  for (const msg of recentMessages) {
    if (msg.sender === MessageSender.USER && msg.text.trim() !== '') {
      history.push({ role: 'user', parts: [{ text: msg.text }] });
    } else if (msg.sender === MessageSender.AI && msg.text.trim() !== '') {
      if (!msg.text.toLowerCase().includes("error processing your message") &&
          !msg.text.toLowerCase().includes("i'm not ready to chat yet")) {
        history.push({ role: 'model', parts: [{ text: msg.text }] });
      }
    }
  }
  return history;
};

export async function sendMessageToAI(
  userMessage: string,
  historyMessages: AppChatMessage[], 
  userData: UserData,
  systemPromptTemplate: string
): Promise<string> {
  const apiUrl = getApiUrl();
  const formattedHistory = formatHistoryForProxy(historyMessages);

  try {
    const response = await fetch(`${apiUrl}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userMessage,
        history: formattedHistory,
        userData,
        systemPromptTemplate,
      }),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to parse error response from backend.' }));
        console.error("Backend API Error:", errorData);
        throw new Error(errorData.error || `Request failed with status ${response.status}`);
    }

    const data = await response.json();
    return data.responseText;

  } catch (error) {
    console.error("Error sending message to backend proxy:", error);
    let detailMessage = "An unexpected error occurred while contacting the backend.";
    if (error instanceof Error) {
        detailMessage = error.message;
    }
    return `Sorry, I couldn't connect to the server right now. Please check your connection and try again. 😔 (Details: ${detailMessage})`;
  }
}

// NOTE: The functions below still call Google's API directly for activity generation.
let genAI_direct: GoogleGenAI | null = null;
const initializeDirectGeniAI = async () => {
    if (genAI_direct) return;
    const apiKey = import.meta.env.VITE_API_KEY;
    if(!apiKey) throw new Error("VITE_API_KEY is not set for direct AI calls.");
    genAI_direct = new GoogleGenAI({ apiKey });
}

export async function generateReflectionContent(prompt: string, userData: UserData): Promise<string> {
    await initializeDirectGeniAI();
    if (!genAI_direct) throw new Error("GoogleGenAI client not initialized.");
    const systemInstruction = `You are Noor App, an AI companion. Your tone is empathetic and insightful. The user's preferred language is ${userData.preferredLanguageCode}.`;

    try {
        const response: GenerateContentResponse = await genAI_direct.models.generateContent({
            model: AI_MODEL_NAME, contents: prompt, config: { systemInstruction },
        });
        return response.text;
    } catch (error) { console.error("Error generating reflection content:", error); throw error; }
}

export async function generateActivityContent(
  activityType: 'quiz' | 'word_search' | 'flip_book_reader' | 'hadith_explorer',
  topic: string,
  userData: UserData
): Promise<QuizData | WordSearchData | FlipBookData> {
    await initializeDirectGeniAI();
    if (!genAI_direct) throw new Error("GoogleGenAI client not initialized for activity generation.");

    let promptText = '';
    // (Same detailed prompt generation logic as before)
     if (activityType === 'quiz') {
    promptText = `Generate a 3-question multiple-choice quiz about "${topic}". Each question must have exactly 3 distinct options. Each question and each option can optionally include a publicly accessible 'image_url'. Ensure any provided image_url is a direct link to an image file. Clearly indicate the correct answer index (0, 1, or 2). The quiz must have an overall title. All text content MUST be in the language: ${userData.preferredLanguageCode}. Respond ONLY with a valid JSON object following this structure: { "title": "string", "questions": [ { "text": "string", "image_url"?: "string", "options": [ { "text": "string", "image_url"?: "string" }, { "text": "string", "image_url"?: "string" }, { "text": "string", "image_url"?: "string" } ], "correctAnswerIndex": number } ] }. Adhere strictly to JSON formatting rules.`;
  } else if (activityType === 'word_search') {
      promptText = `Generate a word search game about "${topic}". Create a 10x10 grid of letters. Provide a list of 5-8 relevant words to find. The words can be placed horizontally, vertically, or diagonally, in forward or reverse directions. **CRITICAL INSTRUCTION: The language for ALL text content (title, words, and grid letters) MUST be ${userData.preferredLanguageCode} (${userData.preferredLanguageName}).** Respond ONLY with a valid JSON object following this structure, with no trailing commas: { "title": "string", "grid": [["A", ...]], "words": ["string", ...], "solutions": [{"word": "string", "start": { "row": number, "col": number }, "direction": "string"}, ...] }. The 'solutions' array is CRITICAL. The grid letters must be uppercase.`;
  } else if (activityType === 'flip_book_reader') {
        promptText = `Generate content for a short, inspirational flip book about "${topic}". The book should contain 4 to 6 pages. Each page needs a title, content (paragraph), and source. All text content MUST be in the language: ${userData.preferredLanguageCode}. Respond ONLY with a valid JSON object: { "title": "string", "introduction": "string", "pages": [ { "title": "string", "content": "string", "source": "string" } ] }`;
    } else if (activityType === 'hadith_explorer') {
        promptText = `Generate a collection of 4 to 6 authentic Hadith about "${topic}". Each page needs a title, content (the Hadith), and source (including grade, e.g., Sahih al-Bukhari, Grade: Sahih). Include an introduction about Hadith authenticity. All text MUST be in ${userData.preferredLanguageCode}. Respond ONLY with a valid JSON object: { "title": "string", "introduction": "string", "pages": [ { "title": "string", "content": "string", "source": "string" } ] }`;
  } else {
    throw new Error(`Unsupported activity type: ${activityType}`);
  }

    try {
        const response = await genAI_direct.models.generateContent({
            model: AI_MODEL_NAME,
            contents: promptText,
            config: { responseMimeType: "application/json" },
        });
        const jsonStr = response.text.trim().replace(/^```(\w*)?\s*\n?(.*?)\n?\s*```$/s, '$2').trim();
        const cleanedJsonStr = jsonStr.replace(/,(?=\s*[}\]])/g, '');
        const parsedData = JSON.parse(cleanedJsonStr);
        // Basic validation can be done here before returning
        return parsedData;
    } catch (error) {
        console.error(`Error generating direct ${activityType} content:`, error);
        throw new Error(`Failed to generate activity content. The AI may have returned an invalid format. Details: ${error instanceof Error ? error.message : String(error)}`);
    }
}
