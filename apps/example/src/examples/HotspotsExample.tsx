import { useEffect, useState } from 'react';
import { Platform, StyleSheet, useWindowDimensions, View } from 'react-native';
import { ModelViewer } from '@arangit/react-native-model-viewer';
import { OrbitControls } from '@arangit/react-native-3d-controls';
import { Hotspot, HotspotLayer } from '@arangit/react-native-3d-hotspots';
import { AppText as Text } from '../components/AppText';
import { DeveloperPanel } from '../components/DeveloperPanel';
import { ErrorFallback, LoadingFallback } from '../components/ViewerFallbacks';
import type { ExampleProps } from '../model';

const MIN_TOUCH_TARGET = Platform.OS === 'android' ? 48 : 44;

export function HotspotsExample({ model }: ExampleProps) {
  const window = useWindowDimensions();
  const compact = window.width > window.height;
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    setSelected(null);
  }, [model.id]);

  return (
    <View style={styles.container}>
      <ModelViewer
        accessibilityHint="Rotate the model and activate annotations to inspect named parts"
        accessibilityLabel={`Interactive annotated 3D model: ${model.label}`}
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
              edgePadding={compact ? 12 : 8}
              id={hotspot.id}
              key={hotspot.id}
              label={hotspot.label}
              offset={
                compact
                  ? index === 1
                    ? [0, -24]
                    : index === 2
                      ? [-16, 20]
                      : [0, 0]
                  : [0, index === 1 ? -18 : 0]
              }
              onPress={() => setSelected(hotspot.label)}
              position={hotspot.position}
              renderContent={
                compact
                  ? ({ active }) => (
                      <View
                        style={[
                          styles.compactMarker,
                          active && styles.compactMarkerActive,
                        ]}
                      >
                        <Text
                          style={[
                            styles.compactMarkerLabel,
                            active && styles.compactMarkerLabelActive,
                          ]}
                        >
                          {index + 1}
                        </Text>
                      </View>
                    )
                  : undefined
              }
            />
          ))}
        </HotspotLayer>
        <View
          accessibilityLabel={
            selected === null
              ? 'No hotspot selected'
              : `Selected hotspot: ${selected}`
          }
          accessibilityLiveRegion="polite"
          accessible
          pointerEvents="none"
          style={[styles.selectionCard, compact && styles.selectionCardCompact]}
        >
          <Text numberOfLines={1} style={styles.selectionLabel}>
            SELECTION
          </Text>
          <Text numberOfLines={1} style={styles.selectionValue}>
            {selected ?? (compact ? 'Tap a number' : 'Tap a hotspot')}
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
  selectionCard: {
    backgroundColor: 'rgba(7, 12, 22, 0.84)',
    borderRadius: 12,
    left: 18,
    paddingHorizontal: 12,
    paddingVertical: 9,
    position: 'absolute',
    top: 18,
  },
  selectionCardCompact: {
    left: 12,
    paddingHorizontal: 10,
    paddingVertical: 8,
    top: 12,
  },
  selectionLabel: {
    color: '#72E2AE',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  selectionValue: {
    color: '#F6F8FC',
    fontSize: 14,
    fontWeight: '700',
    marginTop: 3,
  },
  compactMarker: {
    alignItems: 'center',
    backgroundColor: 'rgba(7, 12, 22, 0.92)',
    borderColor: '#72E2AE',
    borderRadius: MIN_TOUCH_TARGET / 2,
    borderWidth: 1,
    height: MIN_TOUCH_TARGET,
    justifyContent: 'center',
    width: MIN_TOUCH_TARGET,
  },
  compactMarkerActive: {
    backgroundColor: '#72E2AE',
  },
  compactMarkerLabel: {
    color: '#F6F8FC',
    fontSize: 13,
    fontWeight: '800',
  },
  compactMarkerLabelActive: {
    color: '#071016',
  },
});
