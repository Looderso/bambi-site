#!/usr/bin/env node
/*  Holds the site's evaluation of the head model (src/lib/hrtf/model.js) to the decoder's own fixtures: every case's
    two ears at every axis point within 2 mdB, and its time difference within 2 ns, as the decoder's test holds its
    synthesiser.

    Catches: a notch shaped other than the decoder's peak, the depth factor or the head size left out, the harmonics
    normalised otherwise.

      node scripts/hrtf-check.mjs [path to the bambi repository]    (default ../AETHER, or $BAMBI) */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { at, ears } from '../src/lib/hrtf/model.js';

const repo = resolve(process.argv[2] ?? process.env.BAMBI ?? new URL('../../AETHER', import.meta.url).pathname);
const model = JSON.parse(readFileSync(`${repo}/core/data/decode/head.json`, 'utf8'));
const { cases } = JSON.parse(readFileSync(`${repo}/core/tests/decode/fixtures.json`, 'utf8'));

let worst = 0, worstItd = 0;
for (const c of cases) {
  const e = ears(model, at(model, c.azimuth, c.elevation), c.earShift, c.headSize);
  for (let k = 0; k < c.left.length; k++)
    worst = Math.max(worst, Math.abs(e.left[k] - c.left[k]), Math.abs(e.right[k] - c.right[k]));
  worstItd = Math.max(worstItd, Math.abs(e.itd - c.itd));
}
console.log(`${cases.length} cases: ears within ${(worst * 1000).toFixed(2)} mdB, time difference within ${(worstItd * 1000).toFixed(2)} ns`);
if (worst >= 2e-3 || worstItd >= 2e-3) {
  console.error('the site evaluates the model differently from the decoder');
  process.exit(1);
}
