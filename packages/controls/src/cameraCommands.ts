import type {
  ModelViewerCameraController,
  ModelViewerContextValue,
} from '@arangit/react-native-model-viewer';
import type { OrbitControlsHandle } from './types';

function reportCommandError(error: unknown): void {
  console.error('[react-native-3d-controls] Camera command failed.', error);
}

function assertFinite(value: number, name: string): void {
  if (!Number.isFinite(value)) {
    throw new RangeError(`${name} must be a finite number.`);
  }
}

export function runCameraCommand(command: Promise<unknown> | undefined): void {
  command?.catch(reportCommandError);
}

function stepCamera(
  controller: ModelViewerCameraController | null,
  viewport: ModelViewerContextValue['viewport'],
  mode: 'rotate' | 'pan',
  deltaX: number,
  deltaY: number,
): void {
  if (controller === null || viewport.width <= 0 || viewport.height <= 0) {
    return;
  }
  const startX = viewport.width / 2;
  const startY = viewport.height / 2;
  runCameraCommand(
    (async () => {
      await controller.begin(startX, startY, mode);
      await controller.update(startX + deltaX, startY + deltaY);
      await controller.end();
    })(),
  );
}

export function createOrbitControlsHandle(
  controller: ModelViewerCameraController | null,
  resetCamera: () => void,
  viewport: ModelViewerContextValue['viewport'],
): OrbitControlsHandle {
  return {
    reset: resetCamera,
    rotateBy(deltaX, deltaY = 0) {
      assertFinite(deltaX, 'deltaX');
      assertFinite(deltaY, 'deltaY');
      stepCamera(controller, viewport, 'rotate', deltaX, deltaY);
    },
    panBy(deltaX, deltaY = 0) {
      assertFinite(deltaX, 'deltaX');
      assertFinite(deltaY, 'deltaY');
      stepCamera(controller, viewport, 'pan', deltaX, deltaY);
    },
    zoomBy(delta) {
      assertFinite(delta, 'delta');
      if (controller === null || viewport.width <= 0 || viewport.height <= 0) {
        return;
      }
      runCameraCommand(
        controller.zoom(viewport.width / 2, viewport.height / 2, delta),
      );
    },
  };
}
