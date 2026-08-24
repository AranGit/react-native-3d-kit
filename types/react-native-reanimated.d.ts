/**
 * Type-only compatibility for react-native-filament's optional
 * useSyncSharedValue export. The monorepo does not ship or execute Reanimated.
 */
declare module 'react-native-reanimated' {
  export interface SharedValue<Value> {
    value: Value;
  }
}
