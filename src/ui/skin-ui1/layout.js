import { LOGICAL_HEIGHT, LOGICAL_WIDTH, MENU_WIDTH, MENU_HEIGHT } from '../../core/game-state.js';
import { drawBox, drawMiniMap, drawText, PALETTE } from '../shared/primitives.js';

export const UI1_HITBOXES = {
  world: { x: 0, y: 0, width: LOGICAL_WIDTH, height: LOGICAL_HEIGHT },
  tabBag: { x: 10, y: 8, width: 40, height: 12 },
  tabMon: { x: 10, y: 42, width: 40, height: 12 }
};

function drawSlotRow(ctx, x, y, selectedIndex) {
  for (let i = 0; i < 4; i += 1) {
    const slotX = x + i * 18;
    ctx.fillStyle = i === selectedIndex ? PALETTE.dark : PALETTE.mid;
    ctx.fillRect(slotX, y, 14, 10);

    ctx.fillStyle = PALETTE.white;
    ctx.fillRect(slotX + 2, y + 2, 10, 6);
  }
}

export function renderUI1Overlay(ctx, state) {
  ctx.fillStyle = PALETTE.black;
  ctx.fillRect(0, 0, MENU_WIDTH, MENU_HEIGHT);

  drawBox(ctx, 4, 4, 100, 72, { fill: '#c7c7c7', border: '#444444' });
  drawBox(ctx, 108, 4, 48, 72, { fill: '#c7c7c7', border: '#444444' });

  const bagActive = state.menu.ui1Focus === 'BAG';
  const monActive = state.menu.ui1Focus === 'MON';

  drawBox(ctx, 10, 8, 30, 8, {
    fill: bagActive ? '#6c6c6c' : '#9a9a9a',
    border: '#424242'
  });
  drawText(ctx, 'BAG', 12, 9, bagActive ? PALETTE.white : PALETTE.dark);

  drawBox(ctx, 10, 42, 30, 8, {
    fill: monActive ? '#6c6c6c' : '#9a9a9a',
    border: '#424242'
  });
  drawText(ctx, 'MON', 12, 43, monActive ? PALETTE.white : PALETTE.dark);

  drawSlotRow(ctx, 12, 20, bagActive ? state.menu.bagIndex : -1);
  drawSlotRow(ctx, 12, 54, monActive ? state.menu.monIndex : -1);

  drawText(ctx, 'MAP', 112, 8, PALETTE.dark);
  drawMiniMap(ctx, 111, 18, 42, 54, state.world, state.player, state.menu.mapCursor);
}
