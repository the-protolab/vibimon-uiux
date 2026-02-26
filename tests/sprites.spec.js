import { describe, expect, it } from 'vitest';
import {
  buildSpriteSourceIndex,
  hydrateSpritePack,
  pickPlayerId,
  resolvePlayerIdFromSearch
} from '../src/render/sprites.js';

describe('player sprite pipeline', () => {
  it('resolves player id from query string', () => {
    expect(resolvePlayerIdFromSearch('?player=classic', 'default')).toBe('classic');
    expect(resolvePlayerIdFromSearch('?foo=bar', 'default')).toBe('default');
    expect(resolvePlayerIdFromSearch('?player=', 'default')).toBe('default');
  });

  it('picks fallback player when requested pack does not exist', () => {
    const sourceIndex = {
      default: { down: [{ frame: 0, src: '/default/down0.png' }] }
    };

    expect(pickPlayerId(sourceIndex, 'missing_pack', 'default')).toBe('default');
  });

  it('sorts frames numerically when building source index', () => {
    const sourceIndex = buildSpriteSourceIndex({
      '/repo/assets/players/default/walk_right_02.png': '/default/right2.png',
      '/repo/assets/players/default/walk_right_00.png': '/default/right0.png',
      '/repo/assets/players/default/walk_right_01.png': '/default/right1.png'
    });

    expect(sourceIndex.default.right.map((frame) => frame.frame)).toEqual([0, 1, 2]);
  });

  it('hydrates selected pack and flips right frames when left is missing', async () => {
    const sourceIndex = buildSpriteSourceIndex({
      '/repo/assets/players/default/walk_left_00.png': '/default/left0.png',
      '/repo/assets/players/default/walk_up_00.png': '/default/up0.png',
      '/repo/assets/players/default/walk_down_00.png': '/default/down0.png',
      '/repo/assets/players/default/walk_right_00.png': '/default/right0.png',
      '/repo/assets/players/classic/walk_right_02.png': '/classic/right2.png',
      '/repo/assets/players/classic/walk_right_00.png': '/classic/right0.png',
      '/repo/assets/players/classic/walk_right_01.png': '/classic/right1.png',
      '/repo/assets/players/classic/walk_down_00.png': '/classic/down0.png'
    });

    const sprites = await hydrateSpritePack(sourceIndex, {
      preferredPlayerId: 'classic',
      fallbackPlayerId: 'default',
      load: async (src) => src
    });

    expect(sprites.right.map((frame) => frame.image)).toEqual([
      '/classic/right0.png',
      '/classic/right1.png',
      '/classic/right2.png'
    ]);
    expect(sprites.left.map((frame) => frame.image)).toEqual([
      '/classic/right0.png',
      '/classic/right1.png',
      '/classic/right2.png'
    ]);
    expect(sprites.left.every((frame) => frame.flipX)).toBe(true);
    expect(sprites.up.map((frame) => frame.image)).toEqual(['/default/up0.png']);
    expect(sprites.down.map((frame) => frame.image)).toEqual(['/classic/down0.png']);
  });
});
