import type { BufferSource, Float3 } from 'react-native-filament';
import type { ReactNode, Ref } from 'react';
import type { StyleProp, ViewProps, ViewStyle } from 'react-native';

export type ModelSource = BufferSource;
export type Vector3 = Float3;

export interface ScreenPosition {
  x: number;
  y: number;
}

export interface ModelBounds {
  center: Vector3;
  halfExtent: Vector3;
}

export type ModelViewerStatus = 'loading' | 'loaded' | 'error';

export interface ModelViewerLoadEvent {
  source: ModelSource;
  bounds: ModelBounds;
}

export type CameraInteractionMode = 'rotate' | 'pan';

export interface ModelViewerCameraController {
  begin(x: number, y: number, mode: CameraInteractionMode): Promise<void>;
  update(x: number, y: number): Promise<void>;
  end(): Promise<void>;
  zoom(x: number, y: number, delta: number): Promise<void>;
  getLookAt(): Promise<readonly [Vector3, Vector3, Vector3] | null>;
}

export interface ModelViewerContextValue {
  status: ModelViewerStatus;
  error: Error | null;
  viewport: {
    width: number;
    height: number;
  };
  cameraController: ModelViewerCameraController | null;
  resetCamera(): void;
  fitToModel(): boolean;
  projectWorldToScreen(position: Vector3): ScreenPosition | null;
  subscribeToProjectionUpdates(listener: () => void): () => void;
}

export interface ModelViewerHandle {
  resetCamera(): void;
  fitToModel(): boolean;
  projectWorldToScreen(position: Vector3): ScreenPosition | null;
}

export interface ModelViewerErrorFallbackProps {
  error: Error;
}

export interface ModelViewerProps extends Omit<
  ViewProps,
  'children' | 'onError' | 'style'
> {
  source: ModelSource;
  style?: StyleProp<ViewStyle>;
  backgroundColor?: string;
  autoFit?: boolean;
  loadingFallback?: ReactNode;
  errorFallback?: (props: ModelViewerErrorFallbackProps) => ReactNode;
  onLoad?: (event: ModelViewerLoadEvent) => void;
  onError?: (error: Error) => void;
  children?: ReactNode;
  ref?: Ref<ModelViewerHandle>;
}
