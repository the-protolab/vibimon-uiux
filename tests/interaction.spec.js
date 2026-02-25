import { describe, expect, it } from 'vitest';
import { INPUT_ACTIONS } from '../src/core/actions.js';
import { createInitialState } from '../src/core/game-state.js';
import { createUI1Skin } from '../src/ui/skin-ui1/interaction.js';
import { createUI2Skin } from '../src/ui/skin-ui2/interaction.js';

describe('skin input mapping', () => {
  it('ui1 maps keyboard arrows to menu navigation', () => {
    const state = createInitialState('ui1');
    const skin = createUI1Skin();

    const input = skin.mapInput({ kind: 'keyboard', code: 'ArrowUp' }, state);
    expect(input).toEqual([INPUT_ACTIONS.UP]);

    const domain = skin.mapInputToDomain(input[0], state);
    expect(domain[0]).toMatchObject({ type: 'SELECT_ITEM', direction: 'up' });
  });

  it('ui1 maps WASD to world move actions', () => {
    const state = createInitialState('ui1');
    const skin = createUI1Skin();

    const input = skin.mapInput({ kind: 'keyboard', code: 'KeyD' }, state);
    expect(input).toEqual([INPUT_ACTIONS.MOVE_RIGHT]);

    const domain = skin.mapInputToDomain(input[0], state);
    expect(domain[0]).toMatchObject({ type: 'MOVE', direction: 'right' });
  });

  it('ui2 maps tab hitboxes from menu canvas clicks', () => {
    const state = createInitialState('ui2');
    const skin = createUI2Skin();

    const bagInput = skin.mapInput({ kind: 'menu', x: 60, y: 68 }, state);
    expect(bagInput).toEqual([INPUT_ACTIONS.TAB_BAG]);

    const monInput = skin.mapInput({ kind: 'menu', x: 140, y: 68 }, state);
    expect(monInput).toEqual([INPUT_ACTIONS.TAB_MON]);
  });
});
