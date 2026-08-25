# Product

<!-- impeccable:product-schema 1 -->

## Platform

adaptive

## Users

React Native developers who need a small, native GLB viewer foundation for iOS and Android without adopting another rendering engine or a monolithic 3D UI framework.

## Product Purpose

Own the native Filament scene, GLB loading, camera, lighting, viewport, and React Native overlay contract used by the React Native 3D Kit packages. Success means a host can render one GLB model and compose controls, hotspots, fallbacks, and application overlays through a stable public API.

## Positioning

The package is a narrow composable layer on top of `react-native-filament`, not a replacement renderer. It owns one scene and publishes only stable capabilities—load state, viewport, camera commands, reset and fit, projection, and projection subscriptions—rather than leaking raw Filament context to plugins.

## Operating Context

Applications render `ModelViewer` with a local or supported Filament buffer source, then place React Native overlays as children. Optional controls and hotspots consume the viewer context without importing implementation files. Changing `source` keys a new viewer instance so model, camera, and error-boundary state do not leak across sources.

## Capabilities and Constraints

- Loads and renders one GLB model with a camera, default lighting, viewport tracking, optional auto-fit, loading fallback, observable render-error fallback, and load or error callbacks.
- Exposes imperative reset, fit, and world-to-screen projection through a ref and the public context.
- Targets native iOS and Android with React Native 0.83.10, React 19.2.0, `react-native-filament` 1.11.0, and Worklets Core 1.6.3 as the validated MVP matrix.
- Expo Development Build or prebuild may integrate the native dependencies; Expo Go cannot.
- Does not support a web renderer, AR, physics, multiple-model scenes, animation control, conversion, caching, screenshots, material editing, or depth occlusion.
- Asynchronous asset-read failures handled internally by `useBuffer` cannot be truthfully converted into the public error state using the documented upstream API.
- The package is pre-1.0 and has not yet been published.

## Brand Commitments

Preserve the package name `@arangit/react-native-model-viewer` pending npm-scope ownership confirmation and the “small, composable React Native 3D packages” product framing. Documentation must distinguish shipped behavior from future extension points.

## Evidence on Hand

- Public types and exports under `src/types/public.ts` and `src/index.ts`.
- Viewer, scene, camera, source-key, and error-boundary implementation under `src/`.
- Focused tests in `__tests__/ModelViewer.test.tsx`.
- Architecture and known limitations in `../../docs/architecture.md`.
- Integration usage in `../../apps/example/src/examples/BasicViewerExample.tsx`.
- There are no customer claims, performance benchmarks, or production deployment evidence; future work must not fabricate them.

## Product Principles

- Own one scene and expose capabilities instead of renderer internals.
- Keep overlays as ordinary React Native siblings of the Filament surface.
- Dispose model-specific state cleanly when the source changes.
- Document upstream error and projection boundaries without overclaiming.
- Add future 3D features as explicit base-viewer capabilities that plugins can compose.

## Accessibility & Inclusion

The viewer is primarily a visual surface and does not currently define a semantic model description API. Host applications remain responsible for equivalent accessible descriptions and non-visual alternatives; future work must not claim that the rendered model is self-describing.
