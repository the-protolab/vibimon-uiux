export function snapToGrid(value, gridSize) {
  return Math.round(value / gridSize) * gridSize;
}

export function isAligned(value, gridSize) {
  return value % gridSize === 0;
}

export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

export function toTile(pixelValue, gridSize) {
  return Math.floor(pixelValue / gridSize);
}

export function toPixel(tileValue, gridSize) {
  return tileValue * gridSize;
}
