import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ModelViewer } from '@arangit/react-native-model-viewer';
import { OrbitControls } from '@arangit/react-native-3d-controls';
import { Hotspot, HotspotLayer } from '@arangit/react-native-3d-hotspots';
import { DeveloperPanel } from '../components/DeveloperPanel';
import { ErrorFallback, LoadingFallback } from '../components/ViewerFallbacks';
import type { ExampleProps } from '../model';

export function HotspotsExample({ model }: ExampleProps) {
  const [selected, setSelected] = useState('Tap a hotspot');

  useEffect(() => {
    setSelected('Tap a hotspot');
  }, [model.id]);

  return (
    <View style={styles.container}>
      <ModelViewer
        autoFit
        backgroundColor="#101722"
        errorFallback={ErrorFallback}
        loadingFallback={<LoadingFallback />}
        source={model.source}
        style={styles.viewer}
      >
        <OrbitControls />
        <HotspotLayer>
          {model.hotspots.map((hotspot, index) => (
            <Hotspot
              id={hotspot.id}
              key={hotspot.id}
              label={hotspot.label}
              offset={[0, index === 1 ? -18 : 0]}
              onPress={() => setSelected(hotspot.label)}
              position={hotspot.position}
            />
          ))}
        </HotspotLayer>
        <View pointerEvents="none" style={styles.selectionCard}>
          <Text style={styles.selectionLabel}>SELECTION</Text>
          <Text style={styles.selectionValue}>{selected}</Text>
        </View>
        <DeveloperPanel />
      </ModelViewer>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  viewer: { flex: 1 },
  selectionCard: {
    backgroundColor: 'rgba(7, 12, 22, 0.84)',
    borderRadius: 12,
    left: 18,
    paddingHorizontal: 12,
    paddingVertical: 9,
    position: 'absolute',
    top: 18,
  },
  selectionLabel: {
    color: '#72E2AE',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  selectionValue: {
    color: '#F6F8FC',
    fontSize: 14,
    fontWeight: '700',
    marginTop: 3,
  },
});
