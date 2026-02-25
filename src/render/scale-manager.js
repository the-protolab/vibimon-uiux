export function createScaleManager(canvas, logicalWidth, logicalHeight, menuCanvas, menuLogicalWidth, menuLogicalHeight) {
  let scale = 1;

  function computeScale() {
    const parent = canvas.parentElement;
    const parentWidth = parent ? Math.floor(parent.getBoundingClientRect().width - 8) : window.innerWidth - 32;
    const viewportWidth = Math.max(1, Math.min(parentWidth, window.innerWidth - 32));
    const viewportHeight = Math.max(1, window.innerHeight - 360);
    const widthScale = Math.floor(viewportWidth / logicalWidth);
    const heightScale = Math.floor(viewportHeight / logicalHeight);

    return Math.max(1, Math.min(widthScale, heightScale));
  }

  function resize() {
    scale = computeScale();
    canvas.width = logicalWidth;
    canvas.height = logicalHeight;
    canvas.style.width = `${logicalWidth * scale}px`;
    canvas.style.height = `${logicalHeight * scale}px`;

    if (menuCanvas) {
      menuCanvas.width = menuLogicalWidth;
      menuCanvas.height = menuLogicalHeight;
      menuCanvas.style.width = `${menuLogicalWidth * scale}px`;
      menuCanvas.style.height = `${menuLogicalHeight * scale}px`;
    }
  }

  function mapClientToLogical(clientX, clientY) {
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor(((clientX - rect.left) / rect.width) * logicalWidth);
    const y = Math.floor(((clientY - rect.top) / rect.height) * logicalHeight);

    return {
      x: Math.max(0, Math.min(logicalWidth - 1, x)),
      y: Math.max(0, Math.min(logicalHeight - 1, y))
    };
  }

  function mapClientToLogicalMenu(clientX, clientY) {
    if (!menuCanvas) {
      return { x: 0, y: 0 };
    }

    const rect = menuCanvas.getBoundingClientRect();
    const x = Math.floor(((clientX - rect.left) / rect.width) * menuLogicalWidth);
    const y = Math.floor(((clientY - rect.top) / rect.height) * menuLogicalHeight);

    return {
      x: Math.max(0, Math.min(menuLogicalWidth - 1, x)),
      y: Math.max(0, Math.min(menuLogicalHeight - 1, y))
    };
  }

  return {
    resize,
    getScale: () => scale,
    mapClientToLogical,
    mapClientToLogicalMenu
  };
}
