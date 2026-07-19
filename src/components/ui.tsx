/** Small shared primitives so screens stay declarative and on-brand. */
import { BlurView } from 'expo-blur';
import type { ReactNode } from 'react';
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import { Icon, type IconName } from './Icon';
import { radius, spacing, type, usePalette, useScheme } from '@/theme';

type TypeToken = keyof typeof type;

export function Txt({
  variant = 'body',
  color,
  weight,
  align,
  style,
  children,
}: {
  variant?: TypeToken;
  color?: string;
  weight?: TextStyle['fontWeight'];
  align?: TextStyle['textAlign'];
  style?: StyleProp<TextStyle>;
  children: ReactNode;
}) {
  const p = usePalette();
  return (
    <Text
      style={[
        type[variant],
        { color: color ?? p.ink },
        weight ? { fontWeight: weight } : null,
        align ? { textAlign: align } : null,
        style,
      ]}
    >
      {children}
    </Text>
  );
}

export function Eyebrow({ children, color }: { children: ReactNode; color?: string }) {
  const p = usePalette();
  return (
    <Txt
      variant="eyebrow"
      weight="700"
      color={color ?? p.muted}
      style={{ textTransform: 'uppercase' }}
    >
      {children}
    </Txt>
  );
}

/** A round, tappable control used across the call surface. */
export function IconButton({
  name,
  onPress,
  size = 54,
  tone = 'neutral',
  active = false,
  disabled = false,
  label,
}: {
  name: IconName;
  onPress?: () => void;
  size?: number;
  tone?: 'neutral' | 'accent' | 'danger';
  active?: boolean;
  disabled?: boolean;
  label: string;
}) {
  const p = usePalette();
  const bg =
    tone === 'danger'
      ? p.danger
      : tone === 'accent'
        ? p.accent
        : active
          ? p.lineStrong
          : p.surfaceSolid;
  const fg = tone === 'neutral' ? (active ? p.ink : p.inkSoft) : p.onAccent;
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: bg,
          borderWidth: tone === 'neutral' ? 1 : 0,
          borderColor: p.line,
          alignItems: 'center',
          justifyContent: 'center',
          opacity: disabled ? 0.4 : pressed ? 0.85 : 1,
        },
        tone !== 'neutral' && styles.shadow,
      ]}
    >
      <Icon name={name} size={size * 0.42} color={fg} />
    </Pressable>
  );
}

export function Pill({
  children,
  onPress,
  selected,
  tone = 'default',
}: {
  children: ReactNode;
  onPress?: () => void;
  selected?: boolean;
  tone?: 'default' | 'live';
}) {
  const p = usePalette();
  const bg = selected ? p.accent : tone === 'live' ? p.accentSoft : p.surfaceSolid;
  const fg = selected ? p.onAccent : p.inkSoft;
  const Comp: any = onPress ? Pressable : View;
  return (
    <Comp
      onPress={onPress}
      accessibilityRole={onPress ? 'button' : undefined}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.lg,
        borderRadius: radius.pill,
        backgroundColor: bg,
        borderWidth: selected ? 0 : 1,
        borderColor: p.line,
      }}
    >
      {typeof children === 'string' ? (
        <Txt variant="label" weight="600" color={fg}>
          {children}
        </Txt>
      ) : (
        children
      )}
    </Comp>
  );
}

/** Frosted surface — real blur on native, a translucent card on web. */
export function GlassPanel({
  children,
  style,
  intensity = 40,
}: {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  intensity?: number;
}) {
  const p = usePalette();
  const scheme = useScheme();
  if (Platform.OS === 'web') {
    return (
      <View
        style={[
          {
            backgroundColor: p.surface,
            borderRadius: radius.lg,
            borderWidth: 1,
            borderColor: p.line,
            // @ts-expect-error web-only style
            backdropFilter: 'blur(22px)',
          },
          style,
        ]}
      >
        {children}
      </View>
    );
  }
  return (
    <BlurView
      intensity={intensity}
      tint={scheme === 'dark' ? 'dark' : 'light'}
      style={[
        { borderRadius: radius.lg, overflow: 'hidden', borderWidth: 1, borderColor: p.line },
        style,
      ]}
    >
      {children}
    </BlurView>
  );
}

const styles = StyleSheet.create({
  shadow: {
    shadowColor: '#3a3550',
    shadowOpacity: 0.28,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 6,
  },
});
