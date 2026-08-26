---
'@arangit/react-native-model-viewer': patch
---

Keep the loading state active until a prepared model participates in the render
loop, and retain the native Filament scene and surface when changing sources.
