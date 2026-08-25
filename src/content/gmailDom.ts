/**
 * Gmail renders the complete sent timestamp in the title of span.g3 inside
 * each message wrapper. Reading it directly avoids running third-party code
 * in Gmail's Trusted Types-protected page world.
 */
export function getSentDateFromBody(body: HTMLElement): Date | null {
  const message = body.closest<HTMLElement>('div.adn');
  const timestamp = message?.querySelector<HTMLElement>('span.g3[title], span.g3');
  const title = timestamp?.getAttribute('title')?.trim();

  if (!title) {
    return null;
  }

  const sentDate = new Date(title);
  return Number.isNaN(sentDate.getTime()) ? null : sentDate;
}
