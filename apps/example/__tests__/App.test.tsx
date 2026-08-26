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

it('switches models and keeps the selection across examples', () => {
  const screen = render(<App />);
  const vertexCubeOption = screen.getByLabelText('Use Vertex cube model');
  const italjetOption = screen.getByLabelText('Use Italjet model');

  expect(vertexCubeOption.props.accessibilityState.checked).toBe(true);
  expect(italjetOption.props.accessibilityState.checked).toBe(false);
  expect(screen.queryByLabelText('Use UV layout model')).toBeNull();

  fireEvent.press(italjetOption);

  expect(
    screen.getByLabelText('Use Vertex cube model').props.accessibilityState
      .checked,
  ).toBe(false);
  expect(
    screen.getByLabelText('Use Italjet model').props.accessibilityState.checked,
  ).toBe(true);

  fireEvent.press(screen.getByText('Hotspots'));
  expect(screen.getByText('Handlebars')).toBeTruthy();
  expect(screen.getByText('Front wheel')).toBeTruthy();
  expect(screen.queryByText('Top corner')).toBeNull();
});

it('provides model-specific hotspots for HORNET and house', () => {
  const screen = render(<App />);

  fireEvent.press(screen.getByText('Hotspots'));
  fireEvent.press(screen.getByLabelText('Use HORNET model'));
  expect(screen.getByText('Head')).toBeTruthy();
  expect(screen.getByText('Needle')).toBeTruthy();

  fireEvent.press(screen.getByLabelText('Use House model'));
  expect(screen.getByText('House center')).toBeTruthy();
  expect(screen.getByText('Roof')).toBeTruthy();
  expect(screen.queryByText('Head')).toBeNull();
});
