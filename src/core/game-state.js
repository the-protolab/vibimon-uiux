import { createOverworldComponent, syncOverworldDerivedState } from '../overworld/component.js';
import { MENU_TABS } from './actions.js';

export const LOGICAL_WIDTH = 160;
export const LOGICAL_HEIGHT = 144;

export const TILE_SIZE_UI = 8;
export const TILE_SIZE_WORLD = 16;

export const VIEWPORT_COLS = LOGICAL_WIDTH / TILE_SIZE_WORLD;
export const VIEWPORT_ROWS = LOGICAL_HEIGHT / TILE_SIZE_WORLD;
export const WORLD_BLOCK_COLS = 3;
export const WORLD_BLOCK_ROWS = 3;
export const WORLD_COLS = VIEWPORT_COLS * WORLD_BLOCK_COLS;
export const WORLD_ROWS = VIEWPORT_ROWS * WORLD_BLOCK_ROWS;

export const MENU_WIDTH = 160;
export const MENU_HEIGHT = 80;

const DEFAULT_BAG_ITEMS = ['POTION', 'ANTIDOTE', 'ROPE', 'ETHER'];
const DEFAULT_MONS = ['MON-01', 'MON-02', 'MON-03', 'MON-04'];

export function createInitialState(mode, options = {}) {
  const overworldComponent = createOverworldComponent({
    viewportCols: VIEWPORT_COLS,
    viewportRows: VIEWPORT_ROWS,
    ...options.overworldConfig
  });
  const overworld = overworldComponent.buildInitialOverworldState();
  const worldCols = overworld.config.baseBlockCols * overworld.config.blockGridCols;
  const worldRows = overworld.config.baseBlockRows * overworld.config.blockGridRows;
  const mountedEntity = overworld.playerMountedEntityId ? overworld.entities[overworld.playerMountedEntityId] : null;
  const playerStart = mountedEntity || overworld.spawnPoint;
  const initialMessage = overworld.cutscene.active ? 'BOAT APPROACHING' : mode === 'ui1' ? 'UI1 READY' : 'UI2 READY';

  const initialState = {
    mode,
    frame: 0,
    world: {
      cols: worldCols,
      rows: worldRows,
      name: 'OVERWORLD 3X3'
    },
    player: {
      x: playerStart.x,
      y: playerStart.y,
      direction: 'up',
      animFrame: 0
    },
    menu: {
      activeTab: MENU_TABS.MAP,
      ui1Focus: MENU_TABS.BAG,
      bagIndex: 0,
      monIndex: 0,
      mapCursor: { x: playerStart.x, y: playerStart.y },
      bagItems: [...DEFAULT_BAG_ITEMS],
      mons: [...DEFAULT_MONS]
    },
    overworld,
    camera: {
      x: 0,
      y: 0
    },
    interactionPrompt: null,
    interactionIndicator: null,
    playerLocked: false,
    message: initialMessage
  };

  return syncOverworldDerivedState(initialState, { syncCursorWithPlayer: true });
}
