const INTERCEPTED_KEYS = new Set([
  'ArrowUp',
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
  'KeyW',
  'KeyA',
  'KeyS',
  'KeyD',
  'KeyZ',
  'KeyX',
  'Enter',
  'Escape',
  'Backspace',
  'Digit1',
  'Digit2',
  'Digit3'
]);

export function setupKeyboardInput(onInput) {
  function onKeyDown(event) {
    if (!INTERCEPTED_KEYS.has(event.code)) {
      return;
    }

    if (event.target instanceof HTMLElement) {
      const tag = event.target.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') {
        return;
      }
    }

    event.preventDefault();
    onInput({
      kind: 'keyboard',
      code: event.code
    });
  }

  window.addEventListener('keydown', onKeyDown);

  return () => {
    window.removeEventListener('keydown', onKeyDown);
  };
}
