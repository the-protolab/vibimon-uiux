import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MENU_TABS } from '../src/core/actions.js';

const primitiveMocks = vi.hoisted(() => ({
  drawBox: vi.fn(),
  drawMiniMap: vi.fn(),
  drawText: vi.fn(),
  PALETTE: {
    black: '#0f0f0f',
    dark: '#383838',
    white: '#e8e8e8'
  }
}));

vi.mock('../src/ui/shared/primitives.js', () => primitiveMocks);

import { renderUI2Overlay } from '../src/ui/skin-ui2/layout.js';

function createState(activeTab) {
  return {
    menu: {
      activeTab,
      mapCursor: { x: 5, y: 6 },
      bagItems: ['POTION', 'ANTIDOTE', 'ROPE', 'ETHER'],
      bagIndex: 1,
      mons: [
        {
          id: 'wild-01-01',
          name: 'WILD-01',
          level: 5,
          mapIconSpriteId: 'monIcon',
          detailSpriteId: 'fightMonster1'
        },
        null,
        null,
        null
      ],
      monIndex: 0
    },
    world: {
      cols: 30,
      rows: 27
    },
    player: {
      x: 3,
      y: 4
    },
    overworld: {
      blockedTileSet: new Set()
    }
  };
}

function createEmptyState(activeTab) {
  const state = createState(activeTab);
  return {
    ...state,
    menu: {
      ...state.menu,
      bagItems: [null, null, null, null],
      bagIndex: 0,
      mons: [null, null, null, null],
      monIndex: 0
    }
  };
}

function createContext() {
  return {
    fillStyle: '',
    fillRect: vi.fn(),
    drawImage: vi.fn(),
    save: vi.fn(),
    restore: vi.fn()
  };
}

describe('ui2 layout refresh', () => {
  beforeEach(() => {
    primitiveMocks.drawBox.mockClear();
    primitiveMocks.drawMiniMap.mockClear();
    primitiveMocks.drawText.mockClear();
  });

  it('renders map on the full content area (160x64) without internal chrome text', () => {
    const state = createState(MENU_TABS.MAP);
    const ctx = createContext();

    renderUI2Overlay(ctx, state, null);

    expect(primitiveMocks.drawMiniMap).toHaveBeenCalledTimes(1);
    const call = primitiveMocks.drawMiniMap.mock.calls[0];
    expect(call[1]).toBe(0);
    expect(call[2]).toBe(0);
    expect(call[3]).toBe(160);
    expect(call[4]).toBe(64);
    expect(call[9]).toEqual({ showBorder: false });

    const textValues = primitiveMocks.drawText.mock.calls.map((entry) => entry[1]);
    expect(textValues.includes('A TO INTERACT')).toBe(false);

    expect(primitiveMocks.drawBox).toHaveBeenCalledTimes(3);
  });

  it('keeps BAG prev/current/next text aligned on the same x baseline', () => {
    const state = createState(MENU_TABS.BAG);
    const ctx = createContext();

    renderUI2Overlay(ctx, state, null);

    const bagCalls = primitiveMocks.drawText.mock.calls.filter((entry) => [22, 34, 46].includes(entry[3]));

    expect(bagCalls).toHaveLength(3);
    const xPositions = bagCalls.map((entry) => entry[2]);
    expect(new Set(xPositions).size).toBe(1);
  });

  it('renders BAG with a light content background and item details', () => {
    const state = createState(MENU_TABS.BAG);
    const ctx = createContext();

    renderUI2Overlay(ctx, state, null);

    const hasLightContentPanel = primitiveMocks.drawBox.mock.calls.some(
      (entry) =>
        entry[1] === 0 &&
        entry[2] === 0 &&
        entry[3] === 160 &&
        entry[4] === 64 &&
        entry[5]?.fill === '#c7c7c7'
    );
    expect(hasLightContentPanel).toBe(true);

    const qtdCall = primitiveMocks.drawText.mock.calls.find((entry) => entry[1] === 'QTD 1');
    expect(qtdCall).toBeTruthy();
  });

  it('renders MON image + LV without drawing the old detail frame box', () => {
    const state = createState(MENU_TABS.MON);
    const ctx = createContext();
    const sprites = {
      fightMonster1: { id: 'fight-monster' }
    };

    renderUI2Overlay(ctx, state, sprites);

    expect(ctx.drawImage).toHaveBeenCalledTimes(1);

    const levelCall = primitiveMocks.drawText.mock.calls.find((entry) => entry[1] === 'LV 5');
    expect(levelCall).toBeTruthy();

    const hasLegacyFrame = primitiveMocks.drawBox.mock.calls.some((entry) => entry[3] === 68 && entry[4] === 44);
    expect(hasLegacyFrame).toBe(false);
  });

  it('renders dash placeholders when BAG and MON slots are empty', () => {
    const bagState = createEmptyState(MENU_TABS.BAG);
    const bagCtx = createContext();

    renderUI2Overlay(bagCtx, bagState, null);
    const bagDashCount = primitiveMocks.drawText.mock.calls.filter((entry) => entry[1] === '-').length;
    const qtdDashCall = primitiveMocks.drawText.mock.calls.find((entry) => entry[1] === 'QTD -');

    expect(bagDashCount).toBeGreaterThanOrEqual(4);
    expect(qtdDashCall).toBeTruthy();

    primitiveMocks.drawText.mockClear();

    const monState = createEmptyState(MENU_TABS.MON);
    const monCtx = createContext();
    renderUI2Overlay(monCtx, monState, null);

    const monDashCount = primitiveMocks.drawText.mock.calls.filter((entry) => entry[1] === '-').length;
    expect(monDashCount).toBeGreaterThanOrEqual(4);
  });
});
