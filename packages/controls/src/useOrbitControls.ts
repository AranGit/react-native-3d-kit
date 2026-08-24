import { useMemo } from 'react';
import { useModelViewer } from '@arangit/react-native-model-viewer';
import type { OrbitControlsHandle } from './types';

export function useOrbitControls(): OrbitControlsHandle {
  const { resetCamera } = useModelViewer();

  return useMemo(
    () => ({
      reset: resetCamera,
    }),
    [resetCamera],
  );
}
