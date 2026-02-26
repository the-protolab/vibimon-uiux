import { describe, expect, it } from 'vitest';
import { MENU_TABS } from '../src/core/actions.js';
import { createInitialState } from '../src/core/game-state.js';
import { getSelectedMonSlot, renderUI1Overlay } from '../src/ui/skin-ui1/layout.js';

function createMockContext() {
  const drawImages = [];

  return {
    fillStyle: '#000',
    strokeStyle: '#000',
    lineWidth: 1,
    globalAlpha: 1,
    fillRect() {},
    strokeRect() {},
    save() {},
    restore() {},
    drawImage(image, ...rest) {
      drawImages.push({ image, rest });
    },
    get drawImages() {
      return drawImages;
    }
  };
}

function withActiveMon(state) {
  return {
    ...state,
    menu: {
      ...state.menu,
      activeTab: MENU_TABS.MON,
      ui1Focus: MENU_TABS.MON,
      monIndex: 0,
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
      ]
    }
  };
}

describe('ui1 MON preview rendering', () => {
  it('draws mon icon in MON slot row when a slot is occupied', () => {
    const ctx = createMockContext();
    const state = withActiveMon(createInitialState('ui1'));
    const sprites = {
      monIcon: { id: 'mon-icon-image' },
      fightMonster1: { id: 'fight-image' }
    };

    renderUI1Overlay(ctx, state, sprites);

    const iconDraw = ctx.drawImages.find((entry) => entry.image === sprites.monIcon);
    expect(iconDraw).toBeTruthy();
  });

  it('draws selected mon details image in dynamic panel', () => {
    const ctx = createMockContext();
    const state = withActiveMon(createInitialState('ui1'));
    const sprites = {
      monIcon: { id: 'mon-icon-image' },
      fightMonster1: { id: 'fight-image' }
    };

    renderUI1Overlay(ctx, state, sprites);

    const detailDraw = ctx.drawImages.find((entry) => entry.image === sprites.fightMonster1);
    expect(detailDraw).toBeTruthy();
  });

  it('returns selected mon slot for preview data', () => {
    const state = withActiveMon(createInitialState('ui1'));

    expect(getSelectedMonSlot(state)).toMatchObject({
      name: 'WILD-01',
      level: 5
    });
  });
});
