import { describe, expect, it } from 'vitest';
import { DOMAIN_ACTIONS, MENU_TABS } from '../src/core/actions.js';
import { createInitialState } from '../src/core/game-state.js';
import { reduceGameState } from '../src/core/reducer.js';

function tick(state, totalTicks) {
  let next = state;
  for (let i = 0; i < totalTicks; i += 1) {
    next = reduceGameState(next, { type: DOMAIN_ACTIONS.TICK });
  }
  return next;
}

function runUntilDocked(state, maxTicks = 120) {
  let next = state;
  let ticks = 0;

  while (next.overworld.cutscene.active && ticks < maxTicks) {
    next = reduceGameState(next, { type: DOMAIN_ACTIONS.TICK });
    ticks += 1;
  }

  return { state: next, ticks };
}

describe('reducer flows', () => {
  it('ui1 toggles focus with vertical select', () => {
    const initial = createInitialState('ui1');
    const next = reduceGameState(initial, {
      type: DOMAIN_ACTIONS.SELECT_ITEM,
      direction: 'down'
    });

    expect(initial.menu.ui1Focus).toBe(MENU_TABS.BAG);
    expect(next.menu.ui1Focus).toBe(MENU_TABS.MON);
  });

  it('ui1 keeps aligned column when moving from BAG to MON', () => {
    const base = createInitialState('ui1');
    const initial = {
      ...base,
      menu: {
        ...base.menu,
        ui1Focus: MENU_TABS.BAG,
        bagIndex: 2,
        monIndex: 0
      }
    };

    const next = reduceGameState(initial, {
      type: DOMAIN_ACTIONS.SELECT_ITEM,
      direction: 'down'
    });

    expect(next.menu.ui1Focus).toBe(MENU_TABS.MON);
    expect(next.menu.monIndex).toBe(2);
  });

  it('ui1 keeps aligned column when moving from MON to BAG', () => {
    const base = createInitialState('ui1');
    const initial = {
      ...base,
      menu: {
        ...base.menu,
        ui1Focus: MENU_TABS.MON,
        monIndex: 3,
        bagIndex: 0
      }
    };

    const next = reduceGameState(initial, {
      type: DOMAIN_ACTIONS.SELECT_ITEM,
      direction: 'up'
    });

    expect(next.menu.ui1Focus).toBe(MENU_TABS.BAG);
    expect(next.menu.bagIndex).toBe(3);
  });

  it('ui1 horizontal select updates focused list index', () => {
    const initial = createInitialState('ui1');
    const next = reduceGameState(initial, {
      type: DOMAIN_ACTIONS.SELECT_ITEM,
      direction: 'right'
    });

    expect(next.menu.bagIndex).toBe(1);
    expect(next.menu.monIndex).toBe(0);
  });

  it('ui1 OPEN_TAB MAP activates map viewport and preserves ui1 focus and indexes', () => {
    const base = createInitialState('ui1');
    const initial = {
      ...base,
      menu: {
        ...base.menu,
        activeTab: MENU_TABS.MON,
        ui1Focus: MENU_TABS.MON,
        bagIndex: 2,
        monIndex: 3
      }
    };
    const next = reduceGameState(initial, {
      type: DOMAIN_ACTIONS.OPEN_TAB,
      tab: MENU_TABS.MAP
    });

    expect(next.menu.activeTab).toBe(MENU_TABS.MAP);
    expect(next.menu.ui1Focus).toBe(MENU_TABS.MON);
    expect(next.menu.bagIndex).toBe(2);
    expect(next.menu.monIndex).toBe(3);
  });

  it('ui2 map cursor moves inside MAP tab', () => {
    const initial = createInitialState('ui2');
    const next = reduceGameState(initial, {
      type: DOMAIN_ACTIONS.SELECT_ITEM,
      direction: 'right'
    });

    expect(next.menu.activeTab).toBe(MENU_TABS.MAP);
    expect(next.menu.mapCursor.x).toBe(initial.menu.mapCursor.x + 1);
  });

  it('ui2 switches tabs with OPEN_TAB', () => {
    const initial = createInitialState('ui2');
    const next = reduceGameState(initial, {
      type: DOMAIN_ACTIONS.OPEN_TAB,
      tab: MENU_TABS.MON
    });

    expect(next.menu.activeTab).toBe(MENU_TABS.MON);
  });

  it('starts with cutscene lock and boat approach active', () => {
    const initial = createInitialState('ui1');

    expect(initial.playerLocked).toBe(true);
    expect(initial.overworld.cutscene.active).toBe(true);
    expect(initial.overworld.entities.boat.y).toBe(26);
    expect(initial.interactionIndicator).toBeNull();
  });

  it('moves the boat every two ticks during intro cutscene', () => {
    const initial = createInitialState('ui1');
    const tick1 = reduceGameState(initial, { type: DOMAIN_ACTIONS.TICK });
    const tick2 = reduceGameState(tick1, { type: DOMAIN_ACTIONS.TICK });

    expect(tick1.overworld.entities.boat.y).toBe(26);
    expect(tick2.overworld.entities.boat.y).toBe(25);
    expect(tick2.player.y).toBe(25);
  });

  it('docks the boat after the cutscene route and waits for A to disembark', () => {
    const initial = createInitialState('ui1');
    const dockResult = runUntilDocked(initial);
    const docked = dockResult.state;

    expect(docked.overworld.cutscene.active).toBe(false);
    expect(dockResult.ticks).toBe(26);
    expect(docked.overworld.entities.boat.y).toBe(13);
    expect(docked.player.x).toBe(15);
    expect(docked.player.y).toBe(13);
    expect(docked.playerLocked).toBe(true);
    expect(docked.interactionPrompt).toBe('A DISEMBARK');
    expect(docked.interactionIndicator).toEqual({
      spriteId: 'pressA16b',
      x: 15,
      y: 12
    });
  });

  it('keeps movement blocked while player is on the boat after docking', () => {
    const initial = createInitialState('ui1');
    const docked = runUntilDocked(initial).state;
    const moved = reduceGameState(docked, {
      type: DOMAIN_ACTIONS.MOVE,
      direction: 'up'
    });

    expect(moved.player.x).toBe(docked.player.x);
    expect(moved.player.y).toBe(docked.player.y);
    expect(moved.message).toBe('ON BOAT');
  });

  it('A disembarks when mounted and boards again when adjacent', () => {
    const initial = createInitialState('ui1');
    const docked = runUntilDocked(initial).state;
    const disembarked = reduceGameState(docked, { type: DOMAIN_ACTIONS.CONFIRM });

    expect(disembarked.player.x).toBe(15);
    expect(disembarked.player.y).toBe(12);
    expect(disembarked.playerLocked).toBe(false);
    expect(disembarked.overworld.playerMountedEntityId).toBeNull();
    expect(disembarked.interactionPrompt).toBe('A BOARD');

    const boardedAgain = reduceGameState(disembarked, { type: DOMAIN_ACTIONS.CONFIRM });
    expect(boardedAgain.player.x).toBe(15);
    expect(boardedAgain.player.y).toBe(13);
    expect(boardedAgain.overworld.playerMountedEntityId).toBe('boat');
    expect(boardedAgain.playerLocked).toBe(true);
  });

  it('returns no interaction when A is pressed far from interactables', () => {
    const initial = createInitialState('ui1');
    const docked = runUntilDocked(initial).state;
    const disembarked = reduceGameState(docked, { type: DOMAIN_ACTIONS.CONFIRM });

    const farState = {
      ...disembarked,
      player: {
        ...disembarked.player,
        x: 0,
        y: 0
      }
    };
    const next = reduceGameState(farState, { type: DOMAIN_ACTIONS.CONFIRM });
    expect(next.message).toBe('NO INTERACTION');
  });
});
