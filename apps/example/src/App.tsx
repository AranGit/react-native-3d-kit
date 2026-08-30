import { useState } from 'react';
import {
  Pressable,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { BasicViewerExample } from './examples/BasicViewerExample';
import { ControlsExample } from './examples/ControlsExample';
import { HotspotsExample } from './examples/HotspotsExample';
import { ARPlacementExample } from './examples/ARPlacementExample';
import { AppText as Text } from './components/AppText';
import {
  DEFAULT_EXAMPLE_MODEL,
  EXAMPLE_MODELS,
  type ExampleModelId,
} from './model';

const MIN_TOUCH_TARGET = Platform.OS === 'android' ? 48 : 44;

const EXAMPLES = [
  { id: 'viewer', label: 'Viewer', component: BasicViewerExample },
  { id: 'controls', label: 'Controls', component: ControlsExample },
  { id: 'hotspots', label: 'Hotspots', component: HotspotsExample },
  { id: 'ar', label: 'AR', component: ARPlacementExample },
] as const;

function ExampleApp() {
  const insets = useSafeAreaInsets();
  const window = useWindowDimensions();
  const isLandscape = window.width > window.height;
  const compactAccessibility = isLandscape && window.fontScale > 1.5;
  const [activeId, setActiveId] =
    useState<(typeof EXAMPLES)[number]['id']>('controls');
  const [activeModelId, setActiveModelId] = useState<ExampleModelId>(
    DEFAULT_EXAMPLE_MODEL.id,
  );
  const ActiveExample =
    EXAMPLES.find((example) => example.id === activeId)?.component ??
    BasicViewerExample;
  const activeModel =
    EXAMPLE_MODELS.find((model) => model.id === activeModelId) ??
    DEFAULT_EXAMPLE_MODEL;

  return (
    <GestureHandlerRootView style={styles.root}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="#080C13"
        hidden={isLandscape}
      />
      <View
        style={[
          styles.safeArea,
          {
            paddingBottom: insets.bottom,
            paddingLeft: insets.left,
            paddingRight: insets.right,
            paddingTop: insets.top,
          },
        ]}
      >
        <View
          style={[styles.topSection, isLandscape && styles.topSectionLandscape]}
        >
          <View style={[styles.header, isLandscape && styles.headerLandscape]}>
            <View>
              {!compactAccessibility && (
                <Text numberOfLines={1} style={styles.kicker}>
                  @ARANGIT
                </Text>
              )}
              <Text
                numberOfLines={1}
                style={[styles.heading, isLandscape && styles.headingLandscape]}
              >
                {compactAccessibility
                  ? 'RN3D'
                  : isLandscape
                    ? 'RN 3D Kit'
                    : 'React Native 3D Kit'}
              </Text>
            </View>
            {!isLandscape && (
              <View style={styles.versionBadge}>
                <Text style={styles.versionText}>MVP · 0.1</Text>
              </View>
            )}
          </View>

          <View
            style={[styles.modelBar, isLandscape && styles.modelBarLandscape]}
          >
            <Text style={styles.modelBarLabel}>MODEL</Text>
            <View
              accessibilityRole="radiogroup"
              style={[
                styles.modelOptions,
                isLandscape && styles.modelOptionsLandscape,
              ]}
            >
              <ScrollView
                contentContainerStyle={styles.modelOptionsContent}
                horizontal
                showsHorizontalScrollIndicator={false}
              >
                {EXAMPLE_MODELS.map((model) => {
                  const active = model.id === activeModelId;
                  return (
                    <Pressable
                      accessibilityHint="Loads this model in the active example"
                      accessibilityLabel={`Use ${model.label} model`}
                      accessibilityRole="radio"
                      accessibilityState={{ checked: active }}
                      key={model.id}
                      onPress={() => setActiveModelId(model.id)}
                      style={({ pressed }) => [
                        styles.modelOption,
                        active && styles.activeModelOption,
                        pressed && styles.pressedModelOption,
                      ]}
                    >
                      <Text
                        numberOfLines={1}
                        style={[
                          styles.modelOptionLabel,
                          active && styles.activeModelOptionLabel,
                        ]}
                      >
                        {model.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>
          </View>
        </View>

        <View style={styles.stage}>
          <ActiveExample model={activeModel} />
        </View>

        <View
          accessibilityRole="tablist"
          style={[styles.tabs, isLandscape && styles.tabsLandscape]}
        >
          {EXAMPLES.map((example) => {
            const active = example.id === activeId;
            return (
              <Pressable
                accessibilityHint={`Shows the ${example.label} example`}
                accessibilityRole="tab"
                accessibilityState={{ selected: active }}
                key={example.id}
                onPress={() => setActiveId(example.id)}
                style={({ pressed }) => [
                  styles.tab,
                  active && styles.activeTab,
                  pressed && styles.pressedTab,
                ]}
              >
                <Text
                  numberOfLines={1}
                  style={[styles.tabLabel, active && styles.activeLabel]}
                >
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
  topSection: {},
  topSectionLandscape: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  headerLandscape: {
    flexBasis: 124,
    flexShrink: 0,
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  kicker: {
    color: '#72E2AE',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1.8,
  },
  heading: {
    color: '#F6F8FC',
    fontSize: 19,
    fontWeight: '800',
    marginTop: 2,
  },
  headingLandscape: {
    fontSize: 14,
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
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
  },
  modelBar: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    paddingBottom: 10,
    paddingHorizontal: 18,
  },
  modelBarLandscape: {
    flex: 1,
    paddingBottom: 0,
    paddingHorizontal: 6,
    paddingRight: 12,
  },
  modelBarLabel: {
    color: '#8491A7',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  modelOptions: {
    backgroundColor: '#101722',
    borderColor: '#263142',
    borderRadius: 12,
    borderWidth: 1,
    flex: 1,
    overflow: 'hidden',
  },
  modelOptionsLandscape: {
    height: MIN_TOUCH_TARGET + 8,
  },
  modelOptionsContent: {
    flexGrow: 1,
    gap: 3,
    padding: 3,
  },
  modelOption: {
    alignItems: 'center',
    borderRadius: 9,
    flexGrow: 1,
    justifyContent: 'center',
    minHeight: MIN_TOUCH_TARGET,
    minWidth: 92,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  activeModelOption: {
    backgroundColor: '#263A36',
  },
  pressedModelOption: {
    opacity: 0.7,
  },
  modelOptionLabel: {
    color: '#8F9CAF',
    fontSize: 11,
    fontWeight: '700',
  },
  activeModelOptionLabel: {
    color: '#72E2AE',
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
  tabsLandscape: {
    marginBottom: 8,
    marginTop: 8,
  },
  tab: {
    alignItems: 'center',
    borderRadius: 12,
    flex: 1,
    justifyContent: 'center',
    minHeight: MIN_TOUCH_TARGET,
    paddingVertical: 10,
  },
  pressedTab: { opacity: 0.72 },
  activeTab: { backgroundColor: '#72E2AE' },
  tabLabel: {
    color: '#8F9CAF',
    fontSize: 12,
    fontWeight: '800',
  },
  activeLabel: { color: '#071016' },
});
