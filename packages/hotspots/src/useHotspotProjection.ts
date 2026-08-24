import { useCallback, useEffect, useState } from 'react';
import { useModelViewer } from '@arangit/react-native-model-viewer';
import {
  areHotspotProjectionsEqual,
  resolveHotspotProjection,
} from './projection';
import type { HotspotProjectionResult, PixelOffset } from './types';
import type { Vector3 } from '@arangit/react-native-model-viewer';

const ZERO_OFFSET: PixelOffset = [0, 0];
const HIDDEN_PROJECTION: HotspotProjectionResult = {
  screenPosition: null,
  visible: false,
};

export function useHotspotProjection(
  position: Vector3,
  offset: PixelOffset = ZERO_OFFSET,
): HotspotProjectionResult {
  const {
    status,
    viewport,
    projectWorldToScreen,
    subscribeToProjectionUpdates,
  } = useModelViewer();
  const [projection, setProjection] =
    useState<HotspotProjectionResult>(HIDDEN_PROJECTION);
  const [positionX, positionY, positionZ] = position;
  const [offsetX, offsetY] = offset;

  const update = useCallback(() => {
    const nextProjection = resolveHotspotProjection(
      projectWorldToScreen([positionX, positionY, positionZ]),
      viewport,
      status,
      [offsetX, offsetY],
    );
    setProjection((current) =>
      areHotspotProjectionsEqual(current, nextProjection)
        ? current
        : nextProjection,
    );
  }, [
    offsetX,
    offsetY,
    positionX,
    positionY,
    positionZ,
    projectWorldToScreen,
    status,
    viewport,
  ]);

  useEffect(() => {
    update();
    return subscribeToProjectionUpdates(update);
  }, [subscribeToProjectionUpdates, update]);

  return projection;
}
