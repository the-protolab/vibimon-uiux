import { DOMAIN_ACTIONS, INPUT_ACTIONS, MENU_TABS } from '../../core/actions.js';
import { renderUI2Overlay, UI2_HITBOXES } from './layout.js';

function pointInRect(x, y, rect) {
  return x >= rect.x && y >= rect.y && x < rect.x + rect.width && y < rect.y + rect.height;
}

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
    case 'Digit1':
      return INPUT_ACTIONS.TAB_MAP;
    case 'Digit2':
      return INPUT_ACTIONS.TAB_BAG;
    case 'Digit3':
      return INPUT_ACTIONS.TAB_MON;
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
    case INPUT_ACTIONS.TAB_MAP:
      return [{ type: DOMAIN_ACTIONS.OPEN_TAB, tab: MENU_TABS.MAP }];
    case INPUT_ACTIONS.TAB_BAG:
      return [{ type: DOMAIN_ACTIONS.OPEN_TAB, tab: MENU_TABS.BAG }];
    case INPUT_ACTIONS.TAB_MON:
      return [{ type: DOMAIN_ACTIONS.OPEN_TAB, tab: MENU_TABS.MON }];
    case INPUT_ACTIONS.A:
      return [{ type: DOMAIN_ACTIONS.CONFIRM }];
    case INPUT_ACTIONS.B:
      return [];
    default:
      return [];
  }
}

function menuInput(rawInput, state) {
  const { x, y } = rawInput;

  if (pointInRect(x, y, UI2_HITBOXES.tabMap)) {
    return [INPUT_ACTIONS.TAB_MAP];
  }

  if (pointInRect(x, y, UI2_HITBOXES.tabBag)) {
    return [INPUT_ACTIONS.TAB_BAG];
  }

  if (pointInRect(x, y, UI2_HITBOXES.tabMon)) {
    return [INPUT_ACTIONS.TAB_MON];
  }

  if (state.menu.activeTab !== MENU_TABS.MAP && y >= 4 && y < 64) {
    return [x < 80 ? INPUT_ACTIONS.LEFT : INPUT_ACTIONS.RIGHT];
  }

  return [];
}

export function createUI2Skin() {
  return {
    id: 'ui2',
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
        return menuInput(rawInput, state);
      }

      return [];
    },
    mapInputToDomain(inputAction, state) {
      return inputActionToDomain(inputAction, state);
    },
    renderOverlay(ctx, state, sprites) {
      renderUI2Overlay(ctx, state, sprites);
    }
  };
}
