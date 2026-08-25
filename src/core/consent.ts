export const CONSENT_STORAGE_KEY = 'dateResolverConsent';

/** Only an explicit opt-in may enable Gmail message processing. */
export function hasGrantedConsent(value: unknown): boolean {
  return value === true;
}
