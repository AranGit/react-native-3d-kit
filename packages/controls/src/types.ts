import type { Ref, RefAttributes } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';

export interface OrbitControlsHandle {
  reset(): void;
  /** Applies a small orbit step using the same camera manipulator as gestures. */
  rotateBy(deltaX: number, deltaY?: number): void;
  /** Applies a small pan step using the same camera manipulator as gestures. */
  panBy(deltaX: number, deltaY?: number): void;
  /** Applies a zoom step around the center of the viewport. */
  zoomBy(delta: number): void;
}

export interface OrbitControlsProps {
  enabled?: boolean;
  enableRotate?: boolean;
  enableZoom?: boolean;
  enablePan?: boolean;
  orbitSpeed?: number;
  zoomSpeed?: number;
  style?: StyleProp<ViewStyle>;
  onInteractionStart?: () => void;
  onInteractionEnd?: () => void;
  ref?: Ref<OrbitControlsHandle>;
}

export type OrbitControlsComponentProps = OrbitControlsProps &
  RefAttributes<OrbitControlsHandle>;
