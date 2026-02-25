import { MENU_TABS } from './actions.js';

export const LOGICAL_WIDTH = 160;
export const LOGICAL_HEIGHT = 144;

export const TILE_SIZE_UI = 8;
export const TILE_SIZE_WORLD = 16;

export const WORLD_COLS = LOGICAL_WIDTH / TILE_SIZE_WORLD;
export const WORLD_ROWS = LOGICAL_HEIGHT / TILE_SIZE_WORLD;

export const MENU_WIDTH = 160;
export const MENU_HEIGHT = 80;

const DEFAULT_BAG_ITEMS = ['POTION', 'ANTIDOTE', 'ROPE', 'ETHER'];
const DEFAULT_MONS = ['MON-01', 'MON-02', 'MON-03', 'MON-04'];

export function createInitialState(mode) {
  return {
    mode,
    frame: 0,
    world: {
      cols: WORLD_COLS,
      rows: WORLD_ROWS,
      name: 'DEMO FIELD'
    },
    player: {
      x: 4,
      y: 3,
      direction: 'down',
      animFrame: 0
    },
    menu: {
      activeTab: MENU_TABS.MAP,
      ui1Focus: MENU_TABS.BAG,
      bagIndex: 0,
      monIndex: 0,
      mapCursor: { x: 4, y: 3 },
      bagItems: [...DEFAULT_BAG_ITEMS],
      mons: [...DEFAULT_MONS]
    },
    message: mode === 'ui1' ? 'UI1 READY' : 'UI2 READY'
  };
}
