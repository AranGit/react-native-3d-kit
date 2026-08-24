# @arangit/react-native-3d-hotspots

World-space React Native annotations for
`@arangit/react-native-model-viewer`. Hotspots project `[x, y, z]` through the
viewer's public API and remain outside the Filament surface.

## Install

```sh
pnpm add @arangit/react-native-3d-hotspots \
  @arangit/react-native-model-viewer
```

## Usage

```tsx
<ModelViewer source={require('./model.glb')}>
  <HotspotLayer>
    <Hotspot
      id="entrance"
      label="Entrance"
      offset={[0, -16]}
      onPress={() => {}}
      position={[1, 2, 0]}
    />
    <Hotspot
      id="platform"
      position={[-2, 0.5, 1]}
      renderContent={({ active }) => <CustomMarker highlighted={active} />}
    />
  </HotspotLayer>
</ModelViewer>
```

## Public API

- `Hotspot`
- `HotspotLayer`
- `useHotspotProjection(position, offset?)`
- `HotspotProps`, `HotspotLayerProps`, `HotspotRenderProps`
- `HotspotProjectionResult`, `PixelOffset`

A layer uses one viewer subscription for all registered hotspots. Updates are
coalesced by the viewer and unchanged projection state is preserved. Hotspots
outside the viewport, or without a loaded projection, are hidden. `hidden`,
`disabled`, custom content, labels, offsets, presses, and multiple hotspots are
supported.

Projection in Filament 1.11 returns screen coordinates without depth. This MVP
does not implement depth occlusion, behind-camera detection, mesh/node anchors,
label collision avoidance, clustering, dragging, an editor, or persistence.

MIT
