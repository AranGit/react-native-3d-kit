import {
  StyleSheet,
  useWindowDimensions,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useModelViewer } from '@arangit/react-native-model-viewer';
import { AppText as Text } from './AppText';

interface DeveloperPanelProps {
  style?: StyleProp<ViewStyle>;
}

export function DeveloperPanel({ style }: DeveloperPanelProps) {
  const { status, viewport } = useModelViewer();
  const window = useWindowDimensions();
  const compact = window.width > window.height;

  return (
    <View
      accessibilityLabel={`Model ${status}. Viewport ${Math.round(
        viewport.width,
      )} by ${Math.round(viewport.height)} points`}
      accessibilityLiveRegion="polite"
      accessibilityRole="text"
      accessible
      pointerEvents="none"
      style={[styles.panel, style]}
      testID="developer-panel"
    >
      {compact ? (
        <Text numberOfLines={1} style={styles.value}>
          {status.toUpperCase()} · {Math.round(viewport.width)} ×{' '}
          {Math.round(viewport.height)}
        </Text>
      ) : (
        <>
          <Text style={styles.label}>MODEL</Text>
          <Text style={styles.value}>{status.toUpperCase()}</Text>
          <View style={styles.separator} />
          <Text style={styles.label}>VIEWPORT</Text>
          <Text style={styles.value}>
            {Math.round(viewport.width)} × {Math.round(viewport.height)}
          </Text>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: 'rgba(7, 12, 22, 0.86)',
    borderColor: 'rgba(114, 226, 174, 0.28)',
    borderRadius: 14,
    borderWidth: 1,
    bottom: 18,
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    position: 'absolute',
  },
  label: {
    color: '#8491A7',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
  },
  value: {
    color: '#F4F7FB',
    fontSize: 12,
    fontVariant: ['tabular-nums'],
    fontWeight: '700',
  },
  separator: {
    backgroundColor: '#344054',
    height: 14,
    width: StyleSheet.hairlineWidth,
  },
});
