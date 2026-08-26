import { memo, useCallback, useEffect, useState } from 'react';
import {
  DefaultLight,
  FilamentView,
  ModelRenderer,
  RenderCallbackContext,
  useFilamentContext,
  useModel,
} from 'react-native-filament';
import { useRunOnJS, useSharedValue } from 'react-native-worklets-core';
import { StyleSheet } from 'react-native';
import { CameraRig } from './CameraRig';
import {
  copyBounds,
  projectSafely,
  type CameraConfiguration,
} from '../internal/filamentAdapter';
import { getModelSourceKey } from '../internal/sourceKey';
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
  onPrepared: (bounds: ModelBounds) => void;
  onRendered: () => void;
  onControllerReady: (controller: ModelViewerCameraController | null) => void;
  onProjectorReady: (
    projector: ((position: Vector3) => ScreenPosition | null) | null,
  ) => void;
  onCameraChange: () => void;
}

// react-native-filament releases DefaultLight's environment buffer after
// applying it. Keep the light subtree from re-rendering with scene state so
// the released buffer is not submitted to Filament a second time.
const StableDefaultLight = memo(DefaultLight);

export function ModelViewerScene({
  source,
  viewport,
  cameraConfiguration,
  cameraRevision,
  onPrepared,
  onRendered,
  onControllerReady,
  onProjectorReady,
  onCameraChange,
}: ModelViewerSceneProps) {
  const { view } = useFilamentContext();

  useEffect(() => {
    onProjectorReady((position) => projectSafely(view, position, viewport));
    return () => {
      onProjectorReady(null);
    };
  }, [onProjectorReady, view, viewport]);

  return (
    <FilamentView enableTransparentRendering style={StyleSheet.absoluteFill}>
      <StableDefaultLight />
      <ModelAsset
        key={getModelSourceKey(source)}
        source={source}
        cameraRevision={cameraRevision}
        onPrepared={onPrepared}
        onRendered={onRendered}
      />
      <CameraRig
        key={cameraRevision}
        configuration={cameraConfiguration}
        onCameraChange={onCameraChange}
        onControllerReady={onControllerReady}
      />
    </FilamentView>
  );
}

interface ModelAssetProps {
  source: ModelSource;
  cameraRevision: number;
  onPrepared: (bounds: ModelBounds) => void;
  onRendered: () => void;
}

function ModelAsset({
  source,
  cameraRevision,
  onPrepared,
  onRendered,
}: ModelAssetProps) {
  const model = useModel(source);
  const loadedBounds = model.state === 'loaded' ? model.boundingBox : null;
  const [prepared, setPrepared] = useState(false);
  const renderedFrameCount = useSharedValue(0);
  const renderedCameraRevision = useSharedValue(cameraRevision);
  const didNotifyRendered = useSharedValue(false);
  const notifyRendered = useRunOnJS(onRendered, [onRendered]);

  const handleRenderFrame = useCallback(() => {
    'worklet';

    if (renderedCameraRevision.value !== cameraRevision) {
      renderedCameraRevision.value = cameraRevision;
      renderedFrameCount.value = 0;
      didNotifyRendered.value = false;
    }

    if (!prepared || didNotifyRendered.value) {
      return;
    }

    renderedFrameCount.value += 1;
    if (renderedFrameCount.value < 2) {
      return;
    }

    didNotifyRendered.value = true;
    notifyRendered();
  }, [
    cameraRevision,
    didNotifyRendered,
    notifyRendered,
    prepared,
    renderedCameraRevision,
    renderedFrameCount,
  ]);

  RenderCallbackContext.useRenderCallback(handleRenderFrame, [
    handleRenderFrame,
  ]);

  useEffect(() => {
    if (loadedBounds !== null) {
      onPrepared(copyBounds(loadedBounds));
      setPrepared(true);
    }
  }, [loadedBounds, onPrepared]);

  return <ModelRenderer model={model} />;
}
