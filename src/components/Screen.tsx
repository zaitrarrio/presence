/** Full-bleed Lumen background: a soft vertical wash under safe-area padding. */
import { LinearGradient } from 'expo-linear-gradient';
import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';
import { spacing, usePalette } from '@/theme';

export function Screen({
  children,
  edges = ['top', 'bottom'],
  padded = true,
}: {
  children: ReactNode;
  edges?: Edge[];
  padded?: boolean;
}) {
  const p = usePalette();
  return (
    <View style={styles.root}>
      <LinearGradient
        colors={[p.bgTop, p.bg]}
        start={{ x: 0.2, y: 0 }}
        end={{ x: 0.8, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <SafeAreaView
        edges={edges}
        style={[styles.safe, padded && { paddingHorizontal: spacing.xl }]}
      >
        {children}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1, width: '100%', maxWidth: 520, alignSelf: 'center' },
});
