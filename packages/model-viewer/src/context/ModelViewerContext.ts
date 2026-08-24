import { createContext } from 'react';
import type { ModelViewerContextValue } from '../types/public';

export const ModelViewerContext = createContext<
  ModelViewerContextValue | undefined
>(undefined);
