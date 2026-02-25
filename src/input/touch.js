function bindControlButtons(controlsRoot, onInput) {
  if (!controlsRoot) {
    return () => {};
  }

  const buttons = Array.from(controlsRoot.querySelectorAll('[data-input]'));
  const listeners = [];

  for (const button of buttons) {
    const handler = (event) => {
      event.preventDefault();
      const target = event.currentTarget;
      if (!(target instanceof HTMLElement)) {
        return;
      }

      const input = target.dataset.input;
      if (!input) {
        return;
      }

      onInput({
        kind: 'control',
        input
      });
    };

    button.addEventListener('pointerdown', handler);
    listeners.push({ button, handler });
  }

  return () => {
    for (const { button, handler } of listeners) {
      button.removeEventListener('pointerdown', handler);
    }
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
  const unbindControls = bindControlButtons(controlsRoot, onInput);
  const unbindCanvas = bindCanvas(canvas, mapClientToLogical, onInput, 'canvas');

  let unbindMenu = () => {};
  if (menuCanvas && mapClientToLogicalMenu) {
    unbindMenu = bindCanvas(menuCanvas, mapClientToLogicalMenu, onInput, 'menu');
  }

  return () => {
    unbindControls();
    unbindCanvas();
    unbindMenu();
  };
}
