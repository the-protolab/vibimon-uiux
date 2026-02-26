import { DOMAIN_ACTIONS, INPUT_ACTIONS, MENU_TABS } from '../../core/actions.js';
import { renderUI1Overlay } from './layout.js';

function keyToInputAction(code) {
  switch (code) {
    case 'ArrowUp':
      return INPUT_ACTIONS.UP;
    case 'ArrowDown':
      return INPUT_ACTIONS.DOWN;
    case 'ArrowLeft':
      return INPUT_ACTIONS.LEFT;
    case 'ArrowRight':
      return INPUT_ACTIONS.RIGHT;
    case 'KeyZ':
    case 'Enter':
      return INPUT_ACTIONS.A;
    case 'KeyX':
    case 'Escape':
    case 'Backspace':
      return INPUT_ACTIONS.B;
    default:
      return null;
  }
}

function controlToInputAction(control) {
  switch (control) {
    case 'up':
      return INPUT_ACTIONS.UP;
    case 'down':
      return INPUT_ACTIONS.DOWN;
    case 'left':
      return INPUT_ACTIONS.LEFT;
    case 'right':
      return INPUT_ACTIONS.RIGHT;
    case 'a':
      return INPUT_ACTIONS.A;
    case 'b':
      return INPUT_ACTIONS.B;
    default:
      return null;
  }
}

function directionalAction(direction, state) {
  if (state.menu.activeTab === MENU_TABS.MAP) {
    return [{ type: DOMAIN_ACTIONS.MOVE, direction }];
  }

  return [{ type: DOMAIN_ACTIONS.SELECT_ITEM, direction }];
}

function inputActionToDomain(inputAction, state) {
  switch (inputAction) {
    case INPUT_ACTIONS.UP:
      return directionalAction('up', state);
    case INPUT_ACTIONS.DOWN:
      return directionalAction('down', state);
    case INPUT_ACTIONS.LEFT:
      return directionalAction('left', state);
    case INPUT_ACTIONS.RIGHT:
      return directionalAction('right', state);
    case INPUT_ACTIONS.A:
      return [{ type: DOMAIN_ACTIONS.CONFIRM }];
    case INPUT_ACTIONS.B: {
      const nextTab = state.menu.activeTab === MENU_TABS.MAP ? state.menu.ui1Focus : MENU_TABS.MAP;
      return [{ type: DOMAIN_ACTIONS.OPEN_TAB, tab: nextTab }];
    }
    default:
      return [];
  }
}

export function createUI1Skin() {
  return {
    id: 'ui1',
    mapInput(rawInput, state) {
      if (rawInput.kind === 'keyboard') {
        const action = keyToInputAction(rawInput.code);
        return action ? [action] : [];
      }

      if (rawInput.kind === 'control') {
        const action = controlToInputAction(rawInput.input);
        return action ? [action] : [];
      }

      if (rawInput.kind === 'canvas') {
        return [];
      }

      if (rawInput.kind === 'menu') {
        return [];
      }

      return [];
    },
    mapInputToDomain(inputAction, state) {
      return inputActionToDomain(inputAction, state);
    },
    renderOverlay(ctx, state, sprites) {
      renderUI1Overlay(ctx, state, sprites);
    }
  };
}
