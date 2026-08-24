module.exports = {
  root: true,
  extends: ['@react-native'],
  ignorePatterns: [
    '**/lib/**',
    '**/coverage/**',
    '**/Pods/**',
    '**/android/build/**',
    '**/ios/build/**',
  ],
  overrides: [
    {
      files: ['**/__tests__/**/*.{ts,tsx}', '**/*.{test,spec}.{ts,tsx}'],
      env: {
        jest: true,
      },
    },
  ],
};
