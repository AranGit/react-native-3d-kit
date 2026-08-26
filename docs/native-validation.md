# Native validation

The example application is the native integration fixture for all three
packages. Native validation has two layers: deterministic build gates and a
short manual runtime smoke test.

## Build gates

Install JavaScript dependencies before running either gate:

```sh
pnpm install --frozen-lockfile
```

Build the Android debug APK:

```sh
pnpm native:android:build
```

Install iOS pods and build for a generic iOS Simulator without code signing:

```sh
cd apps/example
bundle install
cd ../..
pnpm native:ios:pods
pnpm native:ios:build
```

CI runs these gates independently on Ubuntu and macOS. They verify native
dependency resolution, autolinking, code generation, CMake, Gradle, CocoaPods,
and Xcode compilation, but they do not prove runtime rendering or gestures.

## Runtime smoke test

Start Metro from the repository root:

```sh
pnpm example:start
```

Launch each platform from another terminal:

```sh
pnpm example:ios
pnpm example:android
```

Complete this checklist on both platforms:

- Viewer opens without a red screen or native crash.
- Each local GLB can be selected, reaches `LOADED`, and reports a non-zero viewport.
- Viewer, Controls, and Hotspots tabs can be selected repeatedly.
- One-finger drag changes the camera and Reset camera restores its home view.
- Pinch zoom and two-finger pan move the camera without leaving it stuck in an
  interacting state.
- All three hotspots remain attached while the camera moves.
- Pressing each hotspot updates the selection card.
- Backgrounding, foregrounding, and one development reload keep the app usable.
- Platform logs contain no new application fatal exception or unhandled JavaScript
  error.

Record the OS/runtime, device or simulator, commit, and any dependency warnings
with the release notes. Treat third-party compiler warnings separately from
application crashes or errors.
