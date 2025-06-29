import { GoogleGenerativeAI } from '@google/generative-ai';

// Types for Gemini API
interface GeminiConfig {
  apiKey: string;
  model: string;
}

interface ChatContext {
  userAge?: number;
  userLocation?: {
    latitude: number;
    longitude: number;
  };
  preferredLanguage: string;
  conversationHistory?: Array<{
    role: 'user' | 'model';
    parts: Array<{ text: string }>;
  }>;
}

interface GeminiResponse {
  content: string;
  suggestions?: string[];
  shareableContent?: string;
  activitySuggestion?: {
    type: string;
    topic: string;
    description: string;
  };
}

class GeminiService {
  private genAI: GoogleGenerativeAI | null = null;
  private model: any = null;
  private isInitialized = false;

  constructor() {
    this.initialize();
  }

  private async initialize() {
    try {
      // Get API key from environment or localStorage
      const apiKey = this.getApiKey();
      
      if (!apiKey) {
        console.warn('Gemini API key not found. AI features will be limited.');
        return;
      }

      this.genAI = new GoogleGenerativeAI(apiKey);
      this.model = this.genAI.getGenerativeModel({ 
        model: 'gemini-1.5-flash',
        generationConfig: {
          temperature: 0.7,
          topP: 0.8,
          topK: 40,
          maxOutputTokens: 2048,
        },
      });
      
      this.isInitialized = true;
      console.log('Gemini AI service initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Gemini AI service:', error);
    }
  }

  private getApiKey(): string | null {
    // Try to get from environment variables first
    if (typeof process !== 'undefined' && process.env) {
      const envKey = process.env.REACT_APP_GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
      if (envKey) return envKey;
    }

    // Fallback to localStorage for development
    try {
      return localStorage.getItem('gemini_api_key');
    } catch {
      return null;
    }
  }

  public setApiKey(apiKey: string): void {
    try {
      localStorage.setItem('gemini_api_key', apiKey);
      this.initialize(); // Re-initialize with new key
    } catch (error) {
      console.error('Failed to save API key:', error);
    }
  }

  public isReady(): boolean {
    return this.isInitialized && this.model !== null;
  }

  private buildSystemPrompt(context: ChatContext): string {
    const { userAge, preferredLanguage = 'en' } = context;
    
    let systemPrompt = `You are Noor App, an AI companion rooted in Islamic values. You are empathetic, insightful, and well-mannered, dedicated to assisting Muslims with guidance always grounded in Islamic values, teachings, and principles.

IMPORTANT INSTRUCTIONS:
1. Respond in ${preferredLanguage === 'en' ? 'English' : this.getLanguageName(preferredLanguage)}
2. Always include [SUGGESTIONS: "suggestion1" | "suggestion2" | "suggestion3"] at the end
3. Include [SHAREABLE_TAKEAWAY_START]inspirational Islamic insight[SHAREABLE_TAKEAWAY_END]
4. Be respectful, helpful, and grounded in Islamic teachings
`;

    if (userAge && userAge <= 10) {
      systemPrompt += `
5. SPECIAL: User is ${userAge} years old - use VERY simple language, short sentences, and child-friendly examples.`;
    }

    return systemPrompt;
  }

  private getLanguageName(code: string): string {
    const languages: Record<string, string> = {
      'ar': 'Arabic',
      'es': 'Spanish', 
      'fr': 'French',
      'ur': 'Urdu',
      'id': 'Indonesian'
    };
    return languages[code] || 'English';
  }

  public async sendMessage(
    message: string, 
    context: ChatContext = { preferredLanguage: 'en' }
  ): Promise<GeminiResponse> {
    if (!this.isReady()) {
      return {
        content: "I'm sorry, but I'm not properly configured right now. Please check that the AI service is set up correctly.",
        suggestions: ["Try again later", "Check settings", "Contact support"]
      };
    }

    try {
      const systemPrompt = this.buildSystemPrompt(context);
      const fullPrompt = `${systemPrompt}\n\nUser: ${message}`;

      const result = await this.model.generateContent(fullPrompt);
      const response = await result.response;
      const text = response.text();

      return this.parseResponse(text);
    } catch (error) {
      console.error('Error sending message to Gemini:', error);
      return {
        content: "I apologize, but I'm having trouble responding right now. Please try again in a moment.",
        suggestions: ["Try again", "Rephrase question", "Check connection"]
      };
    }
  }

  private parseResponse(text: string): GeminiResponse {
    let content = text;
    let suggestions: string[] = [];
    let shareableContent: string | undefined;
    let activitySuggestion: any;

    // Extract suggestions
    const suggestionsMatch = text.match(/\[SUGGESTIONS:\s*([^\]]+)\]/);
    if (suggestionsMatch) {
      const suggestionsText = suggestionsMatch[1];
      suggestions = suggestionsText
        .split('|')
        .map(s => s.trim().replace(/"/g, ''))
        .filter(s => s.length > 0);
      content = content.replace(suggestionsMatch[0], '').trim();
    }

    // Extract shareable content
    const shareableMatch = text.match(/\[SHAREABLE_TAKEAWAY_START\]([^\[]+)\[SHAREABLE_TAKEAWAY_END\]/);
    if (shareableMatch) {
      shareableContent = shareableMatch[1].trim();
      content = content.replace(shareableMatch[0], '').trim();
    }

    // Extract activity suggestion
    const activityMatch = text.match(/\[ACTIVITY_SUGGESTION\s+type="([^"]+)"\s+topic="([^"]+)"\]([^\[]+)\[ACTIVITY_SUGGESTION_END\]/);
    if (activityMatch) {
      activitySuggestion = {
        type: activityMatch[1],
        topic: activityMatch[2],
        description: activityMatch[3].trim()
      };
      content = content.replace(activityMatch[0], '').trim();
    }

    return {
      content,
      suggestions: suggestions.length > 0 ? suggestions : ['Tell me more', 'Ask another question', 'Get daily inspiration'],
      shareableContent,
      activitySuggestion
    };
  }

  public async generateQuizQuestions(
    topic: string, 
    difficulty: 'easy' | 'medium' | 'hard' = 'medium',
    count: number = 5
  ): Promise<any[]> {
    if (!this.isReady()) {
      return [];
    }

    try {
      const prompt = `Generate ${count} Islamic quiz questions about "${topic}" with ${difficulty} difficulty. 
      Format as JSON array with: question, options (4 choices), correctAnswer (0-3), explanation.
      Make questions educational and respectful.`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      // Try to parse JSON from response
      const jsonMatch = text.match(/\[.*\]/s);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      return [];
    } catch (error) {
      console.error('Error generating quiz questions:', error);
      return [];
    }
  }

  public async generateDailyReflection(language: string = 'en'): Promise<string> {
    if (!this.isReady()) {
      return "Take a moment today to remember Allah and be grateful for His blessings.";
    }

    try {
      const prompt = `Generate a brief, inspiring daily Islamic reflection in ${language}. 
      Keep it under 100 words, focusing on gratitude, patience, or spiritual growth.`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text().trim();
    } catch (error) {
      console.error('Error generating daily reflection:', error);
      return "May Allah guide us and grant us peace in our hearts today.";
    }
  }

  public async generateReflection(topic?: string, language: string = 'en'): Promise<string> {
    if (!this.isReady()) {
      return "Reflect on Allah's mercy and guidance in your daily life.";
    }

    try {
      const topicPrompt = topic ? ` about ${topic}` : '';
      const prompt = `Generate a thoughtful Islamic reflection${topicPrompt} in ${language}. 
      Keep it meaningful and under 150 words, focusing on spiritual growth and Islamic values.`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text().trim();
    } catch (error) {
      console.error('Error generating reflection:', error);
      return "May Allah grant us wisdom and understanding in all our endeavors.";
    }
  }

  public async initializeChat(context?: ChatContext): Promise<void> {
    try {
      await this.initialize();
      if (context) {
        // Store context for future use
        this.currentContext = context;
      }
    } catch (error) {
      console.error('Error initializing chat:', error);
      throw error;
    }
  }

  private currentContext?: ChatContext;
}

// Export singleton instance
export const geminiService = new GeminiService();
export default geminiService;
