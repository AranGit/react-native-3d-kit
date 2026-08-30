import type { ModelSource, Vector3 } from '@arangit/react-native-model-viewer';

export type ExampleModelId =
  'vertex-cube' | 'italjet-dragster' | 'hornet' | 'house';

export interface ExampleModelHotspot {
  id: string;
  label: string;
  position: Vector3;
}

export interface ExampleModel {
  id: ExampleModelId;
  label: string;
  source: ModelSource;
  arScale: number;
  hotspots: ReadonlyArray<ExampleModelHotspot>;
}

export interface ExampleProps {
  model: ExampleModel;
}

const VERTEX_CUBE_MODEL: ExampleModel = {
  id: 'vertex-cube',
  label: 'Vertex cube',
  source: require('../assets/BoxVertexColors.glb') as ModelSource,
  arScale: 0.25,
  hotspots: [
    { id: 'origin', label: 'Origin', position: [0, 0, 0] },
    { id: 'top', label: 'Top corner', position: [1, 1, 1] },
    { id: 'edge', label: 'Lower edge', position: [1, 0, 1] },
  ],
};

const ITALJET_DRAGSTER_MODEL: ExampleModel = {
  id: 'italjet-dragster',
  label: 'Italjet',
  source:
    require('../assets/2024_italjet_dragster_700_twin.glb') as ModelSource,
  arScale: 0.45,
  hotspots: [
    { id: 'center', label: 'Bike center', position: [0, 0.3, 0] },
    { id: 'handlebars', label: 'Handlebars', position: [0, 0.76, -0.43] },
    { id: 'front-wheel', label: 'Front wheel', position: [0, -0.05, -0.78] },
  ],
};

const HORNET_MODEL: ExampleModel = {
  id: 'hornet',
  label: 'HORNET',
  source: require('../assets/HORNET.glb') as ModelSource,
  arScale: 0.45,
  hotspots: [
    { id: 'head', label: 'Head', position: [0, 0.84, 0] },
    { id: 'chest', label: 'Chest', position: [0, 0.67, -0.01] },
    { id: 'needle', label: 'Needle', position: [0, 0.72, -0.45] },
  ],
};

const HOUSE_MODEL: ExampleModel = {
  id: 'house',
  label: 'House',
  source: require('../assets/house.glb') as ModelSource,
  arScale: 0.16,
  hotspots: [
    { id: 'center', label: 'House center', position: [-1.18, 1.5, 0] },
    { id: 'roof', label: 'Roof', position: [-1.18, 2.9, 0] },
    { id: 'left-side', label: 'Left side', position: [-3.1, 1.2, 0] },
  ],
};

export const EXAMPLE_MODELS: ReadonlyArray<ExampleModel> = [
  HOUSE_MODEL,
  HORNET_MODEL,
  ITALJET_DRAGSTER_MODEL,
  VERTEX_CUBE_MODEL,
];

export const DEFAULT_EXAMPLE_MODEL = HOUSE_MODEL;
