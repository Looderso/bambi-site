/*  The research page's heatmaps of one measured head along the median plane, from the prototype's fit
    (scripts/research-notches.mjs): frequency across, the polar angle up, the level as colour, ink below zero and
    orange above, ±20 dB. One figure lays the surfaces' dips over the measured level as numbered lines, thicker where
    deeper; the other sets the measured level beside the smooth pattern, the notches and their sum. */
const tone = (name) => getComputedStyle(document.documentElement).getPropertyValue(name).trim();
const rgb = (hex) => {
  const n = parseInt(hex.replace('#', ''), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};
const RANGE = 20; // dB at full colour
const TICKS = [500, 1000, 2000, 4000, 8000, 16000];
const MARKS = [[0, 'front'], [90, 'above'], [180, 'behind']];

function canvasOf(canvas) {
  const r = canvas.getBoundingClientRect(), dpr = window.devicePixelRatio || 1;
  canvas.width = Math.round(r.width * dpr);
  canvas.height = Math.round(r.height * dpr);
  const c = canvas.getContext('2d');
  c.scale(dpr, dpr);
  c.font = `11px ${tone('--font')}`;
  return [c, r.width, r.height];
}

/** Draws `field` (row i: points values, dB) with its axes; with `dips`, each surface's dips as a numbered line. */
function heat(canvas, data, field, { dips = false } = {}) {
  const [c, w, h] = canvasOf(canvas);
  const { rows, axis } = data, n = rows.length, NF = axis.points;
  const g = { x0: 44, x1: w - 8, y0: 8, y1: h - 22 };
  const ground = rgb(tone('--ground')), ink = rgb(tone('--text')), warm = rgb(tone('--orange'));
  const scratch = document.createElement('canvas');
  scratch.width = NF;
  scratch.height = n;
  const sc = scratch.getContext('2d'), img = sc.createImageData(NF, n);
  for (let i = 0; i < n; i++) {
    const o = (n - 1 - i) * NF * 4; // polar angle up
    for (let k = 0; k < NF; k++) {
      const v = field(i, k), t = Math.min(1, Math.abs(v) / RANGE), to = v < 0 ? ink : warm;
      for (let j = 0; j < 3; j++) img.data[o + k * 4 + j] = ground[j] + (to[j] - ground[j]) * t;
      img.data[o + k * 4 + 3] = 255;
    }
  }
  sc.putImageData(img, 0, 0);
  c.imageSmoothingEnabled = false;
  c.drawImage(scratch, g.x0, g.y0, g.x1 - g.x0, g.y1 - g.y0);
  const X = (e) => g.x0 + ((e - axis.erb0) / ((NF - 1) * axis.step)) * (g.x1 - g.x0);
  const Y = (i) => g.y1 - ((i + 0.5) / n) * (g.y1 - g.y0);
  if (dips) {
    const surfaces = data.dips.find(Boolean)?.length ?? 0;
    c.strokeStyle = tone('--orange');
    c.lineCap = 'round';
    for (let s = 0; s < surfaces; s++) {
      const seen = [];
      for (let i = 1; i < n; i++) {
        const p = data.dips[i - 1]?.[s], q = data.dips[i]?.[s];
        if (!p || !q || p[1] > -1.5 || q[1] > -1.5) continue; // broken where missing or shallower than 1.5 dB
        c.lineWidth = Math.min(3.5, 0.8 - (p[1] + q[1]) / 10);
        c.beginPath();
        c.moveTo(X(p[0]), Y(i - 1));
        c.lineTo(X(q[0]), Y(i));
        c.stroke();
        seen.push(i);
      }
      if (seen.length) {
        const i = seen[seen.length >> 1];
        const x = X(data.dips[i][s][0]) + 6, y = Y(i) + 4;
        c.fillStyle = tone('--ground');
        c.fillRect(x - 2, y - 10, 12, 13);
        c.fillStyle = tone('--text');
        c.textAlign = 'left';
        c.fillText(String(s + 1), x, y);
      }
    }
  }
  //  the axes: where the polar angle passes the front, the top and the back; the frequencies
  c.fillStyle = tone('--label');
  c.textAlign = 'right';
  for (const [a, t] of MARKS) {
    const i = rows.findIndex((r) => r.polar >= a);
    c.fillText(t, g.x0 - 6, Y(i) + 4);
  }
  c.textAlign = 'center';
  const erb = (f) => 21.4 * Math.log10(1 + 0.00437 * f);
  for (const f of TICKS) c.fillText(f < 1000 ? String(f) : `${f / 1000}k`, X(erb(f)), g.y1 + 15);
}

export async function heatmaps(base) {
  const figures = document.querySelectorAll('figure[data-heat]');
  if (!figures.length) return;
  const at = `${base}/research/personalisation`;
  const [data, bin] = await Promise.all([fetch(`${at}/notches.json`).then((r) => r.json()), fetch(`${at}/notches.bin`).then((r) => r.arrayBuffer())]);
  const values = new Int16Array(bin), NF = data.axis.points;
  //  field f of row i at point k: 0 measured, 1 smooth, 2 notches, 3 their sum
  const field = (f) => (i, k) => (data.rows[i].measured ? values[(i * 4 + f) * NF + k] / 10 : 0);
  const draw = () => {
    for (const figure of figures) {
      if (figure.dataset.heat === 'found') heat(figure.querySelector('canvas'), data, field(0), { dips: true });
      else figure.querySelectorAll('canvas[data-field]').forEach((cv) => heat(cv, data, field(Number(cv.dataset.field))));
    }
  };
  draw();
  let later = 0;
  window.addEventListener('resize', () => { clearTimeout(later); later = setTimeout(draw, 150); });
  for (const el of document.querySelectorAll('[data-heat-head]')) el.textContent = `${data.head.set} ${data.head.name.replace('_HRIRs_measured', '')}, ${data.head.ear} ear`;
  for (const el of document.querySelectorAll('[data-heat-cost]'))
    el.textContent = `${data.cost.smoothOnly.toFixed(2)} dB with the smooth pattern alone, ${data.cost.rebuilt.toFixed(2)} dB with the notches`;
}
