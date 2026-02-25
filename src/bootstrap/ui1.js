import '../styles.css';
import { createGame } from '../create-game.js';

const canvas = document.querySelector('#game');
const menuCanvas = document.querySelector('#menu');
const controlsRoot = document.querySelector('#controls');

if (!(canvas instanceof HTMLCanvasElement)) {
  throw new Error('Canvas element not found');
}

const game = createGame({
  mode: 'ui1',
  canvas,
  menuCanvas,
  controlsRoot
});

window.__GAME = game;
game.start();
