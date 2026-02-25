import { describe, expect, it } from 'vitest';
import { isAligned, snapToGrid, toPixel, toTile } from '../src/core/grid.js';

describe('grid helpers', () => {
  it('snaps values to the nearest grid', () => {
    expect(snapToGrid(15, 8)).toBe(16);
    expect(snapToGrid(17, 8)).toBe(16);
    expect(snapToGrid(31, 16)).toBe(32);
  });

  it('checks alignment to 8 and 16 grids', () => {
    expect(isAligned(24, 8)).toBe(true);
    expect(isAligned(26, 8)).toBe(false);
    expect(isAligned(64, 16)).toBe(true);
    expect(isAligned(72, 16)).toBe(false);
  });

  it('converts between tiles and pixels', () => {
    expect(toTile(47, 16)).toBe(2);
    expect(toPixel(3, 16)).toBe(48);
  });
});
