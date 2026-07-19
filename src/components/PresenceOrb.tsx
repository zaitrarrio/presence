/**
 * PresenceOrb — the ambient centerpiece.
 *
 * A soft light that is always alive: it breathes slowly at rest, swells with the
 * companion's voice level while speaking, and tightens into a focused ring while
 * listening. Built from SVG radial gradients so it renders identically on web,
 * iOS, and Android; animated with the core Animated API (no worklet setup).
 */
import { useEffect, useMemo, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import Svg, { Circle, Defs, RadialGradient, Stop } from 'react-native-svg';
import { usePalette } from '@/theme';
import type { Turn } from '@/lib/vidu/types';

const AnimatedView = Animated.View;

export function PresenceOrb({
  size = 220,
  level = 0,
  turn = 'idle',
}: {
  size?: number;
  level?: number;
  turn?: Turn;
}) {
  const p = usePalette();
  const breath = useRef(new Animated.Value(0)).current;
  const energy = useRef(new Animated.Value(0)).current;
  const ring = useRef(new Animated.Value(0)).current;

  // Slow, continuous breathing.
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(breath, {
          toValue: 1,
          duration: 3400,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(breath, {
          toValue: 0,
          duration: 3400,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [breath]);

  // Follow the live audio level with a little inertia.
  useEffect(() => {
    Animated.spring(energy, {
      toValue: turn === 'speaking' ? level : 0,
      useNativeDriver: true,
      damping: 14,
      stiffness: 120,
      mass: 0.6,
    }).start();
  }, [level, turn, energy]);

  // A listening ripple.
  useEffect(() => {
    if (turn !== 'listening') {
      ring.stopAnimation();
      ring.setValue(0);
      return;
    }
    const loop = Animated.loop(
      Animated.timing(ring, {
        toValue: 1,
        duration: 2600,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
    );
    loop.start();
    return () => loop.stop();
  }, [turn, ring]);

  const scale = Animated.add(
    1,
    Animated.add(
      breath.interpolate({ inputRange: [0, 1], outputRange: [0, 0.045] }),
      energy.interpolate({ inputRange: [0, 1], outputRange: [0, 0.14], extrapolate: 'clamp' }),
    ),
  );
  const haloOpacity = energy.interpolate({
    inputRange: [0, 1],
    outputRange: [0.5, 0.92],
    extrapolate: 'clamp',
  });
  const ringScale = ring.interpolate({ inputRange: [0, 1], outputRange: [0.9, 1.5] });
  const ringOpacity = ring.interpolate({ inputRange: [0, 0.15, 1], outputRange: [0, 0.32, 0] });

  const stops = useMemo(
    () => [
      { offset: '0%', color: p.orbCore, opacity: 1 },
      { offset: '26%', color: p.orbInner, opacity: 1 },
      { offset: '62%', color: p.orbMid, opacity: 1 },
      { offset: '100%', color: p.orbDeep, opacity: 1 },
    ],
    [p],
  );

  const box = size * 1.7;

  return (
    <View style={[styles.wrap, { width: box, height: box }]} pointerEvents="none">
      {/* Outer halo — soft bloom of light around the orb. */}
      <AnimatedView
        style={[
          StyleSheet.absoluteFill,
          styles.center,
          { opacity: haloOpacity, transform: [{ scale }] },
        ]}
      >
        <Svg width={box} height={box} viewBox="0 0 100 100">
          <Defs>
            <RadialGradient id="halo" cx="50%" cy="50%" r="50%">
              <Stop offset="0%" stopColor={p.orbMid} stopOpacity={0.55} />
              <Stop offset="55%" stopColor={p.accent} stopOpacity={0.16} />
              <Stop offset="100%" stopColor={p.accent} stopOpacity={0} />
            </RadialGradient>
          </Defs>
          <Circle cx="50" cy="50" r="50" fill="url(#halo)" />
        </Svg>
      </AnimatedView>

      {/* Listening ripple. */}
      <AnimatedView
        style={[
          StyleSheet.absoluteFill,
          styles.center,
          { opacity: ringOpacity, transform: [{ scale: ringScale }] },
        ]}
      >
        <View
          style={{
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: 1.5,
            borderColor: p.accent,
          }}
        />
      </AnimatedView>

      {/* The orb itself. */}
      <AnimatedView style={[styles.center, { transform: [{ scale }] }]}>
        <Svg width={size} height={size} viewBox="0 0 100 100">
          <Defs>
            <RadialGradient id="orb" cx="38%" cy="34%" r="72%">
              {stops.map((s) => (
                <Stop key={s.offset} offset={s.offset} stopColor={s.color} stopOpacity={s.opacity} />
              ))}
            </RadialGradient>
            <RadialGradient id="sheen" cx="36%" cy="30%" r="40%">
              <Stop offset="0%" stopColor="#ffffff" stopOpacity={0.9} />
              <Stop offset="100%" stopColor="#ffffff" stopOpacity={0} />
            </RadialGradient>
          </Defs>
          <Circle cx="50" cy="50" r="49" fill="url(#orb)" />
          <Circle cx="50" cy="50" r="49" fill="url(#sheen)" />
        </Svg>
      </AnimatedView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center' },
  center: { alignItems: 'center', justifyContent: 'center' },
});
