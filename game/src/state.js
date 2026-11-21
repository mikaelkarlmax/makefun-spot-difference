// The rules of Twin Vista, with no drawing and no input in it: a game state, the scenes it
// walks through, what a click does, what a hint costs, and how the clock runs out. main.js
// feeds it pointer and keyboard events; render.js paints whatever it holds.

import {
  CLICK_MIN_RADIUS,
  CLEAR_BONUS_PER_SECOND,
  FIND_POINTS,
  HINTS_PER_SCENE,
  HINT_COST,
  MISS_TIME_PENALTY,
} from './config.js';
import { SCENES } from './scenes.js';

export const SCREEN_TITLE = 'title';
export const SCREEN_PLAY = 'play';
export const SCREEN_PAUSED = 'paused';
export const SCREEN_CLEAR = 'clear';
export const SCREEN_TIMEUP = 'timeup';
export const SCREEN_SUMMARY = 'summary';

/** A fresh game, sitting on its title screen. */
export function createGame() {
  return {
    screen: SCREEN_TITLE,
    sceneIndex: 0,
    score: 0,
    found: new Set(),
    foundAt: new Map(),
    hintsLeft: HINTS_PER_SCENE,
    hintedIds: [],
    hintPulse: null,
    missMarks: [],
    shakeUntil: 0,
    timeLeft: 0,
    sceneClicks: 0,
    totalFinds: 0,
    totalClicks: 0,
    results: [],
    buttons: [],
    message: '',
  };
}

export function currentScene(state) {
  return SCENES[state.sceneIndex];
}

export function differencesLeft(state) {
  return currentScene(state).differences.length - state.found.size;
}

/** Starts a whole run again from the first scene, score wiped. */
export function startRun(state) {
  state.score = 0;
  state.totalFinds = 0;
  state.totalClicks = 0;
  state.results = [];
  startScene(state, 0);
}

/** Sets one scene up: nothing found, a full hint pouch, a full clock. */
export function startScene(state, index) {
  state.sceneIndex = index;
  state.found = new Set();
  state.foundAt = new Map();
  state.hintsLeft = HINTS_PER_SCENE;
  state.hintedIds = [];
  state.hintPulse = null;
  state.missMarks = [];
  state.sceneClicks = 0;
  state.timeLeft = currentScene(state).timeLimit;
  state.screen = SCREEN_PLAY;
  state.message = `Scene ${index + 1} of ${SCENES.length}: ${currentScene(state).name}. ${currentScene(state).differences.length} differences hide here.`;
}

/**
 * A click in scene coordinates. Returns the difference it claimed, or null for a miss.
 * A miss is never free: it costs seconds off the clock and shakes the panels.
 */
export function registerClick(state, x, y, now) {
  const scene = currentScene(state);
  state.sceneClicks += 1;
  state.totalClicks += 1;
  for (const difference of scene.differences) {
    if (state.found.has(difference.id)) continue;
    const radius = Math.max(difference.r, CLICK_MIN_RADIUS);
    const dx = x - difference.x;
    const dy = y - difference.y;
    if (dx * dx + dy * dy <= radius * radius) {
      state.found.add(difference.id);
      state.foundAt.set(difference.id, now);
      state.totalFinds += 1;
      state.score += FIND_POINTS;
      state.message = `Found one: ${difference.label}. ${differencesLeft(state)} to go.`;
      return difference;
    }
  }
  state.timeLeft = Math.max(0, state.timeLeft - MISS_TIME_PENALTY);
  state.shakeUntil = now + 260;
  state.missMarks.push({ x, y, at: now });
  state.message = `Not there. -${MISS_TIME_PENALTY} seconds.`;
  return null;
}

/**
 * Spends one hint: it pulses a soft ring in the general area of an unhinted, unfound
 * difference — near it, never exactly on it — and costs points as well as the hint itself.
 */
export function useHint(state, now) {
  if (state.hintsLeft <= 0 || state.screen !== SCREEN_PLAY) return null;
  const scene = currentScene(state);
  const candidates = scene.differences.filter(
    (difference) => !state.found.has(difference.id) && !state.hintedIds.includes(difference.id),
  );
  const target = candidates[0] ?? scene.differences.find((difference) => !state.found.has(difference.id));
  if (!target) return null;
  state.hintsLeft -= 1;
  state.score = Math.max(0, state.score - HINT_COST);
  state.hintedIds.push(target.id);
  // A fixed, per-difference offset: the ring warms the neighbourhood, not the spot.
  const wobble = (target.id.length * 37 + target.x) % 40;
  state.hintPulse = {
    x: target.x + (wobble - 20),
    y: target.y + ((wobble * 7) % 30) - 15,
    at: now,
  };
  state.message = 'Somewhere inside the ring…';
  return target;
}

/**
 * Advances the clock. Returns 'timeout' once when the scene's time is gone, 'tick' on each
 * whole second inside the last ten (so main.js can tick audibly), otherwise null.
 */
export function tickClock(state, dt) {
  if (state.screen !== SCREEN_PLAY) return null;
  const before = Math.ceil(state.timeLeft);
  state.timeLeft = Math.max(0, state.timeLeft - dt);
  const after = Math.ceil(state.timeLeft);
  if (state.timeLeft <= 0) return 'timeout';
  if (after !== before && after <= 10) return 'tick';
  return null;
}

/** Closes the scene out: banks the time bonus on a clear, records the result row. */
export function finishScene(state, cleared) {
  const scene = currentScene(state);
  const bonus = cleared ? Math.ceil(state.timeLeft) * CLEAR_BONUS_PER_SECOND : 0;
  state.score += bonus;
  state.results[state.sceneIndex] = {
    name: scene.name,
    found: state.found.size,
    total: scene.differences.length,
    cleared,
    bonus,
    clicks: state.sceneClicks,
  };
  state.screen = cleared ? SCREEN_CLEAR : SCREEN_TIMEUP;
  return bonus;
}

/** Moves on from a finished scene: the next scene, or the run's summary after the last. */
export function advance(state) {
  if (state.sceneIndex + 1 < SCENES.length) {
    startScene(state, state.sceneIndex + 1);
    return 'scene';
  }
  state.screen = SCREEN_SUMMARY;
  return 'summary';
}

/** The differences of the current scene the player never found, for the time-up recap. */
export function unfoundDifferences(state) {
  return currentScene(state).differences.filter((difference) => !state.found.has(difference.id));
}
