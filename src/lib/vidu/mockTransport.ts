/**
 * MockTransport — a fully offline stand-in for a live Vidu S1 session.
 *
 * It drives the same events a real session would (connect → greet → listen →
 * think → speak, with streaming captions, an audio level for the orb, and a
 * live meter), so the whole app is interactive with no API key. Swap in the
 * live client and every screen behaves identically.
 */
import type { ReactNode } from 'react';
import { Emitter, uid } from './emitter';
import type {
  AvatarTransport,
  CaptionLine,
  ConnectOptions,
  TransportEvents,
  Turn,
} from './types';

const GREETINGS = [
  "I'm here. Take your time — there's no rush.",
  "Hey, you. I've been right here. How are you arriving today?",
  "Good to see you. What's present for you right now?",
];

const REPLIES = [
  "Mm. I'm listening — tell me more about that.",
  "That sounds like it's been sitting with you. I'm glad you said it out loud.",
  "Take a breath with me. We can stay with this as long as you need.",
  "I hear you. What would feel like a small kindness to yourself right now?",
  "Thank you for trusting me with that. Nothing about it is too small.",
  "You don't have to have it figured out. I'm not going anywhere.",
];

// The mock has no speech-to-text, so it can't know your words. These stand in
// for the transcript of what you said, purely so the demo reads naturally.
const YOU_PLACEHOLDERS = [
  "I've had a lot on my mind today.",
  "Honestly, I'm just tired.",
  "It's been a strange week.",
  "I wanted to hear a familiar voice.",
];

export class MockTransport extends Emitter<TransportEvents> implements AvatarTransport {
  readonly mode = 'mock' as const;

  private meterSeconds = 0;
  private meterTimer: ReturnType<typeof setInterval> | null = null;
  private levelTimer: ReturnType<typeof setInterval> | null = null;
  private streamTimer: ReturnType<typeof setInterval> | null = null;
  private pending: ReturnType<typeof setTimeout>[] = [];
  private replyIndex = 0;
  private youIndex = 0;
  private micMuted = false;
  private disposed = false;

  async connect(opts: ConnectOptions): Promise<void> {
    this.micMuted = opts.micMuted;
    this.emit('state', 'connecting');
    this.after(700, () => {
      this.emit('state', 'live');
      this.startMeter();
      this.speak(GREETINGS[Math.floor(Math.random() * GREETINGS.length)]);
    });
  }

  async disconnect(): Promise<void> {
    this.disposed = true;
    this.stopAllTimers();
    this.emit('turn', 'idle');
    this.emit('state', 'ended');
    this.clearListeners();
  }

  setMicMuted(muted: boolean): void {
    this.micMuted = muted;
  }

  setCameraEnabled(_enabled: boolean): void {
    /* the mock companion doesn't consume your video; live AliRTC would. */
  }

  interrupt(): void {
    this.stopSpeaking();
    this.setTurn('listening');
  }

  sendText(text: string): void {
    const trimmed = text.trim();
    if (!trimmed) return;
    this.emitCaption({ id: uid('you'), role: 'you', text: trimmed, final: true });
    this.think(() => this.speak(this.nextReply()));
  }

  setUserSpeaking(active: boolean, level = 0): void {
    if (this.micMuted) return;
    if (active) {
      // Barge-in: your voice cuts the companion off, then it listens.
      this.stopSpeaking();
      this.setTurn('listening');
      this.emit('level', Math.min(1, level));
    } else {
      // You stopped talking — drop in a stand-in transcript line, then reply.
      const text = YOU_PLACEHOLDERS[this.youIndex % YOU_PLACEHOLDERS.length];
      this.youIndex += 1;
      this.emitCaption({ id: uid('you'), role: 'you', text, final: true });
      this.think(() => this.speak(this.nextReply()));
    }
  }

  getRemoteVideo(): ReactNode | null {
    return null; // ambient orb stands in for the mock; live mode returns a stream view
  }

  // ---- internals -----------------------------------------------------------

  private nextReply(): string {
    const reply = REPLIES[this.replyIndex % REPLIES.length];
    this.replyIndex += 1;
    return reply;
  }

  private think(then: () => void): void {
    this.setTurn('thinking');
    this.after(650 + Math.random() * 500, then);
  }

  private speak(text: string): void {
    if (this.disposed) return;
    this.stopSpeaking();
    this.setTurn('speaking');
    this.startLevels();

    const words = text.split(' ');
    const line: CaptionLine = { id: uid('ava'), role: 'companion', text: '', final: false };
    let i = 0;
    this.streamTimer = setInterval(() => {
      line.text = words.slice(0, i + 1).join(' ');
      i += 1;
      const done = i >= words.length;
      this.emitCaption({ ...line, final: done });
      if (done) {
        this.stopStream();
        // A beat of quiet, then hand the turn back to you.
        this.after(500, () => {
          this.stopLevels();
          this.setTurn('listening');
        });
      }
    }, 62);
  }

  private stopSpeaking(): void {
    this.stopStream();
    this.stopLevels();
  }

  private startLevels(): void {
    this.stopLevels();
    this.levelTimer = setInterval(() => {
      // A gentle, speech-like envelope for the orb.
      const base = 0.45 + Math.random() * 0.4;
      this.emit('level', Math.min(1, base));
    }, 90);
  }

  private stopLevels(): void {
    if (this.levelTimer) clearInterval(this.levelTimer);
    this.levelTimer = null;
    this.emit('level', 0.06);
  }

  private stopStream(): void {
    if (this.streamTimer) clearInterval(this.streamTimer);
    this.streamTimer = null;
  }

  private startMeter(): void {
    this.meterTimer = setInterval(() => {
      this.meterSeconds += 1;
      this.emit('meter', this.meterSeconds);
    }, 1000);
  }

  private setTurn(turn: Turn): void {
    this.emit('turn', turn);
  }

  private emitCaption(line: CaptionLine): void {
    this.emit('caption', line);
  }

  private after(ms: number, fn: () => void): void {
    const t = setTimeout(() => {
      this.pending = this.pending.filter((p) => p !== t);
      if (!this.disposed) fn();
    }, ms);
    this.pending.push(t);
  }

  private stopAllTimers(): void {
    [this.meterTimer, this.levelTimer, this.streamTimer].forEach((t) => t && clearInterval(t));
    this.pending.forEach((t) => clearTimeout(t));
    this.meterTimer = this.levelTimer = this.streamTimer = null;
    this.pending = [];
  }
}
