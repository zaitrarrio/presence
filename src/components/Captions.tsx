/**
 * Captions — the calm, single-line transcript.
 *
 * Lumen keeps it quiet: the companion's current words in serif, with your last
 * line echoed faintly above. A blinking cursor while the line is still
 * streaming in.
 */
import { useEffect, useRef } from 'react';
import { Animated, View } from 'react-native';
import { Txt } from './ui';
import { spacing, type, usePalette } from '@/theme';
import type { CaptionLine } from '@/lib/vidu/types';

export function Captions({
  companionLine,
  youLine,
}: {
  companionLine: CaptionLine | null;
  youLine: CaptionLine | null;
}) {
  const p = usePalette();
  const blink = useRef(new Animated.Value(1)).current;
  const streaming = companionLine ? !companionLine.final : false;

  useEffect(() => {
    if (!streaming) {
      blink.setValue(0);
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(blink, { toValue: 0, duration: 500, useNativeDriver: true }),
        Animated.timing(blink, { toValue: 1, duration: 500, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [streaming, blink]);

  return (
    <View style={{ minHeight: 96, justifyContent: 'flex-start', gap: spacing.sm }}>
      {youLine ? (
        <Txt variant="label" color={p.faint} align="center">
          you · {youLine.text}
        </Txt>
      ) : null}
      <View style={{ flexDirection: 'row', justifyContent: 'center', flexWrap: 'wrap' }}>
        <Txt variant="prompt" color={p.ink} align="center">
          {companionLine?.text || '…'}
        </Txt>
        {streaming ? (
          <Animated.Text
            style={[type.prompt, { color: p.accent, opacity: blink }]}
            accessibilityElementsHidden
          >
            {' ▍'}
          </Animated.Text>
        ) : null}
      </View>
    </View>
  );
}
