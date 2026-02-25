const DIRECTIONS = ['down', 'left', 'right', 'up'];
const FRAMES = [0, 1, 2, 3];

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(`Failed to load image: ${src}`));
    image.src = src;
  });
}

export async function loadPlayerSprites() {
  const spriteMap = {};

  for (const direction of DIRECTIONS) {
    spriteMap[direction] = [];
    for (const frame of FRAMES) {
      const name = String(frame).padStart(2, '0');
      const src = new URL(`../../assets/walk_${direction}_${name}.png`, import.meta.url).href;
      const image = await loadImage(src);
      spriteMap[direction].push(image);
    }
  }

  return spriteMap;
}

export function getPlayerFrame(sprites, direction, frame) {
  if (!sprites || !sprites[direction]) {
    return null;
  }

  return sprites[direction][frame % sprites[direction].length] || null;
}
