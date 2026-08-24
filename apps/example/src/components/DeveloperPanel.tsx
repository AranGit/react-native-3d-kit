import { StyleSheet, Text, View } from 'react-native';
import { useModelViewer } from '@arangit/react-native-model-viewer';

export function DeveloperPanel() {
  const { status, viewport } = useModelViewer();

  return (
    <View pointerEvents="none" style={styles.panel} testID="developer-panel">
      <Text style={styles.label}>MODEL</Text>
      <Text style={styles.value}>{status.toUpperCase()}</Text>
      <View style={styles.separator} />
      <Text style={styles.label}>VIEWPORT</Text>
      <Text style={styles.value}>
        {Math.round(viewport.width)} × {Math.round(viewport.height)}
      </Text>
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
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1,
  },
  value: {
    color: '#F4F7FB',
    fontSize: 11,
    fontVariant: ['tabular-nums'],
    fontWeight: '700',
  },
  separator: {
    backgroundColor: '#344054',
    height: 14,
    width: StyleSheet.hairlineWidth,
  },
});
