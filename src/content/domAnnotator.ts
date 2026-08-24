import { findDatesInText } from '../core/dateResolver';
import { ExtensionSettings, DEFAULT_SETTINGS } from '../types/settings';

const IGNORED_TAGS = new Set([
  'SCRIPT',
  'STYLE',
  'NOSCRIPT',
  'TEXTAREA',
  'INPUT',
  'CODE',
  'PRE',
]);

/**
 * Removes any existing date-resolver markup from a container, restoring original text nodes.
 */
export function removeAnnotations(container: HTMLElement): void {
  const matches = container.querySelectorAll('.date-resolver-match');
  matches.forEach((span) => {
    const originalText = span.getAttribute('data-original');
    if (originalText !== null) {
      const textNode = document.createTextNode(originalText);
      span.parentNode?.replaceChild(textNode, span);
    }
  });
  container.removeAttribute('data-date-resolver-processed');
  container.normalize();
}

/**
 * Checks if a node or its ancestors are editable or should be ignored.
 */
function isIgnoredNode(node: Node): boolean {
  let current: Node | null = node;
  while (current && current !== document.body) {
    if (current.nodeType === Node.ELEMENT_NODE) {
      const el = current as HTMLElement;
      if (IGNORED_TAGS.has(el.tagName)) return true;
      if (el.isContentEditable || el.getAttribute('contenteditable') === 'true') return true;
      if (el.classList.contains('date-resolver-match') || el.classList.contains('date-resolver-pill')) return true;
    }
    current = current.parentNode;
  }
  return false;
}

/**
 * Annotates relative dates inside text nodes within an HTML element.
 */
export function annotateElement(
  container: HTMLElement,
  sentDate: Date,
  settings: ExtensionSettings = DEFAULT_SETTINGS
): number {
  if (!container) {
    return 0;
  }

  // Always store sentDate on container for subsequent settings changes/re-renders
  container.setAttribute('data-sent-date', sentDate.toISOString());

  if (!settings.enabled) {
    return 0;
  }

  // Find all candidate text nodes using TreeWalker
  const walker = document.createTreeWalker(
    container,
    NodeFilter.SHOW_TEXT,
    {
      acceptNode: (node) => {
        if (isIgnoredNode(node)) {
          return NodeFilter.FILTER_REJECT;
        }
        if (!node.textContent || node.textContent.trim().length === 0) {
          return NodeFilter.FILTER_SKIP;
        }
        return NodeFilter.FILTER_ACCEPT;
      },
    }
  );

  const textNodes: Text[] = [];
  let currentNode: Node | null = walker.nextNode();
  while (currentNode) {
    textNodes.push(currentNode as Text);
    currentNode = walker.nextNode();
  }

  let totalAnnotations = 0;

  for (const textNode of textNodes) {
    const originalText = textNode.textContent;
    if (!originalText) continue;

    const matches = findDatesInText(originalText, sentDate, {
      formatStyle: settings.formatStyle,
      onlyRelative: true,
    });

    if (matches.length === 0) continue;

    const fragment = document.createDocumentFragment();
    let lastIndex = 0;

    for (const match of matches) {
      // Append preceding plain text
      if (match.index > lastIndex) {
        fragment.appendChild(
          document.createTextNode(originalText.slice(lastIndex, match.index))
        );
      }

      // Create highlight wrapper span
      const wrapper = document.createElement('span');
      wrapper.className = 'date-resolver-match';
      wrapper.setAttribute('data-original', match.text);
      wrapper.setAttribute('data-resolved', match.formattedDate);
      wrapper.title = `Resolved: ${match.formattedDate} (Sent: ${sentDate.toLocaleDateString()})`;

      if (settings.displayMode === 'inline_replace') {
        // Full replacement mode: replace match text entirely with resolved date
        wrapper.textContent = match.formattedDate;
      } else {
        wrapper.textContent = match.text;

        if (settings.displayMode === 'pill') {
          const pill = document.createElement('span');
          pill.className = 'date-resolver-pill';
          pill.textContent = ` (${match.formattedDate})`;
          wrapper.appendChild(pill);
        }
      }

      fragment.appendChild(wrapper);
      lastIndex = match.index + match.length;
      totalAnnotations++;
    }

    // Append any remaining text
    if (lastIndex < originalText.length) {
      fragment.appendChild(
        document.createTextNode(originalText.slice(lastIndex))
      );
    }

    textNode.parentNode?.replaceChild(fragment, textNode);
  }

  if (totalAnnotations > 0) {
    container.setAttribute('data-date-resolver-processed', 'true');
  }

  return totalAnnotations;
}
