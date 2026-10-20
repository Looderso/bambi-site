/*  The research page's figures: each a chart of the decoder's head model, evaluated in the page from the model's own
    file, redrawn as its sliders move. A figure is a <figure data-figure="name"> holding a <canvas> and, for each
    slider, an <input type="range" data-k="key"> with an <output> beside it. Colours are the site's, by meaning: ink
    for the model as it plays, the label grey for what it is compared with, orange for what came in (the notches),
    blue for what the ears add (the difference between them). */
import {
  Chart,
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  LogarithmicScale,
  Legend,
  Tooltip,
} from 'chart.js';
import { at, ears, hzOf } from './model.js';

Chart.register(LineController, LineElement, PointElement, LinearScale, LogarithmicScale, Legend, Tooltip);

const tone = (name) => getComputedStyle(document.documentElement).getPropertyValue(name).trim();
const INK = tone('--text'), LABEL = tone('--label'), RULE = tone('--rule'), IN = tone('--orange'), ADDED = tone('--blue');
Chart.defaults.font.family = tone('--font');
Chart.defaults.font.size = 12;
Chart.defaults.color = LABEL;
Chart.defaults.animation = false;

const line = (label, colour, data, dashed = false) => ({
  label,
  data,
  borderColor: colour,
  backgroundColor: colour,
  borderWidth: dashed ? 1.25 : 1.75,
  borderDash: dashed ? [5, 4] : [],
  pointRadius: 0,
  tension: 0,
});

/** Points of a curve over the model's axis, as frequency in Hz against value. */
const overFrequency = (erbs, values) => Array.from(erbs, (e, k) => ({ x: hzOf(e), y: values[k] }));

function chart(canvas, datasets, { x = 'frequency', y = 'dB', log = true, min, max, step } = {}) {
  return new Chart(canvas, {
    type: 'line',
    data: { datasets },
    options: {
      parsing: false,
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'nearest', axis: 'x', intersect: false },
      scales: {
        x: {
          type: log ? 'logarithmic' : 'linear',
          title: { display: true, text: x },
          grid: { color: RULE },
          ticks: log
            ? { maxRotation: 0, autoSkip: false, callback: (v) => ([300, 500, 1000, 2000, 5000, 10000, 20000].includes(v) ? (v >= 1000 ? `${v / 1000}k` : v) : '') }
            : { stepSize: 45, maxRotation: 0 },
          ...(log ? { min: 300, max: 20000 } : { min: -180, max: 180 }), // the model's axis: 300 Hz to 20 kHz
        },
        y: { title: { display: true, text: y }, grid: { color: RULE }, min, max, ticks: { stepSize: step ?? (y === 'µs' ? 300 : 10) } },
      },
      plugins: {
        legend: { position: 'bottom', labels: { boxWidth: 18, boxHeight: 1 } },
        tooltip: {
          callbacks: {
            title: (items) => (log ? `${Math.round(items[0].parsed.x)} Hz` : `${Math.round(items[0].parsed.x)}°`),
            label: (item) => ` ${item.dataset.label}: ${item.parsed.y.toFixed(1)} ${y}`,
          },
        },
      },
    },
  });
}

/** The figure's sliders as numbers, and a call to `draw` whenever one moves. */
function sliders(figure, draw) {
  const inputs = [...figure.querySelectorAll('input[type=range]')];
  const read = () => Object.fromEntries(inputs.map((i) => [i.dataset.k, Number(i.value)]));
  //  a value is shown with its slider's own decimals, so 1 reads 1.0 beside 0.8 and nothing beside it moves
  const decimals = (i) => (i.step.split('.')[1] ?? '').length;
  const show = () =>
    inputs.forEach((i) => (i.nextElementSibling.textContent = `${Number(i.value).toFixed(decimals(i))}${i.dataset.unit ?? ''}`));
  for (const i of inputs) i.addEventListener('input', () => { show(); draw(read()); });
  show();
  draw(read());
}

const json = (url) => fetch(url).then((r) => r.json());

export async function figures(base) {
  const data = `${base}/research/personalisation`;
  const head = await json(`${data}/head.json`);
  const all = (name) => document.querySelectorAll(`figure[data-figure="${name}"]`);

  //  1 · the parts of a head at a direction: the summed level, its smooth part and its notches, and the difference
  //  between the ears.
  for (const figure of all('parts')) {
    const c = chart(figure.querySelector('canvas'), [], { min: -50, max: 30 });
    sliders(figure, ({ az, el }) => {
      const e = ears(head, at(head, az, el));
      const smooth = Array.from(e.cll, (v, k) => v - e.notches[k]);
      c.data.datasets = [
        line('summed level', INK, overFrequency(e.erbs, e.cll)),
        line('smooth pattern and timbre', LABEL, overFrequency(e.erbs, smooth), true),
        line('notches', IN, overFrequency(e.erbs, e.notches)),
        line('level difference, left minus right', ADDED, overFrequency(e.erbs, e.ild)),
      ];
      c.update('none');
    });
  }

  //  2 · the timbre: the population's average against the KU100's.
  for (const figure of all('timbre')) {
    const t = await json(`${data}/timbre.json`);
    const erbs = Array.from({ length: head.axis.points }, (_, k) => head.axis.erb0 + k * head.axis.step);
    chart(figure.querySelector('canvas'), [
      line('the KU100', INK, overFrequency(erbs, t.ku100)),
      line(`the population, ${t.heads.HUTUBS + t.heads['3D3A']} heads`, LABEL, overFrequency(erbs, t.population), true),
    ], { min: -15, max: 15, step: 5 });
  }

  //  3 · the ear slider: the summed level at one elevation in front, as learned and shifted.
  for (const figure of all('ears')) {
    const c = chart(figure.querySelector('canvas'), [], { min: -50, max: 30 });
    sliders(figure, ({ el, shift }) => {
      const place = at(head, 0, el);
      const learned = ears(head, place, 0), moved = ears(head, place, shift);
      c.data.datasets = [
        line(`ears shifted ${shift > 0 ? '+' : ''}${shift} ERB`, INK, overFrequency(moved.erbs, moved.cll)),
        line('as learned', LABEL, overFrequency(learned.erbs, learned.cll), true),
      ];
      c.update('none');
    });
  }

  //  4 · the head slider: the time difference around the horizon.
  for (const figure of all('head')) {
    const around = Array.from({ length: 73 }, (_, i) => -180 + i * 5);
    const base1 = around.map((az) => at(head, az, 0).itd);
    const c = chart(figure.querySelector('canvas'), [], { x: 'azimuth', y: 'µs', log: false, min: -900, max: 900 });
    sliders(figure, ({ size }) => {
      c.data.datasets = [
        line(`head × ${size.toFixed(2)}`, INK, around.map((az, i) => ({ x: az, y: base1[i] * size }))),
        line('the population’s head', LABEL, around.map((az, i) => ({ x: az, y: base1[i] })), true),
      ];
      c.update('none');
    });
  }

  //  5 · nobody's head beside the KU100, both as the decoder plays them, at one direction. The KU100's file is the
  //  largest, so it loads when its figure comes near.
  for (const figure of all('ku100')) {
    const c = chart(figure.querySelector('canvas'), [], { min: -50, max: 30 });
    new IntersectionObserver(async (entries, observer) => {
      if (!entries.some((e) => e.isIntersecting)) return;
      observer.disconnect();
      const ku = await json(`${data}/ku100.json`);
      sliders(figure, ({ az, el }) => {
        const nobody = ears(head, at(head, az, el)), dummy = ears(ku, at(ku, az, el));
        c.data.datasets = [
          line('nobody’s head', INK, overFrequency(nobody.erbs, nobody.cll)),
          line('the KU100', LABEL, overFrequency(dummy.erbs, dummy.cll), true),
        ];
        c.update('none');
      });
    }, { rootMargin: '400px' }).observe(figure);
  }
}
