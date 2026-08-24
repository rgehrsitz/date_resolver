import { describe, it, expect } from 'vitest';
import { findDatesInText, formatDate, isRelativeDateText } from '../src/core/dateResolver';

describe('dateResolver core', () => {
  // Anchored Reference Date: Wednesday, January 15, 2020, 10:30 AM
  const sentDate = new Date(2020, 0, 15, 10, 30, 0);

  it('correctly resolves today, tomorrow, and yesterday relative to sentDate', () => {
    const text = 'Are we meeting today or tomorrow? Yesterday was busy.';
    const matches = findDatesInText(text, sentDate, { formatStyle: 'iso' });

    expect(matches).toHaveLength(3);

    expect(matches[0].text.toLowerCase()).toBe('today');
    expect(matches[0].formattedDate).toBe('2020-01-15');

    expect(matches[1].text.toLowerCase()).toBe('tomorrow');
    expect(matches[1].formattedDate).toBe('2020-01-16');

    expect(matches[2].text.toLowerCase()).toBe('yesterday');
    expect(matches[2].formattedDate).toBe('2020-01-14');
  });

  it('correctly resolves days of the week relative to historical sentDate', () => {
    // sentDate is Wed, Jan 15, 2020
    const text = 'Let us sync this Friday, or next Monday, or check what happened last Monday.';
    const matches = findDatesInText(text, sentDate, { formatStyle: 'iso' });

    const fridayMatch = matches.find((m) => m.text.toLowerCase().includes('friday'));
    expect(fridayMatch).toBeDefined();
    expect(fridayMatch?.formattedDate).toBe('2020-01-17');

    const nextMondayMatch = matches.find((m) => m.text.toLowerCase().includes('next monday'));
    expect(nextMondayMatch).toBeDefined();
    expect(nextMondayMatch?.formattedDate).toBe('2020-01-20');

    const lastMondayMatch = matches.find((m) => m.text.toLowerCase().includes('last monday'));
    expect(lastMondayMatch).toBeDefined();
    expect(lastMondayMatch?.formattedDate).toBe('2020-01-13');
  });

  it('resolves natural language relative variants like "in a day", "two days ago", "in 3 hours", "this weekend"', () => {
    const text1 = 'I will send the report in a day, which was requested two days ago.';
    const matches1 = findDatesInText(text1, sentDate, { formatStyle: 'iso' });
    expect(matches1).toHaveLength(2);
    expect(matches1[0].formattedDate).toBe('2020-01-16');
    expect(matches1[1].formattedDate).toBe('2020-01-13');

    const text2 = 'The server reboot is in 3 hours. Also enjoy this weekend!';
    const matches2 = findDatesInText(text2, sentDate, { formatStyle: 'iso' });
    expect(matches2.length).toBeGreaterThanOrEqual(2);
    // "in 3 hours" should resolve to 2020-01-15 13:30
    const hoursMatch = matches2.find((m) => m.text.toLowerCase().includes('hours'));
    expect(hoursMatch).toBeDefined();
    expect(hoursMatch?.formattedDate).toContain('2020-01-15');

    const weekendMatch = matches2.find((m) => m.text.toLowerCase().includes('weekend'));
    expect(weekendMatch).toBeDefined();
    expect(weekendMatch?.resolvedDate.getTime()).toBeGreaterThan(sentDate.getTime());
  });

  it('resolves relative offset phrases like "in 3 days" and "2 days ago"', () => {
    const text = 'The deadline is in 3 days, but we started 2 days ago.';
    const matches = findDatesInText(text, sentDate, { formatStyle: 'iso' });

    expect(matches).toHaveLength(2);
    expect(matches[0].formattedDate).toBe('2020-01-18');
    expect(matches[1].formattedDate).toBe('2020-01-13');
  });

  it('resolves next week and last week relative to sentDate', () => {
    const text = 'Can we reschedule for next week? We spoke last week.';
    const matches = findDatesInText(text, sentDate, { formatStyle: 'iso' });

    expect(matches.length).toBeGreaterThanOrEqual(2);
    expect(matches[0].resolvedDate.getTime()).toBeGreaterThan(sentDate.getTime());
    expect(matches[1].resolvedDate.getTime()).toBeLessThan(sentDate.getTime());
  });

  it('supports different formatting styles', () => {
    const testDate = new Date(2023, 4, 10, 14, 0); // May 10, 2023
    expect(formatDate(testDate, 'iso')).toBe('2023-05-10');
    expect(formatDate(testDate, 'medium', 'en-US')).toBe('May 10, 2023');
    expect(formatDate(testDate, 'with_day', 'en-US')).toBe('Wed, May 10, 2023');
    expect(formatDate(testDate, 'long', 'en-US')).toBe('Wednesday, May 10, 2023');
  });

  it('correctly distinguishes relative vs absolute dates', () => {
    expect(isRelativeDateText('tomorrow')).toBe(true);
    expect(isRelativeDateText('next Friday')).toBe(true);
    expect(isRelativeDateText('in 5 days')).toBe(true);
    expect(isRelativeDateText('in a day')).toBe(true);
    expect(isRelativeDateText('two days ago')).toBe(true);
    expect(isRelativeDateText('in 3 hours')).toBe(true);
    expect(isRelativeDateText('this weekend')).toBe(true);
    expect(isRelativeDateText('January 15, 2020')).toBe(false);
  });
});
