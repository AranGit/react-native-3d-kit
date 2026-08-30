import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Platform,
  Pressable,
  StyleSheet,
  View,
  type ImageSourcePropType,
} from 'react-native';
import {
  isARSupportedOnDevice,
  requestRequiredPermissions,
  Viro3DObject,
  ViroAmbientLight,
  ViroARPlaneSelector,
  ViroARScene,
  ViroARSceneNavigator,
  ViroDirectionalLight,
  ViroNode,
  ViroPinchStateTypes,
  ViroRotateStateTypes,
  ViroTrackingStateConstants,
  type ViroAnchor,
  type ViroTrackingReason,
  type ViroTrackingState,
} from '@reactvision/react-viro';
import { AppText as Text } from '../components/AppText';
import type { ExampleModel, ExampleProps } from '../model';

const MIN_TOUCH_TARGET = Platform.OS === 'android' ? 48 : 44;
const MIN_SCALE_FACTOR = 0.2;
const MAX_SCALE_FACTOR = 3;

type Availability =
  'checking' | 'ready' | 'permission-denied' | 'unsupported' | 'error';
type ModelLoadState = 'idle' | 'loading' | 'loaded' | 'error';

interface ARSceneHandle {
  removeObject(): void;
}

interface ARSceneAppProps {
  model: ExampleModel;
  onModelLoadStateChange: (state: ModelLoadState) => void;
  onPlaced: () => void;
  onPlaneDetected: () => void;
  onRemoved: () => void;
  onTrackingChange: (
    state: ViroTrackingState,
    reason: ViroTrackingReason,
  ) => void;
  registerScene: (scene: ARSceneHandle | null) => void;
}

interface ARPlacementSceneProps {
  sceneNavigator: {
    viroAppProps: ARSceneAppProps;
  };
}

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(maximum, Math.max(minimum, value));
}

function ARPlacementScene({ sceneNavigator }: ARPlacementSceneProps) {
  const selectorRef = useRef<ViroARPlaneSelector | null>(null);
  const transformRef = useRef<ViroNode | null>(null);
  const selectedPlaneIdRef = useRef<string | null>(null);
  const scaleFactorRef = useRef(1);
  const rotationRef = useRef(0);
  const appProps = sceneNavigator.viroAppProps;
  const { model } = appProps;

  const resetTransform = useCallback(() => {
    scaleFactorRef.current = 1;
    rotationRef.current = 0;
    transformRef.current?.setNativeProps({
      rotation: [0, 0, 0],
      scale: [model.arScale, model.arScale, model.arScale],
    });
  }, [model.arScale]);

  const removeObject = useCallback(() => {
    selectedPlaneIdRef.current = null;
    selectorRef.current?.reset();
    resetTransform();
    appProps.onModelLoadStateChange('idle');
    appProps.onRemoved();
  }, [appProps, resetTransform]);

  useEffect(() => {
    appProps.registerScene({ removeObject });
    return () => appProps.registerScene(null);
  }, [appProps, removeObject]);

  useEffect(() => {
    removeObject();
  }, [model.id, removeObject]);

  const handlePinch = useCallback(
    (state: number, scaleFactor: number) => {
      const nextFactor = clamp(
        scaleFactorRef.current * scaleFactor,
        MIN_SCALE_FACTOR,
        MAX_SCALE_FACTOR,
      );
      const nextScale = model.arScale * nextFactor;
      transformRef.current?.setNativeProps({
        scale: [nextScale, nextScale, nextScale],
      });

      if (state === ViroPinchStateTypes.PINCH_END) {
        scaleFactorRef.current = nextFactor;
      }
    },
    [model.arScale],
  );

  const handleRotate = useCallback((state: number, rotationFactor: number) => {
    const nextRotation = rotationRef.current - rotationFactor;
    transformRef.current?.setNativeProps({ rotation: [0, nextRotation, 0] });

    if (state === ViroRotateStateTypes.ROTATE_END) {
      rotationRef.current = nextRotation;
    }
  }, []);

  const handleAnchorRemoved = useCallback(
    (anchor?: ViroAnchor) => {
      if (anchor === undefined) {
        return;
      }
      selectorRef.current?.handleAnchorRemoved(anchor);
      if (selectedPlaneIdRef.current === anchor.anchorId) {
        selectedPlaneIdRef.current = null;
        appProps.onModelLoadStateChange('idle');
        appProps.onRemoved();
      }
    },
    [appProps],
  );

  return (
    <ViroARScene
      anchorDetectionTypes={['PlanesHorizontal']}
      onAnchorFound={(anchor) => selectorRef.current?.handleAnchorFound(anchor)}
      onAnchorRemoved={handleAnchorRemoved}
      onAnchorUpdated={(anchor) =>
        selectorRef.current?.handleAnchorUpdated(anchor)
      }
      onTrackingUpdated={appProps.onTrackingChange}
    >
      <ViroAmbientLight color="#FFFFFF" intensity={280} />
      <ViroDirectionalLight
        color="#FFFFFF"
        direction={[-0.4, -1, -0.3]}
        intensity={450}
      />
      <ViroARPlaneSelector
        alignment="HorizontalUpward"
        hideOverlayOnSelection
        minHeight={0.15}
        minWidth={0.15}
        onPlaneDetected={() => {
          appProps.onPlaneDetected();
          return true;
        }}
        onPlaneSelected={(plane) => {
          selectedPlaneIdRef.current = plane.anchorId;
          appProps.onModelLoadStateChange('loading');
          appProps.onPlaced();
        }}
        ref={selectorRef}
      >
        <ViroNode
          dragType="FixedToWorld"
          onDrag={() => undefined}
          onPinch={handlePinch}
          onRotate={handleRotate}
          ref={transformRef}
          rotation={[0, 0, 0]}
          scale={[model.arScale, model.arScale, model.arScale]}
        >
          <Viro3DObject
            key={model.id}
            onError={() => appProps.onModelLoadStateChange('error')}
            onLoadEnd={() => appProps.onModelLoadStateChange('loaded')}
            onLoadStart={() => appProps.onModelLoadStateChange('loading')}
            source={model.source as ImageSourcePropType}
            type="GLB"
          />
        </ViroNode>
      </ViroARPlaneSelector>
    </ViroARScene>
  );
}

export function ARPlacementExample({ model }: ExampleProps) {
  const [availability, setAvailability] = useState<Availability>('checking');
  const [trackingState, setTrackingState] = useState<ViroTrackingState | null>(
    null,
  );
  const [planeDetected, setPlaneDetected] = useState(false);
  const [placed, setPlaced] = useState(false);
  const [modelLoadState, setModelLoadState] = useState<ModelLoadState>('idle');
  const sceneRef = useRef<ARSceneHandle | null>(null);

  const prepareAR = useCallback(async () => {
    setAvailability('checking');
    try {
      const support = await isARSupportedOnDevice();
      if (!support.isARSupported) {
        setAvailability('unsupported');
        return;
      }

      const permission = await requestRequiredPermissions(['camera']);
      setAvailability(permission.camera ? 'ready' : 'permission-denied');
    } catch {
      setAvailability('error');
    }
  }, []);

  useEffect(() => {
    prepareAR();
  }, [prepareAR]);

  useEffect(() => {
    sceneRef.current?.removeObject();
    setPlaced(false);
    setModelLoadState('idle');
  }, [model.id]);

  const handleTrackingChange = useCallback(
    (state: ViroTrackingState, _reason: ViroTrackingReason) => {
      setTrackingState(state);
    },
    [],
  );
  const handlePlaneDetected = useCallback(() => setPlaneDetected(true), []);
  const handlePlaced = useCallback(() => setPlaced(true), []);
  const handleRemoved = useCallback(() => setPlaced(false), []);
  const registerScene = useCallback((scene: ARSceneHandle | null) => {
    sceneRef.current = scene;
  }, []);

  const viroAppProps = useMemo<ARSceneAppProps>(
    () => ({
      model,
      onModelLoadStateChange: setModelLoadState,
      onPlaced: handlePlaced,
      onPlaneDetected: handlePlaneDetected,
      onRemoved: handleRemoved,
      onTrackingChange: handleTrackingChange,
      registerScene,
    }),
    [
      handlePlaced,
      handlePlaneDetected,
      handleRemoved,
      handleTrackingChange,
      model,
      registerScene,
    ],
  );

  if (availability !== 'ready') {
    return (
      <View style={styles.fallback}>
        <Text style={styles.fallbackEyebrow}>AR PREVIEW · ตัวอย่าง AR</Text>
        <Text style={styles.fallbackTitle}>
          {availability === 'checking'
            ? 'Checking this device…'
            : availability === 'permission-denied'
              ? 'Camera access is required'
              : availability === 'unsupported'
                ? 'AR is not available on this device'
                : 'AR could not be started'}
        </Text>
        <Text style={styles.fallbackBody}>
          {availability === 'unsupported'
            ? 'Use a physical ARKit or ARCore device. Simulators are not supported.\nต้องใช้เครื่องจริงที่รองรับ ARKit หรือ ARCore'
            : 'The camera is used only to detect surfaces and place the selected model.\nกล้องใช้สำหรับตรวจจับพื้นผิวและวางโมเดลเท่านั้น'}
        </Text>
        {availability !== 'checking' && availability !== 'unsupported' ? (
          <Pressable
            accessibilityLabel="Try AR again"
            accessibilityRole="button"
            onPress={() => prepareAR()}
            style={({ pressed }) => [
              styles.primaryButton,
              pressed && styles.buttonPressed,
            ]}
          >
            <Text style={styles.primaryButtonLabel}>
              Try again · ลองอีกครั้ง
            </Text>
          </Pressable>
        ) : null}
      </View>
    );
  }

  const trackingNormal =
    trackingState === ViroTrackingStateConstants.TRACKING_NORMAL;
  const instruction = placed
    ? modelLoadState === 'error'
      ? 'Model could not be loaded · โหลดโมเดลไม่สำเร็จ'
      : modelLoadState === 'loaded'
        ? 'Drag · pinch · rotate'
        : `Loading ${model.label}…`
    : !trackingNormal
      ? 'Move slowly to start tracking · ขยับเครื่องช้า ๆ'
      : planeDetected
        ? 'Tap a highlighted surface · แตะพื้นที่ที่ไฮไลต์'
        : 'Scan a floor or table · สแกนพื้นหรือโต๊ะ';

  return (
    <View style={styles.container}>
      <ViroARSceneNavigator
        autofocus
        initialScene={{
          scene: ARPlacementScene as unknown as () => React.JSX.Element,
        }}
        pbrEnabled
        shadowsEnabled
        style={styles.navigator}
        viroAppProps={viroAppProps}
      />

      <View pointerEvents="none" style={styles.statusCard}>
        <View style={styles.statusHeader}>
          <View
            style={[styles.statusDot, trackingNormal && styles.statusDotReady]}
          />
          <Text numberOfLines={1} style={styles.statusLabel}>
            {placed ? 'PLACED · วางแล้ว' : 'AR PLACEMENT · วางในพื้นที่จริง'}
          </Text>
        </View>
        <Text numberOfLines={2} style={styles.instruction}>
          {instruction}
        </Text>
      </View>

      <View pointerEvents="box-none" style={styles.actions}>
        <Pressable
          accessibilityHint="Removes the model and lets you select a new surface"
          accessibilityLabel="Remove model from AR space"
          accessibilityRole="button"
          accessibilityState={{ disabled: !placed }}
          disabled={!placed}
          onPress={() => sceneRef.current?.removeObject()}
          style={({ pressed }) => [
            styles.removeButton,
            !placed && styles.removeButtonDisabled,
            pressed && styles.buttonPressed,
          ]}
        >
          <Text style={styles.removeButtonLabel}>Remove · ยกออก</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  actions: {
    bottom: 16,
    left: 16,
    position: 'absolute',
    right: 16,
  },
  buttonPressed: { opacity: 0.72 },
  container: {
    backgroundColor: '#080C13',
    flex: 1,
  },
  fallback: {
    alignItems: 'center',
    backgroundColor: '#101722',
    flex: 1,
    justifyContent: 'center',
    padding: 28,
  },
  fallbackBody: {
    color: '#AAB5C6',
    fontSize: 13,
    lineHeight: 20,
    marginTop: 10,
    maxWidth: 340,
    textAlign: 'center',
  },
  fallbackEyebrow: {
    color: '#72E2AE',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.4,
  },
  fallbackTitle: {
    color: '#F6F8FC',
    fontSize: 20,
    fontWeight: '800',
    marginTop: 8,
    textAlign: 'center',
  },
  instruction: {
    color: '#F6F8FC',
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 18,
    marginTop: 5,
  },
  navigator: { flex: 1 },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: '#72E2AE',
    borderRadius: 12,
    justifyContent: 'center',
    marginTop: 20,
    minHeight: MIN_TOUCH_TARGET,
    paddingHorizontal: 18,
  },
  primaryButtonLabel: {
    color: '#071016',
    fontSize: 12,
    fontWeight: '900',
  },
  removeButton: {
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: '#F6F8FC',
    borderRadius: 14,
    justifyContent: 'center',
    minHeight: MIN_TOUCH_TARGET,
    minWidth: 176,
    paddingHorizontal: 20,
  },
  removeButtonDisabled: { opacity: 0.42 },
  removeButtonLabel: {
    color: '#101722',
    fontSize: 13,
    fontWeight: '900',
  },
  statusCard: {
    backgroundColor: 'rgba(7, 12, 22, 0.84)',
    borderColor: 'rgba(114, 226, 174, 0.34)',
    borderRadius: 14,
    borderWidth: 1,
    left: 16,
    paddingHorizontal: 14,
    paddingVertical: 11,
    position: 'absolute',
    right: 16,
    top: 16,
  },
  statusDot: {
    backgroundColor: '#F7B955',
    borderRadius: 4,
    height: 8,
    marginRight: 7,
    width: 8,
  },
  statusDotReady: { backgroundColor: '#72E2AE' },
  statusHeader: { alignItems: 'center', flexDirection: 'row' },
  statusLabel: {
    color: '#72E2AE',
    flex: 1,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.1,
  },
});
