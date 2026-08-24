module.exports = {
  preset: 'react-native',
  clearMocks: true,
  transform: {
    '^.+\\.(js|ts|tsx)$': [
      'babel-jest',
      { presets: ['module:@react-native/babel-preset'] },
    ],
  },
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/index.ts',
    '!src/**/*.d.ts',
    '!src/**/types.ts',
  ],
  transformIgnorePatterns: [
    'node_modules/(?!((\\.pnpm/)?((jest-)?react-native|@react-native\\+[^/]+|@react-native-community\\+[^/]+)(@|/)|((jest-)?react-native|@react-native(-community)?)/))',
  ],
};
