# Product

<!-- impeccable:product-schema 1 -->

## Platform

adaptive

## Users

React Native developers who are evaluating, integrating, or maintaining the React Native 3D Kit packages on iOS and Android. Within this repository, the example also serves maintainers and contributors who need to verify the packages together in a real native host.

## Product Purpose

Provide the canonical end-to-end integration fixture and demonstration app for the three workspace packages. Success means a developer can run one bare React Native app, switch between local GLB models, exercise camera controls and model-specific hotspots, and verify the required native and bundler setup.

## Positioning

This is not a standalone consumer product. It is the only repository surface that proves all three packages work together through their public package names inside a bare React Native application, including autolinking, CocoaPods, Gradle, Metro asset handling, Worklets Core, and Gesture Handler configuration.

## Operating Context

Developers run the app locally from the pnpm monorepo with Metro and either the iOS or Android native toolchain. The app exposes separate Viewer, Controls, and Hotspots examples and uses local GLB fixtures so validation does not depend on a remote service.

## Capabilities and Constraints

- Opens with the House controls example so the first screen reads immediately as interactive 3D.
- Demonstrates GLB loading and switching, loading and observable error fallbacks, camera status, viewport reporting, orbit and pinch controls, reset, incremental non-gesture camera controls, and interactive projected hotspots.
- Uses bare React Native 0.83.10 with the New Architecture and the compatibility versions recorded in the root README.
- Targets native iOS and Android. Expo Development Build or prebuild may integrate the same dependencies; Expo Go cannot.
- Uses one GLB model at a time and inherits the pre-1.0 package boundaries documented in the repository.
- Is private and intended for local development and validation; the workspace packages have not yet been published.

## Brand Commitments

Preserve the product name “React Native 3D Kit,” the `@arangit` package namespace pending ownership confirmation, and a developer-facing voice that distinguishes demonstrated behavior from unsupported claims.

## Evidence on Hand

- Runnable source and examples under `src/`.
- Integration tests in `__tests__/App.test.tsx`.
- Native iOS and Android projects under `ios/` and `android/`.
- The local GLB fixtures and their available attribution and license metadata in `../../docs/assets.md`.
- There are no customer claims, usage benchmarks, testimonials, or production deployment evidence; future work must not fabricate them.

## Product Principles

- Demonstrate only behavior the packages actually ship.
- Keep native integration requirements visible and reproducible.
- Exercise packages through their public APIs and package names.
- Prefer deterministic local fixtures over network-dependent demos.
- Make unsupported and pre-1.0 boundaries explicit.

## Accessibility & Inclusion

Preserve React Native accessibility roles and selected states for example navigation. Interactive package examples should expose meaningful labels, disabled states, platform-appropriate touch targets, safe-area handling in both orientations, and non-gesture camera alternatives.
