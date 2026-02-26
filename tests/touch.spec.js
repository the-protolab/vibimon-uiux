import { afterEach, describe, expect, it, vi } from 'vitest';
import { setupTouchInput } from '../src/input/touch.js';

function buildControlsRoot() {
  const controls = document.createElement('section');
  controls.innerHTML = `
    <button data-input="up">UP</button>
    <button data-input="down">DOWN</button>
    <button data-input="left">LEFT</button>
    <button data-input="right">RIGHT</button>
    <button data-input="a">A</button>
    <button data-input="b">B</button>
  `;

  for (const button of controls.querySelectorAll('button')) {
    button.setPointerCapture = () => {};
  }

  return controls;
}

function dispatchPointer(target, type) {
  const event = new Event(type, { bubbles: true, cancelable: true });
  Object.defineProperty(event, 'pointerId', {
    configurable: true,
    value: 1
  });
  target.dispatchEvent(event);
  return event;
}

function createHarness() {
  const controlsRoot = buildControlsRoot();
  const canvas = document.createElement('canvas');
  const inputs = [];

  const cleanup = setupTouchInput({
    canvas,
    menuCanvas: null,
    controlsRoot,
    mapClientToLogical: () => ({ x: 0, y: 0 }),
    mapClientToLogicalMenu: null,
    onInput: (input) => inputs.push(input)
  });

  return { controlsRoot, inputs, cleanup };
}

function getButton(controlsRoot, input) {
  const button = controlsRoot.querySelector(`[data-input="${input}"]`);
  if (!(button instanceof HTMLElement)) {
    throw new Error(`Button not found for "${input}"`);
  }
  return button;
}

afterEach(() => {
  vi.useRealTimers();
});

describe('touch input behavior', () => {
  it('dispatches immediate input on directional pointerdown', () => {
    const { controlsRoot, inputs, cleanup } = createHarness();
    const up = getButton(controlsRoot, 'up');

    dispatchPointer(up, 'pointerdown');

    expect(inputs).toEqual([{ kind: 'control', input: 'up' }]);
    cleanup();
  });

  it('repeats directional input while holding after the configured delay', () => {
    vi.useFakeTimers();
    const { controlsRoot, inputs, cleanup } = createHarness();
    const right = getButton(controlsRoot, 'right');

    dispatchPointer(right, 'pointerdown');
    expect(inputs).toHaveLength(1);

    vi.advanceTimersByTime(179);
    expect(inputs).toHaveLength(1);

    vi.advanceTimersByTime(91);
    expect(inputs).toHaveLength(2);

    vi.advanceTimersByTime(90);
    expect(inputs).toHaveLength(3);
    cleanup();
  });

  it.each(['pointerup', 'pointercancel', 'lostpointercapture'])(
    'stops repeating directional input on %s',
    (stopEvent) => {
      vi.useFakeTimers();
      const { controlsRoot, inputs, cleanup } = createHarness();
      const left = getButton(controlsRoot, 'left');

      dispatchPointer(left, 'pointerdown');
      vi.advanceTimersByTime(271);
      expect(inputs.length).toBeGreaterThan(1);

      dispatchPointer(left, stopEvent);
      const countAfterStop = inputs.length;
      vi.advanceTimersByTime(500);

      expect(inputs).toHaveLength(countAfterStop);
      cleanup();
    }
  );

  it('does not repeat non-directional buttons A/B', () => {
    vi.useFakeTimers();
    const { controlsRoot, inputs, cleanup } = createHarness();
    const buttonA = getButton(controlsRoot, 'a');
    const buttonB = getButton(controlsRoot, 'b');

    dispatchPointer(buttonA, 'pointerdown');
    dispatchPointer(buttonB, 'pointerdown');
    expect(inputs).toEqual([
      { kind: 'control', input: 'a' },
      { kind: 'control', input: 'b' }
    ]);

    vi.advanceTimersByTime(1000);
    expect(inputs).toEqual([
      { kind: 'control', input: 'a' },
      { kind: 'control', input: 'b' }
    ]);
    cleanup();
  });

  it('prevents default on quick second touchend (double-tap lock)', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-01T00:00:00.000Z'));
    const { cleanup } = createHarness();

    const firstTouchEnd = new Event('touchend', { bubbles: true, cancelable: true });
    document.dispatchEvent(firstTouchEnd);
    expect(firstTouchEnd.defaultPrevented).toBe(false);

    vi.advanceTimersByTime(200);

    const secondTouchEnd = new Event('touchend', { bubbles: true, cancelable: true });
    document.dispatchEvent(secondTouchEnd);
    expect(secondTouchEnd.defaultPrevented).toBe(true);
    cleanup();
  });

  it('prevents default on multitouch touchmove (pinch lock)', () => {
    const { cleanup } = createHarness();

    const touchMove = new Event('touchmove', { bubbles: true, cancelable: true });
    Object.defineProperty(touchMove, 'touches', {
      configurable: true,
      value: [{}, {}]
    });

    document.dispatchEvent(touchMove);
    expect(touchMove.defaultPrevented).toBe(true);
    cleanup();
  });
});
