/**
 * HoldToTalk — press and hold to speak; release to let the companion answer.
 *
 * This is the app's primary input. Holding reports voice activity to the
 * transport (real VAD would feed the mic level here); releasing hands the turn
 * back. Works with touch and mouse, so it's identical on device and web.
 */
import * as Haptics from 'expo-haptics';
import { useState } from 'react';
import { Platform, Pressable, View } from 'react-native';
import { Waveform } from './Waveform';
import { Txt } from './ui';
import { radius, spacing, usePalette } from '@/theme';

export function HoldToTalk({
  disabled,
  onStart,
  onStop,
}: {
  disabled?: boolean;
  onStart: () => void;
  onStop: () => void;
}) {
  const p = usePalette();
  const [held, setHeld] = useState(false);

  const start = () => {
    if (disabled) return;
    setHeld(true);
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    onStart();
  };
  const stop = () => {
    if (!held) return;
    setHeld(false);
    onStop();
  };

  return (
    <Pressable
      onPressIn={start}
      onPressOut={stop}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel="Hold to talk to your companion"
      accessibilityState={{ disabled: !!disabled, busy: held }}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.md,
        alignSelf: 'center',
        paddingVertical: 16,
        paddingHorizontal: 30,
        borderRadius: radius.pill,
        backgroundColor: held ? p.accent : p.ink,
        opacity: disabled ? 0.4 : pressed ? 0.94 : 1,
        transform: [{ scale: held ? 1.03 : 1 }],
        shadowColor: p.accentDeep,
        shadowOpacity: held ? 0.5 : 0.28,
        shadowRadius: 22,
        shadowOffset: { width: 0, height: 12 },
        elevation: 6,
      })}
    >
      <View style={{ width: 22, alignItems: 'center' }}>
        <Waveform active={held} color={p.onAccent} height={18} />
      </View>
      <Txt variant="label" weight="700" color={p.onAccent}>
        {held ? 'Listening…' : disabled ? 'Muted' : 'Hold to talk'}
      </Txt>
    </Pressable>
  );
}
