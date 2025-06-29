// AI utility functions for the MyNoor app

import { ChatMessage, ActivitySuggestion, QuizQuestion } from '../types';

export interface AIResponse {
  content: string;
  suggestions?: string[];
  shareableContent?: string;
  activitySuggestion?: ActivitySuggestion;
}

export function formatChatMessage(content: string, role: 'user' | 'assistant'): ChatMessage {
  return {
    id: generateId(),
    content,
    role,
    timestamp: new Date().toISOString(),
  };
}

export function generateId(): string {
  return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
}

export function extractActivitySuggestion(content: string): ActivitySuggestion | undefined {
  // Simple pattern matching for activity suggestions
  const patterns = {
    quiz: /quiz|test|question/i,
    khitmah_reader: /quran|reading|khitmah/i,
    flip_book_reader: /story|book|read/i,
    word_search: /word search|puzzle/i,
    hadith_explorer: /hadith|saying|tradition/i,
  };

  for (const [type, pattern] of Object.entries(patterns)) {
    if (pattern.test(content)) {
      return {
        type: type as ActivitySuggestion['type'],
        topic: extractTopic(content),
        description: `Interactive ${type.replace('_', ' ')} activity`,
      };
    }
  }

  return undefined;
}

export function extractTopic(content: string): string {
  // Extract topic from content - simplified implementation
  const words = content.toLowerCase().split(' ');
  const islamicTerms = [
    'prayer', 'salah', 'quran', 'hadith', 'prophet', 'muhammad',
    'allah', 'islam', 'muslim', 'fiqh', 'sunnah', 'dua', 'ramadan',
    'hajj', 'zakat', 'shahada', 'iman', 'tawhid'
  ];

  for (const term of islamicTerms) {
    if (words.includes(term)) {
      return term.charAt(0).toUpperCase() + term.slice(1);
    }
  }

  return 'Islamic Knowledge';
}

export function generateShareableContent(message: ChatMessage): string {
  const content = message.content;
  const timestamp = new Date(message.timestamp).toLocaleDateString();
  
  return `💫 MyNoor Wisdom 💫\n\n${content}\n\n📅 ${timestamp}\n\n🌙 Shared from MyNoor - Your Islamic AI Companion`;
}

export function sanitizeInput(input: string): string {
  // Remove potentially harmful content
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<[^>]*>/g, '')
    .trim();
}

export function validateApiKey(apiKey: string): boolean {
  // Basic validation for Gemini API key format
  return Boolean(apiKey && apiKey.length > 20 && apiKey.startsWith('AIza'));
}

export function formatPrompt(userInput: string, context?: any): string {
  const basePrompt = `You are a knowledgeable and compassionate Islamic AI assistant. 
  Provide helpful, accurate, and respectful guidance based on Islamic teachings. 
  Always cite sources when possible and encourage further learning.`;

  let prompt = `${basePrompt}\n\nUser question: ${userInput}`;

  if (context?.userLocation) {
    prompt += `\n\nUser location context: ${context.userLocation.city}, ${context.userLocation.country}`;
  }

  if (context?.preferredLanguage && context.preferredLanguage !== 'en') {
    prompt += `\n\nPlease respond in ${context.preferredLanguage} when appropriate.`;
  }

  return prompt;
}

export function parseAIResponse(response: string): AIResponse {
  try {
    // Try to parse as JSON first (for structured responses)
    const parsed = JSON.parse(response);
    return {
      content: parsed.content || response,
      suggestions: parsed.suggestions,
      shareableContent: parsed.shareableContent,
      activitySuggestion: parsed.activitySuggestion,
    };
  } catch {
    // If not JSON, treat as plain text
    return {
      content: response,
      suggestions: extractSuggestions(response),
      activitySuggestion: extractActivitySuggestion(response),
    };
  }
}

export function extractSuggestions(content: string): string[] {
  // Extract potential follow-up questions or suggestions
  const suggestions: string[] = [];
  
  if (content.includes('prayer')) {
    suggestions.push('Tell me about prayer times');
    suggestions.push('How do I perform wudu?');
  }
  
  if (content.includes('quran') || content.includes('Quran')) {
    suggestions.push('Show me a verse from the Quran');
    suggestions.push('Help me understand this verse');
  }
  
  if (content.includes('hadith')) {
    suggestions.push('Share a relevant hadith');
    suggestions.push('Explain this hadith');
  }

  return suggestions.slice(0, 3); // Limit to 3 suggestions
}

export function generateQuizFromContent(content: string, difficulty: 'easy' | 'medium' | 'hard' = 'medium'): QuizQuestion[] {
  // This is a simplified implementation
  // In a real app, this would use AI to generate questions
  const questions: QuizQuestion[] = [];
  
  if (content.includes('prayer') || content.includes('salah')) {
    questions.push({
      id: generateId(),
      question: 'How many daily prayers are obligatory in Islam?',
      options: ['3', '4', '5', '6'],
      correctAnswer: 2,
      explanation: 'There are 5 daily obligatory prayers: Fajr, Dhuhr, Asr, Maghrib, and Isha.',
      difficulty,
      category: 'Prayer',
    });
  }

  return questions;
}

export function calculateResponseTime(startTime: number): number {
  return Date.now() - startTime;
}

export function isValidResponse(response: any): boolean {
  return response && 
         typeof response === 'object' && 
         typeof response.content === 'string' && 
         response.content.length > 0;
}

export function handleAPIError(error: any): string {
  if (error.status === 429) {
    return 'Rate limit exceeded. Please wait a moment before trying again.';
  } else if (error.status === 401) {
    return 'Invalid API key. Please check your configuration.';
  } else if (error.status >= 500) {
    return 'Service temporarily unavailable. Please try again later.';
  } else {
    return 'An error occurred while processing your request. Please try again.';
  }
}

export function extractSpecialContent(content: string): {
  suggestions?: string[];
  shareableContent?: string;
  activitySuggestion?: ActivitySuggestion;
} {
  const result: any = {};

  // Extract suggestions
  const suggestionsMatch = content.match(/\[SUGGESTIONS:\s*([^\]]+)\]/);
  if (suggestionsMatch) {
    const suggestionsText = suggestionsMatch[1];
    result.suggestions = suggestionsText
      .split('|')
      .map(s => s.trim().replace(/"/g, ''))
      .filter(s => s.length > 0);
  }

  // Extract shareable content
  const shareableMatch = content.match(/\[SHAREABLE_TAKEAWAY_START\]([^\[]+)\[SHAREABLE_TAKEAWAY_END\]/);
  if (shareableMatch) {
    result.shareableContent = shareableMatch[1].trim();
  }

  // Extract activity suggestion
  const activityMatch = content.match(/\[ACTIVITY_SUGGESTION\s+type="([^"]+)"\s+topic="([^"]+)"\]([^\[]+)\[ACTIVITY_SUGGESTION_END\]/);
  if (activityMatch) {
    result.activitySuggestion = {
      type: activityMatch[1] as ActivitySuggestion['type'],
      topic: activityMatch[2],
      description: activityMatch[3].trim()
    };
  }

  return result;
}
