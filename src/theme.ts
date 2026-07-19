/**
 * Lumen — the visual language for Presence.
 * Calm, light-forward, a single cool accent and a warm-neutral ink.
 * One token set per color scheme; every screen reads from here.
 */
import { Platform, useColorScheme } from 'react-native';

export type Scheme = 'light' | 'dark';

const shared = {
  // The presence orb is a light source — same hues on either ground.
  orbCore: '#ffffff',
  orbInner: '#c9d3f5',
  orbMid: '#8f9ee0',
  orbDeep: '#5b68c4',
  danger: '#e0646d',
  onAccent: '#ffffff',
};

export const palettes = {
  light: {
    ...shared,
    bg: '#EEEBF5',
    bgTop: '#F6F4FB',
    surface: 'rgba(251,250,253,0.82)',
    surfaceSolid: '#FBFAFD',
    ink: '#211F2B',
    inkSoft: '#4A4658',
    muted: '#7C7790',
    faint: '#A9A4B8',
    line: '#E1DCEE',
    lineStrong: '#D2CBE4',
    accent: '#6675D6',
    accentDeep: '#5462C6',
    accentSoft: 'rgba(102,117,214,0.12)',
    nearby: '#2E9E8A',
    scrim: 'rgba(20,16,34,0.34)',
  },
  dark: {
    ...shared,
    bg: '#0D0C13',
    bgTop: '#14121D',
    surface: 'rgba(26,24,38,0.72)',
    surfaceSolid: '#191725',
    ink: '#ECEAF3',
    inkSoft: '#C6C1D6',
    muted: '#8F88A3',
    faint: '#655F78',
    line: '#241F33',
    lineStrong: '#2E2942',
    accent: '#8E9AEC',
    accentDeep: '#A7B0F0',
    accentSoft: 'rgba(142,154,236,0.16)',
    nearby: '#57E6CC',
    scrim: 'rgba(0,0,0,0.5)',
  },
};

export type Palette = (typeof palettes)['light'];

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 36,
  xxxl: 56,
} as const;

export const radius = {
  sm: 12,
  md: 18,
  lg: 26,
  xl: 34,
  pill: 999,
} as const;

export const fonts = Platform.select({
  web: { serif: 'var(--font-serif)', sans: 'var(--font-display)', mono: 'var(--font-mono)' },
  ios: { serif: 'Georgia', sans: 'System', mono: 'ui-monospace' },
  default: { serif: 'serif', sans: 'System', mono: 'monospace' },
})!;

export const type = {
  display: { fontFamily: fonts.serif, fontSize: 30, lineHeight: 38 },
  title: { fontFamily: fonts.serif, fontSize: 22, lineHeight: 28 },
  prompt: { fontFamily: fonts.serif, fontSize: 21, lineHeight: 29 },
  body: { fontFamily: fonts.sans, fontSize: 15, lineHeight: 22 },
  label: { fontFamily: fonts.sans, fontSize: 13, lineHeight: 18 },
  caption: { fontFamily: fonts.sans, fontSize: 12, lineHeight: 16 },
  eyebrow: { fontFamily: fonts.sans, fontSize: 11, lineHeight: 14, letterSpacing: 1.6 },
  mono: { fontFamily: fonts.mono, fontSize: 12, lineHeight: 16 },
} as const;

export function usePalette(): Palette {
  const scheme = useColorScheme();
  return scheme === 'dark' ? palettes.dark : palettes.light;
}

export function useScheme(): Scheme {
  return useColorScheme() === 'dark' ? 'dark' : 'light';
}
