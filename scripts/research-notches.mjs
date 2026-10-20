#!/usr/bin/env node
/*  One measured head through the notch fit, for the research page: the decoder's prototype chain (its lab.js, run
    as its own sheets page runs it, with the settings its search found) on one HUTUBS ear, along the median plane.
    Writes public/research/personalisation/notches.json (the rows, the surfaces' dips, the costs) and notches.bin:
    for every row, four fields over the frequency axis, in 0.1 dB steps as int16 — the measured CLL less its
    average, the smooth pattern, the notches rebuilt from the surfaces, and their sum.

      node scripts/research-notches.mjs [path to the bambi repository] [head, default HUTUBS/pp10] [ear, default left] */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const site = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const repo = resolve(process.argv[2] ?? process.env.BAMBI ?? `${site}/../AETHER`);
const want = process.argv[3] ?? 'HUTUBS/pp10', ear = process.argv[4] ?? 'left';
const sheets = `${repo}/prototypes/decoder/sheets`;

const lab = new Function(
  [`${sheets}/../common.js`, `${sheets}/lab.js`].map((f) => readFileSync(f, 'utf8')).join('\n') +
    '\nreturn { parseHead, analyse, chain, onSphere, bumps, nearest, NF, E0, STEP };',
)();
const surfaces = 6, order = 4;
const preset = JSON.parse(readFileSync(`${sheets}/presets.json`, 'utf8')).sizes.find((z) => z.surfaces === surfaces && z.order === order);
const P = { ...preset.P, surfaces, surfaceOrder: order };

const index = JSON.parse(readFileSync(`${sheets}/run/index.json`, 'utf8'));
const entry = index.heads.find((h) => h.head.startsWith(want) && h.ear === ear);
if (!entry) throw new Error(`no head ${want}, ${ear} ear, in the prototype's run`);
const file = readFileSync(`${sheets}/heads/${entry.head}`);
const H = lab.parseHead(file.buffer.slice(file.byteOffset, file.byteOffset + file.byteLength), entry);
const A = lab.analyse(H, ear === 'left' ? 1 : 2);
const r = lab.chain(H, A, P, {});
const NF = lab.NF;

//  the median plane as the sheets page slices it: every 2.5° of polar angle, from below in front, over the top, to
//  below behind; each row the nearest measured direction, none where the head has none within 12°
const rows = [];
for (let p = -90; p <= 270; p += 2.5) {
  const v = [Math.cos((p * Math.PI) / 180), 0, Math.sin((p * Math.PI) / 180)];
  const [d, off] = lab.nearest(H, v);
  rows.push({ polar: p, d, measured: off <= 12 });
}
const fields = new Int16Array(rows.length * 4 * NF);
const q = (v) => Math.max(-32768, Math.min(32767, Math.round(v * 10)));
const dips = [];
rows.forEach((row, i) => {
  if (!row.measured) { dips.push(null); return; }
  const measured = A.cll.subarray(row.d * NF, (row.d + 1) * NF).map((c, k) => c - A.avg[k]);
  const pattern = lab.onSphere(H, r.pattern, order, row.d);
  const notches = lab.bumps(r.rebuilt[row.d].filter(Boolean));
  for (let k = 0; k < NF; k++) {
    const o = (i * 4) * NF + k;
    fields[o] = q(measured[k]);
    fields[o + NF] = q(pattern[k]);
    fields[o + 2 * NF] = q(notches[k]);
    fields[o + 3 * NF] = q(pattern[k] + notches[k]);
  }
  //  each surface's dip in this row, as centre ERB, depth dB and width ERB, or null where it has none
  dips.push(r.rebuilt[row.d].map((p) => (p ? p.map((v) => Math.round(v * 100) / 100) : null)));
});

const out = `${site}/public/research/personalisation`;
mkdirSync(out, { recursive: true });
writeFileSync(`${out}/notches.bin`, Buffer.from(fields.buffer));
writeFileSync(
  `${out}/notches.json`,
  JSON.stringify({
    head: { set: entry.set, name: entry.name, ear, directions: H.n },
    axis: { erb0: lab.E0, step: lab.STEP, points: NF },
    surfaces: r.sheets,
    cost: { smoothOnly: r.costNone, rebuilt: r.cost, free: r.costFree },
    rows: rows.map(({ polar, measured }) => ({ polar, measured })),
    dips,
  }),
);
console.log(`${entry.set} ${entry.name}, ${ear} ear: ${rows.filter((x) => x.measured).length} of ${rows.length} rows measured, ${r.sheets} surfaces;`
  + ` cost: smooth alone ${r.costNone.toFixed(2)} dB, rebuilt ${r.cost.toFixed(2)} dB`);
