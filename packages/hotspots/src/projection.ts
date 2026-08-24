import type {
  ModelViewerStatus,
  ScreenPosition,
} from '@arangit/react-native-model-viewer';
import type { HotspotProjectionResult, PixelOffset } from './types';

export function areHotspotProjectionsEqual(
  first: HotspotProjectionResult,
  second: HotspotProjectionResult,
): boolean {
  if (first.visible !== second.visible) {
    return false;
  }
  if (first.screenPosition === null || second.screenPosition === null) {
    return first.screenPosition === second.screenPosition;
  }
  return (
    first.screenPosition.x === second.screenPosition.x &&
    first.screenPosition.y === second.screenPosition.y
  );
}

export function resolveHotspotProjection(
  projected: ScreenPosition | null,
  viewport: { width: number; height: number },
  status: ModelViewerStatus,
  offset: PixelOffset,
): HotspotProjectionResult {
  if (status !== 'loaded' || projected === null) {
    return { screenPosition: null, visible: false };
  }

  const screenPosition = {
    x: projected.x + offset[0],
    y: projected.y + offset[1],
  };
  const visible =
    viewport.width > 0 &&
    viewport.height > 0 &&
    screenPosition.x >= 0 &&
    screenPosition.x <= viewport.width &&
    screenPosition.y >= 0 &&
    screenPosition.y <= viewport.height;

  return { screenPosition, visible };
}
