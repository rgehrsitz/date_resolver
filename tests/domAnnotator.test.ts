// @vitest-environment happy-dom
import { describe, it, expect, beforeEach } from 'vitest';
import { annotateElement, removeAnnotations } from '../src/content/domAnnotator';

describe('domAnnotator', () => {
  let container: HTMLDivElement;
  const sentDate = new Date(2023, 4, 10, 10, 0, 0); // Wed, May 10, 2023

  beforeEach(() => {
    container = document.createElement('div');
  });

  it('safely wraps relative dates in text nodes without breaking HTML structure (pill mode)', () => {
    container.innerHTML = '<p>Hi team, let us meet <a href="https://example.com/today">today</a> or <b>tomorrow</b>.</p>';

    const count = annotateElement(container, sentDate, {
      enabled: true,
      displayMode: 'pill',
      formatStyle: 'iso',
      highlightColor: '#1a73e8',
      showRelativeOffset: false,
    });

    expect(count).toBe(2);

    const matches = container.querySelectorAll('.date-resolver-match');
    expect(matches.length).toBe(2);
    expect(container.querySelectorAll('.date-resolver-pill').length).toBe(2);

    // Verify HTML links and tag structure are preserved!
    const link = container.querySelector('a');
    expect(link).not.toBeNull();
    expect(link?.getAttribute('href')).toBe('https://example.com/today');

    const bold = container.querySelector('b');
    expect(bold).not.toBeNull();
    expect(bold?.querySelector('.date-resolver-match')).not.toBeNull();
  });

  it('correctly performs full replacement in inline_replace mode and restores original on revert', () => {
    container.innerHTML = '<p>Let us sync tomorrow morning.</p>';

    const count = annotateElement(container, sentDate, {
      enabled: true,
      displayMode: 'inline_replace',
      formatStyle: 'iso',
      highlightColor: '#1a73e8',
      showRelativeOffset: false,
    });

    expect(count).toBe(1);
    const match = container.querySelector('.date-resolver-match');
    expect(match).not.toBeNull();
    // In full replacement mode, text content should be ONLY the formatted date
    expect(match?.textContent).toBe('2023-05-11');
    expect(container.querySelector('.date-resolver-pill')).toBeNull();

    // Revert should restore "tomorrow morning"
    removeAnnotations(container);
    expect(container.textContent).toBe('Let us sync tomorrow morning.');
  });

  it('renders only original text with title tooltip in tooltip mode', () => {
    container.innerHTML = '<p>Let us sync tomorrow morning.</p>';

    const count = annotateElement(container, sentDate, {
      enabled: true,
      displayMode: 'tooltip',
      formatStyle: 'iso',
      highlightColor: '#1a73e8',
      showRelativeOffset: false,
    });

    expect(count).toBe(1);
    const match = container.querySelector('.date-resolver-match');
    expect(match).not.toBeNull();
    expect(match?.textContent).toBe('tomorrow morning');
    expect(match?.getAttribute('title')).toContain('2023-05-11');
    expect(container.querySelector('.date-resolver-pill')).toBeNull();
  });

  it('does not touch content inside script, style, code, or contenteditable elements', () => {
    container.innerHTML = `
      <div contenteditable="true">Do not modify today inside editor</div>
      <code>console.log("tomorrow");</code>
      <p>Please review tomorrow.</p>
    `;

    const count = annotateElement(container, sentDate, {
      enabled: true,
      displayMode: 'pill',
      formatStyle: 'iso',
      highlightColor: '#1a73e8',
      showRelativeOffset: false,
    });

    expect(count).toBe(1);
    expect(container.querySelector('code .date-resolver-match')).toBeNull();
    expect(container.querySelector('[contenteditable] .date-resolver-match')).toBeNull();
    expect(container.querySelector('p .date-resolver-match')).not.toBeNull();
  });

  it('can cleanly revert annotations with removeAnnotations', () => {
    const originalHTML = '<p>Hi team, let us meet today or tomorrow.</p>';
    container.innerHTML = originalHTML;

    annotateElement(container, sentDate);
    expect(container.querySelectorAll('.date-resolver-match').length).toBe(2);

    removeAnnotations(container);
    expect(container.querySelectorAll('.date-resolver-match').length).toBe(0);
    expect(container.textContent).toBe('Hi team, let us meet today or tomorrow.');
  });
});
