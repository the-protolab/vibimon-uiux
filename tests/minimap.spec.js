import { describe, expect, it } from 'vitest';
import { drawMiniMap } from '../src/ui/shared/primitives.js';

function createMockContext() {
  const fillRects = [];
  const strokeRects = [];

  return {
    fillStyle: '',
    strokeStyle: '',
    lineWidth: 1,
    fillRect(x, y, width, height) {
      fillRects.push({ x, y, width, height });
    },
    strokeRect(x, y, width, height) {
      strokeRects.push({ x, y, width, height });
    },
    get fillRects() {
      return fillRects;
    },
    get strokeRects() {
      return strokeRects;
    }
  };
}

function projectCellRect(x, y, width, height, world, col, row) {
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

describe('minimap geometry', () => {
  it('covers the full minimap area with projected cells and no zero-size tiles', () => {
    const ctx = createMockContext();
    const world = { cols: 30, rows: 27 };
    const player = { x: 0, y: 0 };
    const cursor = { x: 0, y: 0 };
    const originX = 10;
    const originY = 6;
    const width = 52;
    const height = 37;

    drawMiniMap(ctx, originX, originY, width, height, world, player, cursor, { blockedTileSet: new Set() });

    const tileCount = world.cols * world.rows;
    const tileRects = ctx.fillRects.slice(0, tileCount);

    expect(tileRects).toHaveLength(tileCount);
    expect(tileRects.every((rect) => rect.width > 0 && rect.height > 0)).toBe(true);

    const filledArea = tileRects.reduce((sum, rect) => sum + rect.width * rect.height, 0);
    expect(filledArea).toBe(width * height);

    const minX = Math.min(...tileRects.map((rect) => rect.x));
    const minY = Math.min(...tileRects.map((rect) => rect.y));
    const maxX = Math.max(...tileRects.map((rect) => rect.x + rect.width));
    const maxY = Math.max(...tileRects.map((rect) => rect.y + rect.height));

    expect(minX).toBe(originX);
    expect(minY).toBe(originY);
    expect(maxX).toBe(originX + width);
    expect(maxY).toBe(originY + height);
  });

  it('projects cursor and player using the same cell geometry', () => {
    const ctx = createMockContext();
    const world = { cols: 30, rows: 27 };
    const player = { x: 29, y: 26 };
    const cursor = { x: 29, y: 26 };
    const originX = 4;
    const originY = 8;
    const width = 52;
    const height = 37;

    drawMiniMap(ctx, originX, originY, width, height, world, player, cursor, { blockedTileSet: new Set() });

    const rect = projectCellRect(originX, originY, width, height, world, cursor.x, cursor.y);
    const borderRect = ctx.strokeRects[0];
    const cursorRect = ctx.strokeRects[1];
    const playerRect = ctx.fillRects[world.cols * world.rows];

    expect(borderRect).toEqual({
      x: originX + 0.5,
      y: originY + 0.5,
      width: width - 1,
      height: height - 1
    });

    expect(cursorRect).toEqual({
      x: rect.x + 0.5,
      y: rect.y + 0.5,
      width: Math.max(1, rect.width - 1),
      height: Math.max(1, rect.height - 1)
    });

    const insetX = rect.width > 2 ? 1 : 0;
    const insetY = rect.height > 2 ? 1 : 0;
    expect(playerRect).toEqual({
      x: rect.x + insetX,
      y: rect.y + insetY,
      width: Math.max(1, rect.width - insetX * 2),
      height: Math.max(1, rect.height - insetY * 2)
    });
  });
});
