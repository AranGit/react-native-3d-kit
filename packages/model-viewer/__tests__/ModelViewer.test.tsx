import { createRef } from 'react';
import { Text } from 'react-native';
import {
  act,
  fireEvent,
  render,
  waitFor,
  within,
} from '@testing-library/react-native';
import { ModelViewer, useModelViewer, type ModelViewerHandle } from '../src';

type MockModel =
  | { state: 'loading' }
  | {
      state: 'loaded';
      boundingBox: {
        center: [number, number, number];
        halfExtent: [number, number, number];
        min: [number, number, number];
        max: [number, number, number];
        _type: 'AABB';
      };
    };

const mockRuntime: {
  model: MockModel;
  error: Error | null;
  view: {
    projectWorldToScreen: jest.Mock<
      [number, number],
      [[number, number, number]]
    >;
  };
} = {
  model: { state: 'loading' },
  error: null,
  view: {
    projectWorldToScreen: jest.fn<[number, number], [[number, number, number]]>(
      () => [12, 34],
    ),
  },
};

const mockManipulator = {
  grabBegin: jest.fn(),
  grabUpdate: jest.fn(),
  grabEnd: jest.fn(),
  scroll: jest.fn(),
  getLookAt: jest.fn(() => [
    [0, 0, 8],
    [0, 0, 0],
    [0, 1, 0],
  ]),
};

jest.mock('react-native-filament', () => {
  const React = require('react') as typeof import('react');
  const ReactNative = require('react-native') as typeof import('react-native');

  return {
    FilamentScene: ({ children }: { children: React.ReactNode }) => (
      <ReactNative.View testID="filament-scene">{children}</ReactNative.View>
    ),
    FilamentView: ({ children }: { children: React.ReactNode }) => (
      <ReactNative.View testID="filament-view">{children}</ReactNative.View>
    ),
    DefaultLight: () => <ReactNative.View testID="filament-light" />,
    ModelRenderer: () => <ReactNative.View testID="filament-model" />,
    Camera: () => <ReactNative.View testID="filament-camera" />,
    useModel: () => {
      if (mockRuntime.error !== null) {
        throw mockRuntime.error;
      }
      return mockRuntime.model;
    },
    useFilamentContext: () => ({ view: mockRuntime.view }),
    useCameraManipulator: () => mockManipulator,
    useWorkletCallback:
      (callback: (...args: never[]) => unknown) =>
      async (...args: never[]) =>
        callback(...args),
  };
});

const loadedModel: MockModel = {
  state: 'loaded',
  boundingBox: {
    center: [0, 0, 0],
    halfExtent: [1, 2, 1],
    min: [-1, -2, -1],
    max: [1, 2, 1],
    _type: 'AABB',
  },
};

function StatusProbe() {
  const { status, viewport } = useModelViewer();
  return (
    <Text testID="status-probe">
      {status}:{viewport.width}x{viewport.height}
    </Text>
  );
}

describe('ModelViewer', () => {
  beforeEach(() => {
    mockRuntime.model = { state: 'loading' };
    mockRuntime.error = null;
    mockRuntime.view.projectWorldToScreen.mockClear();
    jest.clearAllMocks();
  });

  it('renders loading state and keeps overlays outside FilamentView', () => {
    const screen = render(
      <ModelViewer
        source={{ uri: 'model.glb' }}
        loadingFallback={<Text testID="loading">Loading</Text>}
        testID="viewer"
      >
        <Text testID="overlay">Overlay</Text>
      </ModelViewer>,
    );

    expect(screen.getByTestId('loading')).toBeTruthy();
    expect(screen.getByTestId('overlay')).toBeTruthy();
    expect(
      within(screen.getByTestId('filament-view')).queryByTestId('overlay'),
    ).toBeNull();
  });

  it('reports loaded state and viewport dimensions', async () => {
    mockRuntime.model = loadedModel;
    const onLoad = jest.fn();
    const screen = render(
      <ModelViewer
        source={{ uri: 'model.glb' }}
        onLoad={onLoad}
        testID="viewer"
      >
        <StatusProbe />
      </ModelViewer>,
    );

    fireEvent(screen.getByTestId('viewer'), 'layout', {
      nativeEvent: { layout: { width: 320, height: 240, x: 0, y: 0 } },
    });

    await waitFor(() => {
      expect(screen.getByTestId('status-probe').props.children).toEqual([
        'loaded',
        ':',
        320,
        'x',
        240,
      ]);
      expect(onLoad).toHaveBeenCalledTimes(1);
    });
  });

  it('resets state when source changes', async () => {
    mockRuntime.model = loadedModel;
    const screen = render(
      <ModelViewer source={{ uri: 'first.glb' }}>
        <StatusProbe />
      </ModelViewer>,
    );
    await waitFor(() =>
      expect(screen.getByTestId('status-probe').props.children[0]).toBe(
        'loaded',
      ),
    );

    mockRuntime.model = { state: 'loading' };
    screen.rerender(
      <ModelViewer source={{ uri: 'second.glb' }}>
        <StatusProbe />
      </ModelViewer>,
    );

    await waitFor(() =>
      expect(screen.getByTestId('status-probe').props.children[0]).toBe(
        'loading',
      ),
    );
  });

  it('projects safely only after layout is available', async () => {
    mockRuntime.model = loadedModel;
    const ref = createRef<ModelViewerHandle>();
    const screen = render(
      <ModelViewer ref={ref} source={{ uri: 'model.glb' }} testID="viewer" />,
    );

    expect(ref.current?.projectWorldToScreen([1, 2, 3])).toBeNull();

    await act(async () => {
      fireEvent(screen.getByTestId('viewer'), 'layout', {
        nativeEvent: { layout: { width: 100, height: 100, x: 0, y: 0 } },
      });
    });

    expect(ref.current?.projectWorldToScreen([1, 2, 3])).toEqual({
      x: 12,
      y: 34,
    });
  });

  it('renders an observable error fallback', async () => {
    const expectedError = new Error('Invalid model source');
    mockRuntime.error = expectedError;
    const onError = jest.fn();
    const consoleError = jest
      .spyOn(console, 'error')
      .mockImplementation(() => undefined);

    const screen = render(
      <ModelViewer
        source={{ uri: 'broken.glb' }}
        errorFallback={({ error }) => (
          <Text testID="error-fallback">{error.message}</Text>
        )}
        onError={onError}
      />,
    );

    await waitFor(() => {
      expect(screen.getByTestId('error-fallback').props.children).toBe(
        'Invalid model source',
      );
      expect(onError).toHaveBeenCalledWith(expectedError);
    });
    consoleError.mockRestore();
  });

  it('throws a helpful error when the hook is used outside the provider', () => {
    const consoleError = jest
      .spyOn(console, 'error')
      .mockImplementation(() => undefined);
    expect(() => render(<StatusProbe />)).toThrow(
      'useModelViewer must be used inside',
    );
    consoleError.mockRestore();
  });
});
