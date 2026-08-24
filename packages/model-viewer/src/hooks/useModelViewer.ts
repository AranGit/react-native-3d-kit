import { useContext } from 'react';
import { ModelViewerContext } from '../context/ModelViewerContext';
import type { ModelViewerContextValue } from '../types/public';

export function useModelViewer(): ModelViewerContextValue {
  const context = useContext(ModelViewerContext);

  if (context === undefined) {
    throw new Error(
      'useModelViewer must be used inside an @arangit/react-native-model-viewer <ModelViewer>.',
    );
  }

  return context;
}
