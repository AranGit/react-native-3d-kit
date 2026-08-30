import { useCallback, useEffect, useMemo, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import { useModelViewer } from '@arangit/react-native-model-viewer';
import {
  HotspotLayerContext,
  type HotspotRegistration,
} from './HotspotLayerContext';
import { resolveHotspotProjection } from './projection';
import type { HotspotLayerProps } from './types';

export function HotspotLayer({
  children,
  style,
  pointerEvents = 'box-none',
  ...viewProps
}: HotspotLayerProps) {
  const {
    status,
    viewport,
    projectWorldToScreen,
    subscribeToProjectionUpdates,
  } = useModelViewer();
  const registrationsRef = useRef(new Map<string, HotspotRegistration>());

  const projectRegistration = useCallback(
    (registration: HotspotRegistration) => {
      const projected = projectWorldToScreen(registration.position);
      registration.update(
        resolveHotspotProjection(
          projected,
          viewport,
          status,
          registration.offset,
        ),
      );
    },
    [projectWorldToScreen, status, viewport],
  );

  const projectAll = useCallback(() => {
    registrationsRef.current.forEach(projectRegistration);
  }, [projectRegistration]);

  useEffect(
    () => subscribeToProjectionUpdates(projectAll),
    [projectAll, subscribeToProjectionUpdates],
  );

  useEffect(() => {
    projectAll();
  }, [projectAll]);

  const contextValue = useMemo(
    () => ({
      viewport,
      register(id: string, registration: HotspotRegistration) {
        if (registrationsRef.current.has(id)) {
          throw new Error(
            `Hotspot id "${id}" is already registered in this HotspotLayer.`,
          );
        }
        registrationsRef.current.set(id, registration);
        projectRegistration(registration);

        return () => {
          const current = registrationsRef.current.get(id);
          if (current === registration) {
            registrationsRef.current.delete(id);
          }
        };
      },
    }),
    [projectRegistration, viewport],
  );

  return (
    <HotspotLayerContext.Provider value={contextValue}>
      <View
        {...viewProps}
        pointerEvents={pointerEvents}
        style={[StyleSheet.absoluteFill, style]}
      >
        {children}
      </View>
    </HotspotLayerContext.Provider>
  );
}
