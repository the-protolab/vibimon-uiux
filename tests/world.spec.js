import { describe, expect, it } from 'vitest';
import { createInitialState } from '../src/core/game-state.js';
import { canMoveTo, movePlayer } from '../src/core/world.js';

describe('world movement', () => {
  it('moves in 16px tile steps when destination is free', () => {
    const state = createInitialState('ui1');
    const result = movePlayer(state.world, state.player, 'right');

    expect(result.moved).toBe(true);
    expect(result.player.x).toBe(state.player.x + 1);
    expect(result.player.y).toBe(state.player.y);
  });

  it('blocks movement into blocked tile', () => {
    const state = createInitialState('ui1');
    const blockedX = 6;
    const blockedY = 2;

    expect(canMoveTo(state.world, blockedX, blockedY)).toBe(false);

    const player = { ...state.player, x: 5, y: 2, direction: 'right' };
    const result = movePlayer(state.world, player, 'right');

    expect(result.moved).toBe(false);
    expect(result.player.x).toBe(5);
    expect(result.player.y).toBe(2);
  });
});
