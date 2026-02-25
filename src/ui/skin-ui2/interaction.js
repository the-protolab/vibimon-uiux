import { DOMAIN_ACTIONS, INPUT_ACTIONS, MENU_TABS } from '../../core/actions.js';
import { renderUI2Overlay, UI2_HITBOXES } from './layout.js';

function pointInRect(x, y, rect) {
  return x >= rect.x && y >= rect.y && x < rect.x + rect.width && y < rect.y + rect.height;
}

function pointerToMoveAction(x, y, state) {
  const centerX = state.player.x * 16 + 8;
  const centerY = state.player.y * 16 + 8;
  const deltaX = x - centerX;
  const deltaY = y - centerY;

  if (Math.abs(deltaX) > Math.abs(deltaY)) {
    return deltaX >= 0 ? INPUT_ACTIONS.MOVE_RIGHT : INPUT_ACTIONS.MOVE_LEFT;
  }

  return deltaY >= 0 ? INPUT_ACTIONS.MOVE_DOWN : INPUT_ACTIONS.MOVE_UP;
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
    case 'KeyW':
      return INPUT_ACTIONS.MOVE_UP;
    case 'KeyA':
      return INPUT_ACTIONS.MOVE_LEFT;
    case 'KeyS':
      return INPUT_ACTIONS.MOVE_DOWN;
    case 'KeyD':
      return INPUT_ACTIONS.MOVE_RIGHT;
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

function inputActionToDomain(inputAction) {
  switch (inputAction) {
    case INPUT_ACTIONS.UP:
      return [{ type: DOMAIN_ACTIONS.SELECT_ITEM, direction: 'up' }];
    case INPUT_ACTIONS.DOWN:
      return [{ type: DOMAIN_ACTIONS.SELECT_ITEM, direction: 'down' }];
    case INPUT_ACTIONS.LEFT:
      return [{ type: DOMAIN_ACTIONS.SELECT_ITEM, direction: 'left' }];
    case INPUT_ACTIONS.RIGHT:
      return [{ type: DOMAIN_ACTIONS.SELECT_ITEM, direction: 'right' }];
    case INPUT_ACTIONS.MOVE_UP:
      return [{ type: DOMAIN_ACTIONS.MOVE, direction: 'up' }];
    case INPUT_ACTIONS.MOVE_DOWN:
      return [{ type: DOMAIN_ACTIONS.MOVE, direction: 'down' }];
    case INPUT_ACTIONS.MOVE_LEFT:
      return [{ type: DOMAIN_ACTIONS.MOVE, direction: 'left' }];
    case INPUT_ACTIONS.MOVE_RIGHT:
      return [{ type: DOMAIN_ACTIONS.MOVE, direction: 'right' }];
    case INPUT_ACTIONS.TAB_MAP:
      return [{ type: DOMAIN_ACTIONS.OPEN_TAB, tab: MENU_TABS.MAP }];
    case INPUT_ACTIONS.TAB_BAG:
      return [{ type: DOMAIN_ACTIONS.OPEN_TAB, tab: MENU_TABS.BAG }];
    case INPUT_ACTIONS.TAB_MON:
      return [{ type: DOMAIN_ACTIONS.OPEN_TAB, tab: MENU_TABS.MON }];
    case INPUT_ACTIONS.A:
      return [{ type: DOMAIN_ACTIONS.CONFIRM }];
    case INPUT_ACTIONS.B:
      return [{ type: DOMAIN_ACTIONS.BACK }];
    default:
      return [];
  }
}

function canvasInput(rawInput, state) {
  const { x, y } = rawInput;

  if (pointInRect(x, y, UI2_HITBOXES.world)) {
    return [pointerToMoveAction(x, y, state)];
  }

  return [];
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

  if (y >= 4 && y < 60) {
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
        return canvasInput(rawInput, state);
      }

      if (rawInput.kind === 'menu') {
        return menuInput(rawInput, state);
      }

      return [];
    },
    mapInputToDomain(inputAction) {
      return inputActionToDomain(inputAction);
    },
    renderOverlay(ctx, state) {
      renderUI2Overlay(ctx, state);
    }
  };
}
