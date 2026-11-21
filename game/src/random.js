// A tiny deterministic random source. The painters scatter stars, sparkles and shimmer with a
// fixed seed per scene, so the left and right panels of a scene are painted from exactly the
// same rolls and can never drift apart by accident: the only differences between the panels
// are the ones the scene designer planted.

/** Returns a function that yields the same sequence of numbers in [0, 1) for the same seed. */
export function createRandom(seed) {
  let state = seed >>> 0;
  return function nextRandom() {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

/** Scatters `count` points in a rectangle, from a seeded source so both panels agree. */
export function scatterPoints(seed, count, width, height) {
  const next = createRandom(seed);
  const points = [];
  for (let index = 0; index < count; index += 1) {
    points.push({ x: next() * width, y: next() * height, r: 0.8 + next() * 1.6 });
  }
  return points;
}
