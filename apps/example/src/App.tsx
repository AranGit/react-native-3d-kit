import { useState } from 'react';
import { Pressable, StatusBar, StyleSheet, Text, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { BasicViewerExample } from './examples/BasicViewerExample';
import { ControlsExample } from './examples/ControlsExample';
import { HotspotsExample } from './examples/HotspotsExample';

const EXAMPLES = [
  { id: 'viewer', label: 'Viewer', component: BasicViewerExample },
  { id: 'controls', label: 'Controls', component: ControlsExample },
  { id: 'hotspots', label: 'Hotspots', component: HotspotsExample },
] as const;

function ExampleApp() {
  const insets = useSafeAreaInsets();
  const [activeId, setActiveId] =
    useState<(typeof EXAMPLES)[number]['id']>('viewer');
  const ActiveExample =
    EXAMPLES.find((example) => example.id === activeId)?.component ??
    BasicViewerExample;

  return (
    <GestureHandlerRootView style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="#080C13" />
      <View
        style={[
          styles.safeArea,
          { paddingBottom: insets.bottom, paddingTop: insets.top },
        ]}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.kicker}>@ARANGIT</Text>
            <Text style={styles.heading}>React Native 3D Kit</Text>
          </View>
          <View style={styles.versionBadge}>
            <Text style={styles.versionText}>MVP · 0.1</Text>
          </View>
        </View>

        <View style={styles.stage}>
          <ActiveExample />
        </View>

        <View accessibilityRole="tablist" style={styles.tabs}>
          {EXAMPLES.map((example) => {
            const active = example.id === activeId;
            return (
              <Pressable
                accessibilityRole="tab"
                accessibilityState={{ selected: active }}
                key={example.id}
                onPress={() => setActiveId(example.id)}
                style={[styles.tab, active && styles.activeTab]}
              >
                <Text style={[styles.tabLabel, active && styles.activeLabel]}>
                  {example.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    </GestureHandlerRootView>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <ExampleApp />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  safeArea: {
    backgroundColor: '#080C13',
    flex: 1,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  kicker: {
    color: '#72E2AE',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.8,
  },
  heading: {
    color: '#F6F8FC',
    fontSize: 19,
    fontWeight: '800',
    marginTop: 2,
  },
  versionBadge: {
    borderColor: '#344054',
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  versionText: {
    color: '#98A5B8',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1,
  },
  stage: {
    borderColor: '#263142',
    borderRadius: 20,
    borderWidth: 1,
    flex: 1,
    marginHorizontal: 12,
    overflow: 'hidden',
  },
  tabs: {
    backgroundColor: '#101722',
    borderColor: '#263142',
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 4,
    margin: 12,
    padding: 4,
  },
  tab: {
    alignItems: 'center',
    borderRadius: 12,
    flex: 1,
    paddingVertical: 11,
  },
  activeTab: { backgroundColor: '#72E2AE' },
  tabLabel: {
    color: '#8F9CAF',
    fontSize: 12,
    fontWeight: '800',
  },
  activeLabel: { color: '#071016' },
});
