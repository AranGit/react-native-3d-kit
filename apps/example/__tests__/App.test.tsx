import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';
import App from '../App';

const mockRotateBy = jest.fn();
const mockZoomBy = jest.fn();
const mockReset = jest.fn();
const mockRemoveARObject = jest.fn();

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
      cameraController: {},
      status: 'loaded',
      viewport: { width: 320, height: 240 },
    }),
  };
});

jest.mock('@arangit/react-native-3d-controls', () => {
  const ReactNative = require('react-native') as typeof import('react-native');
  return {
    OrbitControls: () => <ReactNative.View testID="orbit-controls" />,
    useOrbitControls: () => ({
      panBy: jest.fn(),
      reset: mockReset,
      rotateBy: mockRotateBy,
      zoomBy: mockZoomBy,
    }),
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

jest.mock('@reactvision/react-viro', () => {
  const React = require('react') as typeof import('react');
  const ReactNative = require('react-native') as typeof import('react-native');

  function ViroARSceneNavigator({
    viroAppProps,
  }: {
    viroAppProps: {
      onPlaced: () => void;
      onRemoved: () => void;
      onTrackingChange: (state: number, reason: number) => void;
      registerScene: (scene: { removeObject: () => void } | null) => void;
    };
  }) {
    React.useEffect(() => {
      viroAppProps.onTrackingChange(3, 1);
      viroAppProps.registerScene({
        removeObject: () => {
          mockRemoveARObject();
          viroAppProps.onRemoved();
        },
      });
      return () => viroAppProps.registerScene(null);
    }, [viroAppProps]);

    return (
      <ReactNative.View testID="ar-scene-navigator">
        <ReactNative.Pressable
          accessibilityLabel="Simulate AR placement"
          onPress={viroAppProps.onPlaced}
        />
      </ReactNative.View>
    );
  }

  const NullViroComponent = () => null;

  return {
    isARSupportedOnDevice: jest.fn(async () => ({ isARSupported: true })),
    requestRequiredPermissions: jest.fn(async () => ({ camera: true })),
    Viro3DObject: NullViroComponent,
    ViroAmbientLight: NullViroComponent,
    ViroARPlaneSelector: NullViroComponent,
    ViroARScene: NullViroComponent,
    ViroARSceneNavigator,
    ViroDirectionalLight: NullViroComponent,
    ViroNode: NullViroComponent,
    ViroPinchStateTypes: { PINCH_END: 3 },
    ViroRotateStateTypes: { ROTATE_END: 3 },
    ViroTrackingStateConstants: {
      TRACKING_UNAVAILABLE: 1,
      TRACKING_LIMITED: 2,
      TRACKING_NORMAL: 3,
    },
  };
});

it('switches between the package examples and AR placement', async () => {
  const screen = render(<App />);

  expect(screen.getByText('Drag to rotate · pinch to zoom')).toBeTruthy();
  expect(screen.getByTestId('orbit-controls')).toBeTruthy();
  fireEvent.press(screen.getByText('Viewer'));
  expect(screen.getByText('One scene. One GLB.')).toBeTruthy();
  fireEvent.press(screen.getByText('Controls'));
  expect(screen.getByText('Drag to rotate · pinch to zoom')).toBeTruthy();
  expect(screen.getByTestId('orbit-controls')).toBeTruthy();

  fireEvent.press(screen.getByText('Hotspots'));
  expect(screen.getByText('Roof')).toBeTruthy();
  expect(screen.getByText('Left side')).toBeTruthy();

  fireEvent.press(screen.getByText('AR'));
  expect(await screen.findByTestId('ar-scene-navigator')).toBeTruthy();
  expect(
    screen.getByText('Scan a floor or table · สแกนพื้นหรือโต๊ะ'),
  ).toBeTruthy();
});

it('removes a placed model from the AR space', async () => {
  mockRemoveARObject.mockClear();
  const screen = render(<App />);

  fireEvent.press(screen.getByText('AR'));
  await screen.findByTestId('ar-scene-navigator');
  fireEvent.press(screen.getByLabelText('Simulate AR placement'));

  const removeButton = screen.getByLabelText('Remove model from AR space');
  await waitFor(() =>
    expect(removeButton.props.accessibilityState.disabled).toBe(false),
  );
  fireEvent.press(removeButton);

  expect(mockRemoveARObject).toHaveBeenCalledTimes(1);
  await waitFor(() =>
    expect(removeButton.props.accessibilityState.disabled).toBe(true),
  );
});

it('switches models and keeps the selection across examples', () => {
  const screen = render(<App />);
  const vertexCubeOption = screen.getByLabelText('Use Vertex cube model');
  const italjetOption = screen.getByLabelText('Use Italjet model');

  expect(vertexCubeOption.props.accessibilityState.checked).toBe(false);
  expect(
    screen.getByLabelText('Use House model').props.accessibilityState.checked,
  ).toBe(true);
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

it('provides camera buttons as alternatives to gestures', () => {
  const screen = render(<App />);

  fireEvent.press(screen.getByLabelText('Rotate model left'));
  fireEvent.press(screen.getByLabelText('Zoom into model'));
  fireEvent.press(screen.getByLabelText('Reset camera'));

  expect(mockRotateBy).toHaveBeenCalledWith(-48);
  expect(mockZoomBy).toHaveBeenCalledWith(-20);
  expect(mockReset).toHaveBeenCalledTimes(1);
});

it('keeps primary controls at least 44 points tall on iOS', () => {
  const screen = render(<App />);
  const modelOptionStyle = StyleSheet.flatten(
    screen.getByLabelText('Use House model').props.style,
  );
  const tabStyle = StyleSheet.flatten(
    screen.getByRole('tab', { name: 'Controls' }).props.style,
  );
  const cameraButtonStyle = StyleSheet.flatten(
    screen.getByLabelText('Rotate model left').props.style,
  );

  expect(modelOptionStyle.minHeight).toBeGreaterThanOrEqual(44);
  expect(tabStyle.minHeight).toBeGreaterThanOrEqual(44);
  expect(cameraButtonStyle.minHeight).toBeGreaterThanOrEqual(44);
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
