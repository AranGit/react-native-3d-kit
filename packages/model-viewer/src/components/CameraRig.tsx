import { useEffect, useMemo, useRef } from 'react';
import {
  Camera,
  useCameraManipulator,
  useWorkletCallback,
} from 'react-native-filament';
import type { CameraConfiguration } from '../internal/filamentAdapter';
import type { ModelViewerCameraController } from '../types/public';

interface CameraRigProps {
  configuration: CameraConfiguration;
  onControllerReady: (controller: ModelViewerCameraController | null) => void;
  onCameraChange: () => void;
}

export function CameraRig({
  configuration,
  onControllerReady,
  onCameraChange,
}: CameraRigProps) {
  const cameraManipulator = useCameraManipulator({
    orbitHomePosition: configuration.home,
    targetPosition: configuration.target,
    upVector: configuration.up,
    orbitSpeed: [0.003, 0.003],
    zoomSpeed: [0.01],
  });

  const runBegin = useWorkletCallback(
    (x: number, y: number, strafe: boolean) => {
      'worklet';
      cameraManipulator?.grabBegin(x, y, strafe);
    },
  );
  const runUpdate = useWorkletCallback((x: number, y: number) => {
    'worklet';
    cameraManipulator?.grabUpdate(x, y);
  });
  const runEnd = useWorkletCallback(() => {
    'worklet';
    cameraManipulator?.grabEnd();
  });
  const runZoom = useWorkletCallback((x: number, y: number, delta: number) => {
    'worklet';
    cameraManipulator?.scroll(x, y, delta);
  });
  const runGetLookAt = useWorkletCallback(() => {
    'worklet';
    return cameraManipulator?.getLookAt() ?? null;
  });

  const workletsRef = useRef({
    begin: runBegin,
    update: runUpdate,
    end: runEnd,
    zoom: runZoom,
    getLookAt: runGetLookAt,
  });
  workletsRef.current = {
    begin: runBegin,
    update: runUpdate,
    end: runEnd,
    zoom: runZoom,
    getLookAt: runGetLookAt,
  };

  const controller = useMemo<ModelViewerCameraController | null>(() => {
    if (cameraManipulator === undefined) {
      return null;
    }

    return {
      async begin(x, y, mode) {
        await workletsRef.current.begin(x, y, mode === 'pan');
      },
      async update(x, y) {
        await workletsRef.current.update(x, y);
        onCameraChange();
      },
      async end() {
        await workletsRef.current.end();
        onCameraChange();
      },
      async zoom(x, y, delta) {
        await workletsRef.current.zoom(x, y, delta);
        onCameraChange();
      },
      async getLookAt() {
        return workletsRef.current.getLookAt();
      },
    };
  }, [cameraManipulator, onCameraChange]);

  useEffect(() => {
    onControllerReady(controller);
    return () => {
      onControllerReady(null);
    };
  }, [controller, onControllerReady]);

  return cameraManipulator === undefined ? null : (
    <Camera cameraManipulator={cameraManipulator} />
  );
}
