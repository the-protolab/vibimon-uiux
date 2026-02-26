import { DOMAIN_ACTIONS, MENU_TABS } from './actions.js';
import { advanceOverworldTick, canActorMove, resolveInteraction, syncOverworldDerivedState } from '../overworld/component.js';
import { moveCursor } from './world.js';

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
  if (state.menu.activeTab === MENU_TABS.MAP) {
    return resolveInteraction(state);
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

function getMoveBlockedMessage(reason) {
  switch (reason) {
    case 'LOCKED':
      return 'LOCKED';
    case 'MOUNTED':
      return 'ON BOAT';
    default:
      return 'BLOCKED';
  }
}

export function reduceGameState(state, action) {
  switch (action.type) {
    case DOMAIN_ACTIONS.TICK: {
      const next = {
        ...state,
        frame: state.frame + 1
      };
      return advanceOverworldTick(next);
    }

    case DOMAIN_ACTIONS.MOVE: {
      const movement = canActorMove(state, action.direction);
      if (!movement.canMove) {
        return syncOverworldDerivedState({
          ...state,
          player: {
            ...state.player,
            direction: action.direction
          },
          message: getMoveBlockedMessage(movement.reason)
        });
      }

      const nextPlayer = {
        ...state.player,
        x: movement.nextX,
        y: movement.nextY,
        direction: action.direction,
        animFrame: (state.player.animFrame + 1) % 4
      };

      return syncOverworldDerivedState(
        {
          ...state,
          player: nextPlayer,
          menu: {
            ...state.menu,
            mapCursor: { x: nextPlayer.x, y: nextPlayer.y }
          },
          message: `STEP ${nextPlayer.x},${nextPlayer.y}`
        },
        {
          syncCursorWithPlayer: true
        }
      );
    }

    case DOMAIN_ACTIONS.OPEN_TAB: {
      const nextTab = action.tab;
      let nextState;

      if (state.mode === 'ui1') {
        if (nextTab === MENU_TABS.MAP) {
          nextState = {
            ...state,
            menu: {
              ...state.menu,
              activeTab: MENU_TABS.MAP
            },
            message: 'UI1 MAP'
          };
        } else {
          nextState = {
            ...state,
            menu: {
              ...state.menu,
              ui1Focus: nextTab,
              activeTab: nextTab
            },
            message: `UI1 ${nextTab}`
          };
        }
      } else {
        nextState = {
          ...state,
          menu: {
            ...state.menu,
            activeTab: nextTab
          },
          message: `UI2 ${nextTab}`
        };
      }

      return syncOverworldDerivedState(nextState);
    }

    case DOMAIN_ACTIONS.SELECT_ITEM:
      if (state.mode === 'ui1') {
        return syncOverworldDerivedState({
          ...state,
          menu: ui1Select(state.menu, action.direction),
          message: 'UI1 NAV'
        });
      }

      return syncOverworldDerivedState({
        ...state,
        menu: ui2Select(state, action.direction),
        message: 'UI2 NAV'
      });

    case DOMAIN_ACTIONS.CONFIRM:
      return syncOverworldDerivedState(confirmAction(state));

    case DOMAIN_ACTIONS.BACK:
      if (state.mode === 'ui1') {
        return syncOverworldDerivedState({
          ...state,
          menu: {
            ...state.menu,
            ui1Focus: MENU_TABS.BAG
          },
          message: 'UI1 BACK'
        });
      }

      return syncOverworldDerivedState({
        ...state,
        menu: {
          ...state.menu,
          activeTab: MENU_TABS.MAP
        },
        message: 'UI2 BACK'
      });

    default:
      return state;
  }
}
