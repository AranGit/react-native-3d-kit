import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ModelViewer } from '@arangit/react-native-model-viewer';
import {
  OrbitControls,
  type OrbitControlsHandle,
} from '@arangit/react-native-3d-controls';
import { DeveloperPanel } from '../components/DeveloperPanel';
import { ErrorFallback, LoadingFallback } from '../components/ViewerFallbacks';
import type { ExampleProps } from '../model';

export function ControlsExample({ model }: ExampleProps) {
  const controlsRef = useRef<OrbitControlsHandle>(null);
  const [interacting, setInteracting] = useState(false);

  useEffect(() => {
    setInteracting(false);
  }, [model.id]);

  return (
    <View style={styles.container}>
      <ModelViewer
        autoFit
        backgroundColor="#111722"
        errorFallback={ErrorFallback}
        loadingFallback={<LoadingFallback />}
        source={model.source}
        style={styles.viewer}
      >
        <OrbitControls
          enablePan
          onInteractionEnd={() => setInteracting(false)}
          onInteractionStart={() => setInteracting(true)}
          ref={controlsRef}
        />
        <View pointerEvents="box-none" style={styles.toolbar}>
          <View style={styles.instructions}>
            <Text style={styles.title}>Orbit · pinch · two-finger pan</Text>
            <Text style={styles.state}>
              {interacting ? 'CAMERA MOVING' : 'READY'}
            </Text>
          </View>
          <Pressable
            accessibilityRole="button"
            onPress={() => controlsRef.current?.reset()}
            style={({ pressed }) => [
              styles.resetButton,
              pressed && styles.resetButtonPressed,
            ]}
          >
            <Text style={styles.resetLabel}>Reset camera</Text>
          </Pressable>
        </View>
        <DeveloperPanel />
      </ModelViewer>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  viewer: { flex: 1 },
  toolbar: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    left: 18,
    position: 'absolute',
    right: 18,
    top: 18,
  },
  instructions: {
    backgroundColor: 'rgba(7, 12, 22, 0.78)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  title: {
    color: '#F6F8FC',
    fontSize: 12,
    fontWeight: '700',
  },
  state: {
    color: '#72E2AE',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.2,
    marginTop: 3,
  },
  resetButton: {
    backgroundColor: '#72E2AE',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 11,
  },
  resetButtonPressed: { opacity: 0.7 },
  resetLabel: {
    color: '#071016',
    fontSize: 12,
    fontWeight: '800',
  },
});
