// Date utility functions for the MyNoor app

export interface IslamicDate {
  day: number;
  month: number;
  year: number;
  monthName: string;
  dayName?: string;
}

export interface TimeRemaining {
  hours: number;
  minutes: number;
  seconds: number;
  totalMinutes: number;
}

// Islamic month names
export const ISLAMIC_MONTHS = {
  en: [
    'Muharram', 'Safar', 'Rabi\' al-awwal', 'Rabi\' al-thani',
    'Jumada al-awwal', 'Jumada al-thani', 'Rajab', 'Sha\'ban',
    'Ramadan', 'Shawwal', 'Dhu al-Qi\'dah', 'Dhu al-Hijjah'
  ],
  ar: [
    'محرم', 'صفر', 'ربيع الأول', 'ربيع الثاني',
    'جمادى الأولى', 'جمادى الثانية', 'رجب', 'شعبان',
    'رمضان', 'شوال', 'ذو القعدة', 'ذو الحجة'
  ]
};

// Day names
export const DAY_NAMES = {
  en: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  ar: ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت']
};

export function formatTime(date: Date | string, format24Hour: boolean = false): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  
  if (format24Hour) {
    return d.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  } else {
    return d.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  }
}

export function formatDate(date: Date | string, locale: string = 'en-US'): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  
  return d.toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

export function formatRelativeTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - d.getTime()) / 1000);
  
  if (diffInSeconds < 60) {
    return 'just now';
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < 604800) {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  } else {
    return formatDate(d);
  }
}

export function getTimeUntil(targetTime: string): TimeRemaining {
  const now = new Date();
  const target = new Date();
  
  // Parse time string (e.g., "14:30" or "2:30 PM")
  const timeMatch = targetTime.match(/(\d{1,2}):(\d{2})(?:\s*(AM|PM))?/i);
  if (!timeMatch) {
    return { hours: 0, minutes: 0, seconds: 0, totalMinutes: 0 };
  }
  
  let hours = parseInt(timeMatch[1]);
  const minutes = parseInt(timeMatch[2]);
  const ampm = timeMatch[3];
  
  if (ampm) {
    if (ampm.toUpperCase() === 'PM' && hours !== 12) {
      hours += 12;
    } else if (ampm.toUpperCase() === 'AM' && hours === 12) {
      hours = 0;
    }
  }
  
  target.setHours(hours, minutes, 0, 0);
  
  // If target time has passed today, set it for tomorrow
  if (target <= now) {
    target.setDate(target.getDate() + 1);
  }
  
  const diffInMs = target.getTime() - now.getTime();
  const totalMinutes = Math.floor(diffInMs / (1000 * 60));
  const remainingHours = Math.floor(totalMinutes / 60);
  const remainingMinutes = totalMinutes % 60;
  const remainingSeconds = Math.floor((diffInMs % (1000 * 60)) / 1000);
  
  return {
    hours: remainingHours,
    minutes: remainingMinutes,
    seconds: remainingSeconds,
    totalMinutes
  };
}

export function formatTimeRemaining(timeRemaining: TimeRemaining): string {
  const { hours, minutes } = timeRemaining;
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else if (minutes > 0) {
    return `${minutes}m`;
  } else {
    return 'Now';
  }
}

export function isToday(date: Date | string): boolean {
  const d = typeof date === 'string' ? new Date(date) : date;
  const today = new Date();
  
  return d.getDate() === today.getDate() &&
         d.getMonth() === today.getMonth() &&
         d.getFullYear() === today.getFullYear();
}

export function isThisWeek(date: Date | string): boolean {
  const d = typeof date === 'string' ? new Date(date) : date;
  const today = new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay());
  startOfWeek.setHours(0, 0, 0, 0);
  
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);
  
  return d >= startOfWeek && d <= endOfWeek;
}

export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export function addHours(date: Date, hours: number): Date {
  const result = new Date(date);
  result.setHours(result.getHours() + hours);
  return result;
}

export function startOfDay(date: Date): Date {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
}

export function endOfDay(date: Date): Date {
  const result = new Date(date);
  result.setHours(23, 59, 59, 999);
  return result;
}

export function getDayOfWeek(date: Date, language: string = 'en'): string {
  const dayIndex = date.getDay();
  return DAY_NAMES[language as keyof typeof DAY_NAMES]?.[dayIndex] || DAY_NAMES.en[dayIndex];
}

export function getMonthName(monthIndex: number, language: string = 'en'): string {
  return ISLAMIC_MONTHS[language as keyof typeof ISLAMIC_MONTHS]?.[monthIndex] || ISLAMIC_MONTHS.en[monthIndex];
}

// Simplified Islamic date conversion (approximation)
export function toIslamicDate(gregorianDate: Date): IslamicDate {
  // This is a simplified approximation
  // For accurate conversion, you would use a proper Islamic calendar library
  const islamicEpoch = new Date('622-07-16'); // Approximate start of Islamic calendar
  const daysSinceEpoch = Math.floor((gregorianDate.getTime() - islamicEpoch.getTime()) / (1000 * 60 * 60 * 24));
  
  // Islamic year is approximately 354.37 days
  const islamicYear = Math.floor(daysSinceEpoch / 354.37) + 1;
  const dayOfYear = daysSinceEpoch % 354.37;
  
  // Approximate month calculation (Islamic months are 29-30 days)
  const islamicMonth = Math.floor(dayOfYear / 29.5);
  const islamicDay = Math.floor(dayOfYear % 29.5) + 1;
  
  return {
    day: islamicDay,
    month: islamicMonth,
    year: Math.floor(islamicYear),
    monthName: getMonthName(islamicMonth),
    dayName: getDayOfWeek(gregorianDate)
  };
}

export function formatIslamicDate(islamicDate: IslamicDate, language: string = 'en'): string {
  const monthName = ISLAMIC_MONTHS[language as keyof typeof ISLAMIC_MONTHS]?.[islamicDate.month] || islamicDate.monthName;
  return `${islamicDate.day} ${monthName} ${islamicDate.year} AH`;
}

export function getNextFriday(): Date {
  const today = new Date();
  const daysUntilFriday = (5 - today.getDay() + 7) % 7;
  const nextFriday = addDays(today, daysUntilFriday === 0 ? 7 : daysUntilFriday);
  return nextFriday;
}

export function isRamadan(date: Date = new Date()): boolean {
  // This is a simplified check - in reality, you'd need accurate Islamic calendar data
  const islamicDate = toIslamicDate(date);
  return islamicDate.month === 8; // Ramadan is the 9th month (0-indexed)
}

export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

export function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}

export function parseTimeString(timeString: string): { hours: number; minutes: number } | null {
  const match = timeString.match(/(\d{1,2}):(\d{2})(?:\s*(AM|PM))?/i);
  if (!match) return null;
  
  let hours = parseInt(match[1]);
  const minutes = parseInt(match[2]);
  const ampm = match[3];
  
  if (ampm) {
    if (ampm.toUpperCase() === 'PM' && hours !== 12) {
      hours += 12;
    } else if (ampm.toUpperCase() === 'AM' && hours === 12) {
      hours = 0;
    }
  }
  
  return { hours, minutes };
}

export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (hours > 0) {
    return `${hours}h ${mins}m`;
  } else {
    return `${mins}m`;
  }
}

export function calculateEndDate(startDate: string, durationDays: number): string {
  const start = new Date(startDate);
  const end = new Date(start.getTime() + durationDays * 24 * 60 * 60 * 1000);
  return end.toISOString();
}

export function isSponsorshipActive(startDate: string, endDate: string): boolean {
  const now = new Date();
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  return now >= start && now <= end;
}

export function formatDateForDisplay(dateString: string, locale: string = 'en-US'): string {
  const date = new Date(dateString);
  return date.toLocaleDateString(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}
