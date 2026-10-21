// Measuring speakers: exponential sine sweeps, played one speaker after another, recorded by the phone's microphone
// or one on the computer, deconvolved into an impulse response per speaker. The microphone's clock need not be the
// output's, so every speaker is timed against a reference sweep in the same recording -- at the start and again at
// the end, which also gives how far the two clocks drift apart. Shared by the computer's page and the phone's.

import { correction } from './calibration.js';

/** In place, radix 2: `re` and `im` of a length that is a power of two. `inverse` divides by the length. */
export function fft(re, im, inverse = false) {
  const n = re.length;
  for (let i = 1, j = 0; i < n; ++i) {
    let bit = n >> 1;
    for (; j & bit; bit >>= 1) j ^= bit;
    j ^= bit;
    if (i < j) {
      [re[i], re[j]] = [re[j], re[i]];
      [im[i], im[j]] = [im[j], im[i]];
    }
  }
  for (let len = 2; len <= n; len <<= 1) {
    const ang = ((inverse ? 2 : -2) * Math.PI) / len, wr = Math.cos(ang), wi = Math.sin(ang);
    for (let i = 0; i < n; i += len) {
      let cr = 1, ci = 0;
      for (let k = 0; k < len / 2; ++k) {
        const a = i + k, b = a + len / 2;
        const tr = re[b] * cr - im[b] * ci, ti = re[b] * ci + im[b] * cr;
        re[b] = re[a] - tr; im[b] = im[a] - ti;
        re[a] += tr; im[a] += ti;
        [cr, ci] = [cr * wr - ci * wi, cr * wi + ci * wr];
      }
    }
  }
  if (inverse) for (let i = 0; i < n; ++i) { re[i] /= n; im[i] /= n; }
}

const pow2 = (n) => 1 << Math.ceil(Math.log2(n));

/** The sweep both sides use: its length and range, the pause between sweeps, and how long the computer waits
 *  after the phone asks before the first sweep plays. */
export const sweepSpec = { seconds: 1.5, f1: 100, f2: 20000 };
export const sweepGap = 0.8;
export const sweepLead = 0.6;

/** The linear convolution of two real signals. */
export function convolve(a, b) {
  const n = pow2(a.length + b.length - 1);
  const ar = new Float64Array(n), ai = new Float64Array(n), br = new Float64Array(n), bi = new Float64Array(n);
  ar.set(a); br.set(b);
  fft(ar, ai); fft(br, bi);
  for (let i = 0; i < n; ++i) [ar[i], ai[i]] = [ar[i] * br[i] - ai[i] * bi[i], ar[i] * bi[i] + ai[i] * br[i]];
  fft(ar, ai, true);
  return Float64Array.from(ar.subarray(0, a.length + b.length - 1));
}

/** The sweep: `seconds` long from `f1` to `f2` Hz, rising exponentially, faded in and out over 10 ms. */
export function sweep(fs, seconds, f1, f2) {
  const n = Math.round(seconds * fs), L = Math.log(f2 / f1), out = new Float32Array(n), fade = Math.round(0.01 * fs);
  for (let i = 0; i < n; ++i) {
    const t = i / fs;
    let v = Math.sin(((2 * Math.PI * f1 * seconds) / L) * (Math.exp((t / seconds) * L) - 1));
    if (i < fade) v *= 0.5 - 0.5 * Math.cos((Math.PI * i) / fade);
    if (i > n - fade) v *= 0.5 - 0.5 * Math.cos((Math.PI * (n - i)) / fade);
    out[i] = v;
  }
  return out;
}

/** The sweep's inverse filter: the sweep reversed and tilted 6 dB an octave against its lows, scaled so the sweep convolved
 *  with it peaks at 1. A recording convolved with it is the impulse response, the direct sound at its delay plus
 *  `length - 1` samples. */
export function inverse(fs, seconds, f1, f2) {
  const s = sweep(fs, seconds, f1, f2), n = s.length, L = Math.log(f2 / f1), out = new Float64Array(n);
  //  reversed, the sweep starts at its top: full weight there, falling 6 dB an octave towards the bottom
  for (let i = 0; i < n; ++i) out[i] = s[n - 1 - i] * Math.exp((-i / n) * L);
  const peak = convolve(s, out).reduce((m, v) => Math.max(m, Math.abs(v)), 0);
  for (let i = 0; i < n; ++i) out[i] /= peak;
  return out;
}

/** What is played: a reference sweep on `reference`, one sweep on each channel in turn, the reference again. Each
 *  event's start in seconds from the first. */
export function plan(channels, reference, seconds, gap) {
  const order = [{ channel: reference, ref: 'start' }, ...channels.map((c) => ({ channel: c })), { channel: reference, ref: 'end' }];
  return order.map((e, i) => ({ ...e, start: i * (seconds + gap) }));
}

/** The strongest peak of an impulse response between `from` and `to`, to a fraction of a sample. */
function peakIn(h, from, to) {
  let best = from, value = 0;
  for (let i = Math.max(1, from); i < Math.min(h.length - 1, to); ++i)
    if (Math.abs(h[i]) > value) [best, value] = [i, Math.abs(h[i])];
  const a = Math.abs(h[best - 1]), b = Math.abs(h[best]), c = Math.abs(h[best + 1]);
  const shift = a - 2 * b + c === 0 ? 0 : (0.5 * (a - c)) / (a - 2 * b + c);
  return { at: best + shift, value };
}

/** The impulse response of the stretch of `recording` around where a sweep is expected, `expected` seconds in;
 *  the peak's position is returned in the recording's samples. */
function responseAt(recording, fs, inv, expected, margin, tail) {
  const from = Math.max(0, Math.round((expected - margin) * fs));
  const to = Math.min(recording.length, Math.round((expected + margin) * fs) + inv.length + Math.round(tail * fs));
  const h = convolve(recording.subarray(from, to), inv);
  const p = peakIn(h, inv.length - 1, inv.length - 1 + Math.round(2 * margin * fs));
  return { h, peak: p, at: from + p.at - (inv.length - 1) };
}

/** The power spectrum of the impulse response from just before its peak over `ms` milliseconds, the end faded
 *  out, transformed at `size` points: bin k is k * fs / size Hz. */
function powerSpectrum(h, peak, fs, ms, size) {
  const start = Math.max(0, Math.round(peak) - Math.round(0.001 * fs)), len = Math.round((ms / 1000) * fs);
  const n = pow2(Math.max(len, size)), re = new Float64Array(n), im = new Float64Array(n);
  const fade = Math.round(len / 4);
  for (let i = 0; i < len && start + i < h.length; ++i) {
    const w = i > len - fade ? 0.5 + 0.5 * Math.cos((Math.PI * (i - (len - fade))) / fade) : 1;
    re[i] = h[start + i] * w;
  }
  fft(re, im);
  const power = new Float64Array(n / 2);
  for (let k = 0; k < n / 2; ++k) power[k] = re[k] * re[k] + im[k] * im[k];
  return { power, binHz: fs / n };
}

/** Mean power in dB over `lo`..`hi` Hz. */
function bandDb(sp, lo, hi) {
  let s = 0, c = 0;
  for (let k = Math.ceil(lo / sp.binHz); k <= Math.floor(hi / sp.binHz) && k < sp.power.length; ++k) { s += sp.power[k]; c++; }
  return 10 * Math.log10(s / Math.max(1, c) + 1e-30);
}

/** A curve smoothed over 1/`fraction` of an octave around each point, the points 1/48 octave apart from 20 Hz to
 *  20 kHz: each the mean power of the bins within half the smoothing width either side. */
export function smoothed(sp, fraction) {
  const sum = new Float64Array(sp.power.length + 1);
  for (let k = 0; k < sp.power.length; ++k) sum[k + 1] = sum[k] + sp.power[k];
  const freqs = [], db = [], half = 2 ** (1 / (2 * fraction));
  for (let f = 20; f <= 20000; f *= 2 ** (1 / 48)) {
    const lo = Math.max(1, Math.floor(f / half / sp.binHz)), hi = Math.min(sp.power.length - 1, Math.ceil((f * half) / sp.binHz));
    freqs.push(f);
    db.push(10 * Math.log10((sum[hi + 1] - sum[lo]) / (hi - lo + 1) + 1e-30));
  }
  return { freqs, db };
}

/** The curve's value at `f`, from the nearest point. */
export function curveAt(curve, f) {
  let best = 0;
  for (let i = 1; i < curve.freqs.length; ++i) if (Math.abs(Math.log(curve.freqs[i] / f)) < Math.abs(Math.log(curve.freqs[best] / f))) best = i;
  return curve.db[best];
}

/** A cut-only correction at the third-octave centres from 63 Hz to 8 kHz: where the curve stands above its own
 *  mean over 200 Hz..4 kHz, a cut of that much, at most `limit` dB. Never a boost: a phone and one position do
 *  not say enough to raise anything. */
export function cuts(curve, limit = 6) {
  const mid = curve.freqs.map((f, i) => [f, curve.db[i]]).filter(([f]) => f >= 200 && f <= 4000);
  const target = mid.reduce((s, [, d]) => s + d, 0) / mid.length;
  return thirds.filter((f) => f >= 63 && f <= 8000).map((f) => ({ f, db: -Math.min(limit, Math.max(0, curveAt(curve, f) - target)) }));
}

/** Cuts that match the speakers to each other: each curve against the average of all of them, so what they share
 *  -- the phone's microphone, and the room as every speaker excites it -- is left alone. One curve alone is
 *  flattened against itself. */
export function matchedCuts(curves, limit = 6) {
  if (curves.length < 2) return curves.map((c) => cuts(c, limit));
  const mean = curves[0].db.map((_, i) => curves.reduce((s, c) => s + c.db[i], 0) / curves.length);
  return curves.map((c) => cuts({ freqs: c.freqs, db: c.db.map((d, i) => d - mean[i]) }, limit));
}

export const thirds = [50, 63, 80, 100, 125, 160, 200, 250, 315, 400, 500, 630, 800, 1000, 1250, 1600, 2000, 2500, 3150, 4000, 5000, 6300, 8000, 10000, 12500, 16000];

/** Delay, level and response of every speaker in a recording made while `events` played.
 *  `want`: { delay, level, response } -- each worked out only when asked for.
 *  Delays are relative to the reference speaker, corrected for the drift between the two clocks; levels are
 *  in dB, 500 Hz to 2 kHz of the direct sound, relative to the loudest; a response is the curve over the first half
 *  second, smoothed over 1/`want.smoothing` of an octave (3 if not given), with a cut-only correction: matching the
 *  speakers to each other, or with `want.match` false flattening each on its own. `want.calibration`, a microphone's
 *  calibration points, is taken off every response first, so the curve is the speaker's and not the microphone's. */
export function analyse(recording, fs, sweepSpec, events, want) {
  const { seconds, f1, f2 } = sweepSpec;
  const inv = inverse(fs, seconds, f1, f2);
  // the start reference: anywhere in the first stretch, since when the phone began recording is not known
  const firstStretch = Math.min(recording.length, Math.round((events[0].start + seconds + 3) * fs));
  const h0 = convolve(recording.subarray(0, firstStretch), inv);
  //  the earliest strong peak: the stretch can hold the next sweep on the same speaker too, as loud as this one
  const strongest = peakIn(h0, inv.length - 1, h0.length);
  let first = inv.length - 1;
  while (first < h0.length && Math.abs(h0[first]) < 0.5 * strongest.value) first++;
  const p0 = peakIn(h0, first, first + Math.round(0.003 * fs));
  const ref0 = p0.at - (inv.length - 1); // samples into the recording
  const startEvent = events.find((e) => e.ref === 'start'), endEvent = events.find((e) => e.ref === 'end');
  const seconds0 = ref0 / fs;
  // the end reference, near where it should be, gives the clocks' ratio
  const nominalEnd = seconds0 + (endEvent.start - startEvent.start);
  const end = responseAt(recording, fs, inv, nominalEnd, 0.05, 0.6);
  const ratio = (end.at - ref0) / ((endEvent.start - startEvent.start) * fs); // phone samples per computer sample
  const driftPpm = (ratio - 1) * 1e6;
  const results = events.filter((e) => !e.ref).map((e) => {
    const expected = seconds0 + (e.start - startEvent.start) * ratio;
    const r = responseAt(recording, fs, inv, expected, 0.05, 0.6);
    const out = { channel: e.channel, peak: r.peak.value };
    if (want.delay) out.delayMs = ((r.at - expected * fs) / fs) * 1000;
    if (want.level) out.levelDb = bandDb(powerSpectrum(r.h, r.peak.at, fs, 10, 4096), 500, 2000); // the direct sound only
    if (want.response) {
      //  half a second: long enough to resolve the lows, the room included as the ear hears it
      out.response = smoothed(powerSpectrum(r.h, r.peak.at, fs, 500, 65536), want.smoothing ?? 3);
      if (want.calibration) out.response.db = out.response.db.map((d, i) => d - correction(want.calibration, out.response.freqs[i]));
      out.cuts = cuts(out.response);
    }
    return out;
  });
  if (want.response && want.match !== false) {
    const matched = matchedCuts(results.map((r) => r.response));
    results.forEach((r, i) => (r.cuts = matched[i]));
  }
  if (want.level) {
    const top = Math.max(...results.map((r) => r.levelDb));
    for (const r of results) r.levelDb -= top;
  }
  return { driftPpm, referenceMatch: end.peak.value / p0.value, speakers: results };
}

/** The response of the one sweep in `recording`: deconvolved, the half second from its strongest peak, smoothed over
 *  1/`fraction` of an octave. For a check of one speaker, where no reference sweep times it. */
export function responseOf(recording, fs, sweepSpec, fraction = 12) {
  const { seconds, f1, f2 } = sweepSpec, inv = inverse(fs, seconds, f1, f2);
  const h = convolve(recording, inv), peak = peakIn(h, inv.length - 1, h.length);
  return smoothed(powerSpectrum(h, peak.at, fs, 500, 65536), fraction);
}

/** `values` with those that differ by no more than `tolerance` made equal: sorted, each group spans `tolerance` at
 *  most from its smallest, and takes its mean. A listener a little off the sweet spot measures small differences
 *  that are not the speakers'; a group of speakers really nearer or louder keeps its difference. Undefined values
 *  stay undefined. */
export function evened(values, tolerance) {
  const out = values.slice();
  const order = values.map((v, i) => i).filter((i) => values[i] !== undefined).sort((a, b) => values[a] - values[b]);
  for (let start = 0; start < order.length; ) {
    let end = start + 1;
    while (end < order.length && values[order[end]] - values[order[start]] <= tolerance) end++;
    const group = order.slice(start, end), mean = group.reduce((s, i) => s + values[i], 0) / group.length;
    for (const i of group) out[i] = mean;
    start = end;
  }
  return out;
}
