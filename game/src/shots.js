// Deterministic staging, for screenshots and for jumping straight into a scene.
//
// ?shot=start|play|end freezes the game on one real frame of itself: the title screen, a
// scene mid-hunt with some differences already ringed and several still hiding, or the final
// summary. main.js paints it with a fixed clock, so the same URL always gives the same frame.
//
// ?scene=N&found=K (without ?shot) starts a playable game in scene N with the first K of its
// differences already marked — a developer shortcut for reaching a mid-game state at once,
// and the way the screenshot session stages the play frame's scene and finds.

import { SCENES } from './scenes.js';
import { SCREEN_SUMMARY, SCREEN_TITLE, startScene } from './state.js';

/** Clamps a 1-based scene query value to a valid scene index. */
function sceneIndexFrom(param) {
  const n = Number.parseInt(param ?? '', 10);
  if (!Number.isInteger(n)) return 0;
  return Math.min(Math.max(n - 1, 0), SCENES.length - 1);
}

/** Marks the first `count` differences of the current scene found, as of `baseTime`. */
function markFound(state, count, baseTime) {
  const scene = SCENES[state.sceneIndex];
  const n = Math.min(Math.max(count, 0), scene.differences.length);
  for (let i = 0; i < n; i += 1) {
    const difference = scene.differences[i];
    state.found.add(difference.id);
    state.foundAt.set(difference.id, baseTime + i * 120);
    state.totalFinds += 1;
    state.score += 100;
  }
  return n;
}

/**
 * Sets `state` to the named screenshot frame. `fixedNow` is the clock main.js will paint
 * with, so marker animations are staged relative to it and come out settled.
 */
export function stageShot(name, state, { sceneParam = null, foundParam = null, fixedNow = 2000 } = {}) {
  if (name === 'play') {
    startScene(state, sceneIndexFrom(sceneParam));
    const wanted = foundParam === null ? 3 : Number.parseInt(foundParam, 10) || 0;
    const marked = markFound(state, wanted, fixedNow - 800);
    const scene = SCENES[state.sceneIndex];
    state.timeLeft = Math.max(30, scene.timeLimit - 53);
    state.message = marked > 0
      ? `Found one: ${scene.differences[marked - 1].label}. ${scene.differences.length - marked} to go.`
      : state.message;
    return;
  }
  if (name === 'end') {
    // A believable finished run: three scenes cleared, the last one two short.
    const foundCounts = [7, 8, 9, 8];
    state.results = SCENES.map((scene, index) => ({
      name: scene.name,
      found: foundCounts[index],
      total: scene.differences.length,
      cleared: foundCounts[index] === scene.differences.length,
      bonus: foundCounts[index] === scene.differences.length ? 120 : 0,
      clicks: foundCounts[index] + 2,
    }));
    state.totalFinds = foundCounts.reduce((a, b) => a + b, 0);
    state.totalClicks = state.totalFinds + 7;
    state.score = state.totalFinds * 100 + 360;
    state.screen = SCREEN_SUMMARY;
    return;
  }
  state.screen = SCREEN_TITLE;
}

/** Starts a live game in the scene the query names, with its first K differences marked. */
export function stagePlayable(state, sceneParam, foundParam, now) {
  startScene(state, sceneIndexFrom(sceneParam));
  const wanted = foundParam === null ? 0 : Number.parseInt(foundParam, 10) || 0;
  if (wanted > 0) markFound(state, wanted, now - 1000);
}
