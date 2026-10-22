/*  The room's frame, in which the decoder reads directions: x front, y left, z up; azimuth counter-clockwise from
    front, left positive; elevation up positive; degrees. The phone's directions are in east-north-up, and a
    rotation `Q` (3×3, rows the room's axes in east-north-up) takes them into the room. Turning and tilting the
    room is changing Q. */

const rad = Math.PI / 180;

/** The direction an azimuth and an elevation point at, in the room. */
export const vec = (azimuth, elevation) => {
  const a = azimuth * rad, e = elevation * rad;
  return [Math.cos(e) * Math.cos(a), Math.cos(e) * Math.sin(a), Math.sin(e)];
};

/** Azimuth and elevation of a direction in the room. */
export const angles = (v) => ({ azimuth: Math.atan2(v[1], v[0]) / rad, elevation: Math.atan2(v[2], Math.hypot(v[0], v[1])) / rad });

export const times = (A, B) => A.map((row) => [0, 1, 2].map((j) => row[0] * B[0][j] + row[1] * B[1][j] + row[2] * B[2][j]));
export const apply = (A, v) => A.map((row) => row[0] * v[0] + row[1] * v[1] + row[2] * v[2]);
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];

/** The rotation by `deg` about the unit axis `k` (right-handed). */
export function about(k, deg) {
  const t = deg * rad, c = Math.cos(t), s = Math.sin(t), C = 1 - c, [x, y, z] = k;
  return [
    [c + x * x * C, x * y * C - z * s, x * z * C + y * s],
    [y * x * C + z * s, c + y * y * C, y * z * C - x * s],
    [z * x * C - y * s, z * y * C + x * s, c + z * z * C],
  ];
}

/** The room whose front is the compass heading `heading` (degrees clockwise from north), level. */
export function facing(heading) {
  const h = heading * rad;
  return [[Math.sin(h), Math.cos(h), 0], [-Math.cos(h), Math.sin(h), 0], [0, 0, 1]];
}

/** The room turned by `deg` about up: every azimuth grows by `deg`. */
export const turned = (Q, deg) => times(about([0, 0, 1], deg), Q);

/** The room tilted so that the direction at `azimuth` on the horizon rises by `deg`: at front this tilts front up,
 *  at the side it tilts that side up. */
export const tilted = (Q, azimuth, deg) => times(about(cross(vec(azimuth, 0), [0, 0, 1]), deg), Q);

/** The angle between two directions, degrees. */
export const between = (u, v) => Math.acos(Math.max(-1, Math.min(1, u[0] * v[0] + u[1] * v[1] + u[2] * v[2]))) / rad;

/** How far from level a set of directions in the room is: each one's mirror image (left for right) as far from
 *  the nearest speaker as it lands, and the speakers near ear height at different heights. Zero for a layout
 *  symmetric about front with its ear-height ring level. */
export function unlevel(directions) {
  let cost = 0;
  for (const d of directions) cost += Math.min(...directions.map((o) => between([d[0], -d[1], d[2]], o) ** 2));
  const ring = directions.map((d) => angles(d).elevation).filter((e) => Math.abs(e) < 20);
  if (ring.length > 2) {
    const mean = ring.reduce((s, e) => s + e, 0) / ring.length;
    cost += ring.reduce((s, e) => s + (e - mean) ** 2, 0);
  }
  return cost;
}

/** The room turned and tilted, within a few degrees of `Q`, to make the speakers at `world` (east-north-up)
 *  as level as can be: symmetric about front, the ear-height ring level. Their height is left alone: a ring
 *  above or below the ears stays there. */
export function levelled(Q, world) {
  if (world.length < 2) return Q;
  const cost = (q) => unlevel(world.map((w) => apply(q, w)));
  const moves = [(q, d) => turned(q, d), (q, d) => tilted(q, 0, d), (q, d) => tilted(q, 90, d)];
  let best = Q, bestCost = cost(Q);
  for (const step of [4, 2, 1, 0.5, 0.25, 0.1, 0.05]) {
    for (let better = true, rounds = 0; better && rounds < 40; ++rounds) {
      better = false;
      for (const move of moves)
        for (const d of [step, -step]) {
          const q = move(best, d), c = cost(q);
          if (c < bestCost - 1e-9) [best, bestCost, better] = [q, c, true];
        }
    }
  }
  return best;
}

/** Standard layouts as [azimuth, elevation] pairs; the subwoofer is not pointed at. */
export const layouts = {
  stereo: [[30, 0], [-30, 0]],
  '5.0': [[30, 0], [-30, 0], [0, 0], [110, 0], [-110, 0]],
  '7.0': [[30, 0], [-30, 0], [0, 0], [90, 0], [-90, 0], [135, 0], [-135, 0]],
  '5.0.4': [[30, 0], [-30, 0], [0, 0], [110, 0], [-110, 0], [45, 45], [-45, 45], [135, 45], [-135, 45]],
  '7.0.4': [[30, 0], [-30, 0], [0, 0], [90, 0], [-90, 0], [135, 0], [-135, 0], [45, 45], [-45, 45], [135, 45], [-135, 45]],
};

/** For each speaker ({azimuth, elevation}), the layout's place it is nearest to, if within `within` degrees and no
 *  nearer speaker claimed it; null otherwise. */
export function matchLayout(speakers, layout, within = 25) {
  const pairs = [];
  speakers.forEach((s, i) => layout.forEach(([a, e], j) => pairs.push({ i, j, d: between(vec(s.azimuth, s.elevation), vec(a, e)) })));
  pairs.sort((a, b) => a.d - b.d);
  const out = speakers.map(() => null), taken = new Set();
  for (const p of pairs)
    if (p.d <= within && out[p.i] === null && !taken.has(p.j)) {
      out[p.i] = { azimuth: layout[p.j][0], elevation: layout[p.j][1] };
      taken.add(p.j);
    }
  return out;
}

/** `value` on the nearest multiple of `step`; unchanged for no step. */
export const snap = (value, step) => (step ? Math.round(value / step) * step : value);
