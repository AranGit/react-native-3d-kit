import { StyleSheet, useWindowDimensions, View } from 'react-native';
import { ModelViewer } from '@arangit/react-native-model-viewer';
import { AppText as Text } from '../components/AppText';
import { DeveloperPanel } from '../components/DeveloperPanel';
import { ErrorFallback, LoadingFallback } from '../components/ViewerFallbacks';
import type { ExampleProps } from '../model';

export function BasicViewerExample({ model }: ExampleProps) {
  const window = useWindowDimensions();
  const compact = window.width > window.height;

  return (
    <View style={styles.container}>
      <ModelViewer
        accessibilityHint="Displays the model without camera controls"
        accessibilityLabel={`3D model preview: ${model.label}`}
        autoFit
        backgroundColor="#101722"
        errorFallback={ErrorFallback}
        loadingFallback={<LoadingFallback />}
        source={model.source}
        style={styles.viewer}
      >
        <View
          pointerEvents="none"
          style={[styles.caption, compact && styles.captionCompact]}
        >
          <Text numberOfLines={1} style={styles.eyebrow}>
            BASIC VIEWER
          </Text>
          <Text numberOfLines={1} style={styles.title}>
            One scene. One GLB.
          </Text>
          {!compact && (
            <Text style={styles.body}>
              Loading, error UI and React Native overlays remain outside the
              Filament surface.
            </Text>
          )}
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
  captionCompact: {
    left: 12,
    top: 12,
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
