/**
 * SelfCamera — your side of the two-way call.
 *
 * Presence is a companion that can see you, so we put your live front-camera
 * feed on screen (this is what the app publishes to the companion over AliRTC).
 * Degrades gracefully: if the camera is off, or permission is denied, or the
 * device simply has no camera, it shows a calm placeholder instead of breaking.
 */
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useEffect, useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { radius, usePalette } from '@/theme';
import { Icon } from './Icon';
import { Txt } from './ui';

export function SelfCamera({
  enabled,
  width = 96,
  height = 132,
}: {
  enabled: boolean;
  width?: number;
  height?: number;
}) {
  const p = usePalette();
  const [permission, requestPermission] = useCameraPermissions();
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (enabled && permission && !permission.granted && permission.canAskAgain) {
      requestPermission().catch(() => setFailed(true));
    }
  }, [enabled, permission, requestPermission]);

  const granted = permission?.granted;
  const showLive = enabled && granted && !failed;

  return (
    <View
      style={[
        styles.frame,
        { width, height, borderRadius: radius.md, borderColor: p.line, backgroundColor: p.surfaceSolid },
      ]}
    >
      {showLive ? (
        <CameraView
          style={StyleSheet.absoluteFill}
          facing="front"
          // Web mirrors the front camera by convention so it feels like a mirror.
          mirror={Platform.OS !== 'ios'}
          onMountError={() => setFailed(true)}
        />
      ) : (
        <View style={[StyleSheet.absoluteFill, styles.placeholder]}>
          <Icon name={enabled ? 'video-off' : 'video-off'} size={20} color={p.faint} />
          <Txt variant="caption" color={p.faint} align="center" style={{ marginTop: 6 }}>
            {!enabled
              ? 'Camera off'
              : granted === false
                ? 'No camera access'
                : failed
                  ? 'No camera'
                  : 'Starting…'}
          </Txt>
        </View>
      )}
      <View style={[styles.youTag, { backgroundColor: p.scrim }]}>
        <Txt variant="caption" weight="700" color="#fff">
          You
        </Txt>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  frame: { overflow: 'hidden', borderWidth: 1 },
  placeholder: { alignItems: 'center', justifyContent: 'center', padding: 8 },
  youTag: {
    position: 'absolute',
    bottom: 6,
    left: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
});
