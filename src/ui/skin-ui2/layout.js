import { LOGICAL_HEIGHT, LOGICAL_WIDTH, MENU_WIDTH, MENU_HEIGHT } from '../../core/game-state.js';
import { drawBox, drawMiniMap, drawText, PALETTE } from '../shared/primitives.js';
import { MENU_TABS } from '../../core/actions.js';

const TAB_WIDTH = Math.floor(MENU_WIDTH / 3);
const CONTENT_HEIGHT = 64;
const LIST_TEXT_X = 8;

export const UI2_HITBOXES = {
  world: { x: 0, y: 0, width: LOGICAL_WIDTH, height: LOGICAL_HEIGHT },
  tabMap: { x: 0, y: CONTENT_HEIGHT, width: TAB_WIDTH, height: MENU_HEIGHT - CONTENT_HEIGHT },
  tabBag: { x: TAB_WIDTH, y: CONTENT_HEIGHT, width: TAB_WIDTH, height: MENU_HEIGHT - CONTENT_HEIGHT },
  tabMon: {
    x: TAB_WIDTH * 2,
    y: CONTENT_HEIGHT,
    width: MENU_WIDTH - TAB_WIDTH * 2,
    height: MENU_HEIGHT - CONTENT_HEIGHT
  }
};

export const UI2_CONTENT_RECT = {
  x: 0,
  y: 0,
  width: MENU_WIDTH,
  height: CONTENT_HEIGHT
};

function drawTab(ctx, rect, label, active) {
  drawBox(ctx, rect.x, rect.y, rect.width, rect.height, {
    fill: active ? '#707070' : '#a0a0a0',
    border: '#3f3f3f'
  });

  const offsetX = rect.x + Math.floor((rect.width - label.length * 8) / 2);
  drawText(ctx, label, offsetX, rect.y + 4, active ? PALETTE.white : PALETTE.dark);
}

function formatBagLabel(item) {
  if (!item) {
    return 'EMPTY';
  }

  if (typeof item === 'string') {
    return item;
  }

  return item.name || item.id || 'ITEM';
}

function formatMonLabel(mon) {
  if (!mon) {
    return 'EMPTY';
  }

  if (typeof mon === 'string') {
    return mon;
  }

  return mon.name || mon.id || 'MON';
}

function formatMonLevel(mon) {
  if (!mon || typeof mon === 'string') {
    return null;
  }

  if (typeof mon.level === 'number') {
    return mon.level;
  }

  const parsed = Number.parseInt(mon.level, 10);
  return Number.isNaN(parsed) ? null : parsed;
}

function drawListPreview(ctx, title, items, index, format = (value) => String(value || 'EMPTY'), options = {}) {
  const panelX = options.x ?? LIST_TEXT_X;
  const panelY = options.y ?? 8;
  const panelWidth = options.width ?? 148;
  const titleY = panelY;
  const prevY = panelY + 14;
  const currentY = panelY + 26;
  const nextY = panelY + 38;
  const selectedBoxY = currentY - 2;
  const listLength = items.length;

  drawText(ctx, title, panelX, titleY, PALETTE.dark);

  if (listLength === 0) {
    drawText(ctx, 'EMPTY', panelX, currentY, PALETTE.dark);
    return;
  }

  const prev = format(items[(index - 1 + listLength) % listLength]);
  const current = format(items[index]);
  const next = format(items[(index + 1) % listLength]);

  drawText(ctx, prev, panelX, prevY, '#666666');
  drawBox(ctx, panelX - 2, selectedBoxY, panelWidth, 10, { fill: '#7a7a7a', border: '#404040' });
  drawText(ctx, current, panelX, currentY, PALETTE.white);
  drawText(ctx, next, panelX, nextY, '#666666');
}

function drawMonDetails(ctx, mon, sprites) {
  const detailX = 96;
  const detailY = 8;
  const level = formatMonLevel(mon);

  drawText(ctx, level === null ? 'LV ?' : `LV ${level}`, detailX, detailY, PALETTE.dark);

  if (!mon) {
    drawText(ctx, 'EMPTY', detailX, detailY + 12, PALETTE.dark);
    return;
  }

  const spriteSize = 34;
  const spriteX = detailX + 16;
  const spriteY = detailY + 16;

  if (sprites?.fightMonster1) {
    ctx.drawImage(sprites.fightMonster1, spriteX, spriteY, spriteSize, spriteSize);
    return;
  }

  ctx.fillStyle = PALETTE.dark;
  ctx.fillRect(spriteX + 10, spriteY + 10, 14, 14);
}

function renderMapTab(ctx, state) {
  drawMiniMap(
    ctx,
    UI2_CONTENT_RECT.x,
    UI2_CONTENT_RECT.y,
    UI2_CONTENT_RECT.width,
    UI2_CONTENT_RECT.height,
    state.world,
    state.player,
    state.menu.mapCursor,
    state.overworld,
    { showBorder: false }
  );
}

function renderBagTab(ctx, state) {
  drawListPreview(ctx, 'BAG', state.menu.bagItems, state.menu.bagIndex, formatBagLabel, {
    x: LIST_TEXT_X,
    y: 8,
    width: 148
  });
}

function renderMonTab(ctx, state, sprites) {
  drawListPreview(ctx, 'MON', state.menu.mons, state.menu.monIndex, formatMonLabel, {
    x: LIST_TEXT_X,
    y: 8,
    width: 84
  });
  drawMonDetails(ctx, state.menu.mons[state.menu.monIndex], sprites);
}

export function renderUI2Overlay(ctx, state, sprites) {
  ctx.fillStyle = PALETTE.black;
  ctx.fillRect(0, 0, MENU_WIDTH, MENU_HEIGHT);

  if (state.menu.activeTab === MENU_TABS.MAP) {
    renderMapTab(ctx, state);
  }

  if (state.menu.activeTab === MENU_TABS.BAG) {
    renderBagTab(ctx, state);
  }

  if (state.menu.activeTab === MENU_TABS.MON) {
    renderMonTab(ctx, state, sprites);
  }

  drawTab(ctx, UI2_HITBOXES.tabMap, 'MAP', state.menu.activeTab === MENU_TABS.MAP);
  drawTab(ctx, UI2_HITBOXES.tabBag, 'BAG', state.menu.activeTab === MENU_TABS.BAG);
  drawTab(ctx, UI2_HITBOXES.tabMon, 'MON', state.menu.activeTab === MENU_TABS.MON);
}
