import { useMemo } from 'react';
import { useModelViewer } from '@arangit/react-native-model-viewer';
import { createOrbitControlsHandle } from './cameraCommands';
import type { OrbitControlsHandle } from './types';

export function useOrbitControls(): OrbitControlsHandle {
  const { cameraController, resetCamera, viewport } = useModelViewer();

  return useMemo(
    () => createOrbitControlsHandle(cameraController, resetCamera, viewport),
    [cameraController, resetCamera, viewport],
  );
}
