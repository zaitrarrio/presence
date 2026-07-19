/**
 * Types shared across the Vidu S1 integration.
 *
 * Vidu S1 ("Vidu Stream") is a real-time interactive video model: you create a
 * session over HTTPS, stream two-way audio + video through AliRTC, and steer the
 * live character over a WebSocket. Billing meters only the live conversation
 * time. These types describe that surface so the live client and the mock speak
 * exactly the same language to the UI.
 */
import type { ReactNode } from 'react';

export interface VoiceOption {
  id: string;
  name: string;
  /** A one-word feel used in the picker: "Soft", "Warm", "Bright"... */
  timbre: string;
}

export interface LanguageOption {
  /** BCP-47-ish tag Vidu expects, e.g. "en", "ja", "es". */
  code: string;
  label: string;
}

/** The persona the user has shaped — the input to POST /session. */
export interface CompanionConfig {
  name: string;
  /** Avatar still: a single person, any style. URL or data URI. */
  avatarUri: string | null;
  voiceId: string;
  languageCode: string;
  /** System prompt / personality seeded into the session on connect. */
  persona: string;
}

/** Lifecycle of the live connection. */
export type ConnectionState = 'idle' | 'connecting' | 'live' | 'reconnecting' | 'ended' | 'error';

/** What the companion is doing right now — drives the orb + captions. */
export type Turn = 'idle' | 'listening' | 'thinking' | 'speaking';

export interface CaptionLine {
  id: string;
  role: 'companion' | 'you';
  text: string;
  /** False while streaming in word by word. */
  final: boolean;
}

export interface TransportEvents {
  /** Connection lifecycle changed. */
  state: (state: ConnectionState, detail?: string) => void;
  /** Conversational turn changed. */
  turn: (turn: Turn) => void;
  /** A caption line was added or updated (streaming). */
  caption: (line: CaptionLine) => void;
  /** Companion output audio level 0..1 — animates the orb while speaking. */
  level: (level: number) => void;
  /** Live seconds elapsed — what Vidu bills for. */
  meter: (seconds: number) => void;
  /** Fatal-ish error with a human message. */
  error: (message: string) => void;
}

export type TransportEvent = keyof TransportEvents;

export interface ConnectOptions {
  companion: CompanionConfig;
  /** Whether to open with mic hot. */
  micMuted: boolean;
  /** Whether the user's camera should be shared with the companion. */
  cameraEnabled: boolean;
}

/**
 * The seam every screen talks to. The live Vidu client and the offline mock
 * both implement this, so the UI never knows which one it's driving.
 */
export interface AvatarTransport {
  readonly mode: 'live' | 'mock';
  connect(opts: ConnectOptions): Promise<void>;
  disconnect(): Promise<void>;

  setMicMuted(muted: boolean): void;
  setCameraEnabled(enabled: boolean): void;

  /** Barge-in: cut the companion off mid-sentence. */
  interrupt(): void;
  /** Push a typed message into the conversation. */
  sendText(text: string): void;
  /**
   * Report local voice activity from the client's VAD so the companion knows
   * when you start and stop talking. `level` is 0..1 mic loudness.
   */
  setUserSpeaking(active: boolean, level?: number): void;

  /**
   * The companion's rendered video, when the transport has one (live AliRTC
   * stream). Returns null for the mock, where the ambient orb stands in.
   */
  getRemoteVideo(): ReactNode | null;

  on<E extends TransportEvent>(event: E, cb: TransportEvents[E]): () => void;
}
