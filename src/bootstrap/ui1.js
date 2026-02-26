import '../styles.css';
import { createGame } from '../create-game.js';
import { SELECT_LINKS } from '../ui/shared/select-links.js';
import { mountSelectMenu } from '../ui/shared/select-menu.js';

const canvas = document.querySelector('#game');
const menuCanvas = document.querySelector('#menu');
const controlsRoot = document.querySelector('#controls');
const shell = document.querySelector('.gameboy-shell');

if (!(canvas instanceof HTMLCanvasElement)) {
  throw new Error('Canvas element not found');
}

if (!(shell instanceof HTMLElement)) {
  throw new Error('Gameboy shell not found');
}

const game = createGame({
  mode: 'ui1',
  canvas,
  menuCanvas,
  controlsRoot
});
const unmountSelectMenu = mountSelectMenu({
  shell,
  links: SELECT_LINKS
});

window.__GAME = game;
game.start();

if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    unmountSelectMenu();
    game.stop();
  });
}
