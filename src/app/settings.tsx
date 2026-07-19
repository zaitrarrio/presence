/**
 * Settings — shape your companion.
 *
 * Every choice here becomes a field on POST /session: the name and persona seed
 * the character, the voice picks one of Vidu's 50+ voices, the language one of
 * its 28 locales.
 */
import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { Icon } from '@/components/Icon';
import { Screen } from '@/components/Screen';
import { Eyebrow, Pill, Txt } from '@/components/ui';
import { useCompanion } from '@/lib/companion-store';
import { LANGUAGES, VOICES } from '@/lib/vidu/catalog';
import { getViduConfig } from '@/lib/vidu/transport';
import { radius, spacing, usePalette } from '@/theme';

export default function SettingsScreen() {
  const p = usePalette();
  const router = useRouter();
  const { companion, update } = useCompanion();
  const mode = getViduConfig().mode;

  return (
    <Screen edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Txt variant="title" color={p.ink}>
          Your companion
        </Txt>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Close settings"
          onPress={() => router.back()}
          hitSlop={10}
        >
          <Icon name="close" size={22} color={p.muted} />
        </Pressable>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ gap: spacing.xxl, paddingVertical: spacing.lg, paddingBottom: spacing.xxxl }}
      >
        {/* Name */}
        <Field label="Name">
          <TextInput
            value={companion.name}
            onChangeText={(name) => update({ name })}
            placeholder="Ava"
            placeholderTextColor={p.faint}
            style={[
              styles.input,
              { color: p.ink, backgroundColor: p.surfaceSolid, borderColor: p.line },
            ]}
            maxLength={24}
            accessibilityLabel="Companion name"
          />
        </Field>

        {/* Voice */}
        <Field label="Voice" hint="One of 50+ Vidu S1 voices">
          <View style={styles.wrap}>
            {VOICES.map((v) => (
              <Pill
                key={v.id}
                selected={v.id === companion.voiceId}
                onPress={() => update({ voiceId: v.id })}
              >
                {`${v.name} · ${v.timbre}`}
              </Pill>
            ))}
          </View>
        </Field>

        {/* Language */}
        <Field label="Language" hint="Speaks 28 languages">
          <View style={styles.wrap}>
            {LANGUAGES.map((l) => (
              <Pill
                key={l.code}
                selected={l.code === companion.languageCode}
                onPress={() => update({ languageCode: l.code })}
              >
                {l.label}
              </Pill>
            ))}
          </View>
        </Field>

        {/* Persona */}
        <Field label="Personality" hint="Seeds the session on connect">
          <TextInput
            value={companion.persona}
            onChangeText={(persona) => update({ persona })}
            multiline
            style={[
              styles.input,
              styles.textarea,
              { color: p.inkSoft, backgroundColor: p.surfaceSolid, borderColor: p.line },
            ]}
            accessibilityLabel="Companion personality"
          />
        </Field>

        {/* Mode / key note */}
        <View style={[styles.note, { borderColor: p.line, backgroundColor: p.accentSoft }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
            <View
              style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: mode === 'live' ? p.nearby : p.accent }}
            />
            <Eyebrow color={p.inkSoft}>
              {mode === 'live' ? 'Live — connected to Vidu S1' : 'Preview mode'}
            </Eyebrow>
          </View>
          <Txt variant="caption" color={p.muted} style={{ marginTop: spacing.sm }}>
            {mode === 'live'
              ? 'Conversations run against the real Vidu S1 API and are billed per live minute.'
              : 'Running the built-in mock companion. Add EXPO_PUBLIC_VIDU_API_KEY to your .env to go live with real interactive video.'}
          </Txt>
        </View>
      </ScrollView>
    </Screen>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  const p = usePalette();
  return (
    <View style={{ gap: spacing.md }}>
      <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: spacing.sm }}>
        <Eyebrow color={p.muted}>{label}</Eyebrow>
        {hint ? (
          <Txt variant="caption" color={p.faint}>
            {hint}
          </Txt>
        ) : null}
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: spacing.sm,
  },
  input: {
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    fontSize: 16,
  },
  textarea: { minHeight: 96, textAlignVertical: 'top', fontSize: 14, lineHeight: 20 },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  note: { borderWidth: 1, borderRadius: radius.md, padding: spacing.lg },
});
