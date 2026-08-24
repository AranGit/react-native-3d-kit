import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import { FilamentScene } from 'react-native-filament';
import { StyleSheet, View, type LayoutChangeEvent } from 'react-native';
import { ModelViewerContext } from '../context/ModelViewerContext';
import {
  DEFAULT_CAMERA_CONFIGURATION,
  fitCameraToBounds,
  type CameraConfiguration,
} from '../internal/filamentAdapter';
import { getModelSourceKey } from '../internal/sourceKey';
import type {
  ModelBounds,
  ModelViewerCameraController,
  ModelViewerContextValue,
  ModelViewerHandle,
  ModelViewerProps,
  ScreenPosition,
  Vector3,
} from '../types/public';
import { ModelViewerErrorBoundary } from './ModelViewerErrorBoundary';
import { ModelViewerScene } from './ModelViewerScene';

const EMPTY_VIEWPORT = { width: 0, height: 0 };

const ModelViewerInstance = forwardRef<ModelViewerHandle, ModelViewerProps>(
  function ModelViewerComponent(
    {
      source,
      style,
      backgroundColor = 'transparent',
      autoFit = false,
      loadingFallback = null,
      errorFallback,
      onLoad,
      onError,
      children,
      onLayout,
      ...viewProps
    },
    ref,
  ) {
    const sourceKey = getModelSourceKey(source);
    const [statusState, setStatusState] = useState<{
      sourceKey: string;
      status: ModelViewerContextValue['status'];
      error: Error | null;
    }>(() => ({ sourceKey, status: 'loading', error: null }));
    const [viewport, setViewport] = useState(EMPTY_VIEWPORT);
    const [cameraController, setCameraController] =
      useState<ModelViewerCameraController | null>(null);
    const [cameraConfiguration, setCameraConfiguration] =
      useState<CameraConfiguration>(DEFAULT_CAMERA_CONFIGURATION);
    const [cameraRevision, setCameraRevision] = useState(0);
    const boundsRef = useRef<ModelBounds | null>(null);
    const homeConfigurationRef = useRef<CameraConfiguration>(
      DEFAULT_CAMERA_CONFIGURATION,
    );
    const projectorRef = useRef<
      ((position: Vector3) => ScreenPosition | null) | null
    >(null);
    const listenersRef = useRef(new Set<() => void>());
    const animationFrameRef = useRef<number | null>(null);
    const loadedSourceKeyRef = useRef<string | null>(null);

    const notifyProjectionUpdates = useCallback(() => {
      if (animationFrameRef.current !== null) {
        return;
      }
      animationFrameRef.current = requestAnimationFrame(() => {
        animationFrameRef.current = null;
        listenersRef.current.forEach((listener) => listener());
      });
    }, []);

    useEffect(() => {
      return () => {
        if (animationFrameRef.current !== null) {
          cancelAnimationFrame(animationFrameRef.current);
        }
      };
    }, []);

    const applyFit = useCallback((bounds: ModelBounds): boolean => {
      const nextConfiguration = fitCameraToBounds(bounds);
      homeConfigurationRef.current = nextConfiguration;
      setCameraConfiguration(nextConfiguration);
      setCameraRevision((revision) => revision + 1);
      return true;
    }, []);

    const fitToModel = useCallback((): boolean => {
      const bounds = boundsRef.current;
      if (bounds === null) {
        return false;
      }
      const fitted = applyFit(bounds);
      notifyProjectionUpdates();
      return fitted;
    }, [applyFit, notifyProjectionUpdates]);

    const resetCamera = useCallback(() => {
      setCameraConfiguration(homeConfigurationRef.current);
      setCameraRevision((revision) => revision + 1);
      notifyProjectionUpdates();
    }, [notifyProjectionUpdates]);

    const projectWorldToScreen = useCallback(
      (position: Vector3): ScreenPosition | null =>
        projectorRef.current?.(position) ?? null,
      [],
    );

    const subscribeToProjectionUpdates = useCallback((listener: () => void) => {
      listenersRef.current.add(listener);
      return () => {
        listenersRef.current.delete(listener);
      };
    }, []);

    useImperativeHandle(
      ref,
      () => ({ resetCamera, fitToModel, projectWorldToScreen }),
      [fitToModel, projectWorldToScreen, resetCamera],
    );

    const handleLoaded = useCallback(
      (bounds: ModelBounds) => {
        boundsRef.current = bounds;
        setStatusState({ sourceKey, status: 'loaded', error: null });

        if (autoFit) {
          applyFit(bounds);
        }

        if (loadedSourceKeyRef.current !== sourceKey) {
          loadedSourceKeyRef.current = sourceKey;
          onLoad?.({ source, bounds });
        }
        notifyProjectionUpdates();
      },
      [applyFit, autoFit, notifyProjectionUpdates, onLoad, source, sourceKey],
    );

    const handleError = useCallback(
      (error: Error) => {
        setStatusState({ sourceKey, status: 'error', error });
        onError?.(error);
      },
      [onError, sourceKey],
    );

    const handleControllerReady = useCallback(
      (controller: ModelViewerCameraController | null) => {
        setCameraController((current) =>
          current === controller ? current : controller,
        );
      },
      [],
    );

    const handleProjectorReady = useCallback(
      (projector: ((position: Vector3) => ScreenPosition | null) | null) => {
        projectorRef.current = projector;
      },
      [],
    );

    const handleLayout = useCallback(
      (event: LayoutChangeEvent) => {
        const { width, height } = event.nativeEvent.layout;
        setViewport((current) =>
          current.width === width && current.height === height
            ? current
            : { width, height },
        );
        onLayout?.(event);
        notifyProjectionUpdates();
      },
      [notifyProjectionUpdates, onLayout],
    );

    const effectiveStatus =
      statusState.sourceKey === sourceKey ? statusState.status : 'loading';
    const effectiveError =
      statusState.sourceKey === sourceKey ? statusState.error : null;

    const contextValue = useMemo<ModelViewerContextValue>(
      () => ({
        status: effectiveStatus,
        error: effectiveError,
        viewport,
        cameraController,
        resetCamera,
        fitToModel,
        projectWorldToScreen,
        subscribeToProjectionUpdates,
      }),
      [
        cameraController,
        effectiveError,
        effectiveStatus,
        fitToModel,
        projectWorldToScreen,
        resetCamera,
        subscribeToProjectionUpdates,
        viewport,
      ],
    );

    return (
      <ModelViewerContext.Provider value={contextValue}>
        <View
          {...viewProps}
          onLayout={handleLayout}
          style={[styles.container, { backgroundColor }, style]}
        >
          <ModelViewerErrorBoundary key={sourceKey} onError={handleError}>
            <FilamentScene key={sourceKey}>
              <ModelViewerScene
                source={source}
                viewport={viewport}
                cameraConfiguration={cameraConfiguration}
                cameraRevision={cameraRevision}
                onCameraChange={notifyProjectionUpdates}
                onControllerReady={handleControllerReady}
                onLoaded={handleLoaded}
                onProjectorReady={handleProjectorReady}
              />
            </FilamentScene>
          </ModelViewerErrorBoundary>

          <View pointerEvents="box-none" style={StyleSheet.absoluteFill}>
            {effectiveStatus === 'loading' ? loadingFallback : null}
            {effectiveStatus === 'error' && effectiveError !== null
              ? errorFallback?.({ error: effectiveError })
              : null}
            {children}
          </View>
        </View>
      </ModelViewerContext.Provider>
    );
  },
);

export const ModelViewer = forwardRef<ModelViewerHandle, ModelViewerProps>(
  function ModelViewerRoot(props, ref) {
    return (
      <ModelViewerInstance
        key={getModelSourceKey(props.source)}
        ref={ref}
        {...props}
      />
    );
  },
);

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
});
