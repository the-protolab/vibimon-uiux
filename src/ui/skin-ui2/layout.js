import { LOGICAL_HEIGHT, LOGICAL_WIDTH, MENU_WIDTH, MENU_HEIGHT } from '../../core/game-state.js';
import { drawBox, drawMiniMap, drawText, PALETTE } from '../shared/primitives.js';
import { MENU_TABS } from '../../core/actions.js';

const TAB_WIDTH = Math.floor(MENU_WIDTH / 3);
const CONTENT_HEIGHT = 64;
const CONTENT_RECT = {
  x: 0,
  y: 0,
  width: MENU_WIDTH,
  height: CONTENT_HEIGHT
};
const LIST_PANEL = {
  x: 8,
  y: 8,
  width: 78,
  height: 48
};
const DETAIL_PANEL = {
  x: 92,
  y: 8,
  width: 44,
  height: 48
};
const NAV_COLUMN = {
  x: 140,
  y: 8,
  width: 16,
  height: 48
};
const NAV_BUTTON_HEIGHT = 16;
const NAV_BUTTON_GAP = 8;
const LIST_NAV_UP = {
  x: NAV_COLUMN.x,
  y: NAV_COLUMN.y + 8,
  width: NAV_COLUMN.width,
  height: NAV_BUTTON_HEIGHT
};
const LIST_NAV_DOWN = {
  x: NAV_COLUMN.x,
  y: LIST_NAV_UP.y + NAV_BUTTON_HEIGHT + NAV_BUTTON_GAP,
  width: NAV_COLUMN.width,
  height: NAV_BUTTON_HEIGHT
};

export const UI2_HITBOXES = {
  world: { x: 0, y: 0, width: LOGICAL_WIDTH, height: LOGICAL_HEIGHT },
  tabMap: { x: 0, y: CONTENT_HEIGHT, width: TAB_WIDTH, height: MENU_HEIGHT - CONTENT_HEIGHT },
  tabBag: { x: TAB_WIDTH, y: CONTENT_HEIGHT, width: TAB_WIDTH, height: MENU_HEIGHT - CONTENT_HEIGHT },
  tabMon: {
    x: TAB_WIDTH * 2,
    y: CONTENT_HEIGHT,
    width: MENU_WIDTH - TAB_WIDTH * 2,
    height: MENU_HEIGHT - CONTENT_HEIGHT
  },
  listNavUp: LIST_NAV_UP,
  listNavDown: LIST_NAV_DOWN
};

export const UI2_CONTENT_RECT = {
  x: CONTENT_RECT.x,
  y: CONTENT_RECT.y,
  width: CONTENT_RECT.width,
  height: CONTENT_RECT.height
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
    return '-';
  }

  if (typeof item === 'string') {
    return item;
  }

  return item.name || item.id || '-';
}

function formatMonLabel(mon) {
  if (!mon) {
    return '-';
  }

  if (typeof mon === 'string') {
    return mon;
  }

  return mon.name || mon.id || '-';
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

function drawListPreview(ctx, title, items, index, format = (value) => String(value || '-'), options = {}) {
  const panelX = options.x ?? LIST_PANEL.x;
  const panelY = options.y ?? LIST_PANEL.y;
  const panelWidth = options.width ?? LIST_PANEL.width;
  const titleY = panelY;
  const prevY = panelY + 14;
  const currentY = panelY + 26;
  const nextY = panelY + 38;
  const rowY = [prevY, currentY, nextY];
  const listLength = items.length;

  drawText(ctx, title, panelX, titleY, PALETTE.dark);

  if (listLength === 0) {
    drawText(ctx, '-', panelX, currentY, PALETTE.dark);
    return;
  }

  const maxStart = Math.max(0, listLength - 3);
  const windowStart = Math.min(Math.max(index - 1, 0), maxStart);
  const selectedRow = Math.max(0, Math.min(2, index - windowStart));

  for (let row = 0; row < 3; row += 1) {
    const slotIndex = windowStart + row;
    const value = slotIndex < listLength ? format(items[slotIndex]) : '-';

    if (row === selectedRow) {
      drawBox(ctx, panelX - 2, rowY[row] - 2, panelWidth, 10, { fill: '#7a7a7a', border: '#404040' });
      drawText(ctx, value, panelX, rowY[row], PALETTE.white);
    } else {
      drawText(ctx, value, panelX, rowY[row], '#666666');
    }
  }
}

function drawArrowIcon(ctx, direction, rect) {
  const centerX = rect.x + Math.floor(rect.width / 2);
  const centerY = rect.y + Math.floor(rect.height / 2);

  ctx.fillStyle = PALETTE.dark;
  if (direction === 'up') {
    ctx.fillRect(centerX, centerY - 4, 1, 1);
    ctx.fillRect(centerX - 1, centerY - 3, 3, 1);
    ctx.fillRect(centerX - 2, centerY - 2, 5, 1);
    ctx.fillRect(centerX, centerY - 1, 1, 4);
    return;
  }

  ctx.fillRect(centerX, centerY + 4, 1, 1);
  ctx.fillRect(centerX - 1, centerY + 3, 3, 1);
  ctx.fillRect(centerX - 2, centerY + 2, 5, 1);
  ctx.fillRect(centerX, centerY - 3, 1, 4);
}

function drawListNavControls(ctx) {
  drawBox(ctx, LIST_NAV_UP.x, LIST_NAV_UP.y, LIST_NAV_UP.width, LIST_NAV_UP.height, {
    fill: '#a6a6a6',
    border: '#505050'
  });
  drawArrowIcon(ctx, 'up', LIST_NAV_UP);

  drawBox(ctx, LIST_NAV_DOWN.x, LIST_NAV_DOWN.y, LIST_NAV_DOWN.width, LIST_NAV_DOWN.height, {
    fill: '#a6a6a6',
    border: '#505050'
  });
  drawArrowIcon(ctx, 'down', LIST_NAV_DOWN);
}

function drawBagDetails(ctx, item) {
  if (!item) {
    drawText(ctx, '-', DETAIL_PANEL.x, DETAIL_PANEL.y + 10, PALETTE.dark);
    drawText(ctx, 'QTD -', DETAIL_PANEL.x, DETAIL_PANEL.y + 24, PALETTE.dark);
    return;
  }

  const itemName = formatBagLabel(item);
  drawText(ctx, itemName, DETAIL_PANEL.x, DETAIL_PANEL.y + 10, PALETTE.dark);
  drawText(ctx, 'QTD 1', DETAIL_PANEL.x, DETAIL_PANEL.y + 24, PALETTE.dark);
}

function drawMonDetails(ctx, mon, sprites) {
  const detailX = DETAIL_PANEL.x;
  const detailY = DETAIL_PANEL.y;

  if (!mon) {
    drawText(ctx, '-', detailX, detailY + 12, PALETTE.dark);
    return;
  }

  const level = formatMonLevel(mon);
  drawText(ctx, level === null ? 'LV -' : `LV ${level}`, detailX, detailY, PALETTE.dark);

  const spriteSize = 34;
  const spriteX = detailX + 6;
  const spriteY = detailY + 16;

  if (sprites?.fightMonster1) {
    ctx.save();
    ctx.imageSmoothingEnabled = true;
    ctx.drawImage(sprites.fightMonster1, spriteX, spriteY, spriteSize, spriteSize);
    ctx.restore();
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
  drawBox(ctx, CONTENT_RECT.x, CONTENT_RECT.y, CONTENT_RECT.width, CONTENT_RECT.height, {
    fill: '#c7c7c7',
    border: '#444444'
  });
  drawListPreview(ctx, 'BAG', state.menu.bagItems, state.menu.bagIndex, formatBagLabel, {
    x: LIST_PANEL.x,
    y: LIST_PANEL.y,
    width: LIST_PANEL.width
  });
  drawBagDetails(ctx, state.menu.bagItems[state.menu.bagIndex]);
  drawListNavControls(ctx);
}

function renderMonTab(ctx, state, sprites) {
  drawBox(ctx, CONTENT_RECT.x, CONTENT_RECT.y, CONTENT_RECT.width, CONTENT_RECT.height, {
    fill: '#c7c7c7',
    border: '#444444'
  });
  drawListPreview(ctx, 'MON', state.menu.mons, state.menu.monIndex, formatMonLabel, {
    x: LIST_PANEL.x,
    y: LIST_PANEL.y,
    width: LIST_PANEL.width
  });
  drawListNavControls(ctx);
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
