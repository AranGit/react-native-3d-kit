import { Text, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { fireEvent, render } from '@testing-library/react-native';
import { Hotspot, HotspotLayer } from '../src';
import { resolveHotspotProjection } from '../src/projection';

const mockListeners = new Set<() => void>();
const mockViewer = {
  outside: false,
  status: 'loaded' as 'loading' | 'loaded' | 'error',
  viewport: { width: 100, height: 80 },
  projectWorldToScreen: jest.fn(
    ([x, y]: readonly [number, number, number]) => ({ x, y }),
  ),
};

jest.mock('@arangit/react-native-model-viewer', () => ({
  useModelViewer: () => {
    if (mockViewer.outside) {
      throw new Error('useModelViewer must be used inside <ModelViewer>.');
    }
    return {
      status: mockViewer.status,
      viewport: mockViewer.viewport,
      projectWorldToScreen: mockViewer.projectWorldToScreen,
      subscribeToProjectionUpdates(listener: () => void) {
        mockListeners.add(listener);
        return () => mockListeners.delete(listener);
      },
    };
  },
}));

interface TestNode {
  props: Record<string, unknown>;
}

function styleFor(node: TestNode): ViewStyle {
  return StyleSheet.flatten(node.props.style as StyleProp<ViewStyle>);
}

function transformFor(node: TestNode) {
  return styleFor(node).transform;
}

describe('hotspot projection', () => {
  it('maps world projection with a pixel offset', () => {
    expect(
      resolveHotspotProjection(
        { x: 20, y: 30 },
        { width: 100, height: 80 },
        'loaded',
        [4, -6],
      ),
    ).toEqual({ screenPosition: { x: 24, y: 24 }, visible: true });
  });

  it('hides unavailable and out-of-viewport projections', () => {
    expect(
      resolveHotspotProjection(
        { x: 101, y: 30 },
        { width: 100, height: 80 },
        'loaded',
        [0, 0],
      ).visible,
    ).toBe(false);
    expect(
      resolveHotspotProjection(
        { x: 20, y: 30 },
        { width: 100, height: 80 },
        'loading',
        [0, 0],
      ),
    ).toEqual({ screenPosition: null, visible: false });
  });
});

describe('HotspotLayer and Hotspot', () => {
  beforeEach(() => {
    mockListeners.clear();
    mockViewer.outside = false;
    mockViewer.status = 'loaded';
    mockViewer.viewport = { width: 100, height: 80 };
    mockViewer.projectWorldToScreen.mockImplementation(([x, y]) => ({ x, y }));
    jest.clearAllMocks();
  });

  it('positions multiple hotspots independently', () => {
    const screen = render(
      <HotspotLayer>
        <Hotspot id="first" position={[10, 20, 0]} />
        <Hotspot id="second" position={[70, 40, 0]} offset={[2, -3]} />
      </HotspotLayer>,
    );

    expect(transformFor(screen.getByTestId('hotspot-first'))).toEqual([
      { translateX: 10 },
      { translateY: 20 },
    ]);
    expect(transformFor(screen.getByTestId('hotspot-second'))).toEqual([
      { translateX: 72 },
      { translateY: 37 },
    ]);
  });

  it('supports hidden and disabled states', () => {
    const screen = render(
      <HotspotLayer>
        <Hotspot disabled id="disabled" position={[10, 20, 0]} />
        <Hotspot hidden id="hidden" position={[30, 40, 0]} />
      </HotspotLayer>,
    );

    expect(screen.getByTestId('hotspot-disabled').props.pointerEvents).toBe(
      'none',
    );
    const hidden = screen.getByTestId('hotspot-hidden', {
      includeHiddenElements: true,
    });
    expect(hidden.props.pointerEvents).toBe('none');
    expect(styleFor(hidden).opacity).toBe(0);
  });

  it('renders custom content and handles presses', () => {
    const onPress = jest.fn();
    const screen = render(
      <HotspotLayer>
        <Hotspot
          id="custom"
          onPress={onPress}
          position={[10, 20, 0]}
          renderContent={({ active }) => (
            <Text testID="custom-content">{active ? 'active' : 'idle'}</Text>
          )}
        />
      </HotspotLayer>,
    );

    expect(screen.getByTestId('custom-content').props.children).toBe('idle');
    fireEvent.press(screen.getByLabelText('custom'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('throws helpful errors for missing providers', () => {
    const consoleError = jest
      .spyOn(console, 'error')
      .mockImplementation(() => undefined);

    expect(() => render(<Hotspot id="orphan" position={[0, 0, 0]} />)).toThrow(
      'Hotspot must be rendered inside',
    );

    mockViewer.outside = true;
    expect(() => render(<HotspotLayer />)).toThrow(
      'useModelViewer must be used inside <ModelViewer>.',
    );
    consoleError.mockRestore();
  });
});
