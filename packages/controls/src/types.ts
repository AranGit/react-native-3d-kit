import type { Ref, RefAttributes } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';

export interface OrbitControlsHandle {
  reset(): void;
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
