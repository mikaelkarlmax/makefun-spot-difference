// Pointer and keyboard input. A pointer press is reported in view coordinates, along with
// the panel and scene coordinates it lands in when it lands on a picture; key presses are
// reported by name. main.js decides what any of it means — this file only translates.

import {
  PANEL_HEIGHT,
  PANEL_LEFT_X,
  PANEL_RIGHT_X,
  PANEL_TOP,
  PANEL_WIDTH,
  VIEW_HEIGHT,
  VIEW_WIDTH,
} from './config.js';

/** Converts a client (CSS pixel) point into the canvas's fixed view coordinates. */
export function toViewPoint(canvas, clientX, clientY) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: ((clientX - rect.left) / rect.width) * VIEW_WIDTH,
    y: ((clientY - rect.top) / rect.height) * VIEW_HEIGHT,
  };
}

/**
 * Which panel a view point falls on, and where inside the scene's 568 by 400 space:
 * { side: 'left' | 'right', x, y } — or null when the point is on neither panel.
 */
export function panelPointAt(viewX, viewY) {
  if (viewY < PANEL_TOP || viewY >= PANEL_TOP + PANEL_HEIGHT) return null;
  if (viewX >= PANEL_LEFT_X && viewX < PANEL_LEFT_X + PANEL_WIDTH) {
    return { side: 'left', x: viewX - PANEL_LEFT_X, y: viewY - PANEL_TOP };
  }
  if (viewX >= PANEL_RIGHT_X && viewX < PANEL_RIGHT_X + PANEL_WIDTH) {
    return { side: 'right', x: viewX - PANEL_RIGHT_X, y: viewY - PANEL_TOP };
  }
  return null;
}

/** The enabled button under a view point, from the rectangles the renderer last drew. */
export function buttonAt(buttons, viewX, viewY) {
  for (const button of buttons) {
    if (!button.enabled) continue;
    if (viewX >= button.x && viewX < button.x + button.w && viewY >= button.y && viewY < button.y + button.h) {
      return button.id;
    }
  }
  return null;
}

/**
 * Wires the canvas and window to two handlers: onPointer(viewX, viewY) for a press, and
 * onKey(action) with 'confirm', 'pause', 'hint', 'restart' or 'mute' for a key press.
 */
export function createInput(canvas, { onPointer, onKey }) {
  canvas.addEventListener('pointerdown', (event) => {
    const point = toViewPoint(canvas, event.clientX, event.clientY);
    onPointer(point.x, point.y);
  });

  const KEY_ACTIONS = new Map([
    ['Space', 'confirm'],
    ['Enter', 'confirm'],
    ['KeyP', 'pause'],
    ['Escape', 'pause'],
    ['KeyH', 'hint'],
    ['KeyR', 'restart'],
    ['KeyM', 'mute'],
  ]);
  window.addEventListener('keydown', (event) => {
    const action = KEY_ACTIONS.get(event.code);
    if (!action) return;
    if (event.repeat && action !== 'confirm') return;
    event.preventDefault();
    onKey(action);
  });
}
