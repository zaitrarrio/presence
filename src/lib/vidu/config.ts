/**
 * How Presence decides whether to run against real Vidu S1 or the built-in mock.
 *
 * Set these in an `.env` file (Expo reads EXPO_PUBLIC_* at build time):
 *
 *   EXPO_PUBLIC_VIDU_API_KEY=sk-...
 *   EXPO_PUBLIC_VIDU_BASE_URL=https://api.vidu.com   # optional override
 *
 * With no key present the app runs fully in mock mode, so the prototype is
 * interactive out of the box.
 */
export interface ViduConfig {
  apiKey: string | null;
  baseUrl: string;
  /** Resolved transport mode. */
  mode: 'live' | 'mock';
}

const DEFAULT_BASE_URL = 'https://api.vidu.com';

export function getViduConfig(): ViduConfig {
  const apiKey = (process.env.EXPO_PUBLIC_VIDU_API_KEY ?? '').trim() || null;
  const baseUrl = (process.env.EXPO_PUBLIC_VIDU_BASE_URL ?? '').trim() || DEFAULT_BASE_URL;
  return {
    apiKey,
    baseUrl,
    mode: apiKey ? 'live' : 'mock',
  };
}
