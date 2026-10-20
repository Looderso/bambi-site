/*  The research page's two figures in three dimensions, both drawn from the head model in the page and turned with
    the pointer: the notches on the sphere, and the summed level of the median plane as a surface. three.js loads only
    when one of them comes near the screen.

    The model's frame is x front, y left, z up; three.js draws y up, so a model direction (x, y, z) is drawn at
    (−y, z, x): right is +x, up is +y, the front faces the viewer. Colours are the site's: a notch from orange at
    4 kHz to ink at 16 kHz, paler the shallower, and blank where the head has none. */
import { at, ears, hzOf, erbOf, notchesAt } from './model.js';

const tone = (name) => getComputedStyle(document.documentElement).getPropertyValue(name).trim();
const rgb = (hex) => {
  const n = parseInt(hex.replace('#', ''), 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
};
const mix = (a, b, t) => a.map((v, i) => v + (b[i] - v) * t);
/** A colour as the screen shows it, into the linear light three.js renders in, so the site's colours come out as they are. */
const linear = (c) => c.map((v) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));

/** A notch's colour: its centre from orange at 4 kHz to ink at 16 kHz, faded into the ground as it gets shallower. */
function notchColour(centre, depth, palette) {
  const lo = erbOf(4000), hi = erbOf(16000);
  const t = Math.min(1, Math.max(0, (centre - lo) / (hi - lo)));
  const full = Math.min(1, -depth / 12); // full colour at 12 dB deep
  return mix(palette.ground, mix(palette.low, palette.high, t), full);
}

async function stage(figure, THREE, OrbitControls) {
  const canvas = figure.querySelector('canvas');
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(2, window.devicePixelRatio));
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true;
  controls.enableZoom = false;
  canvas.style.touchAction = 'pan-y'; // on a phone a vertical swipe still scrolls the page; a sideways one turns the figure
  const resize = () => {
    const { clientWidth: w, clientHeight: h } = canvas;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  };
  new ResizeObserver(resize).observe(canvas);
  resize();
  let labels = [];
  const frame = () => {
    controls.update();
    renderer.render(scene, camera);
    for (const { el, at: p } of labels) {
      const v = p.clone().project(camera);
      el.style.left = `${((v.x + 1) / 2) * canvas.clientWidth}px`;
      el.style.top = `${((1 - v.y) / 2) * canvas.clientHeight}px`;
      el.style.visibility = v.z < 1 ? 'visible' : 'hidden';
    }
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
  /** A label on the figure, kept over a point of the scene as it turns. */
  const label = (text, point) => {
    const el = document.createElement('span');
    el.className = 'tag3d label';
    el.textContent = text;
    figure.querySelector('.plot').append(el);
    labels.push({ el, at: point });
  };
  return { scene, camera, controls, label };
}

const fromModel = (THREE, x, y, z) => new THREE.Vector3(-y, z, x);

/*  The notches on the sphere: one sphere per notch, turned together, each vertex coloured by that notch there. */
async function sphereFigure(figure, head, THREE, OrbitControls, palette) {
  const { scene, camera, controls, label } = await stage(figure, THREE, OrbitControls);
  const count = head.notches.list.length;
  camera.position.set(1.4, 1.6, 7.5 + 1.2 * count);
  controls.target.set(0, 0, 0);
  const spheres = [];
  for (let i = 0; i < count; i++) {
    const geometry = new THREE.SphereGeometry(1, 96, 48);
    geometry.setAttribute('color', new THREE.BufferAttribute(new Float32Array(geometry.attributes.position.count * 3), 3));
    const mesh = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({ vertexColors: true }));
    mesh.position.x = (i - (count - 1) / 2) * 2.4;
    scene.add(mesh);
    //  the equator and the front, as rules on the sphere
    const ring = new THREE.Mesh(new THREE.TorusGeometry(1.002, 0.004, 6, 128), new THREE.MeshBasicMaterial({ color: palette.rule }));
    ring.rotation.x = Math.PI / 2;
    mesh.add(ring);
    const front = new THREE.Mesh(new THREE.SphereGeometry(0.035, 12, 8), new THREE.MeshBasicMaterial({ color: palette.inkHex }));
    front.position.copy(fromModel(THREE, 1, 0, 0));
    mesh.add(front);
    label(`notch ${i + 1}`, new THREE.Vector3(mesh.position.x, 1.35, 0));
    label('front', new THREE.Vector3(mesh.position.x, -0.2, 1.2));
    spheres.push(geometry);
  }
  //  every vertex's direction in the model's frame, kept for the slider
  const position = spheres[0].attributes.position;
  const dirs = Array.from({ length: position.count }, (_, k) => {
    const X = position.getX(k), Y = position.getY(k), Z = position.getZ(k);
    return [Z, -X, Y]; // three (X, Y, Z) back to the model's (x, y, z)
  });
  const paint = (shift) => {
    const colours = spheres.map((g) => g.attributes.color.array);
    dirs.forEach(([x, y, z], k) => {
      notchesAt(head, x, y, z, shift).forEach((n, i) => colours[i].set(linear(notchColour(n.centre, n.depth, palette)), k * 3));
    });
    spheres.forEach((g) => (g.attributes.color.needsUpdate = true));
  };
  return paint;
}

/*  The summed level of the median plane as a surface: across, the polar angle from below in front, over the top, to
    below behind; along, the frequency; up, the level. */
async function surfaceFigure(figure, head, THREE, OrbitControls, palette) {
  const { scene, camera, controls, label } = await stage(figure, THREE, OrbitControls);
  camera.position.set(2.6, 2.4, 3.4);
  controls.target.set(0, -0.05, 0);
  const angles = Array.from({ length: 136 }, (_, i) => -45 + i * 2); // polar angle, −45 … 225
  const places = angles.map((u) => (u <= 90 ? at(head, 0, u) : at(head, 180, 180 - u)));
  const step = 2, points = head.axis.points;
  const ks = Array.from({ length: Math.ceil(points / step) }, (_, j) => Math.min(points - 1, j * step));
  const W = angles.length, H = ks.length, LO = -24, HI = 12; // dB: the notches' floor to the highest the level reaches
  const geometry = new THREE.PlaneGeometry(2, 2, W - 1, H - 1);
  geometry.setAttribute('color', new THREE.BufferAttribute(new Float32Array(W * H * 3), 3));
  const mesh = new THREE.Mesh(
    geometry,
    new THREE.MeshLambertMaterial({ vertexColors: true, side: THREE.DoubleSide }),
  );
  mesh.rotation.x = -Math.PI / 2; // the plane lies flat; its height is the level
  scene.add(mesh);
  scene.add(new THREE.AmbientLight(0xffffff, 1.1));
  const sun = new THREE.DirectionalLight(0xffffff, 1.0);
  sun.position.set(1, 3, 2);
  scene.add(sun);
  scene.add(new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(2, 0.9, 2)), new THREE.LineBasicMaterial({ color: palette.rule })));
  //  the axes' labels: where the polar angle passes the front, the top and the back, and three frequencies
  const across = (u) => -1 + ((u + 45) / 270) * 2;
  const along = (hz) => {
    const e = erbOf(hz), e0 = head.axis.erb0, e1 = head.axis.erb0 + (points - 1) * head.axis.step;
    return -1 + ((e - e0) / (e1 - e0)) * 2; // the mesh's first row, the lowest frequency, lies furthest back
  };
  for (const [u, name] of [[0, 'front'], [90, 'above'], [180, 'behind']]) label(name, new THREE.Vector3(across(u), -0.5, 1.12));
  for (const hz of [1000, 4000, 16000]) label(`${hz / 1000} kHz`, new THREE.Vector3(1.14, -0.5, along(hz)));
  const pos = geometry.attributes.position, col = geometry.attributes.color.array;
  const paint = (shift) => {
    const lv = places.map((p) => ears(head, p, shift).cll);
    for (let j = 0; j < H; j++)
      for (let i = 0; i < W; i++) {
        const v = lv[i][ks[j]], k = j * W + i;
        const h = (Math.min(HI, Math.max(LO, v)) - LO) / (HI - LO); // 0 … 1
        pos.setZ(k, (h - 0.5) * 0.9);
        col.set(linear(h < 0.55 ? mix(palette.low, palette.ground, Math.min(1, h / 0.55)) : mix(palette.ground, palette.high, (h - 0.55) / 0.45)), k * 3);
      }
    pos.needsUpdate = true;
    geometry.attributes.color.needsUpdate = true;
    geometry.computeVertexNormals();
  };
  return paint;
}

/** The figure's ears slider: its value shown with its decimals, and `paint` called whenever it moves. */
function earsSlider(figure, paint) {
  const input = figure.querySelector('input[data-k=shift]');
  const out = input.nextElementSibling;
  const show = () => {
    out.textContent = `${Number(input.value).toFixed(1)} ERB`;
    paint(Number(input.value));
  };
  input.addEventListener('input', show);
  show();
}

export function solids(head) {
  const figures = [...document.querySelectorAll('figure[data-solid]')];
  if (!figures.length) return;
  //  three.js and the palette, loaded once, the first time a figure comes near
  let ready = null;
  const load = () =>
    (ready ??= Promise.all([import('three'), import('three/examples/jsm/controls/OrbitControls.js')]).then(([THREE, { OrbitControls }]) => ({
      THREE,
      OrbitControls,
      palette: {
        ground: rgb(tone('--ground')),
        low: rgb(tone('--orange')),
        high: rgb(tone('--text')),
        rule: tone('--rule'),
        inkHex: tone('--text'),
      },
    })));
  //  a figure is claimed the moment it is seen, before anything is awaited, so it is never set up twice
  const watch = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      const figure = entry.target;
      watch.unobserve(figure);
      load().then(async ({ THREE, OrbitControls, palette }) => {
        const make = figure.dataset.solid === 'sphere' ? sphereFigure : surfaceFigure;
        earsSlider(figure, await make(figure, head, THREE, OrbitControls, palette));
      });
    }
  }, { rootMargin: '400px' });
  figures.forEach((f) => watch.observe(f));
}
