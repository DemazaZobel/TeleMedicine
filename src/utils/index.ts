/**
 * Format a date string for display in the app.
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Format a date string for display as time.
 */
export function formatTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Get initials from a full name.
 */
export function getInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

/**
 * Truncate a string to a maximum length.
 */
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return `${str.slice(0, maxLength - 1)}…`;
}

/**
 * Format a date string as a relative time (e.g. "2 hours ago", "Yesterday").
 */
export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  
  const diffInMs = now.getTime() - date.getTime();
  const diffInSecs = Math.floor(diffInMs / 1000);
  const diffInMins = Math.floor(diffInSecs / 60);
  const diffInHours = Math.floor(diffInMins / 60);
  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInSecs < 60) return 'Just now';
  if (diffInMins < 60) return `${diffInMins}m ago`;
  if (diffInHours < 24) return `${diffInHours}h ago`;
  
  if (diffInDays === 1) return `Yesterday at ${formatTime(dateString)}`;
  if (diffInDays < 7) return `${diffInDays} days ago`;
  
  return formatDate(dateString);
}

/**
 * Replace raw ISO timestamps in notification body text with human-readable dates.
 * e.g. "2026-04-27 07:00:00+00:00" → "Sun, Apr 27 at 10:00 AM"
 */
export function humanizeNotificationBody(body: string): string {
  // Match patterns like "2026-04-27 07:00:00+00:00" or "2026-04-21T07:00:00Z"
  const isoPattern = /\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}:\d{2}(?:[+-]\d{2}:\d{2}|Z)?/g;
  return body.replace(isoPattern, (match) => {
    try {
      const date = new Date(match.replace(' ', 'T'));
      return date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      }) + ' at ' + date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return match;
    }
  });
}

/**
 * Formats a legacy or structured experience/education value (string, array of strings, or array of objects)
 * into a single clean human-readable multiline string.
 */
export function formatDisplayValue(val: any): string {
  if (!val) return '';
  
  // If it's a string, try to parse it if it looks like JSON
  if (typeof val === 'string') {
    const trimmed = val.trim();
    if (trimmed === '[object Object]') return '';
    if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
      try {
        const parsed = JSON.parse(trimmed);
        return formatDisplayValue(parsed);
      } catch {
        return trimmed;
      }
    }
    return trimmed;
  }
  
  // If it's an array
  if (Array.isArray(val)) {
    return val
      .map((item) => {
        if (!item) return '';
        if (typeof item === 'string') {
          return item.trim() === '[object Object]' ? '' : item;
        }
        if (typeof item === 'object') {
          const title = item.role || item.degree || item.title || '';
          const subtitle = item.hospital || item.institution || item.school || item.company || '';
          const start = item.start_year || item.start_date || '';
          const end = item.end_year || item.end_date || (item.current ? 'Present' : '');
          
          const timeRange = start || end ? ` (${start}${start && end ? ' - ' : ''}${end})` : '';
          
          if (title && subtitle) {
            return `• ${title} at ${subtitle}${timeRange}`;
          } else if (title) {
            return `• ${title}${timeRange}`;
          } else if (subtitle) {
            return `• ${subtitle}${timeRange}`;
          } else {
            return `• ` + Object.entries(item)
              .filter(([k]) => k !== 'id')
              .map(([k, v]) => `${k}: ${v}`)
              .join(', ');
          }
        }
        return String(item);
      })
      .filter(Boolean)
      .join('\n');
  }
  
  // If it's a single object
  if (typeof val === 'object') {
    const title = val.role || val.degree || val.title || '';
    const subtitle = val.hospital || val.institution || val.school || val.company || '';
    if (title && subtitle) return `${title} at ${subtitle}`;
    if (title) return title;
    if (subtitle) return subtitle;
    return JSON.stringify(val);
  }
  
  return String(val);
}
