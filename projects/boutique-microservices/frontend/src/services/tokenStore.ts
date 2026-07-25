/**
 * In-memory access token store.
 *
 * WHY NOT localStorage: the previous implementation kept both the access and
 * refresh tokens in localStorage. Any successful XSS — a malicious npm
 * dependency, a reflected script, a compromised CDN — could read them with one
 * line of JavaScript and exfiltrate a session that never expired.
 *
 * Now:
 *   - The access token lives in a module-level variable. It dies with the tab,
 *     is never written to disk, and cannot be read by another origin.
 *   - The refresh token is an httpOnly cookie set by the auth service, so
 *     JavaScript cannot read it at all — only the browser can send it back.
 *
 * Trade-off: a full page reload loses the in-memory token. That is handled by
 * calling /auth/refresh on startup, which exchanges the httpOnly cookie for a
 * fresh access token.
 */

let accessToken: string | null = null;

type Listener = (token: string | null) => void;
const listeners = new Set<Listener>();

export const tokenStore = {
  get(): string | null {
    return accessToken;
  },

  set(token: string | null): void {
    accessToken = token;
    listeners.forEach((listener) => listener(token));
  },

  clear(): void {
    accessToken = null;
    listeners.forEach((listener) => listener(null));
  },

  subscribe(listener: Listener): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
};
