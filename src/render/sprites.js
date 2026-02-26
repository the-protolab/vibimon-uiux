import {
  DEFAULT_PLAYER_ID,
  PLAYER_QUERY_PARAM,
  PLAYER_SPRITE_FILE_REGEX,
  SPRITE_DIRECTIONS
} from '../config/player-sprite-config.js';

const SPRITE_SOURCE_ENTRIES = import.meta.glob('../../assets/players/**/*.{png,webp}', {
  eager: true,
  import: 'default'
});

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(`Failed to load image: ${src}`));
    image.src = src;
  });
}

function parseSpriteEntry(filePath) {
  const match = filePath.match(PLAYER_SPRITE_FILE_REGEX);
  if (!match) {
    return null;
  }

  const [, playerId, rawDirection, rawFrame] = match;
  const direction = rawDirection.toLowerCase();
  if (!SPRITE_DIRECTIONS.includes(direction)) {
    return null;
  }

  const frame = Number.parseInt(rawFrame, 10);
  if (Number.isNaN(frame)) {
    return null;
  }

  return {
    playerId,
    direction,
    frame
  };
}

function sortAndDedupeFrames(frames) {
  frames.sort((a, b) => a.frame - b.frame);

  const seen = new Set();
  const unique = [];
  for (const frame of frames) {
    if (seen.has(frame.frame)) {
      continue;
    }

    seen.add(frame.frame);
    unique.push(frame);
  }

  return unique;
}

export function buildSpriteSourceIndex(entries) {
  const index = {};

  for (const [filePath, src] of Object.entries(entries)) {
    if (typeof src !== 'string') {
      continue;
    }

    const parsed = parseSpriteEntry(filePath);
    if (!parsed) {
      continue;
    }

    const { playerId, direction, frame } = parsed;
    if (!index[playerId]) {
      index[playerId] = {};
    }
    if (!index[playerId][direction]) {
      index[playerId][direction] = [];
    }

    index[playerId][direction].push({ frame, src });
  }

  for (const pack of Object.values(index)) {
    for (const direction of Object.keys(pack)) {
      pack[direction] = sortAndDedupeFrames(pack[direction]);
    }
  }

  return index;
}

export function resolvePlayerIdFromSearch(search, fallbackId = DEFAULT_PLAYER_ID) {
  const params = new URLSearchParams(search || '');
  const requested = params.get(PLAYER_QUERY_PARAM);
  if (!requested) {
    return fallbackId;
  }

  const trimmed = requested.trim();
  if (!trimmed) {
    return fallbackId;
  }

  return trimmed;
}

export function pickPlayerId(sourceIndex, preferredPlayerId, fallbackPlayerId = DEFAULT_PLAYER_ID) {
  if (preferredPlayerId && sourceIndex[preferredPlayerId]) {
    return preferredPlayerId;
  }

  if (fallbackPlayerId && sourceIndex[fallbackPlayerId]) {
    return fallbackPlayerId;
  }

  const candidates = Object.keys(sourceIndex).sort();
  return candidates[0] || null;
}

function pickDirectionFrames(preferredPack, fallbackPack, direction) {
  const preferredFrames = preferredPack?.[direction] || [];
  const fallbackFrames = fallbackPack?.[direction] || [];

  if (direction !== 'left') {
    if (preferredFrames.length > 0) {
      return { frames: preferredFrames, flipX: false };
    }

    if (fallbackFrames.length > 0) {
      return { frames: fallbackFrames, flipX: false };
    }

    return { frames: [], flipX: false };
  }

  if (preferredFrames.length > 0) {
    return { frames: preferredFrames, flipX: false };
  }

  const preferredRight = preferredPack?.right || [];
  if (preferredRight.length > 0) {
    return { frames: preferredRight, flipX: true };
  }

  if (fallbackFrames.length > 0) {
    return { frames: fallbackFrames, flipX: false };
  }

  const fallbackRight = fallbackPack?.right || [];
  if (fallbackRight.length > 0) {
    return { frames: fallbackRight, flipX: true };
  }

  return { frames: [], flipX: false };
}

async function hydrateDirection(frames, flipX, load) {
  const hydrated = [];
  for (const frame of frames) {
    const image = await load(frame.src);
    hydrated.push({
      image,
      flipX
    });
  }

  return hydrated;
}

export async function hydrateSpritePack(sourceIndex, options = {}) {
  const preferredPlayerId = options.preferredPlayerId || DEFAULT_PLAYER_ID;
  const fallbackPlayerId = options.fallbackPlayerId || DEFAULT_PLAYER_ID;
  const load = options.load || loadImage;

  const preferredPack = sourceIndex[preferredPlayerId] || null;
  const fallbackPack = preferredPlayerId === fallbackPlayerId ? null : sourceIndex[fallbackPlayerId] || null;
  const spriteMap = {};

  for (const direction of SPRITE_DIRECTIONS) {
    const { frames, flipX } = pickDirectionFrames(preferredPack, fallbackPack, direction);
    spriteMap[direction] = await hydrateDirection(frames, flipX, load);
  }

  return spriteMap;
}

export async function loadPlayerSprites() {
  const sourceIndex = buildSpriteSourceIndex(SPRITE_SOURCE_ENTRIES);
  const search = typeof window !== 'undefined' ? window.location.search : '';
  const requestedPlayerId = resolvePlayerIdFromSearch(search, DEFAULT_PLAYER_ID);
  const activePlayerId = pickPlayerId(sourceIndex, requestedPlayerId, DEFAULT_PLAYER_ID);

  if (!activePlayerId) {
    throw new Error('No player sprite packs found in assets/players');
  }

  const spriteMap = await hydrateSpritePack(sourceIndex, {
    preferredPlayerId: activePlayerId,
    fallbackPlayerId: DEFAULT_PLAYER_ID,
    load: loadImage
  });

  return {
    ...spriteMap,
    playerId: activePlayerId
  };
}

export function getPlayerFrame(sprites, direction, frame) {
  const frames = sprites?.[direction];
  if (!Array.isArray(frames) || frames.length === 0) {
    return null;
  }

  return frames[frame % frames.length] || null;
}
