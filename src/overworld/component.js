import { clamp } from '../core/grid.js';

const DEFAULT_BASE_BLOCKED_TILES = [
  '2,1',
  '3,1',
  '6,2',
  '6,3',
  '1,4',
  '8,4',
  '3,6',
  '7,7',
  '5,8'
];

const DEFAULT_SPAWN_LEGEND = {
  empty: 0,
  item: 1,
  monster: 2
};

const DEFAULT_MONSTER_DEFAULTS = {
  id: 'wild-01',
  name: 'WILD-01',
  level: 5,
  mapIconSpriteId: 'monIcon',
  detailSpriteId: 'fightMonster1'
};

const DEFAULT_MON_SLOTS = 4;

function toTileKey(x, y) {
  return `${x},${y}`;
}

function toTileSet(tiles) {
  return new Set(tiles);
}

function createEmptyEntityGrid(cols, rows) {
  return Array.from({ length: rows }, () => Array(cols).fill(0));
}

function normalizeSpawnLegend(spawnLegend = {}) {
  const parseCode = (value, fallback) => {
    const parsed = Number.parseInt(value, 10);
    return Number.isNaN(parsed) ? fallback : parsed;
  };

  return {
    empty: parseCode(spawnLegend.empty, DEFAULT_SPAWN_LEGEND.empty),
    item: parseCode(spawnLegend.item, DEFAULT_SPAWN_LEGEND.item),
    monster: parseCode(spawnLegend.monster, DEFAULT_SPAWN_LEGEND.monster)
  };
}

function normalizeMonsterDefaults(monsterDefaults = {}) {
  const parsedLevel = Number.parseInt(monsterDefaults.level, 10);

  return {
    id: String(monsterDefaults.id || DEFAULT_MONSTER_DEFAULTS.id),
    name: String(monsterDefaults.name || DEFAULT_MONSTER_DEFAULTS.name),
    level: Number.isNaN(parsedLevel) ? DEFAULT_MONSTER_DEFAULTS.level : parsedLevel,
    mapIconSpriteId: String(monsterDefaults.mapIconSpriteId || DEFAULT_MONSTER_DEFAULTS.mapIconSpriteId),
    detailSpriteId: String(monsterDefaults.detailSpriteId || DEFAULT_MONSTER_DEFAULTS.detailSpriteId)
  };
}

function normalizeEntityGrid(entityGrid, cols, rows, fallbackGrid) {
  if (entityGrid == null) {
    return fallbackGrid;
  }

  if (!Array.isArray(entityGrid) || entityGrid.length !== rows) {
    return createEmptyEntityGrid(cols, rows);
  }

  const normalized = [];
  for (let row = 0; row < rows; row += 1) {
    const rawRow = entityGrid[row];
    if (!Array.isArray(rawRow) || rawRow.length !== cols) {
      return createEmptyEntityGrid(cols, rows);
    }

    const nextRow = [];
    for (let col = 0; col < cols; col += 1) {
      const parsed = Number.parseInt(rawRow[col], 10);
      nextRow.push(Number.isNaN(parsed) ? DEFAULT_SPAWN_LEGEND.empty : parsed);
    }
    normalized.push(nextRow);
  }

  return normalized;
}

function buildDefaultEntityGrid(cols, rows, boat) {
  const grid = createEmptyEntityGrid(cols, rows);
  const tileY = boat.disembark.y;
  const candidates = [
    boat.disembark.x - 2,
    boat.disembark.x + 2,
    boat.disembark.x - 1,
    boat.disembark.x + 1,
    boat.disembark.x
  ];

  for (const tileX of candidates) {
    if (tileX >= 0 && tileY >= 0 && tileX < cols && tileY < rows) {
      grid[tileY][tileX] = DEFAULT_SPAWN_LEGEND.monster;
      break;
    }
  }

  return grid;
}

function buildMonsterProfile(monsterDefaults, index) {
  const suffix = String(index).padStart(2, '0');
  return {
    id: `${monsterDefaults.id}-${suffix}`,
    name: monsterDefaults.name,
    level: monsterDefaults.level,
    mapIconSpriteId: monsterDefaults.mapIconSpriteId,
    detailSpriteId: monsterDefaults.detailSpriteId
  };
}

function buildGridEntities(entityGrid, normalizedConfig) {
  const entities = {};
  const interactions = {};
  let monsterCount = 0;
  let itemCount = 0;

  for (let row = 0; row < entityGrid.length; row += 1) {
    for (let col = 0; col < entityGrid[row].length; col += 1) {
      const code = entityGrid[row][col];

      if (code === normalizedConfig.spawnLegend.monster) {
        monsterCount += 1;
        const entityId = `monster_${monsterCount}`;
        entities[entityId] = {
          id: entityId,
          kind: 'monster',
          x: col,
          y: row,
          monster: buildMonsterProfile(normalizedConfig.monsterDefaults, monsterCount)
        };
        interactions[entityId] = {
          range: 'touch',
          actions: ['capture'],
          prompts: {
            capture: 'A CAPTURE'
          },
          indicators: {
            capture: {
              spriteId: 'pressA16b',
              anchor: 'entity',
              offsetX: 0,
              offsetY: -1
            }
          }
        };
        continue;
      }

      if (code === normalizedConfig.spawnLegend.item) {
        itemCount += 1;
        const entityId = `item_${itemCount}`;
        entities[entityId] = {
          id: entityId,
          kind: 'item',
          x: col,
          y: row,
          reserved: true
        };
      }
    }
  }

  return {
    entities,
    interactions
  };
}

function normalizeMonSlots(mons) {
  const slots = Array.from({ length: DEFAULT_MON_SLOTS }, (_, index) => mons?.[index] || null);
  return slots;
}

function normalizeConfig(config = {}) {
  const baseBlockCols = config.baseBlockCols ?? 10;
  const baseBlockRows = config.baseBlockRows ?? 9;
  const blockGridCols = config.blockGridCols ?? 3;
  const blockGridRows = config.blockGridRows ?? 3;

  const spawnBlock = config.spawnBlock || {
    col: Math.floor(blockGridCols / 2),
    row: blockGridRows - 1
  };

  const lowerHalfStartY = baseBlockRows - Math.ceil(baseBlockRows / 2);
  const defaultSeaZones = [
    {
      blockOffsetCol: 0,
      blockOffsetRow: 0,
      x: 0,
      y: 0,
      width: baseBlockCols,
      height: baseBlockRows
    },
    {
      blockOffsetCol: 0,
      blockOffsetRow: -1,
      x: 0,
      y: lowerHalfStartY,
      width: baseBlockCols,
      height: Math.ceil(baseBlockRows / 2)
    }
  ];
  const seaZones = Array.isArray(config.seaZones)
    ? config.seaZones
    : config.seaRect
      ? [
          {
            blockOffsetCol: 0,
            blockOffsetRow: 0,
            ...config.seaRect
          }
        ]
      : defaultSeaZones;

  const cutsceneConfig = config.cutscene || {};
  const boatStartLocal = cutsceneConfig.boatStartLocal || {
    x: Math.floor(baseBlockCols / 2),
    y: baseBlockRows - 1
  };
  const boatDockLocal = cutsceneConfig.boatDockLocal || {
    x: boatStartLocal.x,
    y: -Math.ceil(baseBlockRows / 2)
  };

  return {
    baseBlockCols,
    baseBlockRows,
    blockGridCols,
    blockGridRows,
    viewportCols: config.viewportCols ?? baseBlockCols,
    viewportRows: config.viewportRows ?? baseBlockRows,
    spawnBlock,
    baseBlockedTiles: config.baseBlockedTiles || DEFAULT_BASE_BLOCKED_TILES,
    spawnLegend: normalizeSpawnLegend(config.spawnLegend),
    monsterDefaults: normalizeMonsterDefaults(config.monsterDefaults),
    entityGrid: config.entityGrid || null,
    seaZones,
    cutscene: {
      stepIntervalTicks: cutsceneConfig.stepIntervalTicks ?? 2,
      boatStartLocal,
      boatDockLocal,
      activeAtStart: cutsceneConfig.activeAtStart ?? true
    }
  };
}

function getSpawnOrigin(normalizedConfig) {
  return {
    x: normalizedConfig.spawnBlock.col * normalizedConfig.baseBlockCols,
    y: normalizedConfig.spawnBlock.row * normalizedConfig.baseBlockRows
  };
}

function buildReplicatedTiles(baseTiles, normalizedConfig) {
  const keys = [];

  for (let gridRow = 0; gridRow < normalizedConfig.blockGridRows; gridRow += 1) {
    for (let gridCol = 0; gridCol < normalizedConfig.blockGridCols; gridCol += 1) {
      const offsetX = gridCol * normalizedConfig.baseBlockCols;
      const offsetY = gridRow * normalizedConfig.baseBlockRows;

      for (const tile of baseTiles) {
        const [rawX, rawY] = tile.split(',');
        const localX = Number.parseInt(rawX, 10);
        const localY = Number.parseInt(rawY, 10);

        if (Number.isNaN(localX) || Number.isNaN(localY)) {
          continue;
        }

        keys.push(toTileKey(offsetX + localX, offsetY + localY));
      }
    }
  }

  return keys;
}

function buildSeaTiles(normalizedConfig, spawnOrigin) {
  const keys = [];
  const worldCols = normalizedConfig.baseBlockCols * normalizedConfig.blockGridCols;
  const worldRows = normalizedConfig.baseBlockRows * normalizedConfig.blockGridRows;

  for (const zone of normalizedConfig.seaZones) {
    const blockOffsetCol = zone.blockOffsetCol || 0;
    const blockOffsetRow = zone.blockOffsetRow || 0;
    const zoneWidth = zone.width || 0;
    const zoneHeight = zone.height || 0;
    const zoneX = zone.x || 0;
    const zoneY = zone.y || 0;

    const blockOriginX = spawnOrigin.x + blockOffsetCol * normalizedConfig.baseBlockCols;
    const blockOriginY = spawnOrigin.y + blockOffsetRow * normalizedConfig.baseBlockRows;

    for (let y = 0; y < zoneHeight; y += 1) {
      for (let x = 0; x < zoneWidth; x += 1) {
        const tileX = blockOriginX + zoneX + x;
        const tileY = blockOriginY + zoneY + y;
        if (tileX < 0 || tileY < 0 || tileX >= worldCols || tileY >= worldRows) {
          continue;
        }

        keys.push(toTileKey(tileX, tileY));
      }
    }
  }

  return keys;
}

function createBoatEntity(normalizedConfig, spawnOrigin) {
  const startX = spawnOrigin.x + normalizedConfig.cutscene.boatStartLocal.x;
  const startY = spawnOrigin.y + normalizedConfig.cutscene.boatStartLocal.y;
  const dockX = spawnOrigin.x + normalizedConfig.cutscene.boatDockLocal.x;
  const dockY = spawnOrigin.y + normalizedConfig.cutscene.boatDockLocal.y;

  return {
    id: 'boat',
    kind: 'boat',
    x: startX,
    y: startY,
    spriteOffsetY: -8,
    dock: { x: dockX, y: dockY },
    disembark: { x: dockX, y: dockY - 1 }
  };
}

function getOverworldState(stateOrOverworld) {
  if (!stateOrOverworld) {
    return null;
  }

  if (stateOrOverworld.overworld) {
    return stateOrOverworld.overworld;
  }

  return stateOrOverworld;
}

function getInteractionRange(definition) {
  return definition?.range || 'touch';
}

function isTileInInteractionRange(a, b, range) {
  const distance = Math.abs(a.x - b.x) + Math.abs(a.y - b.y);

  if (range === 'same-tile') {
    return distance === 0;
  }

  return distance <= 1;
}

function getEntity(state, entityId) {
  return state.overworld.entities?.[entityId] || null;
}

function pickInteractionAction(state, entityId, definition) {
  const actions = definition?.actions || [];
  if (actions.length === 0) {
    return null;
  }

  if (state.overworld.playerMountedEntityId === entityId && actions.includes('disembark')) {
    return 'disembark';
  }

  if (!state.overworld.playerMountedEntityId && actions.includes('board')) {
    return 'board';
  }

  return actions[0] || null;
}

function findInteractionCandidate(state) {
  const interactionEntries = Object.entries(state.overworld.interactions || {});

  for (const [entityId, definition] of interactionEntries) {
    const entity = getEntity(state, entityId);
    if (!entity) {
      continue;
    }

    const range = getInteractionRange(definition);
    const mountedOnEntity = state.overworld.playerMountedEntityId === entityId;
    if (!mountedOnEntity && !isTileInInteractionRange(state.player, entity, range)) {
      continue;
    }

    const action = pickInteractionAction(state, entityId, definition);
    if (!action) {
      continue;
    }

    return {
      entityId,
      entity,
      definition,
      action
    };
  }

  return null;
}

function withEntity(overworld, entityId, patch) {
  return {
    ...overworld,
    entities: {
      ...overworld.entities,
      [entityId]: {
        ...overworld.entities[entityId],
        ...patch
      }
    }
  };
}

function isPlayerLocked(overworld) {
  return Boolean(overworld.cutscene?.active) || Boolean(overworld.playerMountedEntityId);
}

function directionToDelta(direction) {
  switch (direction) {
    case 'up':
      return { dx: 0, dy: -1 };
    case 'down':
      return { dx: 0, dy: 1 };
    case 'left':
      return { dx: -1, dy: 0 };
    case 'right':
      return { dx: 1, dy: 0 };
    default:
      return { dx: 0, dy: 0 };
  }
}

function inBounds(world, x, y) {
  return x >= 0 && y >= 0 && x < world.cols && y < world.rows;
}

function resolveBoardInteraction(state, candidate) {
  const { entityId, entity } = candidate;

  if (state.overworld.playerMountedEntityId) {
    return {
      ...state,
      message: 'ALREADY RIDING'
    };
  }

  const nextOverworld = {
    ...state.overworld,
    playerMountedEntityId: entityId
  };

  return {
    ...state,
    overworld: nextOverworld,
    player: {
      ...state.player,
      x: entity.x,
      y: entity.y,
      direction: 'up',
      animFrame: (state.player.animFrame + 1) % 4
    },
    message: `BOARD ${entity.kind.toUpperCase()}`
  };
}

function resolveDisembarkInteraction(state, candidate) {
  const { entityId, entity } = candidate;

  if (state.overworld.playerMountedEntityId !== entityId) {
    return {
      ...state,
      message: 'NOT RIDING'
    };
  }

  const target = entity.disembark;
  const blockedTiles = getBlockedTiles(state);

  if (!inBounds(state.world, target.x, target.y) || blockedTiles.has(toTileKey(target.x, target.y))) {
    return {
      ...state,
      message: 'CANNOT DISEMBARK'
    };
  }

  return {
    ...state,
    overworld: {
      ...state.overworld,
      playerMountedEntityId: null
    },
    player: {
      ...state.player,
      x: target.x,
      y: target.y,
      direction: 'up',
      animFrame: (state.player.animFrame + 1) % 4
    },
    message: 'DISEMBARKED'
  };
}

function removeEntityAndInteraction(overworld, entityId) {
  if (!entityId) {
    return overworld;
  }

  const { [entityId]: removedEntity, ...remainingEntities } = overworld.entities || {};
  const { [entityId]: removedInteraction, ...remainingInteractions } = overworld.interactions || {};

  return {
    ...overworld,
    entities: removedEntity ? remainingEntities : overworld.entities,
    interactions: removedInteraction ? remainingInteractions : overworld.interactions
  };
}

function resolveCaptureInteraction(state, candidate) {
  if (state.overworld.playerMountedEntityId) {
    return {
      ...state,
      message: 'ON BOAT'
    };
  }

  const { entityId, entity } = candidate;
  const monster = entity?.monster;
  if (!monster) {
    return {
      ...state,
      message: 'NO MON DATA'
    };
  }

  const nextMons = normalizeMonSlots(state.menu.mons);
  const firstEmptyIndex = nextMons.findIndex((slot) => !slot);
  if (firstEmptyIndex === -1) {
    return {
      ...state,
      message: 'MON PARTY FULL'
    };
  }

  nextMons[firstEmptyIndex] = {
    ...monster
  };

  return {
    ...state,
    menu: {
      ...state.menu,
      mons: nextMons
    },
    overworld: removeEntityAndInteraction(state.overworld, entityId),
    message: `CAPTURED ${monster.name}`
  };
}

const INTERACTION_HANDLERS = {
  board: resolveBoardInteraction,
  disembark: resolveDisembarkInteraction,
  capture: resolveCaptureInteraction
};

export function computeCamera(world, anchor, viewport) {
  const maxX = Math.max(0, world.cols - viewport.cols);
  const maxY = Math.max(0, world.rows - viewport.rows);

  return {
    x: clamp(anchor.x - Math.floor(viewport.cols / 2), 0, maxX),
    y: clamp(anchor.y - Math.floor(viewport.rows / 2), 0, maxY)
  };
}

function getCameraAnchor(state) {
  const mountedEntityId = state.overworld.playerMountedEntityId;
  if (!mountedEntityId) {
    return state.player;
  }

  const mountedEntity = getEntity(state, mountedEntityId);
  if (!mountedEntity) {
    return state.player;
  }

  return {
    x: mountedEntity.x,
    y: mountedEntity.y
  };
}

function getViewport(overworld) {
  return {
    cols: overworld.config.viewportCols,
    rows: overworld.config.viewportRows
  };
}

function getInteractionPrompt(candidate) {
  if (!candidate) {
    return null;
  }

  const prompt = candidate.definition?.prompts?.[candidate.action];
  return prompt || 'A INTERACT';
}

function getInteractionIndicator(state, candidate) {
  if (!candidate) {
    return null;
  }

  const indicatorConfig = candidate.definition?.indicators?.[candidate.action];
  if (!indicatorConfig || !indicatorConfig.spriteId) {
    return null;
  }

  const anchor = indicatorConfig.anchor || 'entity';
  const anchorTile = anchor === 'player' ? state.player : candidate.entity;
  if (!anchorTile) {
    return null;
  }

  return {
    spriteId: indicatorConfig.spriteId,
    x: anchorTile.x + (indicatorConfig.offsetX ?? 0),
    y: anchorTile.y + (indicatorConfig.offsetY ?? -1)
  };
}

export function syncOverworldDerivedState(state, options = {}) {
  const syncCursorWithPlayer = options.syncCursorWithPlayer ?? false;
  const viewport = getViewport(state.overworld);
  const cameraAnchor = getCameraAnchor(state);
  const camera = computeCamera(state.world, cameraAnchor, viewport);
  const interactionCandidate = state.overworld.cutscene?.active ? null : findInteractionCandidate(state);

  const nextMenu = syncCursorWithPlayer
    ? {
        ...state.menu,
        mapCursor: {
          x: state.player.x,
          y: state.player.y
        }
      }
    : state.menu;

  return {
    ...state,
    menu: nextMenu,
    camera,
    playerLocked: isPlayerLocked(state.overworld),
    interactionPrompt: getInteractionPrompt(interactionCandidate),
    interactionIndicator: getInteractionIndicator(state, interactionCandidate)
  };
}

function buildInitialOverworldStateInternal(normalizedConfig) {
  const spawnOrigin = getSpawnOrigin(normalizedConfig);
  const worldCols = normalizedConfig.baseBlockCols * normalizedConfig.blockGridCols;
  const worldRows = normalizedConfig.baseBlockRows * normalizedConfig.blockGridRows;
  const replicatedBlockedTiles = buildReplicatedTiles(normalizedConfig.baseBlockedTiles, normalizedConfig);
  const seaTiles = buildSeaTiles(normalizedConfig, spawnOrigin);
  const blockedTileSet = toTileSet([...replicatedBlockedTiles, ...seaTiles]);
  const seaTileSet = toTileSet(seaTiles);
  const boat = createBoatEntity(normalizedConfig, spawnOrigin);
  const defaultEntityGrid = buildDefaultEntityGrid(worldCols, worldRows, boat);
  const entityGrid = normalizeEntityGrid(normalizedConfig.entityGrid, worldCols, worldRows, defaultEntityGrid);
  const gridEntities = buildGridEntities(entityGrid, normalizedConfig);
  const boatInteractions = {
    [boat.id]: {
      range: 'touch',
      actions: ['board', 'disembark'],
      prompts: {
        board: 'A BOARD',
        disembark: 'A DISEMBARK'
      },
      indicators: {
        disembark: {
          spriteId: 'pressA16b',
          anchor: 'entity',
          offsetX: 0,
          offsetY: -1
        }
      }
    }
  };

  return {
    config: normalizedConfig,
    spawnOrigin,
    spawnPoint: {
      x: boat.dock.x,
      y: boat.dock.y - 1
    },
    blockedTiles: Array.from(blockedTileSet),
    blockedTileSet,
    seaTiles,
    seaTileSet,
    entityGrid,
    entities: {
      [boat.id]: boat,
      ...gridEntities.entities
    },
    interactions: {
      ...boatInteractions,
      ...gridEntities.interactions
    },
    playerMountedEntityId: boat.id,
    cutscene: {
      id: 'intro_boat',
      entityId: boat.id,
      active: normalizedConfig.cutscene.activeAtStart,
      completed: !normalizedConfig.cutscene.activeAtStart,
      tick: 0,
      stepIntervalTicks: normalizedConfig.cutscene.stepIntervalTicks,
      target: {
        x: boat.dock.x,
        y: boat.dock.y
      }
    }
  };
}

export function buildInitialOverworldState(config = {}) {
  const normalizedConfig = normalizeConfig(config);
  return buildInitialOverworldStateInternal(normalizedConfig);
}

export function createOverworldComponent(config = {}) {
  const normalizedConfig = normalizeConfig(config);

  return {
    buildInitialOverworldState() {
      return buildInitialOverworldStateInternal(normalizedConfig);
    },
    advanceOverworldTick,
    resolveInteraction,
    canActorMove,
    getBlockedTiles
  };
}

export function getBlockedTiles(stateOrOverworld) {
  const overworld = getOverworldState(stateOrOverworld);
  if (!overworld) {
    return new Set();
  }

  if (overworld.blockedTileSet instanceof Set) {
    return overworld.blockedTileSet;
  }

  return toTileSet(overworld.blockedTiles || []);
}

export function getSeaTiles(stateOrOverworld) {
  const overworld = getOverworldState(stateOrOverworld);
  if (!overworld) {
    return new Set();
  }

  if (overworld.seaTileSet instanceof Set) {
    return overworld.seaTileSet;
  }

  return toTileSet(overworld.seaTiles || []);
}

export function canActorMove(state, direction) {
  if (!direction) {
    return {
      canMove: false,
      reason: 'NO_DIRECTION'
    };
  }

  if (state.overworld.cutscene?.active) {
    return {
      canMove: false,
      reason: 'LOCKED'
    };
  }

  if (state.overworld.playerMountedEntityId) {
    return {
      canMove: false,
      reason: 'MOUNTED'
    };
  }

  const { dx, dy } = directionToDelta(direction);
  const nextX = state.player.x + dx;
  const nextY = state.player.y + dy;

  if (!inBounds(state.world, nextX, nextY)) {
    return {
      canMove: false,
      reason: 'BOUNDS'
    };
  }

  const blockedTiles = getBlockedTiles(state);
  if (blockedTiles.has(toTileKey(nextX, nextY))) {
    return {
      canMove: false,
      reason: 'BLOCKED'
    };
  }

  return {
    canMove: true,
    nextX,
    nextY
  };
}

export function advanceOverworldTick(state) {
  const cutscene = state.overworld.cutscene;
  if (!cutscene?.active) {
    return syncOverworldDerivedState(state);
  }

  const nextTick = cutscene.tick + 1;
  const shouldAdvanceStep = nextTick % cutscene.stepIntervalTicks === 0;

  if (!shouldAdvanceStep) {
    return syncOverworldDerivedState({
      ...state,
      overworld: {
        ...state.overworld,
        cutscene: {
          ...cutscene,
          tick: nextTick
        }
      }
    });
  }

  const boat = getEntity(state, cutscene.entityId);
  if (!boat) {
    return syncOverworldDerivedState({
      ...state,
      overworld: {
        ...state.overworld,
        cutscene: {
          ...cutscene,
          active: false,
          completed: true,
          tick: nextTick
        }
      }
    });
  }

  const moveX = Math.sign(cutscene.target.x - boat.x);
  const moveY = Math.sign(cutscene.target.y - boat.y);
  const nextBoat = {
    x: boat.x + moveX,
    y: boat.y + moveY
  };

  const reachedTarget = nextBoat.x === cutscene.target.x && nextBoat.y === cutscene.target.y;

  let nextOverworld = withEntity(state.overworld, cutscene.entityId, nextBoat);
  nextOverworld = {
    ...nextOverworld,
    cutscene: {
      ...cutscene,
      tick: nextTick,
      active: !reachedTarget,
      completed: reachedTarget
    }
  };

  const nextPlayer = state.overworld.playerMountedEntityId
    ? {
        ...state.player,
        x: nextBoat.x,
        y: nextBoat.y
      }
    : state.player;

  const nextMessage = reachedTarget ? 'BOAT DOCKED' : state.message;

  return syncOverworldDerivedState(
    {
      ...state,
      player: nextPlayer,
      overworld: nextOverworld,
      message: nextMessage
    },
    {
      syncCursorWithPlayer: state.overworld.playerMountedEntityId === cutscene.entityId
    }
  );
}

export function resolveInteraction(state) {
  if (state.overworld.cutscene?.active) {
    return syncOverworldDerivedState({
      ...state,
      message: 'CUTSCENE'
    });
  }

  const candidate = findInteractionCandidate(state);
  if (!candidate) {
    return syncOverworldDerivedState({
      ...state,
      message: 'NO INTERACTION'
    });
  }

  const handler = INTERACTION_HANDLERS[candidate.action];
  if (!handler) {
    return syncOverworldDerivedState({
      ...state,
      message: 'NO HANDLER'
    });
  }

  const nextState = handler(state, candidate);
  const syncCursorWithPlayer = nextState.player.x !== state.player.x || nextState.player.y !== state.player.y;

  return syncOverworldDerivedState(nextState, { syncCursorWithPlayer });
}
