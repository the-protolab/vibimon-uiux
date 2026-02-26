import { getBlockedTiles } from '../../core/world.js';
import { getSeaTiles } from '../../overworld/component.js';

export const PALETTE = {
  black: '#0f0f0f',
  dark: '#383838',
  mid: '#7a7a7a',
  light: '#b8b8b8',
  white: '#e8e8e8'
};

const FONT = {
  A: ['01110', '10001', '11111', '10001', '10001'],
  B: ['11110', '10001', '11110', '10001', '11110'],
  C: ['01111', '10000', '10000', '10000', '01111'],
  D: ['11110', '10001', '10001', '10001', '11110'],
  E: ['11111', '10000', '11110', '10000', '11111'],
  F: ['11111', '10000', '11110', '10000', '10000'],
  G: ['01111', '10000', '10111', '10001', '01111'],
  H: ['10001', '10001', '11111', '10001', '10001'],
  I: ['11111', '00100', '00100', '00100', '11111'],
  J: ['00001', '00001', '00001', '10001', '01110'],
  K: ['10001', '10010', '11100', '10010', '10001'],
  L: ['10000', '10000', '10000', '10000', '11111'],
  M: ['10001', '11011', '10101', '10001', '10001'],
  N: ['10001', '11001', '10101', '10011', '10001'],
  O: ['01110', '10001', '10001', '10001', '01110'],
  P: ['11110', '10001', '11110', '10000', '10000'],
  Q: ['01110', '10001', '10001', '10011', '01111'],
  R: ['11110', '10001', '11110', '10010', '10001'],
  S: ['01111', '10000', '01110', '00001', '11110'],
  T: ['11111', '00100', '00100', '00100', '00100'],
  U: ['10001', '10001', '10001', '10001', '01110'],
  V: ['10001', '10001', '10001', '01010', '00100'],
  W: ['10001', '10001', '10101', '11011', '10001'],
  X: ['10001', '01010', '00100', '01010', '10001'],
  Y: ['10001', '01010', '00100', '00100', '00100'],
  Z: ['11111', '00010', '00100', '01000', '11111'],
  '0': ['01110', '10011', '10101', '11001', '01110'],
  '1': ['00100', '01100', '00100', '00100', '01110'],
  '2': ['01110', '10001', '00010', '00100', '11111'],
  '3': ['11110', '00001', '00110', '00001', '11110'],
  '4': ['00010', '00110', '01010', '11111', '00010'],
  '5': ['11111', '10000', '11110', '00001', '11110'],
  '6': ['01110', '10000', '11110', '10001', '01110'],
  '7': ['11111', '00001', '00010', '00100', '00100'],
  '8': ['01110', '10001', '01110', '10001', '01110'],
  '9': ['01110', '10001', '01111', '00001', '01110'],
  '-': ['00000', '00000', '11111', '00000', '00000'],
  '.': ['00000', '00000', '00000', '01100', '01100'],
  ':': ['00000', '01100', '00000', '01100', '00000'],
  ',': ['00000', '00000', '00000', '01100', '00100'],
  ' ': ['00000', '00000', '00000', '00000', '00000']
};

function drawGlyph(ctx, glyph, x, y, color) {
  ctx.fillStyle = color;

  for (let row = 0; row < glyph.length; row += 1) {
    const line = glyph[row];
    for (let col = 0; col < line.length; col += 1) {
      if (line[col] === '1') {
        ctx.fillRect(x + 1 + col, y + 1 + row, 1, 1);
      }
    }
  }
}

export function drawText(ctx, text, x, y, color = PALETTE.dark) {
  const lines = text.toUpperCase().split('\n');

  for (let lineIndex = 0; lineIndex < lines.length; lineIndex += 1) {
    const line = lines[lineIndex];
    for (let i = 0; i < line.length; i += 1) {
      const glyph = FONT[line[i]] || FONT[' '];
      drawGlyph(ctx, glyph, x + i * 8, y + lineIndex * 8, color);
    }
  }
}

export function drawBox(ctx, x, y, width, height, options = {}) {
  const fill = options.fill || PALETTE.light;
  const border = options.border || PALETTE.dark;

  ctx.fillStyle = fill;
  ctx.fillRect(x, y, width, height);

  ctx.strokeStyle = border;
  ctx.lineWidth = 1;
  ctx.strokeRect(x + 0.5, y + 0.5, width - 1, height - 1);
}

export function drawTilePattern(ctx, x, y, cols, rows, tileSize = 8) {
  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      const tone = (row + col) % 2 === 0 ? PALETTE.white : '#d8d8d8';
      ctx.fillStyle = tone;
      ctx.fillRect(x + col * tileSize, y + row * tileSize, tileSize, tileSize);
    }
  }
}

export function drawMiniMap(ctx, x, y, width, height, world, player, cursor, overworldState, options = {}) {
  const blocked = getBlockedTiles(overworldState);
  const seaTiles = getSeaTiles(overworldState);
  const showBorder = options.showBorder ?? true;
  const entities = Object.values(overworldState?.entities || {});

  function getCellRect(col, row) {
    const x0 = x + Math.floor((col * width) / world.cols);
    const x1 = x + Math.floor(((col + 1) * width) / world.cols);
    const y0 = y + Math.floor((row * height) / world.rows);
    const y1 = y + Math.floor(((row + 1) * height) / world.rows);

    return {
      x: x0,
      y: y0,
      width: Math.max(1, x1 - x0),
      height: Math.max(1, y1 - y0)
    };
  }

  for (let row = 0; row < world.rows; row += 1) {
    for (let col = 0; col < world.cols; col += 1) {
      const key = `${col},${row}`;
      const fill = seaTiles.has(key) ? '#c7c7c7' : blocked.has(key) ? '#b5b5b5' : '#d8d8d8';
      const rect = getCellRect(col, row);
      ctx.fillStyle = fill;
      ctx.fillRect(rect.x, rect.y, rect.width, rect.height);
    }
  }

  for (const entity of entities) {
    if (!entity || (entity.kind !== 'item' && entity.kind !== 'monster')) {
      continue;
    }

    const rect = getCellRect(entity.x, entity.y);
    const insetX = rect.width > 2 ? 1 : 0;
    const insetY = rect.height > 2 ? 1 : 0;

    ctx.fillStyle = entity.kind === 'monster' ? '#222222' : '#888888';
    ctx.fillRect(
      rect.x + insetX,
      rect.y + insetY,
      Math.max(1, rect.width - insetX * 2),
      Math.max(1, rect.height - insetY * 2)
    );
  }

  if (showBorder) {
    ctx.strokeStyle = PALETTE.black;
    ctx.lineWidth = 1;
    ctx.strokeRect(x + 0.5, y + 0.5, width - 1, height - 1);
  }

  if (cursor) {
    const rect = getCellRect(cursor.x, cursor.y);
    ctx.strokeStyle = PALETTE.dark;
    ctx.strokeRect(rect.x + 0.5, rect.y + 0.5, Math.max(1, rect.width - 1), Math.max(1, rect.height - 1));
  }

  const playerRect = getCellRect(player.x, player.y);
  const insetX = playerRect.width > 2 ? 1 : 0;
  const insetY = playerRect.height > 2 ? 1 : 0;

  ctx.fillStyle = PALETTE.black;
  ctx.fillRect(
    playerRect.x + insetX,
    playerRect.y + insetY,
    Math.max(1, playerRect.width - insetX * 2),
    Math.max(1, playerRect.height - insetY * 2)
  );
}
