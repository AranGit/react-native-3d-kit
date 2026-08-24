# React Native 3D Kit example

This bare React Native app is the native integration fixture for all three
workspace packages. It demonstrates a local GLB viewer, orbit/zoom/reset
controls, three projected interactive hotspots, loading/error fallbacks, and a
small status/viewport developer panel.

## Run from the monorepo root

```sh
pnpm install --frozen-lockfile
pnpm example:start
```

In another terminal:

```sh
pnpm example:android
# or
pnpm example:ios
```

For a first iOS setup or after native dependency changes:

```sh
cd apps/example
bundle install
cd ios
bundle exec pod install
```

The app is intentionally bare React Native because it validates autolinking,
CocoaPods, and Gradle. An Expo Development Build/prebuild app can integrate the
same native dependencies, but Expo Go cannot load them.

## Integration details demonstrated here

- `metro.config.js` adds `.glb` to Metro assets.
- `babel.config.js` enables `react-native-worklets-core/plugin`.
- `index.js` imports Gesture Handler before the app.
- `src/App.tsx` uses `GestureHandlerRootView`.
- Every package is imported by its public npm name through the pnpm workspace.
- `assets/BoxVertexColors.glb` is the small CC0 Khronos fixture documented in
  the root asset attribution record.

The packages are not published yet; this app is for local development and
validation only.
