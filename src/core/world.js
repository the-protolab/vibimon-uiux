import { clamp } from './grid.js';

function toTileKey(x, y) {
  return `${x},${y}`;
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

function parseCanMoveArgs(overworldOrX, xOrY, maybeY) {
  if (typeof maybeY === 'number') {
    return {
      overworldState: overworldOrX,
      x: xOrY,
      y: maybeY
    };
  }

  return {
    overworldState: null,
    x: overworldOrX,
    y: xOrY
  };
}

function parseMovePlayerArgs(overworldOrPlayer, playerOrDirection, maybeDirection) {
  if (typeof maybeDirection === 'string') {
    return {
      overworldState: overworldOrPlayer,
      player: playerOrDirection,
      direction: maybeDirection
    };
  }

  return {
    overworldState: null,
    player: overworldOrPlayer,
    direction: playerOrDirection
  };
}

export function getBlockedTiles(stateOrOverworld) {
  const overworldState = getOverworldState(stateOrOverworld);
  if (!overworldState) {
    return new Set();
  }

  if (overworldState.blockedTileSet instanceof Set) {
    return overworldState.blockedTileSet;
  }

  return new Set(overworldState.blockedTiles || []);
}

export function isBlocked(overworldState, x, y) {
  return getBlockedTiles(overworldState).has(toTileKey(x, y));
}

export function inBounds(world, x, y) {
  return x >= 0 && y >= 0 && x < world.cols && y < world.rows;
}

export function canMoveTo(world, overworldOrX, xOrY, maybeY) {
  const { overworldState, x, y } = parseCanMoveArgs(overworldOrX, xOrY, maybeY);
  return inBounds(world, x, y) && !isBlocked(overworldState, x, y);
}

export function directionToDelta(direction) {
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

export function movePlayer(world, overworldOrPlayer, playerOrDirection, maybeDirection) {
  const { overworldState, player, direction } = parseMovePlayerArgs(overworldOrPlayer, playerOrDirection, maybeDirection);
  const { dx, dy } = directionToDelta(direction);
  const nextX = player.x + dx;
  const nextY = player.y + dy;

  if (!canMoveTo(world, overworldState, nextX, nextY)) {
    return {
      moved: false,
      player: {
        ...player,
        direction
      }
    };
  }

  return {
    moved: true,
    player: {
      ...player,
      x: nextX,
      y: nextY,
      direction,
      animFrame: (player.animFrame + 1) % 4
    }
  };
}

export function moveCursor(world, cursor, direction) {
  const { dx, dy } = directionToDelta(direction);
  return {
    x: clamp(cursor.x + dx, 0, world.cols - 1),
    y: clamp(cursor.y + dy, 0, world.rows - 1)
  };
}
