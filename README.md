# React Native 3D Kit

A small, composable set of React Native 3D packages built on top of
[`react-native-filament`](https://github.com/margelo/react-native-filament).
The MVP focuses on one GLB model, orbit controls, and interactive React Native
hotspots without introducing another rendering engine.

> Pre-1.0 status: the packages are prepared for local validation but have not
> been published. Confirm ownership of the `@arangit` npm scope and the GitHub
> repository before the first release.

## Packages

| Package                                                         | Purpose                                                                      | Version |
| --------------------------------------------------------------- | ---------------------------------------------------------------------------- | ------- |
| [`@arangit/react-native-model-viewer`](./packages/model-viewer) | Filament scene, GLB loading, camera, lighting, viewport, and overlay context | `0.1.0` |
| [`@arangit/react-native-3d-controls`](./packages/controls)      | Gesture Handler orbit, pinch zoom, optional two-finger pan, and reset        | `0.1.0` |
| [`@arangit/react-native-3d-hotspots`](./packages/hotspots)      | World-space projected React Native labels and press targets                  | `0.1.0` |

## Compatibility

The tested MVP matrix is intentionally narrow:

| Dependency/platform          | Validated target                                                 |
| ---------------------------- | ---------------------------------------------------------------- |
| React Native                 | `0.83.10` (New Architecture)                                     |
| React                        | `19.2.0`                                                         |
| react-native-filament        | `1.11.0`                                                         |
| react-native-worklets-core   | `1.6.3`                                                          |
| react-native-gesture-handler | `2.32.0`                                                         |
| iOS / Android                | Bare React Native example under `apps/example`                   |
| Expo                         | Development Build/prebuild may be used; Expo Go is not supported |
| Asset format                 | GLB only                                                         |

The packages contain no custom Swift, Kotlin, or C++ code. Their native runtime
comes from the peer dependencies above.

## Install

Install the base viewer and the native peers:

```sh
pnpm add @arangit/react-native-model-viewer \
  react-native-filament react-native-worklets-core
```

Add either plugin as needed:

```sh
pnpm add @arangit/react-native-3d-controls react-native-gesture-handler
pnpm add @arangit/react-native-3d-hotspots
```

After installing native dependencies, install iOS pods:

```sh
cd ios && pod install
```

## Required app configuration

Add GLB to Metro's asset extensions:

```js
const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

const defaultConfig = getDefaultConfig(__dirname);
module.exports = mergeConfig(defaultConfig, {
  resolver: {
    assetExts: [...defaultConfig.resolver.assetExts, 'glb'],
  },
});
```

Configure the Worklets Core Babel plugin:

```js
module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    ['react-native-worklets-core/plugin', { processNestedWorklets: true }],
  ],
};
```

Import Gesture Handler before other application code when using controls:

```js
import 'react-native-gesture-handler';
```

Wrap the application in `GestureHandlerRootView` when required by the host app's
Gesture Handler setup.

## Quick start

```tsx
import {
  ModelViewer,
  useModelViewer,
} from '@arangit/react-native-model-viewer';
import { OrbitControls } from '@arangit/react-native-3d-controls';
import { Hotspot, HotspotLayer } from '@arangit/react-native-3d-hotspots';

const model = require('./model.glb');

function Status() {
  const { status, viewport } = useModelViewer();
  return <Text>{`${status} · ${viewport.width}×${viewport.height}`}</Text>;
}

export function ProductPreview() {
  return (
    <ModelViewer
      autoFit
      backgroundColor="#10131A"
      loadingFallback={<Text>Loading…</Text>}
      errorFallback={({ error }) => <Text>{error.message}</Text>}
      source={model}
      style={{ flex: 1 }}
    >
      <OrbitControls enablePan />
      <HotspotLayer>
        <Hotspot
          id="entrance"
          label="Entrance"
          offset={[0, -16]}
          position={[1, 1, 0]}
        />
      </HotspotLayer>
      <Status />
    </ModelViewer>
  );
}
```

React Native overlays are siblings of the Filament surface, never children of
`FilamentView`.

## Run the example

```sh
pnpm install --frozen-lockfile
pnpm example:start
pnpm example:ios
# or
pnpm example:android
```

For the first iOS setup, or after native dependency changes:

```sh
cd apps/example
bundle install
cd ios
bundle exec pod install
```

The workspace uses pnpm's hoisted linker because React Native CocoaPods scripts
need real filesystem paths when resolving native package roots.

The example is a bare React Native app and contains a 1.9 KB CC0 GLB fixture.
See [asset attribution](./docs/assets.md).

## Development

```sh
pnpm format:check
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm pack:check
pnpm validate
```

Changes should include focused tests and a Changeset when they alter published
behavior. See [architecture](./docs/architecture.md) and
[releasing](./docs/releasing.md).

Contributions should branch from `main`, keep the package dependency direction
intact, add meaningful tests, run `pnpm validate` and `pnpm pack:check`, and add
a Changeset for user-visible package changes.

## MVP boundaries

There is no AR, web renderer, physics, animation controller, multiple-model
scene, material editor, model conversion, caching, screenshot API, depth
occlusion, inertia, auto-rotation, or zoom-distance clamping in this release.
These omissions keep the public API on documented Filament capabilities.

## License

MIT. The example GLB has its own CC0 attribution record.
