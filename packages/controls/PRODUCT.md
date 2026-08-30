# Product

<!-- impeccable:product-schema 1 -->

## Platform

adaptive

## Users

React Native developers adding direct-touch camera interaction to GLB viewers on iOS and Android, especially applications already using `@arangit/react-native-model-viewer`.

## Product Purpose

Provide a composable control layer for orbit rotation, pinch zoom, optional two-finger pan, and camera reset. Success means developers can add familiar native gestures without owning Filament camera-manipulator plumbing themselves.

## Positioning

The package controls the base viewer exclusively through its narrow public context. It does not create a second Filament scene or camera and remains independently installable from the viewer and hotspot packages.

## Operating Context

`OrbitControls` is rendered as a React Native overlay inside `ModelViewer` in a host configured for React Native Gesture Handler. Applications can enable or disable the whole surface, toggle individual interactions, tune positive finite speeds, observe interaction start and end, and reset through a ref or hook.

## Capabilities and Constraints

- One-finger pan drives orbit rotation; pinch drives zoom; optional two-finger pan uses Filament orbit strafe mode.
- The ref and hook expose incremental rotate, pan, zoom, and reset commands so hosts can provide buttons, keyboard input, or other non-gesture controls.
- Requires `@arangit/react-native-model-viewer` and `react-native-gesture-handler` within the validated compatibility matrix.
- Targets native iOS and Android; Expo Go cannot load the required native dependencies.
- The documented Filament 1.11 manipulator does not provide an exact camera setter, distance bounds, or programmatic orbit.
- Min/max distance, inertia, damping, and auto-rotation are intentionally unsupported in the MVP.
- The package is pre-1.0 and has not yet been published.

## Brand Commitments

Preserve the package name `@arangit/react-native-3d-controls` pending npm-scope ownership confirmation. Documentation must describe actual supported gestures and must not imply unsupported camera physics.

## Evidence on Hand

- Public API and implementation under `src/`.
- Focused behavior tests in `__tests__/OrbitControls.test.tsx`.
- Integration usage in `../../apps/example/src/examples/ControlsExample.tsx`.
- There are no customer claims, performance benchmarks, or production deployment evidence; future work must not fabricate them.

## Product Principles

- Compose with the viewer rather than duplicating its scene or camera ownership.
- Keep interaction capabilities independently switchable.
- Fail clearly on invalid configuration values.
- State upstream Filament limitations truthfully.
- Keep the public API narrow and stable across native platforms.

## Accessibility & Inclusion

The public contract supports incremental non-gesture camera steps, but host applications must still provide accessible controls, labels, focus order, and an equivalent description of the visual content. Exact camera positioning remains unsupported.
