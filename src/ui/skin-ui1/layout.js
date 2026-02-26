import { LOGICAL_HEIGHT, LOGICAL_WIDTH, MENU_WIDTH, MENU_HEIGHT } from '../../core/game-state.js';
import { drawBox, drawMiniMap, drawText, PALETTE } from '../shared/primitives.js';
import { MENU_TABS } from '../../core/actions.js';

const ISLAND_HEIGHT = 60;

const ISLAND = {
  x: 0,
  y: Math.floor((MENU_HEIGHT - ISLAND_HEIGHT) / 2),
  width: MENU_WIDTH,
  height: ISLAND_HEIGHT
};

const MAP_PANEL = {
  x: ISLAND.width - ISLAND.height,
  y: ISLAND.y,
  width: ISLAND.height,
  height: ISLAND.height
};

const LIST_PANEL = {
  x: ISLAND.x,
  y: ISLAND.y,
  width: MAP_PANEL.x,
  height: ISLAND.height
};

const MAP_INSET = 4;
const TAB_X = 6;
const TAB_WIDTH = 32;
const TAB_HEIGHT = 8;
const SECTION_HEIGHT = Math.floor(LIST_PANEL.height / 2);
const BAG_TAB_Y = LIST_PANEL.y + 4;
const MON_TAB_Y = LIST_PANEL.y + SECTION_HEIGHT + 4;
const BAG_ROW_Y = LIST_PANEL.y + 16;
const MON_ROW_Y = LIST_PANEL.y + SECTION_HEIGHT + 16;
const SLOT_ROW_X = LIST_PANEL.x + 6;
const SLOT_SIZE = 12;
const SLOT_GAP = 4;
const SLOT_STEP = SLOT_SIZE + SLOT_GAP;

export const UI1_HITBOXES = {
  world: { x: 0, y: 0, width: LOGICAL_WIDTH, height: LOGICAL_HEIGHT },
  tabBag: { x: TAB_X, y: BAG_TAB_Y, width: TAB_WIDTH, height: TAB_HEIGHT },
  tabMon: { x: TAB_X, y: MON_TAB_Y, width: TAB_WIDTH, height: TAB_HEIGHT }
};

function drawSlotRow(ctx, x, y, selectedIndex) {
  for (let i = 0; i < 4; i += 1) {
    const slotX = x + i * SLOT_STEP;
    ctx.fillStyle = PALETTE.mid;
    ctx.fillRect(slotX, y, SLOT_SIZE, SLOT_SIZE);

    if (i === selectedIndex) {
      ctx.strokeStyle = PALETTE.black;
      ctx.lineWidth = 1;
      ctx.strokeRect(slotX + 0.5, y + 0.5, SLOT_SIZE - 1, SLOT_SIZE - 1);
    }
  }
}

export function renderUI1Overlay(ctx, state) {
  ctx.fillStyle = PALETTE.black;
  ctx.fillRect(0, 0, MENU_WIDTH, MENU_HEIGHT);

  const islandActive = state.menu.activeTab !== MENU_TABS.MAP;
  const islandOutline = islandActive ? '#4d77da' : '#444444';

  ctx.fillStyle = '#bdbdbd';
  ctx.fillRect(ISLAND.x, ISLAND.y, ISLAND.width, ISLAND.height);
  drawBox(ctx, LIST_PANEL.x, LIST_PANEL.y, LIST_PANEL.width, LIST_PANEL.height, { fill: '#c7c7c7', border: '#444444' });
  drawBox(ctx, MAP_PANEL.x, MAP_PANEL.y, MAP_PANEL.width, MAP_PANEL.height, { fill: '#c7c7c7', border: '#444444' });
  ctx.strokeStyle = islandOutline;
  ctx.lineWidth = 1;
  ctx.strokeRect(ISLAND.x + 0.5, ISLAND.y + 0.5, ISLAND.width - 1, ISLAND.height - 1);

  const bagActive = state.menu.ui1Focus === 'BAG';
  const monActive = state.menu.ui1Focus === 'MON';

  drawBox(ctx, UI1_HITBOXES.tabBag.x, UI1_HITBOXES.tabBag.y, UI1_HITBOXES.tabBag.width, UI1_HITBOXES.tabBag.height, {
    fill: bagActive ? '#6c6c6c' : '#9a9a9a',
    border: '#424242'
  });
  drawText(
    ctx,
    'BAG',
    UI1_HITBOXES.tabBag.x + 2,
    UI1_HITBOXES.tabBag.y + 1,
    bagActive ? PALETTE.white : PALETTE.dark
  );

  drawBox(ctx, UI1_HITBOXES.tabMon.x, UI1_HITBOXES.tabMon.y, UI1_HITBOXES.tabMon.width, UI1_HITBOXES.tabMon.height, {
    fill: monActive ? '#6c6c6c' : '#9a9a9a',
    border: '#424242'
  });
  drawText(
    ctx,
    'MON',
    UI1_HITBOXES.tabMon.x + 2,
    UI1_HITBOXES.tabMon.y + 1,
    monActive ? PALETTE.white : PALETTE.dark
  );

  drawSlotRow(ctx, SLOT_ROW_X, BAG_ROW_Y, islandActive && bagActive ? state.menu.bagIndex : -1);
  drawSlotRow(ctx, SLOT_ROW_X, MON_ROW_Y, islandActive && monActive ? state.menu.monIndex : -1);

  drawMiniMap(
    ctx,
    MAP_PANEL.x + MAP_INSET,
    MAP_PANEL.y + MAP_INSET,
    MAP_PANEL.width - MAP_INSET * 2,
    MAP_PANEL.height - MAP_INSET * 2,
    state.world,
    state.player,
    state.menu.mapCursor,
    state.overworld
  );
}
