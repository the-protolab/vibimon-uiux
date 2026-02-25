import { LOGICAL_HEIGHT, LOGICAL_WIDTH, MENU_WIDTH, MENU_HEIGHT } from '../../core/game-state.js';
import { drawBox, drawMiniMap, drawText, PALETTE } from '../shared/primitives.js';

const TAB_WIDTH = Math.floor(MENU_WIDTH / 3);

export const UI2_HITBOXES = {
  world: { x: 0, y: 0, width: LOGICAL_WIDTH, height: LOGICAL_HEIGHT },
  tabMap: { x: 0, y: 64, width: TAB_WIDTH, height: 16 },
  tabBag: { x: TAB_WIDTH, y: 64, width: TAB_WIDTH, height: 16 },
  tabMon: { x: TAB_WIDTH * 2, y: 64, width: MENU_WIDTH - TAB_WIDTH * 2, height: 16 }
};

function drawTab(ctx, rect, label, active) {
  drawBox(ctx, rect.x, rect.y, rect.width, rect.height, {
    fill: active ? '#707070' : '#a0a0a0',
    border: '#3f3f3f'
  });

  const offsetX = rect.x + Math.floor((rect.width - label.length * 8) / 2);
  drawText(ctx, label, offsetX, rect.y + 4, active ? PALETTE.white : PALETTE.dark);
}

function drawListPreview(ctx, title, items, index) {
  drawText(ctx, title, 8, 8, PALETTE.dark);

  const prev = items[(index - 1 + items.length) % items.length];
  const current = items[index];
  const next = items[(index + 1) % items.length];

  drawText(ctx, prev, 8, 22, '#666666');
  drawBox(ctx, 6, 32, 148, 10, { fill: '#7a7a7a', border: '#404040' });
  drawText(ctx, current, 10, 34, PALETTE.white);
  drawText(ctx, next, 8, 46, '#666666');
}

export function renderUI2Overlay(ctx, state) {
  ctx.fillStyle = PALETTE.black;
  ctx.fillRect(0, 0, MENU_WIDTH, MENU_HEIGHT);

  drawBox(ctx, 4, 4, 152, 56, { fill: '#c8c8c8', border: '#444444' });

  if (state.menu.activeTab === 'MAP') {
    drawText(ctx, 'MAP', 8, 8, PALETTE.dark);
    drawMiniMap(ctx, 58, 10, 96, 46, state.world, state.player, state.menu.mapCursor);
    drawText(ctx, 'A TO WARP', 8, 46, PALETTE.dark);
  }

  if (state.menu.activeTab === 'BAG') {
    drawListPreview(ctx, 'BAG', state.menu.bagItems, state.menu.bagIndex);
  }

  if (state.menu.activeTab === 'MON') {
    drawListPreview(ctx, 'MON', state.menu.mons, state.menu.monIndex);
  }

  drawTab(ctx, UI2_HITBOXES.tabMap, 'MAP', state.menu.activeTab === 'MAP');
  drawTab(ctx, UI2_HITBOXES.tabBag, 'BAG', state.menu.activeTab === 'BAG');
  drawTab(ctx, UI2_HITBOXES.tabMon, 'MON', state.menu.activeTab === 'MON');
}
