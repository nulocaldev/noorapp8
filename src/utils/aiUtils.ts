
import { ChatMessage, InteractiveActivitySuggestion } from '../types';

// Regexes to extract attributes from the activity suggestion tag
export const extractAttribute = (attrs: string, key: string): string | undefined => {
    const regex = new RegExp(`${key}\\s*=\\s*["']([^"']+)["']`, 'i');
    const match = attrs.match(regex);
    return match?.[1]?.trim();
};

const SUGGESTION_REGEX = /\[SUGGESTIONS:\s*(.*?)\s*\]$/is;
const COPY_CONTENT_START_REGEX = /\[COPY_CONTENT_START\]\r?\n?/is;
const COPY_CONTENT_END_REGEX = /\r?\n?\[COPY_CONTENT_END\]/is;
const SHAREABLE_TAKEAWAY_START_REGEX = /\[SHAREABLE_TAKEAWAY_START\]\r?\n?/is;
const SHAREABLE_TAKEAWAY_END_REGEX = /\r?\n?\[SHAREABLE_TAKEAWAY_END\]/is;
const ACTIVITY_SUGGESTION_MAIN_REGEX = /\[ACTIVITY_SUGGESTION\s+([^\]]+?)\](.*?)\[\/?ACTIVITY_SUGGESTION_END\]/is;


export function parseSuggestions(rawText: string): { text: string; suggestions: string[] } {
  let text = rawText;
  let suggestions: string[] = [];
  const suggestionMatch = text.match(SUGGESTION_REGEX);
  if (suggestionMatch && suggestionMatch[1]) {
    const suggestionsString = suggestionMatch[1].trim();
    suggestions = suggestionsString.split('|').map(s => s.trim().replace(/^"|"$/g, '').replace(/^'|'$/g, '')).filter(Boolean);
    text = text.replace(SUGGESTION_REGEX, '').trim();
  }
  return { text, suggestions };
}

export function extractSpecialContent(rawText: string | undefined | null): {
  displayText: string;
  copyableContent?: ChatMessage['copyableContent'];
  shareableTakeaway?: ChatMessage['shareableTakeaway'];
  activitySuggestion?: InteractiveActivitySuggestion;
  suggestions: string[];
} {
  if (typeof rawText !== 'string') {
    return { displayText: "Sorry, I received an unreadable response.", suggestions: ["Try again?"] };
  }

  let currentText = rawText.trim();
  let copyableContent: ChatMessage['copyableContent'] | undefined;
  let shareableTakeaway: ChatMessage['shareableTakeaway'] | undefined;
  let activitySuggestion: InteractiveActivitySuggestion | undefined;

  const activityMatch = currentText.match(ACTIVITY_SUGGESTION_MAIN_REGEX);
  if (activityMatch) {
    const [fullTag, attrs, displayText] = activityMatch;
    const type = extractAttribute(attrs, 'type') as InteractiveActivitySuggestion['type'];
    const topic = extractAttribute(attrs, 'topic');
    if (type && topic) {
        activitySuggestion = {
            type, topic, displayText: displayText.trim()
        };
        currentText = currentText.replace(fullTag, '').trim();
    }
  }

  const takeawayMatch = currentText.match(new RegExp(SHAREABLE_TAKEAWAY_START_REGEX.source + "(.*?)" + SHAREABLE_TAKEAWAY_END_REGEX.source, 'is'));
  if (takeawayMatch) {
    shareableTakeaway = { text: takeawayMatch[1].trim() };
    currentText = currentText.replace(takeawayMatch[0], '').trim();
  }

  const copyMatch = currentText.match(new RegExp(COPY_CONTENT_START_REGEX.source + "(.*?)" + COPY_CONTENT_END_REGEX.source, 'is'));
  if (copyMatch) {
    copyableContent = { content: copyMatch[1].trim() };
    currentText = currentText.replace(copyMatch[0], '').trim();
  }

  const { text: finalDisplayText, suggestions } = parseSuggestions(currentText);

  return {
    displayText: finalDisplayText || (copyableContent || shareableTakeaway || activitySuggestion ? "I've prepared the following for you:" : ""),
    copyableContent,
    shareableTakeaway,
    activitySuggestion,
    suggestions,
  };
}
