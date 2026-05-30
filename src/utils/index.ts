/**
 * Format education/experience fields for display (string, JSON, or structured arrays).
 */
export function formatDisplayValue(value: unknown): string {
  if (value == null || value === "") return "";

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed || trimmed === "[object Object]") return "";
    if (trimmed.startsWith("[") || trimmed.startsWith("{")) {
      try {
        return formatDisplayValue(JSON.parse(trimmed));
      } catch {
        return trimmed;
      }
    }
    return trimmed;
  }

  if (Array.isArray(value)) {
    return value
      .map((item) => formatDisplayEntry(item))
      .filter(Boolean)
      .join("\n");
  }

  if (typeof value === "object") {
    return formatDisplayEntry(value);
  }

  const text = String(value).trim();
  return text === "[object Object]" ? "" : text;
}

function formatDisplayEntry(item: unknown): string {
  if (item == null) return "";
  if (typeof item === "string") {
    const trimmed = item.trim();
    return trimmed === "[object Object]" ? "" : trimmed;
  }
  if (typeof item !== "object") return String(item);

  const record = item as Record<string, unknown>;
  const title = String(record.role ?? record.degree ?? record.title ?? "").trim();
  const subtitle = String(
    record.hospital ?? record.institution ?? record.school ?? record.company ?? "",
  ).trim();

  if (title && subtitle) return `${title} at ${subtitle}`;
  if (title) return title;
  if (subtitle) return subtitle;

  return Object.values(record)
    .filter((v) => v != null && v !== "")
    .map(String)
    .join(", ");
}

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

export * from './translit';

