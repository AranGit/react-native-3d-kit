import { useEffect } from 'react';
import {
  DefaultLight,
  FilamentView,
  ModelRenderer,
  useFilamentContext,
  useModel,
} from 'react-native-filament';
import { StyleSheet } from 'react-native';
import { CameraRig } from './CameraRig';
import {
  copyBounds,
  projectSafely,
  type CameraConfiguration,
} from '../internal/filamentAdapter';
import type {
  ModelBounds,
  ModelSource,
  ModelViewerCameraController,
  ScreenPosition,
  Vector3,
} from '../types/public';

interface ModelViewerSceneProps {
  source: ModelSource;
  viewport: { width: number; height: number };
  cameraConfiguration: CameraConfiguration;
  cameraRevision: number;
  onLoaded: (bounds: ModelBounds) => void;
  onControllerReady: (controller: ModelViewerCameraController | null) => void;
  onProjectorReady: (
    projector: ((position: Vector3) => ScreenPosition | null) | null,
  ) => void;
  onCameraChange: () => void;
}

export function ModelViewerScene({
  source,
  viewport,
  cameraConfiguration,
  cameraRevision,
  onLoaded,
  onControllerReady,
  onProjectorReady,
  onCameraChange,
}: ModelViewerSceneProps) {
  const model = useModel(source);
  const { view } = useFilamentContext();
  const loadedBounds = model.state === 'loaded' ? model.boundingBox : null;

  useEffect(() => {
    onProjectorReady((position) => projectSafely(view, position, viewport));
    return () => {
      onProjectorReady(null);
    };
  }, [onProjectorReady, view, viewport]);

  useEffect(() => {
    if (loadedBounds !== null) {
      onLoaded(copyBounds(loadedBounds));
    }
  }, [loadedBounds, onLoaded]);

  return (
    <FilamentView enableTransparentRendering style={StyleSheet.absoluteFill}>
      <DefaultLight />
      <ModelRenderer model={model} />
      <CameraRig
        key={cameraRevision}
        configuration={cameraConfiguration}
        onCameraChange={onCameraChange}
        onControllerReady={onControllerReady}
      />
    </FilamentView>
  );
}
