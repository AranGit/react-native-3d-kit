import { fireEvent, render } from '@testing-library/react-native';
import App from '../App';

jest.mock('react-native-safe-area-context', () => {
  return {
    SafeAreaProvider: ({ children }: { children: React.ReactNode }) => children,
    useSafeAreaInsets: () => ({ bottom: 0, left: 0, right: 0, top: 0 }),
  };
});

jest.mock('react-native-gesture-handler', () => {
  const ReactNative = require('react-native') as typeof import('react-native');
  return {
    GestureHandlerRootView: ({ children }: { children: React.ReactNode }) => (
      <ReactNative.View>{children}</ReactNative.View>
    ),
  };
});

jest.mock('@arangit/react-native-model-viewer', () => {
  const ReactNative = require('react-native') as typeof import('react-native');
  return {
    ModelViewer: ({ children }: { children: React.ReactNode }) => (
      <ReactNative.View testID="model-viewer">{children}</ReactNative.View>
    ),
    useModelViewer: () => ({
      status: 'loaded',
      viewport: { width: 320, height: 240 },
    }),
  };
});

jest.mock('@arangit/react-native-3d-controls', () => {
  const ReactNative = require('react-native') as typeof import('react-native');
  return {
    OrbitControls: () => <ReactNative.View testID="orbit-controls" />,
  };
});

jest.mock('@arangit/react-native-3d-hotspots', () => {
  const ReactNative = require('react-native') as typeof import('react-native');
  return {
    HotspotLayer: ({ children }: { children: React.ReactNode }) => (
      <ReactNative.View>{children}</ReactNative.View>
    ),
    Hotspot: ({ label }: { label: string }) => (
      <ReactNative.Text>{label}</ReactNative.Text>
    ),
  };
});

it('switches between all three workspace package examples', () => {
  const screen = render(<App />);

  expect(screen.getByText('One scene. One GLB.')).toBeTruthy();
  fireEvent.press(screen.getByText('Controls'));
  expect(screen.getByText('Orbit · pinch · two-finger pan')).toBeTruthy();
  expect(screen.getByTestId('orbit-controls')).toBeTruthy();

  fireEvent.press(screen.getByText('Hotspots'));
  expect(screen.getByText('Top corner')).toBeTruthy();
  expect(screen.getByText('Lower edge')).toBeTruthy();
});
