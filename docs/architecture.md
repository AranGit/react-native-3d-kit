# Architecture

## Dependency direction

```text
react-native-filament + react-native-worklets-core
                         ↑
        @arangit/react-native-model-viewer
                    ↗           ↖
  @arangit/react-native-3d-controls   @arangit/react-native-3d-hotspots
              ↑
 react-native-gesture-handler
```

The model viewer is the base because it owns the only Filament scene, view,
model, camera manipulator, light, and viewport. Controls and hotspots consume a
small public React context. They do not import each other or reach into sibling
package internals.

## Why a pnpm monorepo

The packages need independent npm manifests and tarballs but evolve against one
plugin contract and one native example. A monorepo keeps tests, compatibility
versions, linting, and release preparation aligned. pnpm workspaces provide
deterministic local links and detect incorrect dependency declarations without
adding a task orchestrator that this three-package repository does not need.

## Scene and overlay structure

```text
ModelViewer root View
├── FilamentScene
│   └── FilamentView
│       ├── DefaultLight
│       ├── ModelRenderer
│       └── Camera
└── React Native overlay View
    ├── loading / observable error fallback
    ├── OrbitControls gesture surface
    ├── HotspotLayer
    └── application overlays
```

Regular React Native views never enter `FilamentView`. `ModelViewer` publishes
stable capabilities—status, viewport size, camera commands, projection,
reset/fit, and a narrow projection-change subscription—rather than leaking the
raw Filament context.

Changing `source` keys only the model-specific subtree. React Native Filament's
normal hook lifecycle disposes the old asset, while the `FilamentScene`, native
surface, swapchain, view, and default lighting stay mounted. Camera auto-fit and
the error boundary reset for the new source without rebuilding the renderer.

The upstream `useModel().state` becomes `loaded` after synchronous resource
preparation but before later scene/render work is observable. The viewer keeps
its public status at `loading` until the prepared asset has participated in the
Filament render loop. The loading fallback therefore covers the gap between
resource preparation and visible scene output, and `onLoad` follows the same
transition.

## Camera controls

`CameraRig` adapts the documented `CameraManipulator` methods: `grabBegin`,
`grabUpdate`, `grabEnd`, `scroll`, and `getLookAt`. Worklet callbacks are held in
refs so the public controller stays stable. Gesture Handler recognizes:

- one-pointer pan as orbit rotation;
- pinch as scroll zoom;
- optional two-pointer pan as the manipulator's orbit strafe mode.

Reset and auto-fit recreate the documented camera manipulator with a stored home
configuration. Filament 1.11 does not expose a setter for an exact look-at value,
distance bounds, or programmatic orbit, so min/max distance, inertia, damping,
and auto-rotation are deliberately not advertised.

The controls ref and hook can synthesize small rotate, pan, and zoom steps through
the same manipulator commands used by gestures. These relative steps let host
applications provide buttons, keyboard input, or assistive input without
claiming an exact camera setter.

## Hotspot updates

`HotspotLayer` owns one projection subscription for all registered hotspots.
Camera gesture updates are coalesced to one animation frame by the viewer. Each
hotspot only receives React state when its visible flag or screen coordinates
actually change. This avoids a permanent per-render-frame React `setState` loop.

`useHotspotProjection` is available for standalone custom overlays; a layer is
preferred for multiple hotspots because it centralizes subscription work.
After a hotspot measures its content, its visual center is clamped so the whole
annotation remains inside the viewport padding while the original projected
anchor continues to determine visibility.

## Peer dependency strategy

React, React Native, Filament, Worklets Core, Gesture Handler, and the base viewer
are peers where they are runtime requirements. The example installs exactly one
copy of every native module. Workspace packages appear only as `workspace:*`
development links; pnpm rewrites publishable relationships while packing.

The tested compatibility matrix is React Native 0.83.10, React 19.2.0,
React Native Filament 1.11.0, Worklets Core 1.6.3, Gesture Handler 2.32.0, and
ViroReact 2.58.1 in the private example app. Peer ranges intentionally cover
only the minor lines validated for the public packages; ViroReact is not a
package peer. Its prebuilt ViroKit framework raises only the private iOS
example's deployment target to iOS 17.6.

React Native Filament publishes a declaration that references the optional
`react-native-reanimated` `SharedValue` type even when Reanimated is not used.
This repository supplies a narrow type-only shim for strict checks; it does not
install or ship a second animation runtime.

## Public and internal APIs

Only package entry points are supported. Public contracts live in model-viewer
and are re-exported by `src/index.ts`. Files under `components`, `context`, and
`internal` are implementation details even though source is included for the
React Native export condition. Consumers must not deep-import them.

## Error boundary

The public `error` state, fallback, and `onError` cover errors observable during
React rendering. In React Native Filament 1.11, `useBuffer` handles asynchronous
asset-read failures internally by logging them and does not propagate a rejected
state. The wrapper cannot truthfully convert those failures into its error state
without a private API. This is a documented upstream boundary.

## Known limitations

- GLB only, one model per viewer, iOS and Android only.
- Expo Go cannot load the required native modules. An Expo Development Build or
  prebuild-based app can integrate them, but the validated example is bare RN.
- `View.projectWorldToScreen` exposes screen coordinates but no depth/behind-
  camera flag. Hotspots are viewport-clipped, not depth-occluded.
- No distance clamping, inertia, damping, or auto-rotation with the current
  documented manipulator surface.
- No mesh/node entity anchoring, label-to-label collision avoidance, clustering, editor,
  or persistence.
- No animation controller, model caching, screenshots, AR, physics, conversion,
  material editing, or web implementation in the public packages. The private
  example demonstrates AR as a separate ViroReact integration.

## Future extension points

A future documented camera setter could enable exact distance constraints and
auto-rotation without changing plugin ownership. A projection API that includes
depth could add occlusion policies. Animation, multiple-model scenes, and entity
anchors should be added as explicit base-viewer capabilities rather than raw
Filament context exposure.
