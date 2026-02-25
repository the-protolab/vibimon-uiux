import { DOMAIN_ACTIONS, MENU_TABS } from './actions.js';
import { canMoveTo, moveCursor, movePlayer } from './world.js';

function cycleIndex(current, length, delta) {
  if (length <= 0) {
    return 0;
  }

  const next = (current + delta) % length;
  return next < 0 ? next + length : next;
}

function directionDelta(direction) {
  switch (direction) {
    case 'up':
    case 'left':
      return -1;
    case 'down':
    case 'right':
      return 1;
    default:
      return 0;
  }
}

function ui1Select(menu, direction) {
  if (direction === 'up' || direction === 'down') {
    return {
      ...menu,
      ui1Focus: menu.ui1Focus === MENU_TABS.BAG ? MENU_TABS.MON : MENU_TABS.BAG
    };
  }

  if (direction !== 'left' && direction !== 'right') {
    return menu;
  }

  const delta = directionDelta(direction);
  if (menu.ui1Focus === MENU_TABS.BAG) {
    return {
      ...menu,
      bagIndex: cycleIndex(menu.bagIndex, menu.bagItems.length, delta)
    };
  }

  return {
    ...menu,
    monIndex: cycleIndex(menu.monIndex, menu.mons.length, delta)
  };
}

function ui2Select(state, direction) {
  const { menu } = state;

  if (menu.activeTab === MENU_TABS.MAP) {
    return {
      ...menu,
      mapCursor: moveCursor(state.world, menu.mapCursor, direction)
    };
  }

  const delta = directionDelta(direction);
  if (menu.activeTab === MENU_TABS.BAG) {
    return {
      ...menu,
      bagIndex: cycleIndex(menu.bagIndex, menu.bagItems.length, delta)
    };
  }

  return {
    ...menu,
    monIndex: cycleIndex(menu.monIndex, menu.mons.length, delta)
  };
}

function confirmAction(state) {
  if (state.mode === 'ui2' && state.menu.activeTab === MENU_TABS.MAP) {
    const cursor = state.menu.mapCursor;

    if (!canMoveTo(state.world, cursor.x, cursor.y)) {
      return {
        ...state,
        message: 'MAP TILE BLOCKED'
      };
    }

    return {
      ...state,
      player: {
        ...state.player,
        x: cursor.x,
        y: cursor.y,
        animFrame: (state.player.animFrame + 1) % 4
      },
      message: `WARP ${cursor.x},${cursor.y}`
    };
  }

  if (state.mode === 'ui1') {
    if (state.menu.ui1Focus === MENU_TABS.BAG) {
      return {
        ...state,
        message: `BAG ${state.menu.bagItems[state.menu.bagIndex]}`
      };
    }

    return {
      ...state,
      message: `MON ${state.menu.mons[state.menu.monIndex]}`
    };
  }

  if (state.menu.activeTab === MENU_TABS.BAG) {
    return {
      ...state,
      message: `BAG ${state.menu.bagItems[state.menu.bagIndex]}`
    };
  }

  if (state.menu.activeTab === MENU_TABS.MON) {
    return {
      ...state,
      message: `MON ${state.menu.mons[state.menu.monIndex]}`
    };
  }

  return {
    ...state,
    message: `MAP ${state.player.x},${state.player.y}`
  };
}

export function reduceGameState(state, action) {
  switch (action.type) {
    case DOMAIN_ACTIONS.TICK:
      return {
        ...state,
        frame: state.frame + 1
      };

    case DOMAIN_ACTIONS.MOVE: {
      const result = movePlayer(state.world, state.player, action.direction);
      return {
        ...state,
        player: result.player,
        menu: {
          ...state.menu,
          mapCursor: result.moved ? { x: result.player.x, y: result.player.y } : state.menu.mapCursor
        },
        message: result.moved ? `STEP ${result.player.x},${result.player.y}` : 'BLOCKED'
      };
    }

    case DOMAIN_ACTIONS.OPEN_TAB: {
      const nextTab = action.tab;

      if (state.mode === 'ui1') {
        if (nextTab === MENU_TABS.MAP) {
          return state;
        }

        return {
          ...state,
          menu: {
            ...state.menu,
            ui1Focus: nextTab,
            activeTab: nextTab
          },
          message: `UI1 ${nextTab}`
        };
      }

      return {
        ...state,
        menu: {
          ...state.menu,
          activeTab: nextTab
        },
        message: `UI2 ${nextTab}`
      };
    }

    case DOMAIN_ACTIONS.SELECT_ITEM:
      if (state.mode === 'ui1') {
        return {
          ...state,
          menu: ui1Select(state.menu, action.direction),
          message: 'UI1 NAV'
        };
      }

      return {
        ...state,
        menu: ui2Select(state, action.direction),
        message: 'UI2 NAV'
      };

    case DOMAIN_ACTIONS.CONFIRM:
      return confirmAction(state);

    case DOMAIN_ACTIONS.BACK:
      if (state.mode === 'ui1') {
        return {
          ...state,
          menu: {
            ...state.menu,
            ui1Focus: MENU_TABS.BAG
          },
          message: 'UI1 BACK'
        };
      }

      return {
        ...state,
        menu: {
          ...state.menu,
          activeTab: MENU_TABS.MAP
        },
        message: 'UI2 BACK'
      };

    default:
      return state;
  }
}
