# React Native 3D Kit example

This bare React Native app is the native integration fixture for all three
workspace packages. It demonstrates switching between local GLB models, a
viewer, orbit/zoom/reset controls, model-specific projected hotspots, true AR
placement, loading/error fallbacks, and a small status/viewport developer
panel.

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

## AR placement · การวางโมเดลในพื้นที่จริง

Open the **AR** tab on a physical device that supports ARKit or ARCore. Grant
camera access, move the device slowly until a floor or table is highlighted,
then tap the surface to place the selected GLB model. Drag to move it, pinch to
resize it, rotate with two fingers, or select **Remove · ยกออก** to remove it
and choose another surface.

เปิดแท็บ **AR** บนเครื่องจริงที่รองรับ ARKit หรือ ARCore อนุญาตการใช้กล้อง
จากนั้นขยับเครื่องช้า ๆ จนพื้นหรือโต๊ะถูกไฮไลต์ แล้วแตะเพื่อวางโมเดล GLB
สามารถลากเพื่อย้าย บีบนิ้วเพื่อย่อ/ขยาย หมุนด้วยสองนิ้ว หรือกด
**Remove · ยกออก** เพื่อนำโมเดลออกและเลือกพื้นที่ใหม่

AR does not run in the iOS Simulator or Android Emulator. The iOS example
requires iOS 17.6 or newer because that is the deployment target of the bundled
ViroKit 2.58.1 framework. Re-run CocoaPods and rebuild the native app after
installing or updating the Viro dependency. The AR tab checks device support
and camera permission before starting the session.

AR ใช้งานไม่ได้บน iOS Simulator หรือ Android Emulator และ example ฝั่ง iOS
ต้องใช้ iOS 17.6 ขึ้นไปตาม deployment target ของ ViroKit 2.58.1
ต้องติดตั้ง CocoaPods ใหม่และ build native app อีกครั้งหลังเพิ่มหรืออัปเดต Viro
โดยแท็บ AR จะตรวจสอบการรองรับของอุปกรณ์และสิทธิ์กล้องก่อนเริ่มทำงาน

## Integration details demonstrated here

- `metro.config.js` adds `.glb` to Metro assets.
- `babel.config.js` enables `react-native-worklets-core/plugin`.
- `index.js` imports Gesture Handler before the app.
- `src/App.tsx` uses `GestureHandlerRootView`.
- `src/examples/ARPlacementExample.tsx` uses ViroReact for ARKit/ARCore plane
  detection, anchored GLB placement, gestures, and removal.
- Every package is imported by its public npm name through the pnpm workspace.
- The local models and their separate licenses are documented in the root asset
  attribution record.

The packages are not published yet; this app is for local development and
validation only.
