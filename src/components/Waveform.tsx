/** A tiny equalizer that idles low and animates when `active`. */
import { useEffect, useRef } from 'react';
import { Animated, Easing, View } from 'react-native';

export function Waveform({
  active = false,
  color = '#fff',
  bars = 5,
  height = 18,
  width = 3,
}: {
  active?: boolean;
  color?: string;
  bars?: number;
  height?: number;
  width?: number;
}) {
  const values = useRef(Array.from({ length: bars }, () => new Animated.Value(0.3))).current;

  useEffect(() => {
    const loops = values.map((v, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(v, {
            toValue: active ? 1 : 0.35,
            duration: 320 + i * 70,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: false,
          }),
          Animated.timing(v, {
            toValue: active ? 0.25 : 0.28,
            duration: 300 + i * 60,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: false,
          }),
        ]),
      ),
    );
    loops.forEach((l) => l.start());
    return () => loops.forEach((l) => l.stop());
  }, [active, values]);

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3, height }}>
      {values.map((v, i) => (
        <Animated.View
          key={i}
          style={{
            width,
            borderRadius: width,
            backgroundColor: color,
            height: v.interpolate({ inputRange: [0, 1], outputRange: [height * 0.22, height] }),
          }}
        />
      ))}
    </View>
  );
}
