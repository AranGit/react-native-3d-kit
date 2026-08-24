module.exports = {
  ...require('../../jest.preset'),
  rootDir: __dirname,
  moduleNameMapper: {
    '^@arangit/react-native-model-viewer$':
      '<rootDir>/../../packages/model-viewer/src/index.ts',
    '^@arangit/react-native-3d-controls$':
      '<rootDir>/../../packages/controls/src/index.ts',
    '^@arangit/react-native-3d-hotspots$':
      '<rootDir>/../../packages/hotspots/src/index.ts',
    '\\.(glb)$': '<rootDir>/test-utils/assetMock.js',
  },
};
