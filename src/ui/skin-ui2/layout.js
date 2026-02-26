import { LOGICAL_HEIGHT, LOGICAL_WIDTH, MENU_WIDTH, MENU_HEIGHT } from '../../core/game-state.js';
import { drawBox, drawMiniMap, drawText, PALETTE } from '../shared/primitives.js';
import { MENU_TABS } from '../../core/actions.js';

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
  const panelX = options.x ?? 8;
  const panelY = options.y ?? 8;
  const panelWidth = options.width ?? 148;
  const titleX = panelX;
  const titleY = panelY;
  const prevY = panelY + 14;
  const currentY = panelY + 24;
  const nextY = panelY + 38;
  const selectedBoxY = panelY + 22;
  const listLength = items.length;

  drawText(ctx, title, titleX, titleY, PALETTE.dark);

  if (listLength === 0) {
    drawText(ctx, 'EMPTY', panelX, currentY + 2, PALETTE.dark);
    return;
  }

  const prev = format(items[(index - 1 + listLength) % listLength]);
  const current = format(items[index]);
  const next = format(items[(index + 1) % listLength]);

  drawText(ctx, prev, panelX, prevY, '#666666');
  drawBox(ctx, panelX - 2, selectedBoxY, panelWidth, 10, { fill: '#7a7a7a', border: '#404040' });
  drawText(ctx, current, panelX + 2, currentY, PALETTE.white);
  drawText(ctx, next, panelX, nextY, '#666666');
}

function drawMonDetails(ctx, mon, sprites) {
  drawBox(ctx, 86, 10, 68, 44, { fill: '#d2d2d2', border: '#4a4a4a' });

  if (!mon) {
    drawText(ctx, 'MON', 92, 20, PALETTE.dark);
    drawText(ctx, 'EMPTY', 92, 30, PALETTE.dark);
    return;
  }

  drawText(ctx, formatMonLabel(mon), 90, 14, PALETTE.dark);
  const level = formatMonLevel(mon);
  drawText(ctx, level === null ? 'LVL ?' : `LVL ${level}`, 90, 24, PALETTE.dark);

  if (sprites?.fightMonster1) {
    ctx.drawImage(sprites.fightMonster1, 118, 30, 20, 20);
  } else {
    ctx.fillStyle = PALETTE.dark;
    ctx.fillRect(122, 34, 12, 12);
  }
}

export function renderUI2Overlay(ctx, state, sprites) {
  ctx.fillStyle = PALETTE.black;
  ctx.fillRect(0, 0, MENU_WIDTH, MENU_HEIGHT);

  drawBox(ctx, 4, 4, 152, 56, { fill: '#c8c8c8', border: '#444444' });

  if (state.menu.activeTab === MENU_TABS.MAP) {
    drawText(ctx, 'MAP', 8, 8, PALETTE.dark);
    drawMiniMap(ctx, 58, 10, 96, 46, state.world, state.player, state.menu.mapCursor, state.overworld);
    drawText(ctx, 'A TO INTERACT', 8, 46, PALETTE.dark);
  }

  if (state.menu.activeTab === MENU_TABS.BAG) {
    drawListPreview(ctx, 'BAG', state.menu.bagItems, state.menu.bagIndex, formatBagLabel);
  }

  if (state.menu.activeTab === MENU_TABS.MON) {
    drawListPreview(ctx, 'MON', state.menu.mons, state.menu.monIndex, formatMonLabel, {
      x: 8,
      y: 8,
      width: 76
    });
    drawMonDetails(ctx, state.menu.mons[state.menu.monIndex], sprites);
  }

  drawTab(ctx, UI2_HITBOXES.tabMap, 'MAP', state.menu.activeTab === MENU_TABS.MAP);
  drawTab(ctx, UI2_HITBOXES.tabBag, 'BAG', state.menu.activeTab === MENU_TABS.BAG);
  drawTab(ctx, UI2_HITBOXES.tabMon, 'MON', state.menu.activeTab === MENU_TABS.MON);
}
