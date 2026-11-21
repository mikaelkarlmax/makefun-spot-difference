// Boot and the one loop: Twin Vista's screens, clock and clicks live here, gluing the rules
// in state.js to the pointer and keyboard from input.js and the painting in render.js.
//
// Query strings: ?scene=N starts playing in scene N; &found=K pre-marks its first K
// differences; ?shot=start|play|end stages one fixed frame of the game and sets
// window.__shotReady once it is painted, for screenshots.
import { BEST_KEY, FIND_POINTS } from './config.js';
import { playClear, playClick, playFind, playHint, playMiss, playTick, toggleMuted } from './audio.js';
import { buttonAt, createInput, panelPointAt } from './input.js';
import { createRenderer } from './render.js';
import { stagePlayable, stageShot } from './shots.js';
import {
  SCREEN_CLEAR,
  SCREEN_PAUSED,
  SCREEN_PLAY,
  SCREEN_SUMMARY,
  SCREEN_TIMEUP,
  SCREEN_TITLE,
  advance,
  createGame,
  currentScene,
  differencesLeft,
  finishScene,
  registerClick,
  startRun,
  startScene,
  tickClock,
  useHint,
} from './state.js';

const params = new URLSearchParams(window.location.search);
const canvas = document.getElementById('game');
const status = document.getElementById('status');
const state = createGame();
const renderer = createRenderer(canvas);

function readBest() {
  try {
    return Number.parseInt(window.localStorage.getItem(BEST_KEY) ?? '0', 10) || 0;
  } catch {
    return 0;
  }
}

function saveBest(value) {
  try {
    window.localStorage.setItem(BEST_KEY, String(value));
  } catch {
    // Storage can be off (private windows): the best score then lasts this visit only.
  }
}

let best = readBest();
renderer.setBest(best);

/** Keeps the canvas as large as the window allows, at the game's fixed aspect. */
function fitCanvas() {
  const scale = Math.min(window.innerWidth / 1184, window.innerHeight / 576);
  canvas.style.width = `${Math.floor(1184 * scale)}px`;
  canvas.style.height = `${Math.floor(576 * scale)}px`;
}
window.addEventListener('resize', fitCanvas);
fitCanvas();

function announce(message) {
  if (message) status.textContent = message;
}

/** Undoes the points a half-played (or timed-out) scene already banked, before a restart. */
function rollbackSceneProgress() {
  const banked = state.found.size * FIND_POINTS;
  state.score = Math.max(0, state.score - banked);
  state.totalFinds -= state.found.size;
  state.results[state.sceneIndex] = undefined;
}

function goNext() {
  playClick();
  if (advance(state) === 'summary' && state.score > best) {
    best = state.score;
    saveBest(best);
    renderer.setBest(best);
  }
  announce(state.message);
}

function doHint(now) {
  if (useHint(state, now)) {
    playHint();
    announce(state.message);
  }
}

function handleButton(id, now) {
  switch (id) {
    case 'start':
    case 'again':
      playClick();
      startRun(state);
      announce(state.message);
      break;
    case 'next':
      goNext();
      break;
    case 'retry':
      playClick();
      rollbackSceneProgress();
      startScene(state, state.sceneIndex);
      announce(state.message);
      break;
    case 'restart':
      playClick();
      rollbackSceneProgress();
      startScene(state, state.sceneIndex);
      announce(state.message);
      break;
    case 'pause':
      state.screen = SCREEN_PAUSED;
      announce('Paused.');
      break;
    case 'resume':
      state.screen = SCREEN_PLAY;
      announce(state.message);
      break;
    default:
      break;
  }
}

function onPointer(viewX, viewY) {
  const now = performance.now();
  const buttonId = buttonAt(state.buttons, viewX, viewY);
  if (buttonId) {
    if (buttonId === 'hint') doHint(now);
    else handleButton(buttonId, now);
    return;
  }
  if (state.screen !== SCREEN_PLAY) return;
  const panel = panelPointAt(viewX, viewY);
  if (!panel) return;
  const found = registerClick(state, panel.x, panel.y, now);
  if (found) {
    playFind();
    if (differencesLeft(state) === 0) {
      finishScene(state, true);
      playClear();
      announce(`Scene clear. Every difference in ${currentScene(state).name} found.`);
      return;
    }
  } else {
    playMiss();
  }
  announce(state.message);
}

function onKey(action) {
  const now = performance.now();
  if (action === 'mute') {
    announce(toggleMuted() ? 'Sound off.' : 'Sound on.');
    return;
  }
  if (action === 'hint') {
    if (state.screen === SCREEN_PLAY) doHint(now);
    return;
  }
  if (action === 'restart') {
    if (state.screen === SCREEN_PLAY || state.screen === SCREEN_PAUSED || state.screen === SCREEN_TIMEUP) {
      handleButton('retry', now);
    }
    return;
  }
  if (action === 'pause') {
    if (state.screen === SCREEN_PLAY) state.screen = SCREEN_PAUSED;
    else if (state.screen === SCREEN_PAUSED) state.screen = SCREEN_PLAY;
    return;
  }
  if (action === 'confirm') {
    if (state.screen === SCREEN_TITLE || state.screen === SCREEN_SUMMARY) handleButton('start', now);
    else if (state.screen === SCREEN_CLEAR || state.screen === SCREEN_TIMEUP) goNext();
    else if (state.screen === SCREEN_PAUSED) state.screen = SCREEN_PLAY;
  }
}

const SHOT_NOW = 2000;

function runShot(name) {
  stageShot(name, state, {
    sceneParam: params.get('scene'),
    foundParam: params.get('found'),
    fixedNow: SHOT_NOW,
  });
  if (name === 'end') renderer.setBest(state.score);
  let painted = 0;
  function paint() {
    renderer.draw(state, SHOT_NOW);
    painted += 1;
    if (painted < 2) requestAnimationFrame(paint);
    else window.__shotReady = true;
  }
  requestAnimationFrame(paint);
}

function runGame() {
  createInput(canvas, { onPointer, onKey });
  if (params.has('scene') || params.has('found')) {
    stagePlayable(state, params.get('scene'), params.get('found'), performance.now());
  }
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && state.screen === SCREEN_PLAY) {
      state.screen = SCREEN_PAUSED;
      announce('Paused.');
    }
  });
  announce('Twin Vista. Two pictures, thirty-four hidden differences. Press Space or click Start.');
  let last = performance.now();
  let lastAnnounced = '';
  function frame(now) {
    requestAnimationFrame(frame);
    const dt = Math.min((now - last) / 1000, 0.25);
    last = now;
    if (state.screen === SCREEN_PLAY) {
      const event = tickClock(state, dt);
      if (event === 'tick') playTick();
      else if (event === 'timeout') {
        finishScene(state, false);
        announce(`Time is up in ${currentScene(state).name}.`);
      }
    }
    if (state.missMarks.length > 12) state.missMarks.splice(0, state.missMarks.length - 12);
    renderer.draw(state, now);
    if (state.message !== lastAnnounced) {
      lastAnnounced = state.message;
      announce(state.message);
    }
  }
  requestAnimationFrame(frame);
}

const shot = params.get('shot');
if (shot) runShot(shot);
else runGame();
