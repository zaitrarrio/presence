/** A small hand-picked stroke-icon set, drawn with react-native-svg. */
import Svg, { Path, Circle, Line } from 'react-native-svg';

export type IconName =
  | 'mic'
  | 'mic-off'
  | 'video'
  | 'video-off'
  | 'end'
  | 'settings'
  | 'send'
  | 'back'
  | 'close'
  | 'globe'
  | 'wave'
  | 'check'
  | 'camera-flip';

export function Icon({
  name,
  size = 22,
  color = '#211F2B',
  strokeWidth = 2,
}: {
  name: IconName;
  size?: number;
  color?: string;
  strokeWidth?: number;
}) {
  const common = {
    stroke: color,
    strokeWidth,
    fill: 'none' as const,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {name === 'mic' && (
        <>
          <Path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z" {...common} />
          <Path d="M19 11v1a7 7 0 0 1-14 0v-1M12 19v3" {...common} />
        </>
      )}
      {name === 'mic-off' && (
        <>
          <Path d="M9 5a3 3 0 0 1 6 0v5" {...common} />
          <Path d="M15 13.5A3 3 0 0 1 9 12v-1" {...common} />
          <Path d="M19 11v1a7 7 0 0 1-10.5 6.06M5 11v1a7 7 0 0 0 1 3.6M12 19v3" {...common} />
          <Line x1="3" y1="3" x2="21" y2="21" {...common} />
        </>
      )}
      {name === 'video' && (
        <>
          <Path d="M22 8.5l-6 3.5 6 3.5v-7z" {...common} />
          <Path d="M2 7.5a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-9z" {...common} />
        </>
      )}
      {name === 'video-off' && (
        <>
          <Path d="M16 10.5V16a2 2 0 0 1-2 2H5" {...common} />
          <Path d="M2 7.9A2 2 0 0 1 4 5.5h6M22 8.5l-6 3.5" {...common} />
          <Line x1="3" y1="3" x2="21" y2="21" {...common} />
        </>
      )}
      {name === 'end' && (
        <Path
          d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.12 4.2 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"
          transform="rotate(135 12 12)"
          {...common}
        />
      )}
      {name === 'settings' && (
        <>
          <Circle cx="12" cy="12" r="3" {...common} />
          <Path
            d="M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-2.7 1.1V21a2 2 0 1 1-4 0v-.1A1.6 1.6 0 0 0 7 19.4a1.6 1.6 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.6 1.6 0 0 0-1.1-2.7H1a2 2 0 1 1 0-4h.1A1.6 1.6 0 0 0 2.6 7a1.6 1.6 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1A1.6 1.6 0 0 0 7 2.6h.1A1.6 1.6 0 0 0 8.8 1.1V1a2 2 0 1 1 4 0v.1A1.6 1.6 0 0 0 15 2.6a1.6 1.6 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0 1.1 2.7h.2a2 2 0 1 1 0 4h-.1a1.6 1.6 0 0 0-1.4 1z"
          {...common}
          />
        </>
      )}
      {name === 'send' && <Path d="M4 12l16-8-6 16-3-6-7-2z" {...common} />}
      {name === 'back' && <Path d="M15 5l-7 7 7 7" {...common} />}
      {name === 'close' && <Path d="M6 6l12 12M18 6L6 18" {...common} />}
      {name === 'globe' && (
        <>
          <Circle cx="12" cy="12" r="9" {...common} />
          <Path d="M3 12h18M12 3c2.5 2.5 2.5 15 0 18M12 3c-2.5 2.5-2.5 15 0 18" {...common} />
        </>
      )}
      {name === 'wave' && (
        <Path d="M2 12h2m3-5v10m4-14v18m4-13v8m3-5h2" {...common} />
      )}
      {name === 'check' && <Path d="M4 12l5 5L20 6" {...common} />}
      {name === 'camera-flip' && (
        <>
          <Path d="M3 9a2 2 0 0 1 2-2h2l1.5-2h7L17 7h2a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9z" {...common} />
          <Path d="M9.5 13a2.5 2.5 0 0 1 4.5-1.5M14.5 13A2.5 2.5 0 0 1 10 14.5" {...common} />
          <Path d="M14 10.5V12h1.5M10 13.5V12H8.5" {...common} />
        </>
      )}
    </Svg>
  );
}
