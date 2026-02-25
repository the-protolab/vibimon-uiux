import { describe, expect, it } from 'vitest';
import { DOMAIN_ACTIONS, MENU_TABS } from '../src/core/actions.js';
import { createInitialState } from '../src/core/game-state.js';
import { reduceGameState } from '../src/core/reducer.js';

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

  it('ui1 horizontal select updates focused list index', () => {
    const initial = createInitialState('ui1');
    const next = reduceGameState(initial, {
      type: DOMAIN_ACTIONS.SELECT_ITEM,
      direction: 'right'
    });

    expect(next.menu.bagIndex).toBe(1);
    expect(next.menu.monIndex).toBe(0);
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
});
