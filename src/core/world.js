import { clamp } from './grid.js';

const BLOCKED_TILES = new Set([
  '2,1',
  '3,1',
  '6,2',
  '6,3',
  '1,4',
  '8,4',
  '3,6',
  '7,7',
  '5,8'
]);

export function getBlockedTiles() {
  return BLOCKED_TILES;
}

export function isBlocked(x, y) {
  return BLOCKED_TILES.has(`${x},${y}`);
}

export function inBounds(world, x, y) {
  return x >= 0 && y >= 0 && x < world.cols && y < world.rows;
}

export function canMoveTo(world, x, y) {
  return inBounds(world, x, y) && !isBlocked(x, y);
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

export function movePlayer(world, player, direction) {
  const { dx, dy } = directionToDelta(direction);
  const nextX = player.x + dx;
  const nextY = player.y + dy;

  if (!canMoveTo(world, nextX, nextY)) {
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
