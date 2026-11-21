// The four scenes of Twin Vista, easiest first and hardest last. Each difference names the
// point, in scene coordinates (a panel is 568 by 400), where the right-hand panel disagrees
// with the left, the radius a click must land within to claim it, and a plain label the
// end-of-scene recap reads back. The painters in paint.js plant exactly these changes and no
// others: every difference is hidden by design, none is an accident of the drawing code.

export const SCENES = [
  {
    id: 'lake-dawn',
    name: 'Lake Dawn',
    tagline: 'A cabin, a boat and a low sun over still water.',
    timeLimit: 150,
    differences: [
      { id: 'sun', x: 452, y: 84, r: 34, label: 'the sun has vanished' },
      { id: 'snowcap', x: 150, y: 116, r: 24, label: 'the snow cap is off the tall peak' },
      { id: 'cloud', x: 300, y: 44, r: 30, label: 'a small cloud is missing' },
      { id: 'bird', x: 238, y: 78, r: 17, label: 'the middle bird is gone' },
      { id: 'cabin-window', x: 104, y: 296, r: 16, label: 'the cabin window has gone dark' },
      { id: 'sail', x: 330, y: 282, r: 24, label: 'the boat sail turned red' },
      { id: 'pine', x: 516, y: 285, r: 26, label: 'the middle pine is missing' },
    ],
  },
  {
    id: 'night-market',
    name: 'Night Market',
    tagline: 'Lanterns, awnings and string lights over two busy stalls.',
    timeLimit: 180,
    differences: [
      { id: 'moon-flip', x: 70, y: 60, r: 24, label: 'the crescent moon faces the other way' },
      { id: 'star', x: 470, y: 48, r: 13, label: 'a bright star is missing' },
      { id: 'window', x: 270, y: 104, r: 13, label: 'a lit window has gone dark' },
      { id: 'bulb', x: 336, y: 129, r: 13, label: 'one string light is out' },
      { id: 'lantern', x: 150, y: 204, r: 17, label: 'the middle lantern turned teal' },
      { id: 'awning', x: 423, y: 163, r: 30, label: 'the far awning stripes turned purple' },
      { id: 'sign', x: 120, y: 248, r: 22, label: 'the steam is off the noodle sign' },
      { id: 'cat', x: 500, y: 326, r: 20, label: 'the cat has left its crate' },
    ],
  },
  {
    id: 'coral-beach',
    name: 'Coral Beach',
    tagline: 'Palms, striped shade and a slow tide under a hard sun.',
    timeLimit: 210,
    differences: [
      { id: 'sun-rays', x: 74, y: 62, r: 36, label: 'the sun lost three of its rays' },
      { id: 'sail', x: 440, y: 140, r: 22, label: 'the sailboat sail turned yellow' },
      { id: 'foam', x: 180, y: 268, r: 24, label: 'a line of sea foam is missing' },
      { id: 'coconut', x: 104, y: 144, r: 15, label: 'a coconut is missing from the palm' },
      { id: 'umbrella', x: 300, y: 232, r: 30, label: 'the umbrella stripes turned blue' },
      { id: 'ball', x: 352, y: 318, r: 18, label: 'the beach ball swapped a colour' },
      { id: 'board', x: 492, y: 254, r: 26, label: 'the surfboard leans the other way' },
      { id: 'crab', x: 150, y: 340, r: 18, label: 'the crab has scuttled off' },
      { id: 'shell', x: 420, y: 348, r: 14, label: 'an extra shell has washed up' },
    ],
  },
  {
    id: 'snowy-forest',
    name: 'Snowy Forest',
    tagline: 'A lamplit cabin, a frozen pond and deep quiet snow.',
    timeLimit: 240,
    differences: [
      { id: 'halo', x: 486, y: 58, r: 30, label: 'the halo around the moon is gone' },
      { id: 'star', x: 200, y: 40, r: 12, label: 'a small star is missing' },
      { id: 'smoke', x: 272, y: 182, r: 22, label: 'the chimney smoke has stopped' },
      { id: 'pine-snow', x: 58, y: 148, r: 22, label: 'the snow is off the tall pine' },
      { id: 'window-cross', x: 216, y: 282, r: 14, label: 'the window cross frame is missing' },
      { id: 'scarf', x: 90, y: 299, r: 16, label: 'the snowman scarf turned green' },
      { id: 'lantern', x: 452, y: 238, r: 16, label: 'the lamp post has gone out' },
      { id: 'footprints', x: 292, y: 346, r: 20, label: 'the footprints in the snow are gone' },
      { id: 'pond-crack', x: 330, y: 368, r: 24, label: 'a crack is missing from the pond ice' },
      { id: 'fox-tail', x: 394, y: 344, r: 14, label: 'the fox tail tip lost its white' },
    ],
  },
];

/** Looks up one difference of a scene by id; used by the painters and the recap alike. */
export function differenceById(scene, id) {
  return scene.differences.find((difference) => difference.id === id) ?? null;
}
