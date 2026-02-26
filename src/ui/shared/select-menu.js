function normalizePath(pathname) {
  if (!pathname) {
    return '/';
  }

  return pathname;
}

function isCurrentPathActive(href) {
  const currentPath = normalizePath(window.location.pathname);
  const targetPath = normalizePath(new URL(href, window.location.href).pathname);

  if (currentPath === targetPath) {
    return true;
  }

  if (targetPath.endsWith('/index.html')) {
    const targetDir = targetPath.slice(0, -'index.html'.length);
    if (currentPath === targetDir || currentPath === `${targetDir}/`) {
      return true;
    }
  }

  return false;
}

function createSelectLink(link, closeMenu) {
  const element = document.createElement('a');
  element.className = 'shell-select-link';
  element.href = link.href;
  element.textContent = link.label;
  element.dataset.selectLinkId = link.id;

  if (isCurrentPathActive(link.href)) {
    element.classList.add('is-active');
    element.setAttribute('aria-current', 'page');
  }

  element.addEventListener('click', () => {
    closeMenu();
  });

  return element;
}

export function mountSelectMenu({ shell, links }) {
  if (!(shell instanceof HTMLElement)) {
    throw new Error('A valid shell element is required');
  }

  if (!Array.isArray(links) || links.length === 0) {
    throw new Error('Select links must be a non-empty array');
  }

  const existing = shell.querySelector('[data-shell-select-root="true"]');
  if (existing) {
    return () => {};
  }

  const hint = shell.querySelector('.hint');
  const row = document.createElement('div');
  row.className = 'shell-select-row';
  row.dataset.shellSelectRoot = 'true';

  const wrap = document.createElement('div');
  wrap.className = 'shell-select-wrap';

  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'ctrl-btn shell-select-btn';
  button.textContent = 'SELECT';
  button.setAttribute('aria-label', 'Open select menu');
  button.setAttribute('aria-expanded', 'false');

  const overlay = document.createElement('div');
  overlay.className = 'shell-select-overlay';
  overlay.hidden = true;

  const dialog = document.createElement('section');
  dialog.className = 'shell-select-dialog';
  dialog.setAttribute('role', 'dialog');
  dialog.setAttribute('aria-modal', 'true');
  dialog.setAttribute('aria-label', 'Select destination');

  const header = document.createElement('header');
  header.className = 'shell-select-header';

  const title = document.createElement('h2');
  title.className = 'shell-select-title';
  title.textContent = 'SELECT DESTINATION';

  const closeButton = document.createElement('button');
  closeButton.type = 'button';
  closeButton.className = 'shell-select-close';
  closeButton.setAttribute('aria-label', 'Close select menu');
  closeButton.textContent = 'X';

  const list = document.createElement('nav');
  list.className = 'shell-select-list';

  function closeMenu() {
    overlay.hidden = true;
    button.setAttribute('aria-expanded', 'false');
  }

  function openMenu() {
    overlay.hidden = false;
    button.setAttribute('aria-expanded', 'true');
    closeButton.focus();
  }

  function toggleMenu() {
    if (overlay.hidden) {
      openMenu();
      return;
    }

    closeMenu();
  }

  for (const link of links) {
    list.appendChild(createSelectLink(link, closeMenu));
  }

  const onButtonClick = (event) => {
    event.preventDefault();
    toggleMenu();
  };

  const onCloseButtonClick = (event) => {
    event.preventDefault();
    closeMenu();
  };

  const onOverlayPointerDown = (event) => {
    if (overlay.hidden) {
      return;
    }

    if (event.target instanceof Node && event.target !== overlay) {
      return;
    }

    closeMenu();
  };

  const onDocumentKeyDown = (event) => {
    if (event.key !== 'Escape') {
      return;
    }

    closeMenu();
  };

  button.addEventListener('click', onButtonClick);
  closeButton.addEventListener('click', onCloseButtonClick);
  overlay.addEventListener('pointerdown', onOverlayPointerDown);
  document.addEventListener('keydown', onDocumentKeyDown);

  header.append(title, closeButton);
  dialog.append(header, list);
  overlay.appendChild(dialog);
  document.body.appendChild(overlay);

  wrap.appendChild(button);
  row.appendChild(wrap);

  if (hint && hint.parentNode === shell) {
    shell.insertBefore(row, hint);
  } else {
    shell.appendChild(row);
  }

  return () => {
    button.removeEventListener('click', onButtonClick);
    closeButton.removeEventListener('click', onCloseButtonClick);
    overlay.removeEventListener('pointerdown', onOverlayPointerDown);
    document.removeEventListener('keydown', onDocumentKeyDown);
    overlay.remove();
    row.remove();
  };
}
