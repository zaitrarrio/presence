/**
 * AvatarStage — the companion's side of the call.
 *
 * If the transport supplies a live video (AliRTC remote track), it fills the
 * stage. Otherwise the PresenceOrb stands in — which is exactly Lumen's intent:
 * presence as a calm light, not a literal face. A soft status word tells you
 * what the companion is doing.
 */
import type { ReactNode } from 'react';
import { View } from 'react-native';
import { PresenceOrb } from './PresenceOrb';
import { Eyebrow } from './ui';
import { spacing, usePalette } from '@/theme';
import type { ConnectionState, Turn } from '@/lib/vidu/types';

const STATUS: Record<Turn, string> = {
  idle: 'here',
  listening: 'listening',
  thinking: 'thinking',
  speaking: 'speaking',
};

export function AvatarStage({
  turn,
  level,
  state,
  remoteVideo,
  orbSize = 200,
}: {
  turn: Turn;
  level: number;
  state: ConnectionState;
  remoteVideo: ReactNode | null;
  orbSize?: number;
}) {
  const p = usePalette();
  const statusWord =
    state === 'connecting'
      ? 'connecting'
      : state === 'reconnecting'
        ? 'reconnecting'
        : state === 'ended'
          ? 'until next time'
          : STATUS[turn];

  return (
    <View style={{ alignItems: 'center', justifyContent: 'center' }}>
      {remoteVideo ? (
        <View style={{ borderRadius: 28, overflow: 'hidden' }}>{remoteVideo}</View>
      ) : (
        <PresenceOrb size={orbSize} level={level} turn={turn} />
      )}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: spacing.sm,
          marginTop: spacing.md,
        }}
      >
        <View
          style={{
            width: 7,
            height: 7,
            borderRadius: 4,
            backgroundColor: turn === 'speaking' ? p.accent : p.nearby,
          }}
        />
        <Eyebrow color={p.muted}>{statusWord}</Eyebrow>
      </View>
    </View>
  );
}
