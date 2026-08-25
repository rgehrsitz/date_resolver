import { describe, expect, it } from 'vitest';
import { hasGrantedConsent } from '../src/core/consent';

describe('consent', () => {
  it('requires an explicit true value before Gmail processing is enabled', () => {
    expect(hasGrantedConsent(undefined)).toBe(false);
    expect(hasGrantedConsent(false)).toBe(false);
    expect(hasGrantedConsent('true')).toBe(false);
    expect(hasGrantedConsent(true)).toBe(true);
  });
});
