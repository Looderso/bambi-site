/*  The decoder's head model, evaluated as the decoder evaluates it: every part a real spherical-harmonic
    expansion (SN3D, ACN) of a curve over an ERB axis. A direction is evaluated, not looked up. The arithmetic
    follows the decoder's synthesiser step for step, and scripts/hrtf-check.mjs holds it to the decoder's own
    fixtures.

    Units: dB; the axis in ERB numbers, erb = 21.4 log10(1 + 0.00437 f); microseconds for the time difference,
    left arrival minus right. Directions in degrees at this boundary: azimuth counter-clockwise from the front,
    elevation up. */

/** The ERB number of a frequency in Hz, and back. */
export const erbOf = (hz) => 21.4 * Math.log10(1 + 0.00437 * hz);
export const hzOf = (erb) => (10 ** (erb / 21.4) - 1) / 0.00437;

const channels = (order) => (order + 1) * (order + 1);

/** Real spherical harmonics, SN3D, ACN, up to `order`, at the unit direction (x front, y left, z up). */
export function sh(x, y, z, order) {
  const out = new Float64Array(channels(order));
  const zc = Math.min(1, Math.max(-1, z));
  const phi = Math.atan2(y, x);
  const s = Math.sqrt(Math.max(0, 1 - zc * zc));
  let pmm = 1, normPmm = 1;
  for (let m = 0; m <= order; m++) {
    if (m > 0) {
      pmm *= (2 * m - 1) * s; // no Condon-Shortley phase, as AmbiX
      normPmm /= Math.sqrt((2 * m - 1) * (2 * m));
      if (m === 1) normPmm *= Math.SQRT2;
    }
    const cm = Math.cos(m * phi), sm = Math.sin(m * phi);
    let prev2 = 0, prev1 = pmm, norm = normPmm;
    for (let n = m; n <= order; n++) {
      let leg;
      if (n === m) leg = pmm;
      else if (n === m + 1) { leg = zc * (2 * m + 1) * pmm; prev2 = prev1; prev1 = leg; }
      else { leg = (zc * (2 * n - 1) * prev1 - (n + m - 1) * prev2) / (n - m); prev2 = prev1; prev1 = leg; }
      if (n > m) norm *= Math.sqrt((n - m) / (n + m));
      out[n * n + n + m] = norm * leg * cm;
      if (m > 0) out[n * n + n - m] = norm * leg * sm;
    }
  }
  return out;
}

/** The unit direction of an azimuth and elevation in degrees. */
export function direction(azimuth, elevation) {
  const a = (azimuth * Math.PI) / 180, e = (elevation * Math.PI) / 180;
  return [Math.cos(e) * Math.cos(a), Math.cos(e) * Math.sin(a), Math.sin(e)];
}

const dot = (y, coef) => {
  let v = 0;
  for (let p = 0; p < coef.length; p++) v += y[p] * coef[p];
  return v;
};

/** A table's curve at a direction: the sum of its rows weighted by the harmonics. */
function curve(table, y, points) {
  const out = new Float64Array(points);
  for (let c = 0; c < channels(table.order); c++) {
    const w = y[c];
    if (w === 0) continue;
    for (let k = 0; k < points; k++) out[k] += w * table.coef[c * points + k];
  }
  return out;
}

/** The model's ERB axis, its points as ERB numbers. */
export function axis(model) {
  const { erb0, step, points } = model.axis;
  return Float64Array.from({ length: points }, (_, k) => erb0 + k * step);
}

/*  Everything that does not depend on the sliders, at one direction: the smooth summed level, the level
    difference and its change with size, the time difference, and each notch's centre, depth (with its factor
    and fade) and width. */
export function at(model, azimuth, elevation) {
  const [x, y, z] = direction(azimuth, elevation);
  const order = Math.max(model.smooth.order, model.ild.order, model.itd.order, model.notches.order);
  const Y = sh(x, y, z, order);
  const points = model.axis.points;
  const N = model.notches;
  const [fadeIn, fadeOut] = N.fade, [widthMin, widthMax] = N.widthRange;
  return {
    smooth: curve(model.smooth, Y, points),
    ild: curve(model.ild, Y, points),
    ildSlope: curve({ order: model.ild.order, coef: model.ild.withSize }, Y, points),
    itd: dot(Y, model.itd.coef),
    notches: N.list.map((n) => {
      const t = Math.min(1, Math.max(0, (dot(Y, n.presence) - fadeIn) / (fadeOut - fadeIn)));
      const fade = t * t * (3 - 2 * t);
      return {
        centre: dot(Y, n.centre),
        depth: Math.max(-60, Math.min(0, dot(Y, n.depth)) * N.depthFactor * fade),
        width: Math.min(widthMax, Math.max(widthMin, dot(Y, n.width))),
      };
    }),
  };
}

/*  The notches alone at a unit direction (x front, y left, z up), with the ears shifted by earShift ERB: each
    notch's centre as played (shifted, kept in the band), its depth with factor and fade, and its width. Only the
    notch maps are evaluated, so a whole sphere of directions stays cheap. */
export function notchesAt(model, x, y, z, earShift = 0) {
  const N = model.notches;
  const Y = sh(x, y, z, N.order);
  const [fadeIn, fadeOut] = N.fade, [widthMin, widthMax] = N.widthRange, [bandLo, bandHi] = N.band;
  return N.list.map((n) => {
    const t = Math.min(1, Math.max(0, (dot(Y, n.presence) - fadeIn) / (fadeOut - fadeIn)));
    const fade = t * t * (3 - 2 * t);
    return {
      centre: Math.min(bandHi, Math.max(bandLo, dot(Y, n.centre) + earShift)),
      depth: Math.max(-60, Math.min(0, dot(Y, n.depth)) * N.depthFactor * fade),
      width: Math.min(widthMax, Math.max(widthMin, dot(Y, n.width))),
    };
  });
}

/*  The two ears at one direction for a slider setting: the summed level with its notches shifted by
    earShift (ERB), split into the ears by the level difference morphed with headSize; and the time
    difference scaled by headSize. Each notch is a peaking filter's dip, depth / (1 + u^2), u its distance
    from the centre in widths. */
export function ears(model, place, earShift = 0, headSize = 1) {
  const erbs = axis(model);
  const [bandLo, bandHi] = model.notches.band;
  const grow = headSize - 1;
  const shifted = place.notches.map((n) => Math.min(bandHi, Math.max(bandLo, n.centre + earShift)));
  const points = erbs.length;
  const cll = new Float64Array(points), notchesOnly = new Float64Array(points);
  const left = new Float64Array(points), right = new Float64Array(points), ild = new Float64Array(points);
  for (let k = 0; k < points; k++) {
    let dips = 0;
    place.notches.forEach((n, i) => {
      if (n.depth === 0) return;
      const u = (erbs[k] - shifted[i]) / n.width;
      dips += n.depth / (1 + u * u);
    });
    notchesOnly[k] = dips;
    cll[k] = place.smooth[k] + dips;
    ild[k] = place.ild[k] + grow * place.ildSlope[k];
    const both = 10 * Math.log10(1 + 10 ** (ild[k] / 10));
    left[k] = cll[k] + ild[k] - both;
    right[k] = cll[k] - both;
  }
  return { erbs, cll, notches: notchesOnly, ild, left, right, itd: place.itd * headSize, centres: shifted };
}
