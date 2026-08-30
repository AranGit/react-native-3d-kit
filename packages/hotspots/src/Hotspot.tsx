import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import {
  Pressable,
  Platform,
  StyleSheet,
  Text,
  View,
  type LayoutChangeEvent,
} from 'react-native';
import { HotspotLayerContext } from './HotspotLayerContext';
import { areHotspotProjectionsEqual } from './projection';
import type { HotspotProjectionResult, HotspotProps } from './types';

const ZERO_OFFSET = [0, 0] as const;
const MIN_TOUCH_TARGET = Platform.OS === 'android' ? 48 : 44;
const HIDDEN_PROJECTION: HotspotProjectionResult = {
  screenPosition: null,
  visible: false,
};

function clampToViewport(
  position: number,
  contentSize: number,
  viewportSize: number,
  edgePadding: number,
): number {
  if (contentSize === 0 || viewportSize <= 0) {
    return position;
  }
  if (contentSize + edgePadding * 2 >= viewportSize) {
    return viewportSize / 2;
  }
  const halfSize = contentSize / 2;
  return Math.min(
    Math.max(position, edgePadding + halfSize),
    viewportSize - edgePadding - halfSize,
  );
}

export function Hotspot({
  id,
  position,
  label,
  offset = ZERO_OFFSET,
  edgePadding = 8,
  hidden = false,
  disabled = false,
  onPress,
  renderContent,
  style,
  testID,
}: HotspotProps) {
  if (!Number.isFinite(edgePadding) || edgePadding < 0) {
    throw new RangeError(
      'edgePadding must be a finite number of zero or more.',
    );
  }
  const layer = useContext(HotspotLayerContext);
  if (layer === undefined) {
    throw new Error(
      'Hotspot must be rendered inside an @arangit/react-native-3d-hotspots <HotspotLayer>.',
    );
  }
  const { viewport } = layer;

  const [projection, setProjection] =
    useState<HotspotProjectionResult>(HIDDEN_PROJECTION);
  const [contentSize, setContentSize] = useState({ width: 0, height: 0 });
  const updateRef = useRef(setProjection);
  updateRef.current = setProjection;
  const [positionX, positionY, positionZ] = position;
  const [offsetX, offsetY] = offset;

  useEffect(
    () =>
      layer.register(id, {
        position: [positionX, positionY, positionZ],
        offset: [offsetX, offsetY],
        update: (nextProjection) =>
          updateRef.current((current) =>
            areHotspotProjectionsEqual(current, nextProjection)
              ? current
              : nextProjection,
          ),
      }),
    [id, layer, offsetX, offsetY, positionX, positionY, positionZ],
  );

  const handleLayout = useCallback((event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setContentSize((current) =>
      current.width === width && current.height === height
        ? current
        : { width, height },
    );
  }, []);

  const isVisible =
    !hidden && projection.visible && projection.screenPosition !== null;
  const x = projection.screenPosition?.x ?? 0;
  const y = projection.screenPosition?.y ?? 0;
  const halfWidth = contentSize.width / 2;
  const halfHeight = contentSize.height / 2;
  const clampedX = clampToViewport(
    x,
    contentSize.width,
    viewport.width,
    edgePadding,
  );
  const clampedY = clampToViewport(
    y,
    contentSize.height,
    viewport.height,
    edgePadding,
  );

  return (
    <View
      accessibilityElementsHidden={!isVisible}
      importantForAccessibility={isVisible ? 'auto' : 'no-hide-descendants'}
      onLayout={handleLayout}
      pointerEvents={isVisible && !disabled ? 'auto' : 'none'}
      style={[
        styles.positioned,
        isVisible ? styles.visible : styles.hidden,
        {
          transform: [
            { translateX: clampedX - halfWidth },
            { translateY: clampedY - halfHeight },
          ],
        },
        style,
      ]}
      testID={testID ?? `hotspot-${id}`}
    >
      <Pressable
        accessibilityHint="Activates this model annotation"
        accessibilityLabel={label ?? id}
        accessibilityRole="button"
        accessibilityState={{ disabled }}
        disabled={disabled}
        onPress={onPress}
      >
        {({ pressed }) =>
          renderContent?.({ active: pressed }) ?? (
            <View style={styles.defaultContent}>
              <View style={styles.dot} />
              {label === undefined ? null : (
                <Text style={styles.label}>{label}</Text>
              )}
            </View>
          )
        }
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  positioned: {
    left: 0,
    position: 'absolute',
    top: 0,
  },
  visible: {
    opacity: 1,
  },
  hidden: {
    opacity: 0,
  },
  defaultContent: {
    alignItems: 'center',
    backgroundColor: 'rgba(11, 18, 32, 0.9)',
    borderColor: '#72E2AE',
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 6,
    justifyContent: 'center',
    minHeight: MIN_TOUCH_TARGET,
    minWidth: MIN_TOUCH_TARGET,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  dot: {
    backgroundColor: '#72E2AE',
    borderRadius: 4,
    height: 8,
    width: 8,
  },
  label: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
});
