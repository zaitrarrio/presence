/**
 * ViduClient — the live Vidu S1 transport.
 *
 * Faithful to the documented flow:
 *   1. POST /v1/sessions  ......... create a session from avatar + voice + language
 *   2. AliRTC join ................ two-way audio + video (see attachMedia)
 *   3. WebSocket control .......... mute / interrupt / text / captions / events
 *   4. meter ...................... server reports billed live seconds
 *
 * The HTTP + WebSocket halves are implemented for real. The AliRTC media join
 * is isolated in attachMedia(): it needs the AliRTC SDK and a running key, so
 * it's the one seam you wire up when going live. Until then the ambient orb
 * stands in for the remote video and captions/turns still flow over the socket.
 */
import type { ReactNode } from 'react';
import { Emitter, uid } from './emitter';
import type { ViduConfig } from './config';
import type {
  AvatarTransport,
  ConnectOptions,
  ConnectionState,
  TransportEvents,
  Turn,
} from './types';

interface SessionResponse {
  session_id: string;
  /** Control-plane socket for steering the character. */
  control_url: string;
  /** AliRTC join credentials. */
  rtc: {
    app_id: string;
    channel: string;
    token: string;
    user_id: string;
    gateway?: string;
  };
}

/** Events the server streams over the control socket. */
type ServerEvent =
  | { type: 'turn'; turn: Turn }
  | { type: 'caption'; role: 'companion' | 'you'; text: string; final: boolean; id?: string }
  | { type: 'level'; value: number }
  | { type: 'meter'; seconds: number }
  | { type: 'error'; message: string };

export class ViduClient extends Emitter<TransportEvents> implements AvatarTransport {
  readonly mode = 'live' as const;
  private ws: WebSocket | null = null;
  private session: SessionResponse | null = null;
  private state: ConnectionState = 'idle';

  constructor(private readonly config: ViduConfig) {
    super();
  }

  async connect(opts: ConnectOptions): Promise<void> {
    this.setState('connecting');
    try {
      this.session = await this.createSession(opts);
      await this.openControlSocket(this.session.control_url);
      await this.attachMedia(this.session.rtc, opts);
      this.setState('live');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Could not reach your companion.';
      this.emit('error', message);
      this.setState('error', message);
      throw err;
    }
  }

  async disconnect(): Promise<void> {
    try {
      if (this.session) {
        await fetch(`${this.config.baseUrl}/v1/sessions/${this.session.session_id}`, {
          method: 'DELETE',
          headers: this.authHeaders(),
        }).catch(() => undefined);
      }
    } finally {
      this.ws?.close();
      this.ws = null;
      this.session = null;
      this.setState('ended');
      this.clearListeners();
    }
  }

  setMicMuted(muted: boolean): void {
    this.send({ type: 'mic', muted });
  }

  setCameraEnabled(enabled: boolean): void {
    this.send({ type: 'camera', enabled });
  }

  interrupt(): void {
    this.send({ type: 'interrupt' });
  }

  sendText(text: string): void {
    const trimmed = text.trim();
    if (!trimmed) return;
    this.send({ type: 'text', text: trimmed });
  }

  setUserSpeaking(active: boolean, level = 0): void {
    this.send({ type: 'vad', active, level });
  }

  getRemoteVideo(): ReactNode | null {
    // Rendered by attachMedia once the AliRTC remote track is bound.
    return this.remoteVideo;
  }

  // ---- HTTP -----------------------------------------------------------------

  private async createSession(opts: ConnectOptions): Promise<SessionResponse> {
    const { companion } = opts;
    const res = await fetch(`${this.config.baseUrl}/v1/sessions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...this.authHeaders() },
      body: JSON.stringify({
        avatar: companion.avatarUri,
        voice: companion.voiceId,
        language: companion.languageCode,
        persona: companion.persona,
        modalities: ['audio', 'video'],
        // We send our camera up so the character can see the user.
        input_video: opts.cameraEnabled,
        start_muted: opts.micMuted,
      }),
    });
    if (!res.ok) {
      throw new Error(`Vidu session failed (${res.status}). Check your API key and quota.`);
    }
    return (await res.json()) as SessionResponse;
  }

  private authHeaders(): Record<string, string> {
    return { Authorization: `Bearer ${this.config.apiKey ?? ''}` };
  }

  // ---- WebSocket control ----------------------------------------------------

  private openControlSocket(url: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const ws = new WebSocket(url);
      this.ws = ws;
      const timeout = setTimeout(() => reject(new Error('Control socket timed out.')), 10000);

      ws.onopen = () => {
        clearTimeout(timeout);
        resolve();
      };
      ws.onerror = () => {
        clearTimeout(timeout);
        reject(new Error('Control socket error.'));
      };
      ws.onclose = () => {
        if (this.state === 'live') this.setState('reconnecting');
      };
      ws.onmessage = (ev) => this.onServerEvent(ev.data);
    });
  }

  private onServerEvent(raw: unknown): void {
    let evt: ServerEvent;
    try {
      evt = JSON.parse(String(raw)) as ServerEvent;
    } catch {
      return;
    }
    switch (evt.type) {
      case 'turn':
        this.emit('turn', evt.turn);
        break;
      case 'caption':
        this.emit('caption', {
          id: evt.id ?? uid(evt.role),
          role: evt.role,
          text: evt.text,
          final: evt.final,
        });
        break;
      case 'level':
        this.emit('level', evt.value);
        break;
      case 'meter':
        this.emit('meter', evt.seconds);
        break;
      case 'error':
        this.emit('error', evt.message);
        break;
    }
  }

  private send(payload: Record<string, unknown>): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(payload));
    }
  }

  // ---- AliRTC media ---------------------------------------------------------

  private remoteVideo: ReactNode | null = null;

  /**
   * Join the AliRTC channel: publish the local mic + front camera and subscribe
   * to the companion's rendered video. This is where the AliRTC SDK plugs in
   * (`aliyun-rtc-sdk` on web, the native SDK via a config plugin on device).
   * Left as an explicit seam because it requires the SDK and live credentials.
   */
  private async attachMedia(_rtc: SessionResponse['rtc'], _opts: ConnectOptions): Promise<void> {
    // e.g. on web:
    //   const engine = AliRtcEngine.getInstance();
    //   await engine.joinChannel(rtc.token, rtc.channel, rtc.user_id);
    //   engine.publish();  // mic + camera
    //   engine.on('remoteTrackAvailable', track => this.remoteVideo = <VideoView track={track}/>);
    return;
  }

  private setState(state: ConnectionState, detail?: string): void {
    this.state = state;
    this.emit('state', state, detail);
  }
}
