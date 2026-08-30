import { useEffect, useState } from 'react';
import {
  Pressable,
  Platform,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import {
  ModelViewer,
  useModelViewer,
} from '@arangit/react-native-model-viewer';
import {
  OrbitControls,
  useOrbitControls,
} from '@arangit/react-native-3d-controls';
import { AppText as Text } from '../components/AppText';
import { DeveloperPanel } from '../components/DeveloperPanel';
import { ErrorFallback, LoadingFallback } from '../components/ViewerFallbacks';
import type { ExampleProps } from '../model';

const CAMERA_ROTATION_STEP = 48;
const CAMERA_ZOOM_STEP = 20;
const MIN_TOUCH_TARGET = Platform.OS === 'android' ? 48 : 44;

interface CameraStepControlsProps {
  compact: boolean;
  shortLabels: boolean;
  onUse: () => void;
}

function CameraStepControls({
  compact,
  shortLabels,
  onUse,
}: CameraStepControlsProps) {
  const controls = useOrbitControls();
  const { cameraController } = useModelViewer();
  const disabled = cameraController === null;
  const actions = [
    {
      label: 'Left',
      accessibilityLabel: 'Rotate model left',
      run: () => controls.rotateBy(-CAMERA_ROTATION_STEP),
    },
    {
      label: 'Right',
      accessibilityLabel: 'Rotate model right',
      run: () => controls.rotateBy(CAMERA_ROTATION_STEP),
    },
    {
      label: shortLabels ? 'In' : 'Zoom in',
      accessibilityLabel: 'Zoom into model',
      run: () => controls.zoomBy(-CAMERA_ZOOM_STEP),
    },
    {
      label: shortLabels ? 'Out' : 'Zoom out',
      accessibilityLabel: 'Zoom out from model',
      run: () => controls.zoomBy(CAMERA_ZOOM_STEP),
    },
  ] as const;

  return (
    <View
      accessibilityLabel="Camera step controls"
      style={[
        styles.cameraStepControls,
        compact && styles.cameraStepControlsCompact,
      ]}
    >
      {actions.map((action) => (
        <Pressable
          accessibilityHint="Provides a button alternative to camera gestures"
          accessibilityLabel={action.accessibilityLabel}
          accessibilityRole="button"
          accessibilityState={{ disabled }}
          disabled={disabled}
          key={action.accessibilityLabel}
          onPress={() => {
            action.run();
            onUse();
          }}
          style={({ pressed }) => [
            styles.cameraStepButton,
            disabled && styles.cameraStepButtonDisabled,
            pressed && styles.cameraStepButtonPressed,
          ]}
        >
          <Text numberOfLines={1} style={styles.cameraStepLabel}>
            {action.label}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

export function ControlsExample({ model }: ExampleProps) {
  const window = useWindowDimensions();
  const compact = window.width > window.height;
  const compactAccessibility = compact && window.fontScale > 1.5;
  const [interacting, setInteracting] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  useEffect(() => {
    setInteracting(false);
    setHasInteracted(false);
  }, [model.id]);

  return (
    <View style={styles.container}>
      <ModelViewer
        accessibilityHint="Use gestures or the camera step controls to inspect the model"
        accessibilityLabel={`Interactive 3D model: ${model.label}`}
        autoFit
        backgroundColor="#111722"
        errorFallback={ErrorFallback}
        loadingFallback={<LoadingFallback />}
        source={model.source}
        style={styles.viewer}
      >
        <OrbitControls
          enablePan
          onInteractionEnd={() => {
            setInteracting(false);
            setHasInteracted(true);
          }}
          onInteractionStart={() => setInteracting(true)}
        />
        <View
          pointerEvents="box-none"
          style={[
            styles.toolbar,
            compactAccessibility && styles.toolbarCompact,
          ]}
        >
          {!compactAccessibility && (
            <View style={styles.instructions}>
              <Text numberOfLines={1} style={styles.title}>
                {hasInteracted
                  ? 'Orbit · pinch · two-finger pan'
                  : 'Drag to rotate · pinch to zoom'}
              </Text>
              <Text numberOfLines={1} style={styles.state}>
                {interacting
                  ? 'CAMERA MOVING'
                  : hasInteracted
                    ? 'READY'
                    : 'TRY IT'}
              </Text>
            </View>
          )}
          <CameraResetAction onReset={() => setHasInteracted(true)} />
        </View>
        <CameraStepControls
          compact={compact}
          shortLabels={compactAccessibility}
          onUse={() => setHasInteracted(true)}
        />
        <DeveloperPanel
          style={compact ? styles.developerPanelCompact : undefined}
        />
      </ModelViewer>
    </View>
  );
}

function CameraResetAction({ onReset }: { onReset: () => void }) {
  const controls = useOrbitControls();

  return (
    <Pressable
      accessibilityHint="Restores the fitted camera position"
      accessibilityLabel="Reset camera"
      accessibilityRole="button"
      onPress={() => {
        controls.reset();
        onReset();
      }}
      style={({ pressed }) => [
        styles.resetButton,
        pressed && styles.resetButtonPressed,
      ]}
    >
      <Text numberOfLines={1} style={styles.resetLabel}>
        Reset camera
      </Text>
    </Pressable>
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
  toolbarCompact: {
    justifyContent: 'flex-end',
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
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.2,
    marginTop: 3,
  },
  resetButton: {
    backgroundColor: '#72E2AE',
    borderRadius: 12,
    minHeight: MIN_TOUCH_TARGET,
    paddingHorizontal: 14,
    paddingVertical: 11,
  },
  resetButtonPressed: { opacity: 0.7 },
  resetLabel: {
    color: '#071016',
    fontSize: 12,
    fontWeight: '800',
  },
  cameraStepControls: {
    backgroundColor: 'rgba(7, 12, 22, 0.86)',
    borderColor: 'rgba(114, 226, 174, 0.28)',
    borderRadius: 14,
    borderWidth: 1,
    bottom: 72,
    flexDirection: 'row',
    gap: 4,
    left: 18,
    padding: 4,
    position: 'absolute',
    right: 18,
  },
  cameraStepControlsCompact: {
    bottom: 10,
    right: 'auto',
    width: 330,
  },
  cameraStepButton: {
    alignItems: 'center',
    borderRadius: 9,
    flex: 1,
    justifyContent: 'center',
    minHeight: MIN_TOUCH_TARGET,
    paddingHorizontal: 8,
  },
  cameraStepButtonDisabled: { opacity: 0.42 },
  cameraStepButtonPressed: { backgroundColor: '#263A36' },
  cameraStepLabel: {
    color: '#D8E0EC',
    fontSize: 11,
    fontWeight: '700',
  },
  developerPanelCompact: {
    alignSelf: 'flex-end',
    bottom: 10,
    right: 12,
  },
});
