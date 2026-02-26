import { setupKeyboardInput } from './input/keyboard.js';
import { setupTouchInput } from './input/touch.js';
import { DOMAIN_ACTIONS } from './core/actions.js';
import { createInitialState, LOGICAL_HEIGHT, LOGICAL_WIDTH, MENU_HEIGHT, MENU_WIDTH } from './core/game-state.js';
import { reduceGameState } from './core/reducer.js';
import { createRenderer } from './render/canvas.js';
import { createScaleManager } from './render/scale-manager.js';
import { loadPlayerSprites } from './render/sprites.js';
import { createUI1Skin } from './ui/skin-ui1/interaction.js';
import { createUI2Skin } from './ui/skin-ui2/interaction.js';

function pickSkin(mode) {
  if (mode === 'ui1') {
    return createUI1Skin();
  }

  if (mode === 'ui2') {
    return createUI2Skin();
  }

  throw new Error(`Unsupported mode: ${mode}`);
}

export function createGame({ mode, canvas, menuCanvas, controlsRoot, overworldConfig }) {
  if (!canvas) {
    throw new Error('Canvas is required');
  }

  const skin = pickSkin(mode);
  const renderer = createRenderer(canvas, menuCanvas);
  const scaleManager = createScaleManager(canvas, LOGICAL_WIDTH, LOGICAL_HEIGHT, menuCanvas, MENU_WIDTH, MENU_HEIGHT);
  const shell = canvas.closest('.gameboy-shell');

  let state = createInitialState(mode, { overworldConfig });
  let sprites = null;
  let running = false;
  let rafId = 0;
  let lastTick = 0;
  const cleanups = [];

  function isCutsceneActive(currentState) {
    return Boolean(currentState.overworld?.cutscene?.active);
  }

  function applyHudVisibility(currentState) {
    if (!(shell instanceof HTMLElement)) {
      return;
    }

    shell.classList.toggle('is-ui-revealed', !isCutsceneActive(currentState));
  }

  function applyDomainAction(action) {
    state = reduceGameState(state, action);
    applyHudVisibility(state);
    return state;
  }

  function dispatchInput(inputAction) {
    const actions = skin.mapInputToDomain(inputAction, state);
    for (const action of actions) {
      applyDomainAction(action);
    }
  }

  function handleRawInput(rawInput) {
    if (isCutsceneActive(state)) {
      return;
    }

    const inputActions = skin.mapInput(rawInput, state);
    for (const inputAction of inputActions) {
      dispatchInput(inputAction);
    }
  }

  function loop(timestamp) {
    if (!running) {
      return;
    }

    if (timestamp - lastTick >= 180) {
      applyDomainAction({ type: DOMAIN_ACTIONS.TICK });
      lastTick = timestamp;
    }

    renderer.render(state, skin, sprites);
    rafId = window.requestAnimationFrame(loop);
  }

  async function start() {
    if (running) {
      return;
    }

    applyHudVisibility(state);

    scaleManager.resize();
    const resizeHandler = () => scaleManager.resize();
    window.addEventListener('resize', resizeHandler);
    cleanups.push(() => window.removeEventListener('resize', resizeHandler));

    cleanups.push(setupKeyboardInput(handleRawInput));
    cleanups.push(
      setupTouchInput({
        canvas,
        menuCanvas,
        controlsRoot,
        mapClientToLogical: scaleManager.mapClientToLogical,
        mapClientToLogicalMenu: scaleManager.mapClientToLogicalMenu,
        onInput: handleRawInput
      })
    );

    try {
      sprites = await loadPlayerSprites();
    } catch {
      sprites = null;
    }

    running = true;
    rafId = window.requestAnimationFrame(loop);
  }

  function stop() {
    running = false;
    window.cancelAnimationFrame(rafId);

    while (cleanups.length > 0) {
      const cleanup = cleanups.pop();
      if (cleanup) {
        cleanup();
      }
    }
  }

  function dispatch(action) {
    if (typeof action === 'string') {
      dispatchInput(action);
      return state;
    }

    return applyDomainAction(action);
  }

  return {
    start,
    stop,
    dispatch,
    getState: () => state,
    renderFrame: () => renderer.render(state, skin, sprites)
  };
}
