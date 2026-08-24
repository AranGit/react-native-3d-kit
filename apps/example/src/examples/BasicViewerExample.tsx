import { StyleSheet, Text, View } from 'react-native';
import { ModelViewer } from '@arangit/react-native-model-viewer';
import { DeveloperPanel } from '../components/DeveloperPanel';
import { ErrorFallback, LoadingFallback } from '../components/ViewerFallbacks';
import { SAMPLE_MODEL } from '../model';

export function BasicViewerExample() {
  return (
    <View style={styles.container}>
      <ModelViewer
        autoFit
        backgroundColor="#101722"
        errorFallback={ErrorFallback}
        loadingFallback={<LoadingFallback />}
        source={SAMPLE_MODEL}
        style={styles.viewer}
      >
        <View pointerEvents="none" style={styles.caption}>
          <Text style={styles.eyebrow}>BASIC VIEWER</Text>
          <Text style={styles.title}>One scene. One GLB.</Text>
          <Text style={styles.body}>
            Loading, error UI and React Native overlays remain outside the
            Filament surface.
          </Text>
        </View>
        <DeveloperPanel />
      </ModelViewer>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  viewer: { flex: 1 },
  caption: {
    left: 20,
    maxWidth: 250,
    position: 'absolute',
    top: 20,
  },
  eyebrow: {
    color: '#72E2AE',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  title: {
    color: '#F6F8FC',
    fontSize: 22,
    fontWeight: '800',
    marginTop: 6,
  },
  body: {
    color: '#AAB5C6',
    fontSize: 12,
    lineHeight: 18,
    marginTop: 6,
  },
});
