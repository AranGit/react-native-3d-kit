import {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useMemo,
  useRef,
} from 'react';
import { StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { useModelViewer } from '@arangit/react-native-model-viewer';
import { createOrbitControlsHandle, runCameraCommand } from './cameraCommands';
import type { OrbitControlsHandle, OrbitControlsProps } from './types';

const DEFAULT_ORBIT_SPEED = 0.003;
const DEFAULT_ZOOM_SPEED = 0.01;

function assertPositiveFinite(value: number, name: string): void {
  if (!Number.isFinite(value) || value <= 0) {
    throw new RangeError(`${name} must be a finite number greater than zero.`);
  }
}

export const OrbitControls = forwardRef<
  OrbitControlsHandle,
  OrbitControlsProps
>(function OrbitControlsComponent(
  {
    enabled = true,
    enableRotate = true,
    enableZoom = true,
    enablePan = false,
    orbitSpeed = DEFAULT_ORBIT_SPEED,
    zoomSpeed = DEFAULT_ZOOM_SPEED,
    style,
    onInteractionStart,
    onInteractionEnd,
  },
  ref,
) {
  assertPositiveFinite(orbitSpeed, 'orbitSpeed');
  assertPositiveFinite(zoomSpeed, 'zoomSpeed');

  const { cameraController, resetCamera, viewport } = useModelViewer();
  const activeInteractionsRef = useRef(0);
  const previousPinchScaleRef = useRef(1);

  useImperativeHandle(
    ref,
    () => createOrbitControlsHandle(cameraController, resetCamera, viewport),
    [cameraController, resetCamera, viewport],
  );

  const beginInteraction = useCallback(() => {
    if (activeInteractionsRef.current === 0) {
      onInteractionStart?.();
    }
    activeInteractionsRef.current += 1;
  }, [onInteractionStart]);

  const endInteraction = useCallback(() => {
    activeInteractionsRef.current = Math.max(
      0,
      activeInteractionsRef.current - 1,
    );
    if (activeInteractionsRef.current === 0) {
      onInteractionEnd?.();
    }
  }, [onInteractionEnd]);

  const gesture = useMemo(() => {
    const orbitScale = orbitSpeed / DEFAULT_ORBIT_SPEED;
    const zoomScale = zoomSpeed / DEFAULT_ZOOM_SPEED;

    const rotate = Gesture.Pan()
      .enabled(enabled && enableRotate && cameraController !== null)
      .maxPointers(1)
      .runOnJS(true)
      .onBegin(() => {
        beginInteraction();
        runCameraCommand(cameraController?.begin(0, viewport.height, 'rotate'));
      })
      .onUpdate((event) => {
        runCameraCommand(
          cameraController?.update(
            event.translationX * orbitScale,
            viewport.height - event.translationY * orbitScale,
          ),
        );
      })
      .onFinalize(() => {
        runCameraCommand(cameraController?.end());
        endInteraction();
      });

    const pan = Gesture.Pan()
      .enabled(enabled && enablePan && cameraController !== null)
      .minPointers(2)
      .runOnJS(true)
      .onBegin(() => {
        beginInteraction();
        runCameraCommand(cameraController?.begin(0, viewport.height, 'pan'));
      })
      .onUpdate((event) => {
        runCameraCommand(
          cameraController?.update(
            event.translationX * orbitScale,
            viewport.height - event.translationY * orbitScale,
          ),
        );
      })
      .onFinalize(() => {
        runCameraCommand(cameraController?.end());
        endInteraction();
      });

    const pinch = Gesture.Pinch()
      .enabled(enabled && enableZoom && cameraController !== null)
      .runOnJS(true)
      .onBegin(() => {
        previousPinchScaleRef.current = 1;
        beginInteraction();
      })
      .onUpdate((event) => {
        const scaleDelta = event.scale - previousPinchScaleRef.current;
        previousPinchScaleRef.current = event.scale;
        runCameraCommand(
          cameraController?.zoom(
            event.focalX,
            viewport.height - event.focalY,
            -scaleDelta * 100 * zoomScale,
          ),
        );
      })
      .onFinalize(() => {
        endInteraction();
      });

    return Gesture.Simultaneous(rotate, pan, pinch);
  }, [
    beginInteraction,
    cameraController,
    enablePan,
    enableRotate,
    enableZoom,
    enabled,
    endInteraction,
    orbitSpeed,
    viewport.height,
    zoomSpeed,
  ]);

  return (
    <GestureDetector gesture={gesture}>
      <View
        pointerEvents={enabled ? 'auto' : 'none'}
        style={[StyleSheet.absoluteFill, style]}
        testID="orbit-controls"
      />
    </GestureDetector>
  );
});
