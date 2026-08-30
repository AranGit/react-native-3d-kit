# @arangit/react-native-model-viewer

Typed GLB viewer for React Native iOS and Android, powered by
`react-native-filament`. It owns a single scene, model, camera, default light,
viewport, and a React Native overlay layer for plugins.

> Pre-1.0 and not yet published. The validated matrix is React Native 0.83.10,
> React 19.2.0, React Native Filament 1.11.0, and Worklets Core 1.6.3.

## Install

```sh
pnpm add @arangit/react-native-model-viewer \
  react-native-filament react-native-worklets-core
```

Add `glb` to Metro `assetExts`, add `react-native-worklets-core/plugin` to Babel,
and run `pod install` for iOS. See the repository root README for complete setup.

## Usage

```tsx
import { ModelViewer } from '@arangit/react-native-model-viewer';

const model = require('./model.glb');

export function Preview() {
  return (
    <ModelViewer
      accessibilityHint="Use the controls to inspect the model"
      accessibilityLabel="Interactive 3D product model"
      autoFit
      backgroundColor="#10131A"
      errorFallback={({ error }) => <Text>{error.message}</Text>}
      loadingFallback={<Text>Loading…</Text>}
      onLoad={({ bounds }) => console.log(bounds)}
      source={model}
      style={{ flex: 1 }}
    >
      <Text>React Native overlay</Text>
    </ModelViewer>
  );
}
```

Remote files use `{uri: 'https://example.com/model.glb'}`. Only GLB is supported
by this MVP.

## Public API

- `ModelViewer`
- `useModelViewer()`
- `ModelViewerProps`, `ModelViewerHandle`, `ModelViewerContextValue`
- `ModelSource`, `ModelViewerStatus`, `ModelViewerLoadEvent`
- `ModelBounds`, `Vector3`, `ScreenPosition`
- `ModelViewerErrorFallbackProps`

The ref exposes `resetCamera()`, `fitToModel()`, and
`projectWorldToScreen(position)`. The hook additionally exposes status, error,
viewport, the narrow camera controller needed by plugins, and projection update
subscription. Calling the hook outside a viewer throws a helpful error.

When `accessibilityLabel` is provided, the viewer exposes a sibling image
description without grouping or hiding interactive React Native overlays.
Applications should describe the model's purpose and provide equivalent
controls or content for tasks that cannot be completed visually.

`loading` and the loading fallback remain active while the asset is prepared,
added to the scene, and auto-fitted. `loaded` and `onLoad` are reported only
after the prepared model has participated in the Filament render loop, avoiding
a parse-ready state that precedes visible scene output.

## Boundaries

React Native Filament 1.11 logs asynchronous asset-read failures internally, so
the error fallback can only represent errors observable by React. Projection has
no depth or behind-camera result. There is no multiple-model scene, animation
controller, cache, screenshot, AR, physics, material editor, conversion, or web
support.

MIT
