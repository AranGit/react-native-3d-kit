import { createContext } from 'react';
import type { Vector3 } from '@arangit/react-native-model-viewer';
import type { HotspotProjectionResult, PixelOffset } from './types';

export interface HotspotRegistration {
  position: Vector3;
  offset: PixelOffset;
  update: (projection: HotspotProjectionResult) => void;
}

export interface HotspotLayerContextValue {
  register(id: string, registration: HotspotRegistration): () => void;
}

export const HotspotLayerContext = createContext<
  HotspotLayerContextValue | undefined
>(undefined);
