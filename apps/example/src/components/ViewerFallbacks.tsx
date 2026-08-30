import { ActivityIndicator, StyleSheet, View } from 'react-native';
import type { ModelViewerErrorFallbackProps } from '@arangit/react-native-model-viewer';
import { AppText as Text } from './AppText';

export function LoadingFallback() {
  return (
    <View pointerEvents="none" style={styles.centered}>
      <ActivityIndicator color="#72E2AE" />
      <Text style={styles.loadingText}>Loading GLB…</Text>
    </View>
  );
}

export function ErrorFallback({ error }: ModelViewerErrorFallbackProps) {
  return (
    <View style={styles.errorCard}>
      <Text style={styles.errorTitle}>Could not load model</Text>
      <Text numberOfLines={3} style={styles.errorMessage}>
        {error.message}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  centered: {
    alignItems: 'center',
    bottom: 0,
    gap: 10,
    justifyContent: 'center',
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  loadingText: {
    color: '#C8D1E0',
    fontSize: 12,
    fontWeight: '600',
  },
  errorCard: {
    alignSelf: 'center',
    backgroundColor: '#3C1D25',
    borderColor: '#F97084',
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 24,
    maxWidth: 320,
    padding: 14,
  },
  errorTitle: {
    color: '#FDA4AF',
    fontSize: 14,
    fontWeight: '800',
  },
  errorMessage: {
    color: '#FCE7EA',
    fontSize: 12,
    marginTop: 4,
  },
});
