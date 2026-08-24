import { createRef } from 'react';
import { render } from '@testing-library/react-native';
import { OrbitControls, type OrbitControlsHandle } from '../src';

interface MockGestureBuilder {
  kind: 'pan' | 'pinch';
  isEnabled: boolean;
  minimumPointers?: number;
  maximumPointers?: number;
  begin?: () => void;
  update?: (event: {
    translationX: number;
    translationY: number;
    scale: number;
    focalX: number;
    focalY: number;
  }) => void;
  finalize?: () => void;
  enabled(value: boolean): MockGestureBuilder;
  maxPointers(value: number): MockGestureBuilder;
  minPointers(value: number): MockGestureBuilder;
  runOnJS(): MockGestureBuilder;
  onBegin(callback: () => void): MockGestureBuilder;
  onUpdate(
    callback: NonNullable<MockGestureBuilder['update']>,
  ): MockGestureBuilder;
  onFinalize(callback: () => void): MockGestureBuilder;
}

const mockGestures: MockGestureBuilder[] = [];
const mockResetCamera = jest.fn();
const mockCameraController = {
  begin: jest.fn(async () => undefined),
  update: jest.fn(async () => undefined),
  end: jest.fn(async () => undefined),
  zoom: jest.fn(async () => undefined),
  getLookAt: jest.fn(async () => null),
};
const mockViewer = {
  outside: false,
  cameraController: mockCameraController,
  resetCamera: mockResetCamera,
  viewport: { width: 320, height: 240 },
};

function mockCreateGesture(
  kind: MockGestureBuilder['kind'],
): MockGestureBuilder {
  const builder: MockGestureBuilder = {
    kind,
    isEnabled: true,
    enabled(value) {
      builder.isEnabled = value;
      return builder;
    },
    maxPointers(value) {
      builder.maximumPointers = value;
      return builder;
    },
    minPointers(value) {
      builder.minimumPointers = value;
      return builder;
    },
    runOnJS() {
      return builder;
    },
    onBegin(callback) {
      builder.begin = callback;
      return builder;
    },
    onUpdate(callback) {
      builder.update = callback;
      return builder;
    },
    onFinalize(callback) {
      builder.finalize = callback;
      return builder;
    },
  };
  mockGestures.push(builder);
  return builder;
}

jest.mock('react-native-gesture-handler', () => {
  const React = require('react') as typeof import('react');
  const ReactNative = require('react-native') as typeof import('react-native');
  return {
    Gesture: {
      Pan: () => mockCreateGesture('pan'),
      Pinch: () => mockCreateGesture('pinch'),
      Simultaneous: (...gestures: MockGestureBuilder[]) => gestures,
    },
    GestureDetector: ({ children }: { children: React.ReactNode }) => (
      <ReactNative.View>{children}</ReactNative.View>
    ),
  };
});

jest.mock('@arangit/react-native-model-viewer', () => ({
  useModelViewer: () => {
    if (mockViewer.outside) {
      throw new Error('useModelViewer must be used inside <ModelViewer>.');
    }
    return mockViewer;
  },
}));

function latestGestures() {
  const current = mockGestures.slice(-3);
  return {
    rotate: current[0] as MockGestureBuilder,
    pan: current[1] as MockGestureBuilder,
    pinch: current[2] as MockGestureBuilder,
  };
}

describe('OrbitControls', () => {
  beforeEach(() => {
    mockGestures.length = 0;
    mockViewer.outside = false;
    jest.clearAllMocks();
  });

  it('disables every recognizer and pointer handling when disabled', () => {
    const screen = render(<OrbitControls enabled={false} enablePan />);
    const gestures = latestGestures();

    expect(gestures.rotate.isEnabled).toBe(false);
    expect(gestures.pan.isEnabled).toBe(false);
    expect(gestures.pinch.isEnabled).toBe(false);
    expect(screen.getByTestId('orbit-controls').props.pointerEvents).toBe(
      'none',
    );
    expect(mockCameraController.begin).not.toHaveBeenCalled();
  });

  it('reports gesture start and finalize and delegates camera commands', () => {
    const onInteractionStart = jest.fn();
    const onInteractionEnd = jest.fn();
    render(
      <OrbitControls
        onInteractionEnd={onInteractionEnd}
        onInteractionStart={onInteractionStart}
      />,
    );
    const { rotate } = latestGestures();

    rotate.begin?.();
    rotate.update?.({
      translationX: 10,
      translationY: 5,
      scale: 1,
      focalX: 0,
      focalY: 0,
    });
    rotate.finalize?.();

    expect(onInteractionStart).toHaveBeenCalledTimes(1);
    expect(onInteractionEnd).toHaveBeenCalledTimes(1);
    expect(mockCameraController.begin).toHaveBeenCalledWith(0, 240, 'rotate');
    expect(mockCameraController.update).toHaveBeenCalledWith(10, 235);
    expect(mockCameraController.end).toHaveBeenCalledTimes(1);
  });

  it('delegates imperative reset to ModelViewer', () => {
    const ref = createRef<OrbitControlsHandle>();
    render(<OrbitControls ref={ref} />);

    ref.current?.reset();

    expect(mockResetCamera).toHaveBeenCalledTimes(1);
  });

  it.each([
    ['orbitSpeed', 0],
    ['orbitSpeed', Number.NaN],
    ['zoomSpeed', -1],
    ['zoomSpeed', Number.POSITIVE_INFINITY],
  ] as const)('rejects invalid %s values', (prop, value) => {
    const consoleError = jest
      .spyOn(console, 'error')
      .mockImplementation(() => undefined);

    expect(() => render(<OrbitControls {...{ [prop]: value }} />)).toThrow(
      `${prop} must be a finite number greater than zero.`,
    );
    consoleError.mockRestore();
  });

  it('surfaces the ModelViewer provider error', () => {
    mockViewer.outside = true;
    const consoleError = jest
      .spyOn(console, 'error')
      .mockImplementation(() => undefined);

    expect(() => render(<OrbitControls />)).toThrow(
      'useModelViewer must be used inside <ModelViewer>.',
    );
    consoleError.mockRestore();
  });
});
