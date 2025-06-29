
export function calculateEndDate(startDateString: string, durationDays: number): string {
  const startDate = new Date(startDateString);
  if (isNaN(startDate.getTime())) {
    console.error("Invalid start date for end date calculation:", startDateString);
    const today = new Date();
    today.setDate(today.getDate() + durationDays);
    return today.toISOString().split('T')[0];
  }
  startDate.setDate(startDate.getDate() + durationDays);
  return startDate.toISOString().split('T')[0];
}

export function isSponsorshipActive(endDateString: string): boolean {
  const endDate = new Date(endDateString);
  const today = new Date();
  endDate.setHours(23, 59, 59, 999);
  today.setHours(0, 0, 0, 0);
  return endDate >= today;
}

export function formatDateForDisplay(isoDateString: string, includeTime: boolean = false): string {
  if (!isoDateString || isNaN(new Date(isoDateString).getTime())) {
    return "N/A";
  }
  const date = new Date(isoDateString);
  // No timezone offset adjustment here, show as stored (likely UTC from Date.now())
  // Or adjust based on how dates are intended to be stored/viewed.
  // For chat list "last activity" timestamps, local time is usually preferred.

  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short', // Use short month for brevity
    day: 'numeric',
  };

  if (includeTime) {
    options.hour = '2-digit';
    options.minute = '2-digit';
    // options.hour12 = true; // Optional: use 12-hour format
  }

  return date.toLocaleDateString(undefined, options);
}

export function getTodayISOString(): string {
  return new Date().toISOString().split('T')[0];
}
