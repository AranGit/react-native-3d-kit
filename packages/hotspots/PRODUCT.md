# Product

<!-- impeccable:product-schema 1 -->

## Platform

adaptive

## Users

React Native developers who need labels, press targets, or custom annotations tied to positions on a GLB model in native iOS and Android applications.

## Product Purpose

Let developers place interactive React Native content at world-space coordinates projected through `@arangit/react-native-model-viewer`. Success means annotations remain composable with ordinary React Native UI and update efficiently as the camera or viewport changes.

## Positioning

Hotspots stay outside the Filament surface and consume only the viewer’s public projection contract. A shared layer centralizes projection subscriptions for multiple annotations instead of requiring a permanent per-hotspot render-frame state loop.

## Operating Context

Applications render `HotspotLayer` inside `ModelViewer`, then register labeled or custom `Hotspot` children with IDs, 3D positions, optional pixel offsets, press handlers, and visibility or disabled state. A standalone projection hook supports custom overlays when a shared layer is not suitable.

## Capabilities and Constraints

- Supports multiple world-space hotspots, labels, custom content, offsets, press handling, hidden state, disabled state, and measured edge clamping.
- Coalesces projection updates through the viewer and avoids React state changes when projection results are unchanged.
- Hides hotspots that are outside the viewport or have no loaded projection.
- Targets native iOS and Android and requires `@arangit/react-native-model-viewer` within the validated compatibility matrix.
- Filament 1.11 projection exposes screen coordinates without depth, so depth occlusion and reliable behind-camera detection are unavailable.
- Mesh or node anchors, collision avoidance, clustering, dragging, an editor, and persistence are outside the MVP.
- The package is pre-1.0 and has not yet been published.

## Brand Commitments

Preserve the package name `@arangit/react-native-3d-hotspots` pending npm-scope ownership confirmation. Documentation must distinguish screen projection from depth-aware anchoring and must not claim occlusion behavior that the upstream API cannot support.

## Evidence on Hand

- Public API, projection logic, and components under `src/`.
- Focused behavior tests in `__tests__/Hotspots.test.tsx`.
- Integration usage in `../../apps/example/src/examples/HotspotsExample.tsx`.
- There are no customer claims, scale benchmarks, or production deployment evidence; future work must not fabricate them.

## Product Principles

- Keep annotation content in React Native rather than inside Filament.
- Centralize shared projection work for multiple hotspots.
- Preserve stable state when projected output has not changed.
- Make visibility and upstream depth limitations explicit.
- Support custom presentation without expanding scene ownership.

## Accessibility & Inclusion

Default hotspots expose a button role, a label derived from `label` or `id`, and disabled state. Hidden hotspots are removed from the accessibility tree. Custom content must preserve equivalent meaning and interaction semantics.
