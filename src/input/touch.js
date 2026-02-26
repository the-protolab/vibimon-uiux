function bindControlButtons(controlsRoot, onInput) {
  if (!controlsRoot) {
    return () => {};
  }

  const HOLD_DELAY_MS = 180;
  const HOLD_REPEAT_MS = 90;
  const REPEATABLE_INPUTS = new Set(['up', 'down', 'left', 'right']);
  const buttons = Array.from(controlsRoot.querySelectorAll('[data-input]'));
  const listeners = [];
  const repeats = new Map();

  function dispatchControlInput(button) {
    const input = button.dataset.input;
    if (!input) {
      return null;
    }

    onInput({
      kind: 'control',
      input
    });

    return input;
  }

  function stopRepeat(button) {
    const repeat = repeats.get(button);
    if (!repeat) {
      return;
    }

    window.clearTimeout(repeat.delayId);
    if (repeat.intervalId !== null) {
      window.clearInterval(repeat.intervalId);
    }
    repeats.delete(button);
  }

  for (const button of buttons) {
    const onPointerDown = (event) => {
      event.preventDefault();
      const selection = window.getSelection?.();
      if (selection && selection.rangeCount > 0) {
        selection.removeAllRanges();
      }
      const target = event.currentTarget;
      if (!(target instanceof HTMLElement)) {
        return;
      }

      const input = dispatchControlInput(target);
      if (!input) {
        return;
      }

      if (!REPEATABLE_INPUTS.has(input)) {
        return;
      }

      stopRepeat(target);
      if (typeof target.setPointerCapture === 'function') {
        target.setPointerCapture(event.pointerId);
      }

      const delayId = window.setTimeout(() => {
        const intervalId = window.setInterval(() => {
          dispatchControlInput(target);
        }, HOLD_REPEAT_MS);

        const current = repeats.get(target);
        if (current) {
          current.intervalId = intervalId;
        } else {
          window.clearInterval(intervalId);
        }
      }, HOLD_DELAY_MS);

      repeats.set(target, {
        delayId,
        intervalId: null
      });
    };

    const onPointerEnd = (event) => {
      const target = event.currentTarget;
      if (!(target instanceof HTMLElement)) {
        return;
      }

      stopRepeat(target);
    };

    button.addEventListener('pointerdown', onPointerDown);
    button.addEventListener('pointerup', onPointerEnd);
    button.addEventListener('pointercancel', onPointerEnd);
    button.addEventListener('lostpointercapture', onPointerEnd);

    listeners.push({
      button,
      onPointerDown,
      onPointerEnd
    });
  }

  return () => {
    for (const { button, onPointerDown, onPointerEnd } of listeners) {
      stopRepeat(button);
      button.removeEventListener('pointerdown', onPointerDown);
      button.removeEventListener('pointerup', onPointerEnd);
      button.removeEventListener('pointercancel', onPointerEnd);
      button.removeEventListener('lostpointercapture', onPointerEnd);
    }
  };
}

function bindZoomLock() {
  let lastTouchEnd = 0;

  const handleTouchEnd = (event) => {
    const now = Date.now();
    if (now - lastTouchEnd <= 300) {
      event.preventDefault();
    }
    lastTouchEnd = now;
  };

  const handleTouchMove = (event) => {
    if (event.touches.length > 1) {
      event.preventDefault();
    }
  };

  const handleGesture = (event) => {
    event.preventDefault();
  };

  document.addEventListener('touchend', handleTouchEnd, { passive: false });
  document.addEventListener('touchmove', handleTouchMove, { passive: false });
  document.addEventListener('gesturestart', handleGesture);
  document.addEventListener('gesturechange', handleGesture);
  document.addEventListener('gestureend', handleGesture);

  return () => {
    document.removeEventListener('touchend', handleTouchEnd);
    document.removeEventListener('touchmove', handleTouchMove);
    document.removeEventListener('gesturestart', handleGesture);
    document.removeEventListener('gesturechange', handleGesture);
    document.removeEventListener('gestureend', handleGesture);
  };
}

function bindCanvas(canvas, mapClientToLogical, onInput, kind) {
  const handler = (event) => {
    event.preventDefault();

    const point = mapClientToLogical(event.clientX, event.clientY);
    onInput({
      kind,
      x: point.x,
      y: point.y
    });
  };

  canvas.addEventListener('pointerdown', handler);

  return () => {
    canvas.removeEventListener('pointerdown', handler);
  };
}

export function setupTouchInput({ canvas, menuCanvas, controlsRoot, mapClientToLogical, mapClientToLogicalMenu, onInput }) {
  const unbindZoomLock = bindZoomLock();
  const unbindControls = bindControlButtons(controlsRoot, onInput);
  const unbindCanvas = bindCanvas(canvas, mapClientToLogical, onInput, 'canvas');

  let unbindMenu = () => {};
  if (menuCanvas && mapClientToLogicalMenu) {
    unbindMenu = bindCanvas(menuCanvas, mapClientToLogicalMenu, onInput, 'menu');
  }

  return () => {
    unbindZoomLock();
    unbindControls();
    unbindCanvas();
    unbindMenu();
  };
}
