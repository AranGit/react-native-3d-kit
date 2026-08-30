import type { ReactNode } from 'react';
import type { StyleProp, ViewProps, ViewStyle } from 'react-native';
import type {
  ScreenPosition,
  Vector3,
} from '@arangit/react-native-model-viewer';

export type PixelOffset = readonly [number, number];

export interface HotspotRenderProps {
  active: boolean;
}

export interface HotspotProps {
  id: string;
  position: Vector3;
  label?: string;
  offset?: PixelOffset;
  /** Minimum distance, in points, between hotspot content and the viewport edge. */
  edgePadding?: number;
  hidden?: boolean;
  disabled?: boolean;
  onPress?: () => void;
  renderContent?: (props: HotspotRenderProps) => ReactNode;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

export interface HotspotLayerProps extends Omit<
  ViewProps,
  'children' | 'style'
> {
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
}

export interface HotspotProjectionResult {
  screenPosition: ScreenPosition | null;
  visible: boolean;
}
