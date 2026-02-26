import { describe, expect, it } from 'vitest';
import { createInitialState } from '../src/core/game-state.js';
import { canMoveTo, movePlayer } from '../src/core/world.js';
import { computeCamera } from '../src/overworld/component.js';

describe('world movement', () => {
  it('creates the 3x3 overworld using the current block size', () => {
    const state = createInitialState('ui1');
    expect(state.world.cols).toBe(30);
    expect(state.world.rows).toBe(27);
  });

  it('replicates blocked tiles from the base block across every block in the 3x3 grid', () => {
    const state = createInitialState('ui1');

    expect(canMoveTo(state.world, state.overworld, 6, 2)).toBe(false);
    expect(canMoveTo(state.world, state.overworld, 16, 2)).toBe(false);
    expect(canMoveTo(state.world, state.overworld, 26, 20)).toBe(false);
  });

  it('blocks sea tiles on the lower half of the spawn block', () => {
    const state = createInitialState('ui1');

    expect(canMoveTo(state.world, state.overworld, 15, 18)).toBe(false);
    expect(canMoveTo(state.world, state.overworld, 15, 26)).toBe(false);
    expect(canMoveTo(state.world, state.overworld, 15, 13)).toBe(false);
    expect(canMoveTo(state.world, state.overworld, 15, 12)).toBe(true);
  });

  it('moves in 16px tile steps when destination is free', () => {
    const state = createInitialState('ui1');
    const player = { ...state.player, x: 14, y: 12, direction: 'right' };
    const result = movePlayer(state.world, state.overworld, player, 'right');

    expect(result.moved).toBe(true);
    expect(result.player.x).toBe(15);
    expect(result.player.y).toBe(12);
  });

  it('blocks movement into blocked tile', () => {
    const state = createInitialState('ui1');
    const blockedX = 16;
    const blockedY = 21;

    expect(canMoveTo(state.world, state.overworld, blockedX, blockedY)).toBe(false);

    const player = { ...state.player, x: 15, y: 21, direction: 'right' };
    const result = movePlayer(state.world, state.overworld, player, 'right');

    expect(result.moved).toBe(false);
    expect(result.player.x).toBe(15);
    expect(result.player.y).toBe(21);
  });

  it('clamps the camera at map bounds', () => {
    const world = { cols: 30, rows: 27 };
    const viewport = { cols: 10, rows: 9 };

    expect(computeCamera(world, { x: 0, y: 0 }, viewport)).toEqual({ x: 0, y: 0 });
    expect(computeCamera(world, { x: 29, y: 26 }, viewport)).toEqual({ x: 20, y: 18 });
    expect(computeCamera(world, { x: 15, y: 13 }, viewport)).toEqual({ x: 10, y: 9 });
  });

  it('spawns a default monster entity with contextual capture interaction', () => {
    const state = createInitialState('ui1');
    const monster = Object.values(state.overworld.entities).find((entity) => entity.kind === 'monster');

    expect(monster).toBeTruthy();
    expect(state.overworld.interactions[monster.id]).toMatchObject({
      actions: ['capture']
    });
  });

  it('uses an empty fallback grid when provided entity grid shape is invalid', () => {
    const state = createInitialState('ui1', {
      overworldConfig: {
        entityGrid: [[2]]
      }
    });

    const monster = Object.values(state.overworld.entities).find((entity) => entity.kind === 'monster');
    expect(monster).toBeFalsy();
  });

  it('builds item/monster entities from a valid global 30x27 entity grid', () => {
    const entityGrid = Array.from({ length: 27 }, () => Array(30).fill(0));
    entityGrid[5][7] = 1;
    entityGrid[6][8] = 2;

    const state = createInitialState('ui1', {
      overworldConfig: {
        entityGrid
      }
    });

    const item = Object.values(state.overworld.entities).find((entity) => entity.kind === 'item');
    const monster = Object.values(state.overworld.entities).find((entity) => entity.kind === 'monster');

    expect(item).toMatchObject({ x: 7, y: 5, reserved: true });
    expect(monster).toMatchObject({ x: 8, y: 6 });
    expect(state.overworld.interactions[item.id]).toBeUndefined();
    expect(state.overworld.interactions[monster.id]).toMatchObject({ actions: ['capture'] });
  });
});
