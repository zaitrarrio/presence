/**
 * Home — the ambient presence.
 *
 * Lumen's idea of a launch screen: not a dashboard, just your companion as a
 * calm light in the room. The orb breathes; a single line invites you in; one
 * tap opens the live two-way call.
 */
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { PresenceOrb } from '@/components/PresenceOrb';
import { Screen } from '@/components/Screen';
import { Icon } from '@/components/Icon';
import { Eyebrow, Txt } from '@/components/ui';
import { useCompanion } from '@/lib/companion-store';
import { getViduConfig } from '@/lib/vidu/transport';
import { languageByCode, voiceById } from '@/lib/vidu/catalog';
import { radius, spacing, usePalette } from '@/theme';

export default function HomeScreen() {
  const p = usePalette();
  const router = useRouter();
  const { companion } = useCompanion();
  const mode = getViduConfig().mode;
  const voice = voiceById(companion.voiceId);
  const lang = languageByCode(companion.languageCode);

  return (
    <Screen>
      <View style={styles.rail}>
        <View style={styles.brand}>
          <View style={[styles.dot, { backgroundColor: p.nearby }]} />
          <Txt variant="label" weight="700" color={p.inkSoft} style={{ letterSpacing: 0.3 }}>
            Presence
          </Txt>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Companion settings"
          onPress={() => router.push('/settings')}
          hitSlop={10}
        >
          <Icon name="settings" size={22} color={p.muted} />
        </Pressable>
      </View>

      <View style={styles.center}>
        <PresenceOrb size={196} turn="idle" level={0} />
        <View style={{ alignItems: 'center', marginTop: spacing.xl, gap: spacing.sm }}>
          <Eyebrow color={p.muted}>{companion.name} is nearby</Eyebrow>
          <Txt variant="prompt" color={p.ink} align="center" style={{ maxWidth: 300 }}>
            Whenever you're ready, I'm listening.
          </Txt>
        </View>
      </View>

      <View style={{ gap: spacing.lg, paddingBottom: spacing.md }}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Start a live conversation with ${companion.name}`}
          onPress={() => router.push('/call')}
          style={({ pressed }) => [
            styles.enter,
            { backgroundColor: p.ink, opacity: pressed ? 0.92 : 1, shadowColor: p.accentDeep },
          ]}
        >
          <Icon name="wave" size={20} color={p.onAccent} />
          <Txt variant="body" weight="700" color={p.onAccent}>
            Spend a moment together
          </Txt>
        </Pressable>

        <View style={styles.metaRow}>
          <Meta label="Voice" value={`${voice.name} · ${voice.timbre}`} />
          <View style={[styles.sep, { backgroundColor: p.line }]} />
          <Meta label="Language" value={lang.label} />
          <View style={[styles.sep, { backgroundColor: p.line }]} />
          <Meta label="Session" value={mode === 'live' ? 'Live · Vidu S1' : 'Preview'} />
        </View>
      </View>
    </Screen>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  const p = usePalette();
  return (
    <View style={{ alignItems: 'center', gap: 3, flex: 1 }}>
      <Eyebrow color={p.faint}>{label}</Eyebrow>
      <Txt variant="caption" weight="600" color={p.inkSoft} align="center">
        {value}
      </Txt>
    </View>
  );
}

const styles = StyleSheet.create({
  rail: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: spacing.sm,
  },
  brand: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  dot: { width: 9, height: 9, borderRadius: 5 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  enter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    paddingVertical: 17,
    borderRadius: radius.pill,
    shadowOpacity: 0.3,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 12 },
    elevation: 5,
  },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  sep: { width: 1, height: 26 },
});
