import type { AABB, View } from 'react-native-filament';
import type { ModelBounds, ScreenPosition, Vector3 } from '../types/public';

export interface CameraConfiguration {
  home: Vector3;
  target: Vector3;
  up: Vector3;
}

export const DEFAULT_CAMERA_CONFIGURATION: CameraConfiguration = {
  home: [0, 0, 8],
  target: [0, 0, 0],
  up: [0, 1, 0],
};

export function copyBounds(bounds: AABB): ModelBounds {
  return {
    center: [...bounds.center],
    halfExtent: [...bounds.halfExtent],
  };
}

export function fitCameraToBounds(bounds: ModelBounds): CameraConfiguration {
  const [centerX, centerY, centerZ] = bounds.center;
  const [extentX, extentY, extentZ] = bounds.halfExtent;
  const radius = Math.max(Math.hypot(extentX, extentY, extentZ), 0.25);
  const distance = radius * 2.75;

  return {
    home: [centerX, centerY, centerZ + distance],
    target: [centerX, centerY, centerZ],
    up: [0, 1, 0],
  };
}

export function projectSafely(
  view: View | null,
  position: Vector3,
  viewport: { width: number; height: number },
): ScreenPosition | null {
  if (view === null || viewport.width <= 0 || viewport.height <= 0) {
    return null;
  }

  try {
    const [x, y] = view.projectWorldToScreen(position);
    if (!Number.isFinite(x) || !Number.isFinite(y)) {
      return null;
    }
    return { x, y };
  } catch {
    return null;
  }
}
