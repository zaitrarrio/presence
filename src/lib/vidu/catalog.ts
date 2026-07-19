/**
 * A curated slice of what Vidu S1 exposes: 50+ voices and 28 languages.
 * These are the options we surface in Presence; the `id` / `code` values are
 * what get sent to POST /session.
 */
import type { CompanionConfig, LanguageOption, VoiceOption } from './types';

export const VOICES: VoiceOption[] = [
  { id: 'aria', name: 'Aria', timbre: 'Soft' },
  { id: 'noa', name: 'Noa', timbre: 'Warm' },
  { id: 'kai', name: 'Kai', timbre: 'Low' },
  { id: 'lumen', name: 'Lumen', timbre: 'Airy' },
  { id: 'sol', name: 'Sol', timbre: 'Bright' },
  { id: 'ember', name: 'Ember', timbre: 'Husky' },
  { id: 'iris', name: 'Iris', timbre: 'Clear' },
  { id: 'rowan', name: 'Rowan', timbre: 'Steady' },
];

export const LANGUAGES: LanguageOption[] = [
  { code: 'en', label: 'English' },
  { code: 'es', label: 'Español' },
  { code: 'fr', label: 'Français' },
  { code: 'de', label: 'Deutsch' },
  { code: 'pt', label: 'Português' },
  { code: 'ja', label: '日本語' },
  { code: 'ko', label: '한국어' },
  { code: 'zh', label: '中文' },
  { code: 'hi', label: 'हिन्दी' },
  { code: 'ar', label: 'العربية' },
];

export const DEFAULT_COMPANION: CompanionConfig = {
  name: 'Ava',
  avatarUri: null,
  voiceId: 'aria',
  languageCode: 'en',
  persona:
    'You are Ava, a calm, attentive companion. You speak in short, unhurried sentences, ' +
    'you remember what matters to the person, and you never rush them.',
};

export function voiceById(id: string): VoiceOption {
  return VOICES.find((v) => v.id === id) ?? VOICES[0];
}

export function languageByCode(code: string): LanguageOption {
  return LANGUAGES.find((l) => l.code === code) ?? LANGUAGES[0];
}
