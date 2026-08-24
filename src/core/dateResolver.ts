import * as chrono from 'chrono-node';

export interface DateMatch {
  text: string;
  index: number;
  length: number;
  resolvedDate: Date;
  formattedDate: string;
  isRelative: boolean;
}

export type DateFormatStyle = 'iso' | 'short' | 'medium' | 'long' | 'with_day';

export interface ResolverOptions {
  formatStyle?: DateFormatStyle;
  includeTime?: boolean;
  locale?: string;
  onlyRelative?: boolean;
}

const NUMBER_WORDS = 'a|an|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|few|couple(?:\\s+of)?|several|\\d+';
const TIME_UNITS = 'second|seconds|minute|minutes|hour|hours|day|days|week|weeks|weekend|weekends|month|months|year|years';
const DAYS_OF_WEEK = 'monday|tuesday|wednesday|thursday|friday|saturday|sunday|mon|tue|wed|thu|fri|sat|sun';
const RELATIVE_PREFIXES = 'this|next|last|coming|upcoming|past|previous';

const RELATIVE_PATTERNS = [
  // Standalone today/tomorrow/yesterday/tonight
  /\b(today|tomorrow|yesterday|tonight)\b/i,
  // this/next/last + day of week or period (e.g. this weekend, next week, last Friday)
  new RegExp(`\\b(?:${RELATIVE_PREFIXES})\\s+(?:${DAYS_OF_WEEK}|${TIME_UNITS}|morning|afternoon|evening|night)\\b`, 'i'),
  // Standalone days of the week (e.g. "Let's meet Friday")
  new RegExp(`\\b(?:${DAYS_OF_WEEK})\\b`, 'i'),
  // in X days / hours / weeks (e.g. "in a day", "in 3 hours", "in two days")
  new RegExp(`\\bin\\s+(?:${NUMBER_WORDS})\\s+(?:${TIME_UNITS})\\b`, 'i'),
  // X days ago / from now / later (e.g. "two days ago", "3 weeks from now")
  new RegExp(`\\b(?:${NUMBER_WORDS})\\s+(?:${TIME_UNITS})\\s+(?:ago|from\\s+now|later|prior|earlier|before)\\b`, 'i'),
  // this weekend, next weekend
  /\b(this|next|last)?\s*weekend\b/i,
  // end/beginning of week/month/year
  /\b(?:end|beginning|start)\s+of\s+(?:the\s+|this\s+|next\s+|last\s+)?(?:day|week|month|year|weekend)\b/i,
];

/**
 * Formats a Date object according to the chosen style.
 */
export function formatDate(
  date: Date,
  style: DateFormatStyle = 'medium',
  locale: string = 'en-US',
  includeTime: boolean = false
): string {
  const timeOptions: Intl.DateTimeFormatOptions = includeTime
    ? { hour: 'numeric', minute: '2-digit' }
    : {};

  switch (style) {
    case 'iso': {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      if (includeTime) {
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${year}-${month}-${day} ${hours}:${minutes}`;
      }
      return `${year}-${month}-${day}`;
    }
    case 'short':
      return date.toLocaleDateString(locale, {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        ...timeOptions,
      });
    case 'with_day':
      return date.toLocaleDateString(locale, {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        ...timeOptions,
      });
    case 'long':
      return date.toLocaleDateString(locale, {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        ...timeOptions,
      });
    case 'medium':
    default:
      return date.toLocaleDateString(locale, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        ...timeOptions,
      });
  }
}

/**
 * Checks if a parsed text or Chrono result represents a relative date reference.
 */
export function isRelativeDateText(text: string): boolean {
  if (!text) return false;
  return RELATIVE_PATTERNS.some((pattern) => pattern.test(text));
}

/**
 * Resolves date mentions in a text string anchored to a reference date (such as an email's sent date).
 */
export function findDatesInText(
  text: string,
  referenceDate: Date,
  options: ResolverOptions = {}
): DateMatch[] {
  const {
    formatStyle = 'with_day',
    includeTime = false,
    locale = 'en-US',
    onlyRelative = true,
  } = options;

  if (!text || typeof text !== 'string') {
    return [];
  }

  // Parse dates anchored to the reference date
  const parsedResults = chrono.en.casual.parse(text, referenceDate);
  const matches: DateMatch[] = [];

  for (const result of parsedResults) {
    const matchedText = result.text;
    const isRelative = isRelativeDateText(matchedText);

    if (onlyRelative && !isRelative) {
      continue;
    }

    const resolvedDate = result.start.date();
    const hasCertainTime = result.start.isCertain('hour');
    // If the matched text mentioned hours/minutes (e.g. "in 3 hours") or time options are enabled, include time
    const mentionsTimeUnits = /\b(hour|hours|minute|minutes|tonight|morning|afternoon|evening|night)\b/i.test(matchedText);
    const formatWithTime = includeTime || (hasCertainTime && mentionsTimeUnits);

    const formattedDate = formatDate(resolvedDate, formatStyle, locale, formatWithTime);

    matches.push({
      text: matchedText,
      index: result.index,
      length: matchedText.length,
      resolvedDate,
      formattedDate,
      isRelative,
    });
  }

  return matches;
}
