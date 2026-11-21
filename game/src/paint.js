// The painters: every scene in Twin Vista is drawn from code, element by element, into a
// 568 by 400 panel. paintScene draws one panel of a scene; the `mods` set names the
// differences to plant. The left panel is painted with an empty set and the right panel
// with the scene's full difference list, so the two agree everywhere except exactly at the
// planted changes listed in scenes.js. Decorative scatter (stars, shimmer, speckles) comes
// from seeded sources in random.js, identical for both panels.

import { PANEL_WIDTH as W, PANEL_HEIGHT as H } from './config.js';
import { createRandom, scatterPoints } from './random.js';

function circle(ctx, x, y, r, fill) {
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}

function ellipse(ctx, x, y, rx, ry, fill) {
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
}

function polygon(ctx, points, fill) {
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.moveTo(points[0][0], points[0][1]);
  for (let i = 1; i < points.length; i += 1) ctx.lineTo(points[i][0], points[i][1]);
  ctx.closePath();
  ctx.fill();
}

function strokePath(ctx, points, color, width) {
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(points[0][0], points[0][1]);
  for (let i = 1; i < points.length; i += 1) ctx.lineTo(points[i][0], points[i][1]);
  ctx.stroke();
}

function verticalGradient(ctx, stops, y0 = 0, y1 = H) {
  const gradient = ctx.createLinearGradient(0, y0, 0, y1);
  for (const [at, color] of stops) gradient.addColorStop(at, color);
  return gradient;
}

function drawCloud(ctx, x, y, scale, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.ellipse(x, y, 34 * scale, 15 * scale, 0, 0, Math.PI * 2);
  ctx.ellipse(x - 22 * scale, y + 4 * scale, 22 * scale, 11 * scale, 0, 0, Math.PI * 2);
  ctx.ellipse(x + 24 * scale, y + 4 * scale, 24 * scale, 12 * scale, 0, 0, Math.PI * 2);
  ctx.ellipse(x + 2 * scale, y - 9 * scale, 20 * scale, 12 * scale, 0, 0, Math.PI * 2);
  ctx.fill();
}

function drawBird(ctx, x, y, scale, color) {
  ctx.strokeStyle = color;
  ctx.lineWidth = 2.4 * scale;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.arc(x - 7 * scale, y, 7 * scale, Math.PI * 1.15, Math.PI * 1.85);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(x + 7 * scale, y, 7 * scale, Math.PI * 1.15, Math.PI * 1.85);
  ctx.stroke();
}

function drawPine(ctx, x, baseY, height, trunk = '#4a3521', leaf = '#1e4634') {
  const w = height * 0.36;
  ctx.fillStyle = trunk;
  ctx.fillRect(x - 3, baseY - height * 0.14, 6, height * 0.14);
  ctx.fillStyle = leaf;
  for (let tier = 0; tier < 3; tier += 1) {
    const tierW = w * (1 - tier * 0.26);
    const tierTop = baseY - height * (0.1 + tier * 0.27);
    const tierBottom = baseY - height * (0.06 + tier * 0.24);
    polygon(ctx, [[x - tierW / 2, tierBottom], [x + tierW / 2, tierBottom], [x, tierTop]], leaf);
  }
}

function drawSparkleStar(ctx, x, y, r, color) {
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.6;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x - r, y);
  ctx.lineTo(x + r, y);
  ctx.moveTo(x, y - r);
  ctx.lineTo(x, y + r);
  ctx.stroke();
  circle(ctx, x, y, 1.8, color);
}

function drawStars(ctx, seed, count, width, maxY, color) {
  for (const point of scatterPoints(seed, count, width, maxY)) {
    ctx.globalAlpha = 0.35 + (point.r / 2.4) * 0.6;
    circle(ctx, point.x, point.y, point.r * 0.7, color);
  }
  ctx.globalAlpha = 1;
}

// ---------------------------------------------------------------- Lake Dawn

function paintLakeDawn(ctx, mods) {
  ctx.fillStyle = verticalGradient(ctx, [[0, '#33608e'], [0.5, '#8fb8d8'], [0.78, '#f2b879'], [1, '#f7cf8f']], 0, 232);
  ctx.fillRect(0, 0, W, 232);

  if (!mods.has('sun')) {
    const glow = ctx.createRadialGradient(452, 84, 8, 452, 84, 90);
    glow.addColorStop(0, 'rgba(255, 214, 110, 0.55)');
    glow.addColorStop(1, 'rgba(255, 214, 110, 0)');
    ctx.fillStyle = glow;
    ctx.fillRect(362, 0, 180, 180);
    circle(ctx, 452, 84, 30, '#ffd76e');
    circle(ctx, 452, 84, 36, 'rgba(255, 215, 110, 0.25)');
  }

  drawCloud(ctx, 110, 64, 1.0, 'rgba(255, 244, 224, 0.92)');
  if (!mods.has('cloud')) drawCloud(ctx, 300, 44, 0.7, 'rgba(255, 244, 224, 0.85)');
  drawCloud(ctx, 508, 132, 0.55, 'rgba(255, 240, 214, 0.7)');

  drawBird(ctx, 210, 90, 1, '#22364f');
  if (!mods.has('bird')) drawBird(ctx, 238, 78, 1, '#22364f');
  drawBird(ctx, 262, 96, 1, '#22364f');

  // Back range, with snow caps on two peaks; the tall peak's cap is a difference.
  polygon(ctx, [[0, 232], [70, 150], [150, 112], [225, 185], [300, 140], [380, 200], [460, 155], [568, 232]], '#5b7296');
  if (!mods.has('snowcap')) polygon(ctx, [[150, 112], [136, 130], [146, 128], [152, 134], [160, 127], [166, 131]], '#eef4fb');
  polygon(ctx, [[300, 140], [288, 156], [297, 153], [303, 159], [310, 152], [315, 157]], '#eef4fb');
  polygon(ctx, [[0, 232], [120, 168], [230, 232], [330, 176], [470, 232], [568, 190], [568, 232]], '#42597a');

  // The lake itself, with deterministic shimmer strokes.
  ctx.fillStyle = verticalGradient(ctx, [[0, '#3d7ea6'], [1, '#275d7d']], 232, H);
  ctx.fillRect(0, 232, W, H - 232);
  const shimmer = createRandom(41);
  ctx.strokeStyle = 'rgba(255, 230, 170, 0.35)';
  ctx.lineWidth = 2;
  for (let i = 0; i < 26; i += 1) {
    const y = 244 + shimmer() * 130;
    const x = shimmer() * W;
    const len = 14 + shimmer() * 42;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(Math.min(x + len, W), y);
    ctx.stroke();
  }

  // Shores: a dark hill on each side for the cabin and the pines to stand on.
  polygon(ctx, [[0, 318], [170, 292], [210, 400], [0, 400]], '#1e4634');
  polygon(ctx, [[398, 400], [452, 300], [568, 288], [568, 400]], '#1e4634');

  // Cabin: log body, roof, door, and one window that may or may not be lit.
  ctx.fillStyle = '#7a4a2b';
  ctx.fillRect(56, 282, 96, 52);
  ctx.fillStyle = 'rgba(0, 0, 0, 0.18)';
  for (let y = 292; y < 334; y += 10) ctx.fillRect(56, y, 96, 2);
  polygon(ctx, [[48, 284], [160, 284], [104, 252]], '#4e2f1d');
  ctx.fillStyle = '#3a2415';
  ctx.fillRect(122, 300, 18, 34);
  ctx.fillStyle = mods.has('cabin-window') ? '#2b2b33' : '#ffd76e';
  ctx.fillRect(96, 288, 17, 17);
  ctx.strokeStyle = '#4e2f1d';
  ctx.lineWidth = 2;
  ctx.strokeRect(96, 288, 17, 17);

  // Pines on the right shore; the middle one is a difference.
  drawPine(ctx, 486, 330, 74);
  if (!mods.has('pine')) drawPine(ctx, 516, 334, 92);
  drawPine(ctx, 542, 328, 62);

  // The boat: hull, mast and a sail that changes colour.
  ctx.strokeStyle = '#3a2415';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(330, 306);
  ctx.lineTo(330, 260);
  ctx.stroke();
  polygon(ctx, [[330, 262], [330, 300], [356, 300]], mods.has('sail') ? '#e2483d' : '#f6f1e7');
  polygon(ctx, [[328, 268], [328, 300], [310, 300]], '#e8dfca');
  polygon(ctx, [[300, 306], [362, 306], [350, 324], [312, 324]], '#8a3324');
}

// ---------------------------------------------------------------- Night Market

function paintNightMarket(ctx, mods) {
  ctx.fillStyle = verticalGradient(ctx, [[0, '#10142b'], [1, '#232a4d']], 0, 300);
  ctx.fillRect(0, 0, W, 300);
  drawStars(ctx, 77, 42, W, 130, '#dfe8ff');

  // One bright star with a sparkle cross; it can go missing.
  if (!mods.has('star')) drawSparkleStar(ctx, 470, 48, 7, '#ffe9a8');

  // Crescent moon; the difference flips which way it faces.
  circle(ctx, 70, 60, 24, '#f4ead0');
  ctx.fillStyle = '#141a38';
  ctx.beginPath();
  ctx.arc(mods.has('moon-flip') ? 56 : 84, 54, 20, 0, Math.PI * 2);
  ctx.fill();

  // Rooftops and a grid of windows behind the stalls; one window can go dark.
  ctx.fillStyle = '#171d38';
  ctx.fillRect(0, 120, 130, 180);
  ctx.fillRect(196, 96, 150, 204);
  ctx.fillRect(420, 128, 148, 172);
  for (let row = 0; row < 4; row += 1) {
    for (let col = 0; col < 3; col += 1) {
      const x = 216 + col * 44;
      const y = 116 + row * 44;
      const isTheWindow = x === 260 && y === 116;
      const lit = (row * 3 + col) % 3 !== 1;
      ctx.fillStyle = lit && !(isTheWindow && mods.has('window')) ? '#ffd76e' : '#232a4d';
      if (isTheWindow) ctx.fillStyle = mods.has('window') ? '#232a4d' : '#ffd76e';
      ctx.fillRect(x, y - 24, 20, 24);
    }
  }
  ctx.fillStyle = '#ffd76e';
  ctx.fillRect(24, 150, 18, 22);
  ctx.fillRect(66, 196, 18, 22);
  ctx.fillStyle = '#232a4d';
  ctx.fillRect(452, 158, 18, 22);
  ctx.fillRect(508, 204, 18, 22);

  // Ground and a worn pavement edge.
  ctx.fillStyle = '#191c2b';
  ctx.fillRect(0, 300, W, 100);
  ctx.fillStyle = '#232842';
  ctx.fillRect(0, 300, W, 8);

  // String lights sagging across the top of the stalls; one bulb can be out.
  const bulbColors = ['#ffd76e', '#ff7d6b', '#7de2a8', '#7db8ff'];
  const bulbPoints = [];
  for (let i = 0; i <= 10; i += 1) {
    const t = i / 10;
    const x = 24 + t * 520;
    const y = 108 + Math.sin(t * Math.PI) * 26 - t * 14;
    bulbPoints.push([x, y]);
  }
  strokePath(ctx, bulbPoints, 'rgba(220, 225, 255, 0.35)', 1.6);
  bulbPoints.forEach(([x, y], index) => {
    if (index === 0 || index === bulbPoints.length - 1) return;
    const isTheBulb = index === 6;
    if (isTheBulb && mods.has('bulb')) {
      circle(ctx, x, y + 5, 4.5, '#2c2f3d');
      return;
    }
    const glow = ctx.createRadialGradient(x, y + 5, 1, x, y + 5, 13);
    const color = bulbColors[index % bulbColors.length];
    glow.addColorStop(0, color);
    glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = glow;
    ctx.fillRect(x - 13, y - 8, 26, 26);
    circle(ctx, x, y + 5, 4.5, color);
  });

  drawStall(ctx, mods, 'left');
  drawStall(ctx, mods, 'right');

  // A cat asleep on a crate by the far stall; it can slip away.
  ctx.fillStyle = '#4a3521';
  ctx.fillRect(476, 338, 52, 30);
  ctx.strokeStyle = '#332412';
  ctx.lineWidth = 2;
  ctx.strokeRect(476, 338, 52, 30);
  if (!mods.has('cat')) {
    ellipse(ctx, 500, 332, 17, 9, '#2e2a33');
    circle(ctx, 486, 326, 8.5, '#2e2a33');
    polygon(ctx, [[480, 322], [477, 312], [486, 318]], '#2e2a33');
    polygon(ctx, [[490, 318], [494, 310], [496, 320]], '#2e2a33');
    strokePath(ctx, [[514, 334], [526, 330], [528, 320]], '#2e2a33', 4);
    circle(ctx, 483, 325, 1.4, '#ffd76e');
  }
}

/** One market stall: posts, a striped awning, a counter of goods, hanging lanterns. */
function drawStall(ctx, mods, side) {
  const x0 = side === 'left' ? 40 : 318;
  const x1 = side === 'left' ? 250 : 528;
  const stripeA = side === 'left' ? '#e2483d' : (mods.has('awning') ? '#8b5cf6' : '#1f9e8f');
  // Posts and counter.
  ctx.fillStyle = '#4a3521';
  ctx.fillRect(x0 + 4, 176, 7, 132);
  ctx.fillRect(x1 - 11, 176, 7, 132);
  ctx.fillStyle = '#5d4128';
  ctx.fillRect(x0 - 4, 292, x1 - x0 + 8, 16);
  ctx.fillStyle = '#3c2a18';
  ctx.fillRect(x0 - 4, 308, x1 - x0 + 8, 34);
  // Striped awning, slanted.
  for (let i = 0; i < 8; i += 1) {
    const sx = x0 - 8 + i * ((x1 - x0 + 16) / 8);
    ctx.fillStyle = i % 2 === 0 ? stripeA : '#f2ead8';
    polygon(ctx, [[sx, 178], [sx + (x1 - x0 + 16) / 8, 178], [sx + (x1 - x0 + 16) / 8 - 6, 152], [sx - 6, 152]], ctx.fillStyle);
  }
  // Goods: jars and boxes along the counter.
  const goods = createRandom(side === 'left' ? 5 : 9);
  for (let i = 0; i < 6; i += 1) {
    const gx = x0 + 16 + i * ((x1 - x0 - 32) / 5);
    const kind = goods();
    if (kind < 0.5) {
      ctx.fillStyle = ['#e2a13d', '#7de2a8', '#ff7d6b', '#7db8ff'][i % 4];
      ctx.fillRect(gx - 8, 268, 16, 24);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
      ctx.fillRect(gx - 8, 268, 16, 5);
    } else {
      circle(ctx, gx, 280, 11, ['#e2483d', '#f59e4c', '#e2d13d'][i % 3]);
    }
  }
  if (side === 'left') {
    // Three hanging lanterns; the middle one can change colour.
    const lanternColors = ['#e2483d', mods.has('lantern') ? '#37b8a5' : '#f59e4c', '#e2483d'];
    [90, 150, 210].forEach((lx, index) => {
      ctx.strokeStyle = 'rgba(220, 225, 255, 0.4)';
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(lx, 178);
      ctx.lineTo(lx, 190);
      ctx.stroke();
      const glow = ctx.createRadialGradient(lx, 204, 2, lx, 204, 26);
      glow.addColorStop(0, 'rgba(255, 200, 110, 0.5)');
      glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = glow;
      ctx.fillRect(lx - 26, 178, 52, 52);
      circle(ctx, lx, 204, 14, lanternColors[index]);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.22)';
      ctx.fillRect(lx - 14, 202, 28, 3);
    });
    // The noodle sign: a board, a bowl, and steam that can vanish.
    ctx.fillStyle = '#2c2118';
    ctx.fillRect(66, 232, 108, 56);
    ctx.strokeStyle = '#8a6a42';
    ctx.lineWidth = 3;
    ctx.strokeRect(66, 232, 108, 56);
    ctx.strokeStyle = '#f2ead8';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(120, 268, 20, 0, Math.PI);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(98, 268);
    ctx.lineTo(142, 268);
    ctx.stroke();
    if (!mods.has('sign')) {
      ctx.strokeStyle = 'rgba(242, 234, 216, 0.85)';
      ctx.lineWidth = 2.4;
      for (const sx of [110, 122, 134]) {
        ctx.beginPath();
        ctx.moveTo(sx, 258);
        ctx.bezierCurveTo(sx - 4, 250, sx + 4, 246, sx, 238);
        ctx.stroke();
      }
    }
  }
}

// ---------------------------------------------------------------- Coral Beach

function paintCoralBeach(ctx, mods) {
  ctx.fillStyle = verticalGradient(ctx, [[0, '#79cfee'], [1, '#dff7ff']], 0, 212);
  ctx.fillRect(0, 0, W, 212);

  // Sun with eight rays; three rays can go missing.
  const rayAngles = [0, 45, 90, 135, 180, 225, 270, 315];
  ctx.strokeStyle = '#ffd94d';
  ctx.lineWidth = 4;
  ctx.lineCap = 'round';
  rayAngles.forEach((deg, index) => {
    if (mods.has('sun-rays') && index % 3 === 1) return;
    const rad = (deg * Math.PI) / 180;
    ctx.beginPath();
    ctx.moveTo(74 + Math.cos(rad) * 34, 62 + Math.sin(rad) * 34);
    ctx.lineTo(74 + Math.cos(rad) * 46, 62 + Math.sin(rad) * 46);
    ctx.stroke();
  });
  circle(ctx, 74, 62, 26, '#ffd94d');
  circle(ctx, 74, 62, 20, '#ffe37e');

  drawCloud(ctx, 300, 52, 0.8, 'rgba(255, 255, 255, 0.95)');
  drawCloud(ctx, 470, 96, 0.6, 'rgba(255, 255, 255, 0.85)');
  drawBird(ctx, 210, 120, 0.9, '#2b6a80');
  drawBird(ctx, 246, 106, 0.8, '#2b6a80');

  // Sea, then sand.
  ctx.fillStyle = verticalGradient(ctx, [[0, '#27a9c4'], [1, '#15809c']], 210, 302);
  ctx.fillRect(0, 210, W, 92);
  ctx.fillStyle = '#f4dfa4';
  ctx.fillRect(0, 300, W, 100);
  const speckles = createRandom(23);
  ctx.fillStyle = 'rgba(190, 150, 80, 0.5)';
  for (let i = 0; i < 60; i += 1) circle(ctx, speckles() * W, 306 + speckles() * 90, 1.4, ctx.fillStyle);

  // Sailboat on the horizon; its sail can turn yellow.
  ctx.strokeStyle = '#5d4128';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(440, 168);
  ctx.lineTo(440, 116);
  ctx.stroke();
  polygon(ctx, [[440, 118], [440, 162], [468, 162]], mods.has('sail') ? '#ffd94d' : '#ffffff');
  polygon(ctx, [[437, 126], [437, 162], [418, 162]], '#eef6f8');
  polygon(ctx, [[412, 168], [472, 168], [462, 182], [422, 182]], '#b5542c');

  // Foam arcs where the sea meets the sand; the middle one can vanish.
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
  ctx.lineWidth = 3;
  const foamAt = (x, y, w) => {
    ctx.beginPath();
    ctx.ellipse(x, y, w, 8, 0, Math.PI * 0.1, Math.PI * 0.9);
    ctx.stroke();
  };
  foamAt(120, 288, 42);
  if (!mods.has('foam')) foamAt(180, 268, 36);
  foamAt(268, 292, 48);
  foamAt(470, 282, 40);

  drawPalm(ctx, mods);
  drawUmbrellaAndToys(ctx, mods);

  // A starfish that never changes, down on the sand.
  drawStarfish(ctx, 60, 356, '#f59e4c');
  if (mods.has('shell')) drawShell(ctx, 420, 348);
  drawShell(ctx, 250, 358);
}

function drawPalm(ctx, mods) {
  ctx.strokeStyle = '#8a6a42';
  ctx.lineWidth = 11;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(64, 306);
  ctx.quadraticCurveTo(76, 210, 98, 132);
  ctx.stroke();
  ctx.strokeStyle = '#2e9e5b';
  ctx.lineWidth = 6;
  for (const [dx, dy] of [[-52, -18], [-30, -34], [0, -40], [32, -32], [54, -14], [40, 6]]) {
    ctx.beginPath();
    ctx.moveTo(98, 130);
    ctx.quadraticCurveTo(98 + dx * 0.6, 130 + dy - 12, 98 + dx, 130 + dy + 12);
    ctx.stroke();
  }
  // Three coconuts under the fronds; one can go missing.
  circle(ctx, 88, 140, 6.5, '#6b4a2a');
  if (!mods.has('coconut')) circle(ctx, 104, 144, 6.5, '#6b4a2a');
  circle(ctx, 95, 152, 6.5, '#7a5636');
}

function drawUmbrellaAndToys(ctx, mods) {
  // Umbrella: a leaning pole and a striped canopy whose red can turn blue.
  ctx.strokeStyle = '#8a8f99';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(300, 322);
  ctx.lineTo(306, 244);
  ctx.stroke();
  const stripe = mods.has('umbrella') ? '#3d7de2' : '#e2483d';
  for (let i = 0; i < 6; i += 1) {
    const a0 = Math.PI + (i * Math.PI) / 6;
    const a1 = Math.PI + ((i + 1) * Math.PI) / 6;
    ctx.fillStyle = i % 2 === 0 ? stripe : '#ffffff';
    ctx.beginPath();
    ctx.moveTo(306, 244);
    ctx.arc(306, 244, 58, a0, a1);
    ctx.closePath();
    ctx.fill();
  }
  circle(ctx, 306, 240, 4, '#5d4128');

  // Beach ball with three coloured panels; one panel can swap colour.
  circle(ctx, 352, 318, 17, '#ffffff');
  ctx.save();
  ctx.beginPath();
  ctx.arc(352, 318, 17, 0, Math.PI * 2);
  ctx.clip();
  ctx.fillStyle = mods.has('ball') ? '#37b06b' : '#e2483d';
  ctx.fillRect(340, 301, 9, 34);
  ctx.fillStyle = '#ffd94d';
  ctx.fillRect(355, 301, 9, 34);
  ctx.restore();
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.15)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(352, 318, 17, 0, Math.PI * 2);
  ctx.stroke();

  // Surfboard planted in the sand; it can lean the other way.
  ctx.save();
  ctx.translate(492, 268);
  ctx.rotate(mods.has('board') ? 0.32 : -0.32);
  ctx.fillStyle = '#f2f2f2';
  ctx.beginPath();
  ctx.ellipse(0, 0, 13, 56, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#e2483d';
  ctx.fillRect(mods.has('board') ? -13 : 4, -50, 9, 100);
  ctx.restore();

  // A crab with claws and stalk eyes; it can scuttle away entirely.
  if (!mods.has('crab')) {
    ctx.strokeStyle = '#c94a24';
    ctx.lineWidth = 2.4;
    for (const side of [-1, 1]) {
      for (let leg = 0; leg < 3; leg += 1) {
        ctx.beginPath();
        ctx.moveTo(150 + side * 10, 344 + leg * 3);
        ctx.lineTo(150 + side * (20 + leg * 3), 350 + leg * 4);
        ctx.stroke();
      }
      ctx.beginPath();
      ctx.moveTo(150 + side * 8, 334);
      ctx.lineTo(150 + side * 16, 326);
      ctx.stroke();
      circle(ctx, 150 + side * 18, 324, 5.5, '#e2572b');
    }
    ellipse(ctx, 150, 340, 15, 10, '#e2572b');
    ctx.strokeStyle = '#c94a24';
    ctx.beginPath();
    ctx.moveTo(144, 331);
    ctx.lineTo(143, 324);
    ctx.moveTo(156, 331);
    ctx.lineTo(157, 324);
    ctx.stroke();
    circle(ctx, 143, 323, 2, '#26221f');
    circle(ctx, 157, 323, 2, '#26221f');
  }
}

function drawShell(ctx, x, y) {
  ctx.fillStyle = '#f6c8d8';
  ctx.beginPath();
  ctx.arc(x, y, 9, Math.PI, 0);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#d88bab';
  ctx.lineWidth = 1.6;
  for (const dx of [-5, 0, 5]) {
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + dx, y - 8);
    ctx.stroke();
  }
}

function drawStarfish(ctx, x, y, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  for (let i = 0; i < 5; i += 1) {
    const angle = -Math.PI / 2 + (i * Math.PI * 2) / 5;
    const inner = angle + Math.PI / 5;
    ctx.lineTo(x + Math.cos(angle) * 13, y + Math.sin(angle) * 13);
    ctx.lineTo(x + Math.cos(inner) * 5.5, y + Math.sin(inner) * 5.5);
  }
  ctx.closePath();
  ctx.fill();
}

// ---------------------------------------------------------------- Snowy Forest

function paintSnowyForest(ctx, mods) {
  ctx.fillStyle = verticalGradient(ctx, [[0, '#16233f'], [1, '#33507e']], 0, 282);
  ctx.fillRect(0, 0, W, 282);
  drawStars(ctx, 133, 54, W, 170, '#dfe8ff');
  if (!mods.has('star')) drawSparkleStar(ctx, 200, 40, 6, '#ffe9a8');

  // Full moon, with a halo that can fade away.
  if (!mods.has('halo')) {
    circle(ctx, 486, 58, 33, 'rgba(220, 232, 255, 0.16)');
    circle(ctx, 486, 58, 28, 'rgba(220, 232, 255, 0.12)');
  }
  circle(ctx, 486, 58, 23, '#eef3fb');
  circle(ctx, 478, 52, 4.5, 'rgba(160, 175, 200, 0.5)');
  circle(ctx, 494, 66, 3.4, 'rgba(160, 175, 200, 0.45)');

  // A far treeline, then the snowfield.
  ctx.fillStyle = '#12291f';
  for (let x = -10; x < W + 20; x += 46) {
    polygon(ctx, [[x, 284], [x + 23, 224], [x + 46, 284]], '#12291f');
  }
  ctx.fillStyle = '#e9f1fa';
  ctx.fillRect(0, 282, W, H - 282);
  ellipse(ctx, 120, 330, 130, 20, '#f4f9ff');
  ellipse(ctx, 470, 356, 120, 18, '#f4f9ff');
  const sparkles = createRandom(55);
  ctx.fillStyle = 'rgba(170, 200, 235, 0.7)';
  for (let i = 0; i < 34; i += 1) circle(ctx, sparkles() * W, 292 + sparkles() * 100, 1.3, ctx.fillStyle);

  drawSnowyPine(ctx, mods);
  drawCabinInSnow(ctx, mods);
  drawLampPost(ctx, mods);
  drawSnowman(ctx, mods);
  drawPondAndFox(ctx, mods);
}

/** The tall pine on the left; the snow on its crown can be missing. */
function drawSnowyPine(ctx, mods) {
  const x = 58;
  const baseY = 330;
  ctx.fillStyle = '#4a3521';
  ctx.fillRect(x - 4, baseY - 26, 8, 26);
  const tiers = [
    { w: 96, top: 176, bottom: 246 },
    { w: 78, top: 148, bottom: 208 },
    { w: 56, top: 122, bottom: 172 },
  ];
  for (const tier of tiers) {
    polygon(ctx, [[x - tier.w / 2, tier.bottom], [x + tier.w / 2, tier.bottom], [x, tier.top]], '#17382c');
  }
  // Snow lying on each tier's shoulders; the crown's snow is a difference.
  ctx.strokeStyle = '#eef4fb';
  ctx.lineWidth = 5;
  ctx.lineCap = 'round';
  for (const [sx, sy, len] of [[x - 34, 232, 22], [x + 14, 232, 22], [x - 26, 196, 18], [x + 10, 196, 18]]) {
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.lineTo(sx + len, sy + 5);
    ctx.stroke();
  }
  if (!mods.has('pine-snow')) {
    ctx.beginPath();
    ctx.moveTo(x - 16, 158);
    ctx.lineTo(x + 2, 164);
    ctx.lineTo(x + 18, 156);
    ctx.stroke();
  }
}

function drawCabinInSnow(ctx, mods) {
  // Chimney smoke first, so it rises behind the roof; it can stop entirely.
  if (!mods.has('smoke')) {
    ctx.fillStyle = 'rgba(210, 218, 230, 0.55)';
    circle(ctx, 274, 196, 7, 'rgba(210, 218, 230, 0.55)');
    circle(ctx, 268, 182, 10, 'rgba(210, 218, 230, 0.45)');
    circle(ctx, 276, 166, 13, 'rgba(210, 218, 230, 0.35)');
  }
  ctx.fillStyle = '#5d4128';
  ctx.fillRect(262, 200, 15, 30);
  // Log walls and a snow-heavy roof.
  ctx.fillStyle = '#6b4630';
  ctx.fillRect(172, 252, 138, 68);
  ctx.fillStyle = 'rgba(0, 0, 0, 0.16)';
  for (let y = 262; y < 318; y += 11) ctx.fillRect(172, y, 138, 2);
  polygon(ctx, [[160, 254], [322, 254], [241, 214]], '#4e3421');
  polygon(ctx, [[160, 254], [322, 254], [241, 214]], 'rgba(0, 0, 0, 0)');
  ctx.strokeStyle = '#eef4fb';
  ctx.lineWidth = 7;
  ctx.beginPath();
  ctx.moveTo(163, 252);
  ctx.lineTo(241, 216);
  ctx.lineTo(319, 252);
  ctx.stroke();
  // Door, and a warm window whose cross frame can go missing.
  ctx.fillStyle = '#3a2415';
  ctx.fillRect(258, 276, 26, 44);
  circle(ctx, 279, 299, 2.2, '#ffd76e');
  ctx.fillStyle = '#ffd76e';
  ctx.fillRect(206, 272, 21, 21);
  if (!mods.has('window-cross')) {
    ctx.strokeStyle = '#4e3421';
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.moveTo(216.5, 272);
    ctx.lineTo(216.5, 293);
    ctx.moveTo(206, 282.5);
    ctx.lineTo(227, 282.5);
    ctx.stroke();
  }
  ctx.strokeStyle = '#4e3421';
  ctx.lineWidth = 2.4;
  ctx.strokeRect(206, 272, 21, 21);
  // Footprints wandering away from the door; they can be snowed over.
  if (!mods.has('footprints')) {
    ctx.fillStyle = 'rgba(150, 175, 205, 0.8)';
    for (const [fx, fy, rot] of [[268, 330, 0.4], [282, 340, -0.3], [296, 348, 0.3], [312, 354, -0.2], [328, 358, 0.3]]) {
      ctx.save();
      ctx.translate(fx, fy);
      ctx.rotate(rot);
      ctx.beginPath();
      ctx.ellipse(0, 0, 5, 3, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }
}

function drawLampPost(ctx, mods) {
  ctx.fillStyle = '#23272f';
  ctx.fillRect(449, 244, 5, 80);
  ctx.fillRect(438, 322, 34, 5);
  if (!mods.has('lantern')) {
    const glow = ctx.createRadialGradient(452, 238, 2, 452, 238, 40);
    glow.addColorStop(0, 'rgba(255, 215, 110, 0.55)');
    glow.addColorStop(1, 'rgba(255, 215, 110, 0)');
    ctx.fillStyle = glow;
    ctx.fillRect(412, 198, 80, 80);
  }
  ctx.fillStyle = mods.has('lantern') ? '#3a3f47' : '#ffd76e';
  ctx.fillRect(444, 230, 16, 17);
  ctx.strokeStyle = '#23272f';
  ctx.lineWidth = 2;
  ctx.strokeRect(444, 230, 16, 17);
  polygon(ctx, [[441, 230], [463, 230], [452, 220]], '#23272f');
}

function drawSnowman(ctx, mods) {
  ellipse(ctx, 90, 344, 30, 8, 'rgba(170, 200, 235, 0.5)');
  circle(ctx, 90, 322, 24, '#f7fbff');
  circle(ctx, 90, 288, 17, '#f7fbff');
  // The scarf around its neck changes colour.
  ctx.fillStyle = mods.has('scarf') ? '#37b06b' : '#e2483d';
  ctx.fillRect(74, 296, 32, 8);
  ctx.fillRect(98, 300, 8, 18);
  circle(ctx, 84, 284, 2.2, '#26221f');
  circle(ctx, 96, 284, 2.2, '#26221f');
  polygon(ctx, [[90, 288], [104, 291], [90, 293]], '#f59e4c');
  circle(ctx, 90, 316, 2.4, '#26221f');
  circle(ctx, 90, 328, 2.4, '#26221f');
  ctx.strokeStyle = '#6b4a2a';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(72, 314);
  ctx.lineTo(52, 300);
  ctx.moveTo(108, 314);
  ctx.lineTo(128, 302);
  ctx.stroke();
}

function drawPondAndFox(ctx, mods) {
  // The frozen pond: pale ice, a shine, and cracks that can partly vanish.
  ellipse(ctx, 330, 368, 96, 22, '#bcd8ee');
  ellipse(ctx, 306, 362, 44, 8, 'rgba(255, 255, 255, 0.5)');
  ctx.strokeStyle = 'rgba(90, 130, 170, 0.75)';
  ctx.lineWidth = 1.8;
  strokePath(ctx, [[268, 366], [292, 372], [306, 364]], 'rgba(90, 130, 170, 0.75)', 1.8);
  if (!mods.has('pond-crack')) {
    strokePath(ctx, [[330, 374], [352, 366], [376, 374]], 'rgba(90, 130, 170, 0.75)', 1.8);
    strokePath(ctx, [[352, 366], [358, 358]], 'rgba(90, 130, 170, 0.75)', 1.5);
  }
  // A fox sitting by the pond, tail curled round; the white tail tip can go.
  ellipse(ctx, 366, 348, 20, 6, 'rgba(170, 200, 235, 0.5)');
  ellipse(ctx, 362, 330, 15, 17, '#e07b39');
  circle(ctx, 362, 308, 11, '#e07b39');
  polygon(ctx, [[353, 302], [350, 290], [360, 298]], '#e07b39');
  polygon(ctx, [[371, 302], [374, 290], [364, 298]], '#e07b39');
  circle(ctx, 358, 307, 1.8, '#26221f');
  circle(ctx, 366, 307, 1.8, '#26221f');
  polygon(ctx, [[362, 312], [365, 311], [363.5, 315]], '#26221f');
  // Tail: a thick curve sweeping out to the right, tipped white unless changed.
  ctx.strokeStyle = '#e07b39';
  ctx.lineWidth = 10;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(374, 340);
  ctx.quadraticCurveTo(396, 336, 398, 346);
  ctx.stroke();
  if (!mods.has('fox-tail')) {
    ctx.strokeStyle = '#f7fbff';
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.moveTo(394, 340);
    ctx.quadraticCurveTo(398, 342, 398, 346);
    ctx.stroke();
  }
}

// ---------------------------------------------------------------- Entry point

const PAINTERS = {
  'lake-dawn': paintLakeDawn,
  'night-market': paintNightMarket,
  'coral-beach': paintCoralBeach,
  'snowy-forest': paintSnowyForest,
};

/**
 * Paints one panel of `scene` into ctx (which must be translated to the panel's origin).
 * `mods` is the set of difference ids to plant: empty for the original panel, every id of
 * the scene for its twin.
 */
export function paintScene(ctx, scene, mods) {
  ctx.save();
  ctx.beginPath();
  ctx.rect(0, 0, W, H);
  ctx.clip();
  PAINTERS[scene.id](ctx, mods);
  ctx.restore();
}
