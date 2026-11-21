// Layout and rule constants for Twin Vista: every number the rest of the game shares, in one
// place. The canvas has a fixed internal size and is scaled by CSS to fit the window, so all
// drawing and all click maths happen in these view coordinates.

/** The whole stage: HUD on top, two panels in the middle, a message-and-buttons strip below. */
export const VIEW_WIDTH = 1184;
export const VIEW_HEIGHT = 576;
export const HUD_HEIGHT = 76;

/** One picture panel. Scene art is painted in a 568 by 400 space that both panels share. */
export const PANEL_WIDTH = 568;
export const PANEL_HEIGHT = 400;
export const PANEL_TOP = 92;
export const PANEL_LEFT_X = 16;
export const PANEL_RIGHT_X = 600;
export const FOOTER_TOP = 508;

/** A click counts as a find when it lands within the difference's radius, but never less than this. */
export const CLICK_MIN_RADIUS = 26;

/** The scoring and pressure rules of a scene. */
export const HINTS_PER_SCENE = 3;
export const HINT_COST = 25;
export const FIND_POINTS = 100;
export const MISS_TIME_PENALTY = 3;
export const CLEAR_BONUS_PER_SECOND = 2;

/** Where the best full-run score is kept between visits. */
export const BEST_KEY = 'twin-vista-best';
