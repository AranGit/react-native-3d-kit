# @arangit/react-native-3d-controls

Gesture-driven camera controls for
`@arangit/react-native-model-viewer`. The package operates through the viewer's
public context and never creates another Filament scene or camera.

## Install

```sh
pnpm add @arangit/react-native-3d-controls \
  @arangit/react-native-model-viewer react-native-gesture-handler
```

Follow the host app setup for Model Viewer, import Gesture Handler at the app
entry point, and use `GestureHandlerRootView` when required.

## Usage

```tsx
const controlsRef = useRef<OrbitControlsHandle>(null);

<ModelViewer source={require('./model.glb')}>
  <OrbitControls
    ref={controlsRef}
    enablePan
    enableRotate
    enableZoom
    orbitSpeed={0.003}
    zoomSpeed={0.01}
    onInteractionStart={() => {}}
    onInteractionEnd={() => {}}
  />
</ModelViewer>;

controlsRef.current?.reset();
```

## Public API

- `OrbitControls`
- `useOrbitControls()`
- `OrbitControlsProps`
- `OrbitControlsHandle`

One finger orbits, pinch zooms, and optional two-finger pan uses Filament orbit
strafe mode. `enabled={false}` disables recognizers and pointer interception.
Rotation, zoom, and pan can be toggled independently. Speed values must be finite
and greater than zero.

The documented React Native Filament 1.11 manipulator has no exact camera setter,
distance bounds, or programmatic orbit. Consequently this MVP does not pretend
to support min/max distance, inertia, damping, or auto-rotation.

MIT
