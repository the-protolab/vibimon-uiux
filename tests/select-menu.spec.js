import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { SELECT_LINKS } from '../src/ui/shared/select-links.js';
import { mountSelectMenu } from '../src/ui/shared/select-menu.js';

function createShell() {
  const shell = document.createElement('section');
  shell.className = 'gameboy-shell';

  const controls = document.createElement('section');
  controls.className = 'controls';
  shell.appendChild(controls);

  const hint = document.createElement('p');
  hint.className = 'hint';
  shell.appendChild(hint);

  document.body.appendChild(shell);
  return shell;
}

function getSelectElements(shell) {
  const row = shell.querySelector('.shell-select-row');
  const button = shell.querySelector('.shell-select-btn');
  const overlay = document.querySelector('.shell-select-overlay');
  const dialog = document.querySelector('.shell-select-dialog');
  const close = document.querySelector('.shell-select-close');

  if (!(row instanceof HTMLElement)) {
    throw new Error('Select row not mounted');
  }
  if (!(button instanceof HTMLButtonElement)) {
    throw new Error('Select button not mounted');
  }
  if (!(overlay instanceof HTMLElement)) {
    throw new Error('Select overlay not mounted');
  }
  if (!(dialog instanceof HTMLElement)) {
    throw new Error('Select dialog not mounted');
  }
  if (!(close instanceof HTMLButtonElement)) {
    throw new Error('Select close button not mounted');
  }

  return { row, button, overlay, dialog, close };
}

function click(element) {
  element.dispatchEvent(new Event('click', { bubbles: true, cancelable: true }));
}

beforeEach(() => {
  document.body.innerHTML = '';
  window.history.replaceState({}, '', '/ui1.html');
});

afterEach(() => {
  document.body.innerHTML = '';
});

describe('select menu component', () => {
  it('mounts the select row before hint and keeps overlay hidden initially', () => {
    const shell = createShell();
    const cleanup = mountSelectMenu({ shell, links: SELECT_LINKS });
    const { row, button, overlay } = getSelectElements(shell);
    const hint = shell.querySelector('.hint');

    expect(row.nextElementSibling).toBe(hint);
    expect(button.textContent).toBe('SELECT');
    expect(overlay.hidden).toBe(true);
    cleanup();
  });

  it('opens and closes overlay on button toggle', () => {
    const shell = createShell();
    const cleanup = mountSelectMenu({ shell, links: SELECT_LINKS });
    const { button, overlay } = getSelectElements(shell);

    click(button);
    expect(overlay.hidden).toBe(false);
    expect(button.getAttribute('aria-expanded')).toBe('true');

    click(button);
    expect(overlay.hidden).toBe(true);
    expect(button.getAttribute('aria-expanded')).toBe('false');
    cleanup();
  });

  it('closes overlay on backdrop click and Escape', () => {
    const shell = createShell();
    const cleanup = mountSelectMenu({ shell, links: SELECT_LINKS });
    const { button, overlay } = getSelectElements(shell);

    click(button);
    expect(overlay.hidden).toBe(false);

    overlay.dispatchEvent(new Event('pointerdown', { bubbles: true, cancelable: true }));
    expect(overlay.hidden).toBe(true);

    click(button);
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    expect(overlay.hidden).toBe(true);
    cleanup();
  });

  it('closes overlay on close button click', () => {
    const shell = createShell();
    const cleanup = mountSelectMenu({ shell, links: SELECT_LINKS });
    const { button, overlay, close } = getSelectElements(shell);

    click(button);
    expect(overlay.hidden).toBe(false);

    click(close);
    expect(overlay.hidden).toBe(true);
    cleanup();
  });

  it('renders all links from shared source', () => {
    const shell = createShell();
    const cleanup = mountSelectMenu({ shell, links: SELECT_LINKS });
    const links = Array.from(document.querySelectorAll('.shell-select-link'));

    expect(links).toHaveLength(SELECT_LINKS.length);
    SELECT_LINKS.forEach((item, index) => {
      const link = links[index];
      expect(link.getAttribute('href')).toBe(item.href);
      expect(link.textContent).toBe(item.label);
    });
    cleanup();
  });

  it('marks the active link based on current path', () => {
    window.history.replaceState({}, '', '/ui2.html');
    const shell = createShell();
    const cleanup = mountSelectMenu({ shell, links: SELECT_LINKS });

    const active = document.querySelector('.shell-select-link.is-active');
    expect(active).not.toBeNull();
    expect(active?.textContent).toBe('UI 2');
    cleanup();
  });

  it('closes overlay when selecting a link and keeps same-tab navigation', () => {
    const shell = createShell();
    const cleanup = mountSelectMenu({ shell, links: SELECT_LINKS });
    const { button, overlay } = getSelectElements(shell);
    const link = document.querySelector('.shell-select-link');

    if (!(link instanceof HTMLAnchorElement)) {
      throw new Error('Link not mounted');
    }

    click(button);
    expect(overlay.hidden).toBe(false);

    click(link);
    expect(overlay.hidden).toBe(true);
    expect(link.getAttribute('target')).toBeNull();
    cleanup();
  });

  it('does not duplicate component if mounted twice on the same shell', () => {
    const shell = createShell();
    const cleanupFirst = mountSelectMenu({ shell, links: SELECT_LINKS });
    const cleanupSecond = mountSelectMenu({ shell, links: SELECT_LINKS });

    expect(shell.querySelectorAll('.shell-select-row')).toHaveLength(1);
    cleanupSecond();
    cleanupFirst();
  });

  it('cleanup removes row and overlay from the DOM', () => {
    const shell = createShell();
    const cleanup = mountSelectMenu({ shell, links: SELECT_LINKS });

    cleanup();
    expect(shell.querySelector('.shell-select-row')).toBeNull();
    expect(document.querySelector('.shell-select-overlay')).toBeNull();
  });
});
