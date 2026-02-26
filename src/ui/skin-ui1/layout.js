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
const INACTIVE_TAB_ALPHA = 0.8;

export const UI1_DYNAMIC_PANEL_VIEWS = {
  MAP: 'map',
  BAG_PREVIEW: 'bagPreview',
  MON_PREVIEW: 'monPreview'
};

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

function drawPreviewPlaceholder(ctx, label) {
  const innerPadding = 2;
  const maxCharsPerLine = Math.max(1, Math.floor((MAP_PANEL.width - innerPadding * 2) / 8));
  const lines =
    label.length > maxCharsPerLine && label.includes(' ') ? label.split(' ') : [label];
  const longestLine = lines.reduce((longest, line) => Math.max(longest, line.length), 0);
  const blockWidth = longestLine * 8;
  const blockHeight = lines.length * 8;
  const textX = MAP_PANEL.x + Math.max(innerPadding, Math.floor((MAP_PANEL.width - blockWidth) / 2));
  const textY = MAP_PANEL.y + Math.floor((MAP_PANEL.height - blockHeight) / 2);

  drawText(ctx, lines.join('\n'), textX, textY, PALETTE.dark);
}

function renderMapPanel(ctx, state) {
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

function renderBagPreviewPanel(ctx) {
  drawPreviewPlaceholder(ctx, 'BAG INFO');
}

function renderMonPreviewPanel(ctx) {
  drawPreviewPlaceholder(ctx, 'MON INFO');
}

const DYNAMIC_PANEL_RENDERERS = {
  [UI1_DYNAMIC_PANEL_VIEWS.MAP]: renderMapPanel,
  [UI1_DYNAMIC_PANEL_VIEWS.BAG_PREVIEW]: renderBagPreviewPanel,
  [UI1_DYNAMIC_PANEL_VIEWS.MON_PREVIEW]: renderMonPreviewPanel
};

export function resolveUI1DynamicPanelView(state) {
  if (state.menu.activeTab === MENU_TABS.MAP) {
    return UI1_DYNAMIC_PANEL_VIEWS.MAP;
  }

  switch (state.menu.ui1Focus) {
    case MENU_TABS.MON:
      return UI1_DYNAMIC_PANEL_VIEWS.MON_PREVIEW;
    case MENU_TABS.BAG:
    default:
      return UI1_DYNAMIC_PANEL_VIEWS.BAG_PREVIEW;
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
  const bagHighlighted = islandActive && bagActive;
  const monHighlighted = islandActive && monActive;
  const tabAlpha = islandActive ? 1 : INACTIVE_TAB_ALPHA;

  ctx.save();
  ctx.globalAlpha = tabAlpha;
  drawBox(ctx, UI1_HITBOXES.tabBag.x, UI1_HITBOXES.tabBag.y, UI1_HITBOXES.tabBag.width, UI1_HITBOXES.tabBag.height, {
    fill: bagHighlighted ? '#6c6c6c' : '#9a9a9a',
    border: '#424242'
  });
  drawText(
    ctx,
    'BAG',
    UI1_HITBOXES.tabBag.x + 2,
    UI1_HITBOXES.tabBag.y + 1,
    bagHighlighted ? PALETTE.white : PALETTE.dark
  );
  ctx.restore();

  ctx.save();
  ctx.globalAlpha = tabAlpha;
  drawBox(ctx, UI1_HITBOXES.tabMon.x, UI1_HITBOXES.tabMon.y, UI1_HITBOXES.tabMon.width, UI1_HITBOXES.tabMon.height, {
    fill: monHighlighted ? '#6c6c6c' : '#9a9a9a',
    border: '#424242'
  });
  drawText(
    ctx,
    'MON',
    UI1_HITBOXES.tabMon.x + 2,
    UI1_HITBOXES.tabMon.y + 1,
    monHighlighted ? PALETTE.white : PALETTE.dark
  );
  ctx.restore();

  drawSlotRow(ctx, SLOT_ROW_X, BAG_ROW_Y, islandActive && bagActive ? state.menu.bagIndex : -1);
  drawSlotRow(ctx, SLOT_ROW_X, MON_ROW_Y, islandActive && monActive ? state.menu.monIndex : -1);

  const view = resolveUI1DynamicPanelView(state);
  const renderPanel = DYNAMIC_PANEL_RENDERERS[view] || DYNAMIC_PANEL_RENDERERS[UI1_DYNAMIC_PANEL_VIEWS.MAP];
  renderPanel(ctx, state);
}
