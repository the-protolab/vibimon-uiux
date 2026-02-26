import { describe, expect, it } from 'vitest';
import { DOMAIN_ACTIONS, INPUT_ACTIONS, MENU_TABS } from '../src/core/actions.js';
import { createInitialState } from '../src/core/game-state.js';
import { createUI1Skin } from '../src/ui/skin-ui1/interaction.js';
import { createUI2Skin } from '../src/ui/skin-ui2/interaction.js';
import { UI2_HITBOXES } from '../src/ui/skin-ui2/layout.js';

describe('skin input mapping', () => {
  it('ui1 maps keyboard arrows to world move while MAP viewport is active', () => {
    const state = createInitialState('ui1');
    const skin = createUI1Skin();

    const input = skin.mapInput({ kind: 'keyboard', code: 'ArrowRight' }, state);
    expect(input).toEqual([INPUT_ACTIONS.RIGHT]);

    const domain = skin.mapInputToDomain(input[0], state);
    expect(domain[0]).toMatchObject({ type: DOMAIN_ACTIONS.MOVE, direction: 'right' });
  });

  it('ui1 B toggles from MAP viewport to current UI focus', () => {
    const state = createInitialState('ui1');
    const skin = createUI1Skin();

    const input = skin.mapInput({ kind: 'keyboard', code: 'KeyX' }, state);
    expect(input).toEqual([INPUT_ACTIONS.B]);

    const domain = skin.mapInputToDomain(input[0], state);
    expect(domain[0]).toMatchObject({ type: DOMAIN_ACTIONS.OPEN_TAB, tab: MENU_TABS.BAG });
  });

  it('ui1 keyboard arrows map to SELECT_ITEM while BAG/MON viewport is active', () => {
    const initial = createInitialState('ui1');
    const state = {
      ...initial,
      menu: {
        ...initial.menu,
        activeTab: MENU_TABS.MON,
        ui1Focus: MENU_TABS.MON
      }
    };
    const skin = createUI1Skin();

    const input = skin.mapInput({ kind: 'keyboard', code: 'ArrowLeft' }, state);
    expect(input).toEqual([INPUT_ACTIONS.LEFT]);

    const domain = skin.mapInputToDomain(input[0], state);
    expect(domain[0]).toMatchObject({ type: DOMAIN_ACTIONS.SELECT_ITEM, direction: 'left' });
  });

  it('ui1 B toggles back to MAP when BAG/MON viewport is active', () => {
    const initial = createInitialState('ui1');
    const state = {
      ...initial,
      menu: {
        ...initial.menu,
        activeTab: MENU_TABS.BAG,
        ui1Focus: MENU_TABS.BAG
      }
    };
    const skin = createUI1Skin();

    const input = skin.mapInput({ kind: 'keyboard', code: 'KeyX' }, state);
    expect(input).toEqual([INPUT_ACTIONS.B]);

    const domain = skin.mapInputToDomain(input[0], state);
    expect(domain[0]).toMatchObject({ type: DOMAIN_ACTIONS.OPEN_TAB, tab: MENU_TABS.MAP });
  });

  it('ui1 ignores WASD input', () => {
    const state = createInitialState('ui1');
    const skin = createUI1Skin();

    expect(skin.mapInput({ kind: 'keyboard', code: 'KeyW' }, state)).toEqual([]);
    expect(skin.mapInput({ kind: 'keyboard', code: 'KeyA' }, state)).toEqual([]);
    expect(skin.mapInput({ kind: 'keyboard', code: 'KeyS' }, state)).toEqual([]);
    expect(skin.mapInput({ kind: 'keyboard', code: 'KeyD' }, state)).toEqual([]);
  });

  it('ui1 ignores canvas and menu clicks', () => {
    const state = createInitialState('ui1');
    const skin = createUI1Skin();

    expect(skin.mapInput({ kind: 'canvas', x: 80, y: 72 }, state)).toEqual([]);
    expect(skin.mapInput({ kind: 'menu', x: 16, y: 16 }, state)).toEqual([]);
  });

  it('ui2 maps tab hitboxes from menu canvas clicks', () => {
    const state = createInitialState('ui2');
    const skin = createUI2Skin();

    const bagInput = skin.mapInput({ kind: 'menu', x: 60, y: 68 }, state);
    expect(bagInput).toEqual([INPUT_ACTIONS.TAB_BAG]);

    const monInput = skin.mapInput({ kind: 'menu', x: 140, y: 68 }, state);
    expect(monInput).toEqual([INPUT_ACTIONS.TAB_MON]);
  });

  it('ui2 keyboard arrows move player while MAP tab is active', () => {
    const state = createInitialState('ui2');
    const skin = createUI2Skin();

    const input = skin.mapInput({ kind: 'keyboard', code: 'ArrowRight' }, state);
    expect(input).toEqual([INPUT_ACTIONS.RIGHT]);

    const domain = skin.mapInputToDomain(input[0], state);
    expect(domain).toEqual([{ type: DOMAIN_ACTIONS.MOVE, direction: 'right' }]);
  });

  it('ui2 ignores keyboard arrows in BAG and MON tabs', () => {
    const initial = createInitialState('ui2');
    const bagState = {
      ...initial,
      menu: {
        ...initial.menu,
        activeTab: MENU_TABS.BAG
      }
    };
    const monState = {
      ...initial,
      menu: {
        ...initial.menu,
        activeTab: MENU_TABS.MON
      }
    };
    const skin = createUI2Skin();

    expect(skin.mapInput({ kind: 'keyboard', code: 'ArrowLeft' }, bagState)).toEqual([]);
    expect(skin.mapInput({ kind: 'keyboard', code: 'ArrowDown' }, monState)).toEqual([]);
    expect(skin.mapInput({ kind: 'control', input: 'up' }, bagState)).toEqual([]);
    expect(skin.mapInput({ kind: 'control', input: 'down' }, monState)).toEqual([]);
  });

  it('ui2 list navigation click hitboxes emit SELECT_ITEM via UP and DOWN', () => {
    const initial = createInitialState('ui2');
    const state = {
      ...initial,
      menu: {
        ...initial.menu,
        activeTab: MENU_TABS.BAG
      }
    };
    const skin = createUI2Skin();

    const upInput = skin.mapInput(
      { kind: 'menu', x: UI2_HITBOXES.listNavUp.x + 1, y: UI2_HITBOXES.listNavUp.y + 1 },
      state
    );
    expect(upInput).toEqual([INPUT_ACTIONS.UP]);
    expect(skin.mapInputToDomain(upInput[0], state)).toEqual([
      { type: DOMAIN_ACTIONS.SELECT_ITEM, direction: 'up' }
    ]);

    const downInput = skin.mapInput(
      { kind: 'menu', x: UI2_HITBOXES.listNavDown.x + 1, y: UI2_HITBOXES.listNavDown.y + 1 },
      state
    );
    expect(downInput).toEqual([INPUT_ACTIONS.DOWN]);
    expect(skin.mapInputToDomain(downInput[0], state)).toEqual([
      { type: DOMAIN_ACTIONS.SELECT_ITEM, direction: 'down' }
    ]);
  });

  it('ui2 ignores WASD movement keys', () => {
    const state = createInitialState('ui2');
    const skin = createUI2Skin();

    expect(skin.mapInput({ kind: 'keyboard', code: 'KeyW' }, state)).toEqual([]);
    expect(skin.mapInput({ kind: 'keyboard', code: 'KeyA' }, state)).toEqual([]);
    expect(skin.mapInput({ kind: 'keyboard', code: 'KeyS' }, state)).toEqual([]);
    expect(skin.mapInput({ kind: 'keyboard', code: 'KeyD' }, state)).toEqual([]);
  });

  it('ui2 ignores world canvas clicks for movement', () => {
    const state = createInitialState('ui2');
    const skin = createUI2Skin();

    expect(skin.mapInput({ kind: 'canvas', x: 80, y: 72 }, state)).toEqual([]);
  });

  it('ui2 maps A to CONFIRM in map mode for contextual interactions', () => {
    const state = createInitialState('ui2');
    const skin = createUI2Skin();

    const input = skin.mapInput({ kind: 'keyboard', code: 'KeyZ' }, state);
    expect(input).toEqual([INPUT_ACTIONS.A]);

    const domain = skin.mapInputToDomain(input[0], state);
    expect(domain).toEqual([{ type: DOMAIN_ACTIONS.CONFIRM }]);
  });

  it('ui2 A from BAG/MON jumps to MAP and confirms contextual interaction', () => {
    const base = createInitialState('ui2');
    const bagState = {
      ...base,
      menu: {
        ...base.menu,
        activeTab: MENU_TABS.BAG
      }
    };
    const skin = createUI2Skin();

    const bagInput = skin.mapInput({ kind: 'keyboard', code: 'KeyZ' }, bagState);
    expect(bagInput).toEqual([INPUT_ACTIONS.A]);
    expect(skin.mapInputToDomain(bagInput[0], bagState)).toEqual([
      { type: DOMAIN_ACTIONS.OPEN_TAB, tab: MENU_TABS.MAP },
      { type: DOMAIN_ACTIONS.CONFIRM }
    ]);

    const monState = {
      ...base,
      menu: {
        ...base.menu,
        activeTab: MENU_TABS.MON
      }
    };
    const monInput = skin.mapInput({ kind: 'control', input: 'a' }, monState);
    expect(monInput).toEqual([INPUT_ACTIONS.A]);
    expect(skin.mapInputToDomain(monInput[0], monState)).toEqual([
      { type: DOMAIN_ACTIONS.OPEN_TAB, tab: MENU_TABS.MAP },
      { type: DOMAIN_ACTIONS.CONFIRM }
    ]);
  });

  it('ui2 maps B to no-op because tabs drive navigation', () => {
    const state = createInitialState('ui2');
    const skin = createUI2Skin();

    const input = skin.mapInput({ kind: 'keyboard', code: 'KeyX' }, state);
    expect(input).toEqual([INPUT_ACTIONS.B]);

    const domain = skin.mapInputToDomain(input[0], state);
    expect(domain).toEqual([]);
  });

  it('ui1 maps A to CONFIRM in map mode for contextual interactions', () => {
    const state = createInitialState('ui1');
    const skin = createUI1Skin();

    const input = skin.mapInput({ kind: 'keyboard', code: 'KeyZ' }, state);
    expect(input).toEqual([INPUT_ACTIONS.A]);

    const domain = skin.mapInputToDomain(input[0], state);
    expect(domain).toEqual([{ type: DOMAIN_ACTIONS.CONFIRM }]);
  });

  it('ui2 touch control A maps to the same contextual CONFIRM action', () => {
    const state = createInitialState('ui2');
    const skin = createUI2Skin();

    const input = skin.mapInput({ kind: 'control', input: 'a' }, state);
    expect(input).toEqual([INPUT_ACTIONS.A]);

    const domain = skin.mapInputToDomain(input[0], state);
    expect(domain).toEqual([{ type: DOMAIN_ACTIONS.CONFIRM }]);
  });
});
