// The renderer: paints the whole game into the one canvas — the HUD with its counter and
// clock, the two picture panels (painted once per scene into offscreen canvases by paint.js,
// then blitted), the found markers with their pop animation, hint pulses, miss crosses, and
// the title / paused / clear / time-up / summary screens laid over the top. Every button it
// draws is registered on state.buttons so input.js can hit-test the same rectangles.

import {
  FOOTER_TOP,
  HUD_HEIGHT,
  PANEL_HEIGHT,
  PANEL_LEFT_X,
  PANEL_RIGHT_X,
  PANEL_TOP,
  PANEL_WIDTH,
  VIEW_HEIGHT,
  VIEW_WIDTH,
} from './config.js';
import { paintScene } from './paint.js';
import { SCENES } from './scenes.js';
import {
  SCREEN_CLEAR,
  SCREEN_PAUSED,
  SCREEN_PLAY,
  SCREEN_SUMMARY,
  SCREEN_TIMEUP,
  SCREEN_TITLE,
  currentScene,
  differencesLeft,
  unfoundDifferences,
} from './state.js';

const FONT = 'system-ui, -apple-system, "Segoe UI", sans-serif';
const INK = '#eef1f5';
const MUTED = '#9aa5b8';
const ACCENT = '#ffcf3f';
const DANGER = '#ff6b5e';

function text(ctx, value, x, y, { size = 16, weight = 400, color = INK, align = 'left' } = {}) {
  ctx.fillStyle = color;
  ctx.font = `${weight} ${size}px ${FONT}`;
  ctx.textAlign = align;
  ctx.textBaseline = 'alphabetic';
  ctx.fillText(value, x, y);
}

function roundedRect(ctx, x, y, w, h, r, fill) {
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
  ctx.fill();
}

/** Draws a button and records its rectangle on state.buttons for the click handler. */
function drawButton(ctx, state, id, x, y, w, h, label, { enabled = true, primary = false } = {}) {
  roundedRect(ctx, x, y, w, h, 8, !enabled ? '#232833' : primary ? '#c9a227' : '#2b3247');
  ctx.strokeStyle = !enabled ? '#2e3444' : primary ? '#ffcf3f' : '#465069';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, 8);
  ctx.stroke();
  text(ctx, label, x + w / 2, y + h / 2 + 6, {
    size: 15,
    weight: 700,
    align: 'center',
    color: !enabled ? '#5c6577' : primary ? '#191405' : INK,
  });
  state.buttons.push({ id, x, y, w, h, enabled });
}

/** One found marker: a gold ring that pops outward, then settles with a check inside. */
function drawMarker(ctx, x, y, r, progress) {
  const eased = 1 - (1 - progress) * (1 - progress);
  const ringR = r * (0.45 + 0.55 * eased) + 4;
  ctx.beginPath();
  ctx.arc(x, y, ringR + 5, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255, 207, 63, 0.16)';
  ctx.fill();
  ctx.lineWidth = 7;
  ctx.strokeStyle = 'rgba(12, 14, 20, 0.75)';
  ctx.beginPath();
  ctx.arc(x, y, ringR, 0, Math.PI * 2);
  ctx.stroke();
  ctx.lineWidth = 3.6;
  ctx.strokeStyle = ACCENT;
  ctx.beginPath();
  ctx.arc(x, y, ringR, 0, Math.PI * 2);
  ctx.stroke();
  if (progress > 0.45) {
    const s = Math.min(1, (progress - 0.45) / 0.4) * Math.min(r, 20) * 0.5;
    ctx.strokeStyle = ACCENT;
    ctx.lineWidth = 3.4;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(x - s * 0.8, y + s * 0.1);
    ctx.lineTo(x - s * 0.25, y + s * 0.62);
    ctx.lineTo(x + s * 0.9, y - s * 0.55);
    ctx.stroke();
  }
}

/** A miss cross that fades and shrinks over half a second. */
function drawMissMark(ctx, x, y, progress) {
  const s = 11 * (1 - progress * 0.4);
  ctx.globalAlpha = 1 - progress;
  ctx.strokeStyle = DANGER;
  ctx.lineWidth = 3.4;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x - s, y - s);
  ctx.lineTo(x + s, y + s);
  ctx.moveTo(x + s, y - s);
  ctx.lineTo(x - s, y + s);
  ctx.stroke();
  ctx.globalAlpha = 1;
}

export function createRenderer(canvas) {
  const ctx = canvas.getContext('2d');
  let cache = { sceneIndex: -1, left: null, right: null };
  let best = 0;

  function panelImage(scene, mods) {
    const image = document.createElement('canvas');
    image.width = PANEL_WIDTH;
    image.height = PANEL_HEIGHT;
    paintScene(image.getContext('2d'), scene, mods);
    return image;
  }

  function panelsFor(state) {
    if (cache.sceneIndex !== state.sceneIndex) {
      const scene = currentScene(state);
      cache = {
        sceneIndex: state.sceneIndex,
        left: panelImage(scene, new Set()),
        right: panelImage(scene, new Set(scene.differences.map((d) => d.id))),
      };
    }
    return cache;
  }

  function drawPanels(state, now) {
    const { left, right } = panelsFor(state);
    let shakeX = 0;
    if (now < state.shakeUntil) {
      const remainingMs = state.shakeUntil - now;
      shakeX = Math.sin(now * 0.09) * 3.2 * (remainingMs / 260);
    }
    for (const [image, x, tag] of [[left, PANEL_LEFT_X, 'ORIGINAL'], [right, PANEL_RIGHT_X, 'THE TWIN']]) {
      ctx.drawImage(image, x + shakeX, PANEL_TOP);
      ctx.strokeStyle = '#39415a';
      ctx.lineWidth = 2;
      ctx.strokeRect(x + shakeX, PANEL_TOP, PANEL_WIDTH, PANEL_HEIGHT);
      roundedRect(ctx, x + shakeX + 10, PANEL_TOP + 10, tag.length * 8.4 + 18, 24, 6, 'rgba(10, 12, 20, 0.72)');
      text(ctx, tag, x + shakeX + 19, PANEL_TOP + 27, { size: 12, weight: 700, color: '#cfd8ea' });
    }
    // Found markers ride on both panels at once.
    const scene = currentScene(state);
    for (const difference of scene.differences) {
      if (!state.found.has(difference.id)) continue;
      const progress = Math.min(1, (now - state.foundAt.get(difference.id)) / 380);
      drawMarker(ctx, PANEL_LEFT_X + shakeX + difference.x, PANEL_TOP + difference.y, difference.r, progress);
      drawMarker(ctx, PANEL_RIGHT_X + shakeX + difference.x, PANEL_TOP + difference.y, difference.r, progress);
    }
    // A live hint pulse breathes over its neighbourhood on both panels.
    if (state.hintPulse && now - state.hintPulse.at < 1500) {
      const progress = (now - state.hintPulse.at) / 1500;
      for (const x0 of [PANEL_LEFT_X, PANEL_RIGHT_X]) {
        for (const phase of [0, 0.5]) {
          const p = (progress + phase) % 1;
          ctx.globalAlpha = (1 - p) * 0.8;
          ctx.strokeStyle = '#6be2ff';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(x0 + shakeX + state.hintPulse.x, PANEL_TOP + state.hintPulse.y, 18 + p * 40, 0, Math.PI * 2);
          ctx.stroke();
        }
      }
      ctx.globalAlpha = 1;
    }
    // Miss crosses fade where the player clicked wrong.
    for (const mark of state.missMarks) {
      const progress = (now - mark.at) / 550;
      if (progress >= 1) continue;
      drawMissMark(ctx, PANEL_LEFT_X + shakeX + mark.x, PANEL_TOP + mark.y, progress);
      drawMissMark(ctx, PANEL_RIGHT_X + shakeX + mark.x, PANEL_TOP + mark.y, progress);
    }
  }

  function drawHud(state, now) {
    const scene = currentScene(state);
    text(ctx, 'TWIN VISTA', 16, 32, { size: 21, weight: 800, color: ACCENT });
    text(ctx, `Scene ${state.sceneIndex + 1} of ${SCENES.length} · ${scene.name}`, 16, 56, { size: 13.5, color: MUTED });

    const foundCount = state.found.size;
    const total = scene.differences.length;
    text(ctx, `${foundCount} OF ${total} FOUND`, VIEW_WIDTH / 2, 36, { size: 27, weight: 800, align: 'center' });
    const left = differencesLeft(state);
    text(ctx, left === 0 ? 'that is the lot — nicely spotted' : `${left} difference${left === 1 ? '' : 's'} still hiding`, VIEW_WIDTH / 2, 60, {
      size: 14,
      align: 'center',
      color: left === 0 ? ACCENT : MUTED,
    });

    // The clock: a number and a draining bar, red and pulsing under 30 seconds.
    const seconds = Math.max(0, Math.ceil(state.timeLeft));
    const clock = `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
    const urgent = state.screen === SCREEN_PLAY && state.timeLeft < 30;
    const pulse = urgent ? 0.72 + 0.28 * Math.sin(now * 0.012) : 1;
    ctx.globalAlpha = pulse;
    text(ctx, clock, VIEW_WIDTH - 16, 36, { size: 27, weight: 800, align: 'right', color: urgent ? DANGER : INK });
    ctx.globalAlpha = 1;
    const barW = 216;
    const fraction = Math.max(0, Math.min(1, state.timeLeft / scene.timeLimit));
    roundedRect(ctx, VIEW_WIDTH - 16 - barW, 48, barW, 9, 4, '#262c3e');
    if (fraction > 0) roundedRect(ctx, VIEW_WIDTH - 16 - barW, 48, barW * fraction, 9, 4, urgent ? DANGER : '#57c785');

    text(ctx, `SCORE ${state.score}`, VIEW_WIDTH - 248, 36, { size: 16, weight: 700, align: 'right', color: ACCENT });
    text(ctx, `best ${best}`, VIEW_WIDTH - 248, 58, { size: 12.5, align: 'right', color: MUTED });
  }

  function drawFooter(state) {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.fillRect(0, FOOTER_TOP - 8, VIEW_WIDTH, 1.5);
    text(ctx, state.message, 16, FOOTER_TOP + 26, { size: 14.5, color: '#cfd8ea' });
    text(ctx, 'Click a difference in either picture · H hint · Space pause · R restart scene', 16, FOOTER_TOP + 50, { size: 12, color: MUTED });
    if (state.screen === SCREEN_PLAY) {
      drawButton(ctx, state, 'hint', 830, FOOTER_TOP + 8, 108, 40, `Hint (${state.hintsLeft})`, { enabled: state.hintsLeft > 0 });
      drawButton(ctx, state, 'pause', 950, FOOTER_TOP + 8, 96, 40, 'Pause');
      drawButton(ctx, state, 'restart', 1058, FOOTER_TOP + 8, 110, 40, 'Restart');
    }
  }

  function overlay(alpha = 0.78) {
    ctx.fillStyle = `rgba(8, 10, 17, ${alpha})`;
    ctx.fillRect(0, 0, VIEW_WIDTH, VIEW_HEIGHT);
  }

  function drawTitle(state) {
    overlay(0.74);
    text(ctx, 'TWIN VISTA', VIEW_WIDTH / 2, 168, { size: 68, weight: 800, align: 'center', color: ACCENT });
    text(ctx, 'S P O T   T H E   D I F F E R E N C E', VIEW_WIDTH / 2, 204, { size: 19, weight: 600, align: 'center', color: INK });
    text(ctx, 'Two pictures, side by side. They agree on everything — except a handful of planted changes.', VIEW_WIDTH / 2, 258, { size: 16.5, align: 'center', color: '#cfd8ea' });
    text(ctx, 'Four scenes · 34 differences · a clock that will not wait for you.', VIEW_WIDTH / 2, 286, { size: 16.5, align: 'center', color: '#cfd8ea' });
    text(ctx, 'Click a difference in either panel to mark it in both. A miss costs 3 seconds. Three hints a scene, if you must.', VIEW_WIDTH / 2, 322, { size: 14.5, align: 'center', color: MUTED });
    text(ctx, SCENES.map((s) => `${s.name} (${s.differences.length})`).join('   ·   '), VIEW_WIDTH / 2, 356, { size: 14.5, align: 'center', color: MUTED });
    drawButton(ctx, state, 'start', VIEW_WIDTH / 2 - 105, 392, 210, 52, 'Start spotting', { primary: true });
    if (best > 0) text(ctx, `Your best run: ${best}`, VIEW_WIDTH / 2, 486, { size: 14, align: 'center', color: ACCENT });
  }

  function drawPaused() {
    overlay(0.66);
    text(ctx, 'PAUSED', VIEW_WIDTH / 2, 250, { size: 44, weight: 800, align: 'center' });
    text(ctx, 'The clock is holding its breath.', VIEW_WIDTH / 2, 288, { size: 16, align: 'center', color: MUTED });
    drawButton(ctx, state, 'resume', VIEW_WIDTH / 2 - 170, 330, 160, 48, 'Resume', { primary: true });
    drawButton(ctx, state, 'restart', VIEW_WIDTH / 2 + 10, 330, 160, 48, 'Restart scene');
  }

  function drawClear(state) {
    overlay(0.8);
    const result = state.results[state.sceneIndex];
    text(ctx, 'SCENE CLEAR!', VIEW_WIDTH / 2, 218, { size: 46, weight: 800, align: 'center', color: ACCENT });
    text(ctx, `Every one of the ${result.total} differences in ${result.name}, found.`, VIEW_WIDTH / 2, 264, { size: 17, align: 'center', color: '#cfd8ea' });
    text(ctx, `Time bonus +${result.bonus} · Score ${state.score}`, VIEW_WIDTH / 2, 300, { size: 17, align: 'center', color: INK });
    const last = state.sceneIndex + 1 >= SCENES.length;
    drawButton(ctx, state, 'next', VIEW_WIDTH / 2 - 95, 348, 190, 50, last ? 'See the results' : 'Next scene', { primary: true });
  }

  function drawTimeUp(state) {
    overlay(0.84);
    const result = state.results[state.sceneIndex];
    text(ctx, "TIME'S UP", VIEW_WIDTH / 2, 168, { size: 44, weight: 800, align: 'center', color: DANGER });
    text(ctx, `You found ${result.found} of ${result.total} differences in ${result.name}.`, VIEW_WIDTH / 2, 208, { size: 17, align: 'center', color: '#cfd8ea' });
    text(ctx, 'Still hiding:', VIEW_WIDTH / 2, 248, { size: 14, weight: 700, align: 'center', color: MUTED });
    const missed = unfoundDifferences(state);
    missed.slice(0, 6).forEach((difference, index) => {
      text(ctx, `· ${difference.label}`, VIEW_WIDTH / 2, 276 + index * 24, { size: 15, align: 'center', color: '#cfd8ea' });
    });
    if (missed.length > 6) text(ctx, `· …and ${missed.length - 6} more`, VIEW_WIDTH / 2, 276 + 6 * 24, { size: 15, align: 'center', color: MUTED });
    drawButton(ctx, state, 'retry', VIEW_WIDTH / 2 - 180, 448, 170, 48, 'Retry scene');
    const last = state.sceneIndex + 1 >= SCENES.length;
    drawButton(ctx, state, 'next', VIEW_WIDTH / 2 + 10, 448, 170, 48, last ? 'See the results' : 'Carry on', { primary: true });
  }

  function drawSummary(state) {
    overlay(0.9);
    text(ctx, 'EXPEDITION COMPLETE', VIEW_WIDTH / 2, 108, { size: 38, weight: 800, align: 'center', color: ACCENT });
    const totalFound = state.results.reduce((sum, r) => sum + (r?.found ?? 0), 0);
    const totalDiffs = SCENES.reduce((sum, s) => sum + s.differences.length, 0);
    let y = 168;
    for (const [index, scene] of SCENES.entries()) {
      const result = state.results[index];
      const label = result ? `${result.found} / ${result.total} found${result.cleared ? ' · cleared' : ''}` : 'not played';
      text(ctx, scene.name, VIEW_WIDTH / 2 - 240, y, { size: 17, weight: 600 });
      text(ctx, label, VIEW_WIDTH / 2 + 240, y, { size: 17, align: 'right', color: result?.cleared ? '#57c785' : MUTED });
      y += 34;
    }
    const accuracy = state.totalClicks > 0 ? Math.round((state.totalFinds / state.totalClicks) * 100) : 100;
    text(ctx, `${totalFound} of ${totalDiffs} differences · accuracy ${accuracy}%`, VIEW_WIDTH / 2, y + 14, { size: 17, align: 'center', color: '#cfd8ea' });
    text(ctx, `FINAL SCORE ${state.score}`, VIEW_WIDTH / 2, y + 58, { size: 30, weight: 800, align: 'center', color: ACCENT });
    if (best > 0) text(ctx, `Best run: ${best}`, VIEW_WIDTH / 2, y + 88, { size: 14, align: 'center', color: MUTED });
    drawButton(ctx, state, 'again', VIEW_WIDTH / 2 - 95, y + 116, 190, 50, 'Play again', { primary: true });
  }

  /** Paints one whole frame: stage, HUD, panels, footer, and any screen laid over them. */
  function draw(state, now) {
    state.buttons = [];
    ctx.fillStyle = '#10131f';
    ctx.fillRect(0, 0, VIEW_WIDTH, VIEW_HEIGHT);
    ctx.fillStyle = '#171b29';
    ctx.fillRect(0, 0, VIEW_WIDTH, HUD_HEIGHT);
    drawPanels(state, now);
    drawHud(state, now);
    drawFooter(state);
    if (state.screen === SCREEN_TITLE) drawTitle(state);
    else if (state.screen === SCREEN_PAUSED) drawPaused();
    else if (state.screen === SCREEN_CLEAR) drawClear(state);
    else if (state.screen === SCREEN_TIMEUP) drawTimeUp(state);
    else if (state.screen === SCREEN_SUMMARY) drawSummary(state);
  }

  return {
    draw,
    /** Tells the renderer the stored best score, for the HUD and the title screen. */
    setBest(value) {
      best = value;
    },
  };
}
