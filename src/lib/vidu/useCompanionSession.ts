/**
 * useCompanionSession — the live-call state machine for a screen.
 *
 * Owns a transport (live Vidu or mock), subscribes to its events, and exposes
 * plain React state + imperative controls. The Call screen renders this; it
 * never touches the transport directly.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { createTransport, getViduConfig } from './transport';
import type {
  AvatarTransport,
  CaptionLine,
  CompanionConfig,
  ConnectionState,
  Turn,
} from './types';

const MAX_CAPTIONS = 40;

export interface SessionControls {
  mode: 'live' | 'mock';
  state: ConnectionState;
  turn: Turn;
  level: number;
  meterSeconds: number;
  captions: CaptionLine[];
  latestCompanionLine: CaptionLine | null;
  error: string | null;
  micMuted: boolean;
  cameraEnabled: boolean;

  toggleMic: () => void;
  toggleCamera: () => void;
  interrupt: () => void;
  sendText: (text: string) => void;
  setUserSpeaking: (active: boolean, level?: number) => void;
  end: () => void;
}

export function useCompanionSession(
  companion: CompanionConfig,
  opts: { autoStart?: boolean; startCameraOn?: boolean } = {},
): SessionControls {
  const { autoStart = true, startCameraOn = true } = opts;

  const [state, setState] = useState<ConnectionState>('idle');
  const [turn, setTurn] = useState<Turn>('idle');
  const [level, setLevel] = useState(0);
  const [meterSeconds, setMeterSeconds] = useState(0);
  const [captions, setCaptions] = useState<CaptionLine[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [micMuted, setMicMuted] = useState(false);
  const [cameraEnabled, setCameraEnabled] = useState(startCameraOn);

  const transportRef = useRef<AvatarTransport | null>(null);
  const mode = useRef(getViduConfig().mode).current;

  useEffect(() => {
    if (!autoStart) return;
    const transport = createTransport();
    transportRef.current = transport;

    const unsubs = [
      transport.on('state', (s, detail) => {
        setState(s);
        if (s === 'error' && detail) setError(detail);
      }),
      transport.on('turn', setTurn),
      transport.on('level', setLevel),
      transport.on('meter', setMeterSeconds),
      transport.on('error', setError),
      transport.on('caption', (line) =>
        setCaptions((prev) => {
          const idx = prev.findIndex((l) => l.id === line.id);
          const next = idx >= 0 ? prev.map((l) => (l.id === line.id ? line : l)) : [...prev, line];
          return next.slice(-MAX_CAPTIONS);
        }),
      ),
    ];

    transport.connect({ companion, micMuted: false, cameraEnabled: startCameraOn }).catch(() => {
      /* error already surfaced via the error event */
    });

    return () => {
      unsubs.forEach((u) => u());
      transport.disconnect().catch(() => undefined);
      transportRef.current = null;
    };
    // Connect once per mount; companion is captured at connect time.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleMic = useCallback(() => {
    setMicMuted((m) => {
      const next = !m;
      transportRef.current?.setMicMuted(next);
      return next;
    });
  }, []);

  const toggleCamera = useCallback(() => {
    setCameraEnabled((c) => {
      const next = !c;
      transportRef.current?.setCameraEnabled(next);
      return next;
    });
  }, []);

  const interrupt = useCallback(() => transportRef.current?.interrupt(), []);
  const sendText = useCallback((text: string) => transportRef.current?.sendText(text), []);
  const setUserSpeaking = useCallback(
    (active: boolean, lvl?: number) => transportRef.current?.setUserSpeaking(active, lvl),
    [],
  );
  const end = useCallback(() => {
    transportRef.current?.disconnect().catch(() => undefined);
    setState('ended');
  }, []);

  const latestCompanionLine =
    [...captions].reverse().find((l) => l.role === 'companion') ?? null;

  return {
    mode,
    state,
    turn,
    level,
    meterSeconds,
    captions,
    latestCompanionLine,
    error,
    micMuted,
    cameraEnabled,
    toggleMic,
    toggleCamera,
    interrupt,
    sendText,
    setUserSpeaking,
    end,
  };
}
