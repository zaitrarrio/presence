/**
 * Call — the live, two-way conversation.
 *
 * The companion (orb, or live AliRTC video when connected) sits center stage;
 * your own front camera rides in the corner because Presence is a companion that
 * can see you. Hold to talk, release to listen. A quiet meter shows the live
 * time Vidu bills for.
 */
import { useRouter } from 'expo-router';
import { useKeepAwake } from 'expo-keep-awake';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { AvatarStage } from '@/components/AvatarStage';
import { Captions } from '@/components/Captions';
import { HoldToTalk } from '@/components/HoldToTalk';
import { Icon } from '@/components/Icon';
import { Screen } from '@/components/Screen';
import { SelfCamera } from '@/components/SelfCamera';
import { Eyebrow, IconButton, Txt } from '@/components/ui';
import { useCompanion } from '@/lib/companion-store';
import { useCompanionSession } from '@/lib/vidu/useCompanionSession';
import { spacing, usePalette } from '@/theme';

function clock(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function CallScreen() {
  useKeepAwake();
  const p = usePalette();
  const router = useRouter();
  const { companion } = useCompanion();
  const session = useCompanionSession(companion);

  const youLine = [...session.captions].reverse().find((l) => l.role === 'you') ?? null;
  const live = session.state === 'live' || session.state === 'reconnecting';

  useEffect(() => {
    if (session.state === 'ended') {
      const t = setTimeout(() => router.back(), 200);
      return () => clearTimeout(t);
    }
  }, [session.state, router]);

  const end = () => session.end();

  return (
    <Screen edges={['top', 'bottom']}>
      {/* Top bar: identity, meter, mode */}
      <View style={styles.top}>
        <View style={{ gap: 2 }}>
          <Txt variant="title" color={p.ink}>
            {companion.name}
          </Txt>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
            <View
              style={{
                width: 7,
                height: 7,
                borderRadius: 4,
                backgroundColor: live ? p.nearby : p.faint,
              }}
            />
            <Eyebrow color={p.muted}>
              {session.mode === 'live' ? 'Vidu S1 · live' : 'Preview · mock'} · {clock(session.meterSeconds)}
            </Eyebrow>
          </View>
        </View>
        <SelfCamera enabled={session.cameraEnabled} width={92} height={124} />
      </View>

      {/* Stage + captions */}
      <View style={styles.stage}>
        <AvatarStage
          turn={session.turn}
          level={session.level}
          state={session.state}
          remoteVideo={null}
          orbSize={196}
        />
        <View style={{ marginTop: spacing.xxl, width: '100%' }}>
          <Captions companionLine={session.latestCompanionLine} youLine={youLine} />
        </View>
        {session.error ? (
          <Txt variant="caption" color={p.danger} align="center" style={{ marginTop: spacing.md }}>
            {session.error}
          </Txt>
        ) : null}
      </View>

      {/* Controls */}
      <View style={{ gap: spacing.xl, paddingBottom: spacing.md }}>
        <HoldToTalk
          disabled={session.micMuted || !live}
          onStart={() => session.setUserSpeaking(true, 0.7)}
          onStop={() => session.setUserSpeaking(false)}
        />
        <View style={styles.dock}>
          <IconButton
            name={session.micMuted ? 'mic-off' : 'mic'}
            label={session.micMuted ? 'Unmute microphone' : 'Mute microphone'}
            active={session.micMuted}
            onPress={session.toggleMic}
          />
          <IconButton
            name={session.cameraEnabled ? 'video' : 'video-off'}
            label={session.cameraEnabled ? 'Turn camera off' : 'Turn camera on'}
            active={!session.cameraEnabled}
            onPress={session.toggleCamera}
          />
          <IconButton name="end" label="End conversation" tone="danger" size={64} onPress={end} />
        </View>
        <View style={{ alignItems: 'center' }}>
          <Txt variant="caption" color={p.faint} align="center">
            {live
              ? 'Billed only while you’re live together'
              : session.state === 'connecting'
                ? 'Reaching your companion…'
                : 'Ending…'}
          </Txt>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  top: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingTop: spacing.sm,
  },
  stage: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  dock: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xl,
  },
});
