import {
  LOGICAL_HEIGHT,
  LOGICAL_WIDTH,
  MENU_HEIGHT,
  MENU_WIDTH,
  TILE_SIZE_WORLD,
  VIEWPORT_COLS,
  VIEWPORT_ROWS
} from '../core/game-state.js';
import { getBlockedTiles } from '../core/world.js';
import { getSeaTiles } from '../overworld/component.js';
import { drawText, PALETTE } from '../ui/shared/primitives.js';
import { getPlayerFrame } from './sprites.js';

function isVisibleOnCamera(camera, tileX, tileY) {
  return (
    tileX >= camera.x &&
    tileY >= camera.y &&
    tileX < camera.x + VIEWPORT_COLS &&
    tileY < camera.y + VIEWPORT_ROWS
  );
}

function tileToScreen(tile, cameraAxis) {
  return (tile - cameraAxis) * TILE_SIZE_WORLD;
}

function drawWorldLayer(ctx, state, sprites) {
  const blockedTiles = getBlockedTiles(state.overworld);
  const seaTiles = getSeaTiles(state.overworld);
  const camera = state.camera || { x: 0, y: 0 };

  ctx.fillStyle = PALETTE.white;
  ctx.fillRect(0, 0, LOGICAL_WIDTH, LOGICAL_HEIGHT);

  for (let row = 0; row < VIEWPORT_ROWS; row += 1) {
    for (let col = 0; col < VIEWPORT_COLS; col += 1) {
      const worldX = camera.x + col;
      const worldY = camera.y + row;
      if (worldX >= state.world.cols || worldY >= state.world.rows) {
        continue;
      }

      const x = col * TILE_SIZE_WORLD;
      const y = row * TILE_SIZE_WORLD;
      const key = `${worldX},${worldY}`;
      const sea = seaTiles.has(key);
      const tone = sea
        ? (worldX + worldY) % 2 === 0
          ? '#8ec7e8'
          : '#74b1d5'
        : blockedTiles.has(key)
          ? '#6a6a6a'
          : (worldX + worldY) % 2 === 0
            ? '#dedede'
            : '#c9c9c9';

      ctx.fillStyle = tone;
      ctx.fillRect(x, y, TILE_SIZE_WORLD, TILE_SIZE_WORLD);

      ctx.strokeStyle = '#b0b0b0';
      ctx.lineWidth = 1;
      ctx.strokeRect(x + 0.5, y + 0.5, TILE_SIZE_WORLD - 1, TILE_SIZE_WORLD - 1);
    }
  }

  const boat = state.overworld?.entities?.boat;
  if (boat && isVisibleOnCamera(camera, boat.x, boat.y)) {
    const boatHeight = sprites?.boat?.naturalHeight || sprites?.boat?.height || 24;
    const boatX = tileToScreen(boat.x, camera.x);
    const boatY = tileToScreen(boat.y, camera.y) + (boat.spriteOffsetY || 0);

    if (sprites?.boat) {
      ctx.drawImage(sprites.boat, boatX, boatY, TILE_SIZE_WORLD, boatHeight);
    } else {
      ctx.fillStyle = '#4a6470';
      ctx.fillRect(boatX, boatY + 8, TILE_SIZE_WORLD, TILE_SIZE_WORLD);
    }
  }

  const playerX = tileToScreen(state.player.x, camera.x);
  const playerY = tileToScreen(state.player.y, camera.y);
  const spriteFrame = getPlayerFrame(sprites, state.player.direction, state.player.animFrame);

  if (spriteFrame?.image) {
    if (spriteFrame.flipX) {
      ctx.save();
      ctx.translate(playerX + TILE_SIZE_WORLD, playerY);
      ctx.scale(-1, 1);
      ctx.drawImage(spriteFrame.image, 0, 0, TILE_SIZE_WORLD, TILE_SIZE_WORLD);
      ctx.restore();
    } else {
      ctx.drawImage(spriteFrame.image, playerX, playerY, TILE_SIZE_WORLD, TILE_SIZE_WORLD);
    }
  } else {
    ctx.fillStyle = PALETTE.black;
    ctx.fillRect(playerX + 2, playerY + 2, TILE_SIZE_WORLD - 4, TILE_SIZE_WORLD - 4);
  }

  drawText(ctx, state.world.name, 2, 2, PALETTE.dark);
  drawText(ctx, `${state.player.x},${state.player.y}`, LOGICAL_WIDTH - 64, 2, PALETTE.dark);
  if (state.interactionPrompt) {
    drawText(ctx, state.interactionPrompt, 4, LOGICAL_HEIGHT - 16, PALETTE.dark);
  }
}

export function renderFrame(ctx, state, skin, sprites) {
  ctx.imageSmoothingEnabled = false;
  ctx.clearRect(0, 0, LOGICAL_WIDTH, LOGICAL_HEIGHT);

  drawWorldLayer(ctx, state, sprites);
  drawText(ctx, state.message, 4, LOGICAL_HEIGHT - 8, PALETTE.dark);
}

function renderMenuFrame(menuCtx, state, skin) {
  menuCtx.imageSmoothingEnabled = false;
  menuCtx.clearRect(0, 0, MENU_WIDTH, MENU_HEIGHT);

  skin.renderOverlay(menuCtx, state);
}

export function createRenderer(canvas, menuCanvas) {
  const ctx = canvas.getContext('2d', { alpha: false });

  if (!ctx) {
    throw new Error('2D context not available');
  }

  ctx.imageSmoothingEnabled = false;

  let menuCtx = null;
  if (menuCanvas) {
    menuCtx = menuCanvas.getContext('2d', { alpha: false });
    if (menuCtx) {
      menuCtx.imageSmoothingEnabled = false;
    }
  }

  return {
    ctx,
    render(state, skin, sprites) {
      renderFrame(ctx, state, skin, sprites);
      if (menuCtx) {
        renderMenuFrame(menuCtx, state, skin);
      }
    }
  };
}
