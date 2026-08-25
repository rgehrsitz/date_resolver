// @vitest-environment happy-dom
import { describe, expect, it } from 'vitest';
import { getSentDateFromBody } from '../src/content/gmailDom';

describe('getSentDateFromBody', () => {
  it('reads Gmail\'s full sent timestamp from the message wrapper', () => {
    const wrapper = document.createElement('div');
    wrapper.className = 'adn';
    wrapper.innerHTML = '<span class="g3" title="Wed, May 10, 2023, 10:30 AM">May 10</span><div class="a3s">Meet tomorrow.</div>';

    const sentDate = getSentDateFromBody(wrapper.querySelector<HTMLElement>('.a3s')!);

    expect(sentDate).not.toBeNull();
    expect(sentDate?.getFullYear()).toBe(2023);
    expect(sentDate?.getMonth()).toBe(4);
    expect(sentDate?.getDate()).toBe(10);
  });

  it('does not process a body until Gmail exposes a valid timestamp', () => {
    const body = document.createElement('div');
    body.className = 'a3s';

    expect(getSentDateFromBody(body)).toBeNull();
  });
});
