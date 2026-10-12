/*  The grips, and the presets that fill them in. A new kind is one entry in `kinds`, a new starting point
    one entry in `presets`; the form builds itself from them. Every kind can be used on either end. */
import type { Fit, Geometry, GripKind, GripPreset } from './types';

const len = { unit: 'mm', step: 0.05 } as const;
const svg = (body: string) => `<svg viewBox="14 6 252 100">${body}</svg>`;

/** A rectangle in the plan, centred on x, from y0 down to y0 - h. */
function slab(g: Geometry, w: number, h: number, y0: number) {
  return g.CrossSection.square([w, h], true).translate(0, y0 - h / 2);
}

/** An oval of the given width and depth, centred on the origin, grown evenly by `grow`. */
function oval(g: Geometry, width: number, depth: number, grow: number) {
  const o = g.CrossSection.circle(1, 128).scale([width / 2, depth / 2]);
  return grow > 0 ? o.offset(grow, 'Round', 2, 128) : o;
}

const ovalGrip: GripKind = {
  id: 'oval',
  name: 'oval',
  measures: [
    { key: 'width', label: 'width', min: 1, max: 40, ...len, hint: 'across the opening, side to side' },
    { key: 'depth', label: 'depth', min: 1, max: 40, ...len, hint: 'through, from the opening to the bridge; equal to width for a circle' },
    { key: 'snap', label: 'snap', min: 0, max: 3, ...len, hint: 'how far each side of the opening reaches past the widest point' },
    { key: 'length', label: 'grip length', min: 3, max: 40, ...len, hint: 'how much of it the grip holds' },
  ],
  figure: svg(`<ellipse cx="140" cy="56" rx="34" ry="40" fill="none" stroke="currentColor" stroke-dasharray="3 3"/>
<path d="M126 102 A44 50 0 1 1 154 102" fill="none" stroke="currentColor" stroke-width="3"/>
<text x="140" y="60" text-anchor="middle">width</text><text x="196" y="40">depth</text><text x="196" y="96">snap</text>`),
  build(g, v, fit) {
    const outerDepth = v.depth + 2 * (fit.tolerance + fit.wall);
    const centre = -outerDepth / 2;
    const ring = oval(g, v.width, v.depth, fit.tolerance + fit.wall).subtract(oval(g, v.width, v.depth, fit.tolerance));
    //  the opening faces away from the bridge, narrower than the width by the snap on each side
    const opening = Math.max(0.8, v.width - 2 * v.snap);
    const section = ring.subtract(g.CrossSection.square([opening, outerDepth], false).translate(-opening / 2, -outerDepth)).translate(0, centre);
    return { solid: section.extrude(v.length), height: v.length, width: v.width + 2 * (fit.tolerance + fit.wall) };
  },
};

const box: GripKind = {
  id: 'box',
  name: 'box',
  measures: [
    { key: 'width', label: 'box width', min: 3, max: 80, ...len, hint: 'across the box, side to side' },
    { key: 'depth', label: 'box depth', min: 2, max: 40, ...len, hint: 'through the box, from its face to the bridge' },
    { key: 'length', label: 'box length', min: 3, max: 80, ...len, hint: 'how much of the box the cradle holds; it slides in from the top' },
    { key: 'lip', label: 'lip', min: 0.5, max: 10, ...len, hint: 'how far the cradle reaches over the box’s face' },
  ],
  figure: svg(`<rect x="80" y="30" width="120" height="44" fill="none" stroke="currentColor" stroke-dasharray="3 3"/>
<path d="M100 84 H72 V22 H208 V84 H180" fill="none" stroke="currentColor" stroke-width="3"/>
<text x="140" y="16" text-anchor="middle">box width</text><text x="214" y="56">depth</text><text x="140" y="100" text-anchor="middle">lip ↔ face</text>`),
  build(g, v, fit) {
    const w = v.width + 2 * fit.tolerance;
    const d = v.depth + 2 * fit.tolerance;
    const outerW = w + 2 * fit.wall;
    const outerD = d + 2 * fit.wall;
    const opening = Math.max(1, v.width - 2 * v.lip);
    const section = slab(g, outerW, outerD, 0)
      .subtract(slab(g, w, d, -fit.wall))
      .subtract(slab(g, opening, fit.wall + 1, -outerD + fit.wall));
    //  a floor the box rests on: the cradle's own outline, closed
    const floor = slab(g, outerW, outerD, 0).extrude(fit.wall);
    const walls = section.extrude(v.length + fit.wall);
    return { solid: g.Manifold.union([floor, walls]), height: v.length + fit.wall, width: outerW };
  },
};

const band: GripKind = {
  id: 'band',
  name: 'band',
  measures: [
    { key: 'width', label: 'band width', min: 5, max: 60, ...len, hint: 'across the band, front to back' },
    { key: 'thickness', label: 'band thickness', min: 1, max: 20, ...len, hint: 'through the band, outside to inside' },
    { key: 'lip', label: 'lip', min: 0.5, max: 10, ...len, hint: 'how far the clip reaches round the inside face' },
    { key: 'length', label: 'clip length', min: 5, max: 40, ...len, hint: 'along the band' },
  ],
  figure: svg(`<rect x="40" y="35" width="120" height="30" fill="none" stroke="currentColor" stroke-dasharray="3 3"/>
<path d="M60 75 H32 V25 H168 V75 H140" fill="none" stroke="currentColor" stroke-width="3"/>
<text x="100" y="18" text-anchor="middle">band width</text><text x="176" y="54">thickness</text><text x="100" y="95" text-anchor="middle">lip ↔ inside</text>`),
  build(g, v, fit) {
    const w = v.width + 2 * fit.tolerance;
    const t = v.thickness + 2 * fit.tolerance;
    const outerW = w + 2 * fit.wall;
    const outerT = t + 2 * fit.wall;
    const shell = slab(g, outerW, outerT, 0).subtract(slab(g, w, t, -fit.wall));
    //  the open side faces away from the bridge: the lips hook round the band's far face
    const opening = Math.max(1, v.width - 2 * v.lip);
    const section = shell.subtract(slab(g, opening, fit.wall + 1, -outerT + fit.wall));
    return { solid: section.extrude(v.length), height: v.length, width: outerW };
  },
};

const round: GripKind = {
  id: 'round',
  name: 'round',
  measures: [
    { key: 'diameter', label: 'diameter', min: 2, max: 40, ...len, hint: 'of the rod or tube the clip goes round' },
    { key: 'opening', label: 'opening', min: 40, max: 160, unit: '°', step: 1, hint: 'smaller holds tighter, larger snaps on more easily' },
    { key: 'length', label: 'clip length', min: 5, max: 40, ...len, hint: 'along the rod' },
  ],
  figure: svg(`<circle cx="100" cy="55" r="26" fill="none" stroke="currentColor" stroke-dasharray="3 3"/>
<path d="M82 85 A34 34 0 1 1 118 85" fill="none" stroke="currentColor" stroke-width="3"/>
<text x="100" y="59" text-anchor="middle">diameter</text><text x="100" y="104" text-anchor="middle">opening</text>`),
  build(g, v, fit) {
    const inner = v.diameter / 2 + fit.tolerance;
    const outer = inner + fit.wall;
    let ring = g.CrossSection.circle(outer, 96).subtract(g.CrossSection.circle(inner, 96));
    //  a wedge of the given angle, opening away from the bridge; counter-clockwise, as a filled contour must be
    const half = (v.opening / 2) * (Math.PI / 180);
    const r = outer * 2;
    const wedge = g.CrossSection.ofPolygons([[0, 0], [-r * Math.sin(half), -r * Math.cos(half)], [0, -r], [r * Math.sin(half), -r * Math.cos(half)]]);
    ring = ring.subtract(wedge).translate(0, -outer);
    return { solid: ring.extrude(v.length), height: v.length, width: 2 * outer };
  },
};

const slit: GripKind = {
  id: 'slit',
  name: 'slit',
  measures: [
    { key: 'slit', label: 'slit width', min: 1, max: 20, ...len, hint: 'the gap the tab goes through' },
    { key: 'thickness', label: 'band thickness', min: 0.5, max: 15, ...len, hint: 'of the band either side of the slit' },
    { key: 'overhang', label: 'overhang', min: 1, max: 15, ...len, hint: 'how far the tab reaches past the slit behind the band' },
    { key: 'length', label: 'tab length', min: 5, max: 40, ...len, hint: 'along the slit; slide it in from the slit’s end' },
  ],
  figure: svg(`<rect x="20" y="45" width="65" height="18" fill="none" stroke="currentColor" stroke-dasharray="3 3"/><rect x="115" y="45" width="65" height="18" fill="none" stroke="currentColor" stroke-dasharray="3 3"/>
<path d="M60 30 H140 M90 30 V70 M110 30 V70 M70 70 H130" fill="none" stroke="currentColor" stroke-width="3"/>
<text x="100" y="20" text-anchor="middle">slit width</text><text x="186" y="58">thickness</text><text x="100" y="90" text-anchor="middle">overhang</text>`),
  build(g, v, fit) {
    const neck = Math.max(0.8, v.slit - 2 * fit.tolerance);
    const plateW = v.slit + 2 * v.overhang;
    const plate = slab(g, plateW, fit.wall, 0);
    const stem = slab(g, neck, v.thickness + 2 * fit.tolerance, -fit.wall);
    const bar = slab(g, plateW, fit.wall, -fit.wall - v.thickness - 2 * fit.tolerance);
    const section = g.CrossSection.union([plate, stem, bar]);
    return { solid: section.extrude(v.length), height: v.length, width: plateW };
  },
};

const pad: GripKind = {
  id: 'pad',
  name: 'flat pad',
  measures: [
    { key: 'width', label: 'pad width', min: 5, max: 60, ...len },
    { key: 'height', label: 'pad height', min: 5, max: 60, ...len },
    { key: 'thickness', label: 'pad thickness', min: 1, max: 6, ...len, hint: 'stuck on with double-sided tape' },
  ],
  figure: svg(`<rect x="40" y="40" width="120" height="16" fill="none" stroke="currentColor" stroke-width="3"/>
<path d="M40 70 H160" stroke="currentColor" stroke-dasharray="3 3"/><text x="100" y="30" text-anchor="middle">pad width</text><text x="100" y="90" text-anchor="middle">tape</text>`),
  build(g, v) {
    return { solid: slab(g, v.width, v.thickness, 0).extrude(v.height), height: v.height, width: v.width };
  },
};

export const kinds: GripKind[] = [ovalGrip, box, band, round, slit, pad];

export const presets: GripPreset[] = [
  //  measured and printed: the stem as seen looking at the ear, 6.35 wide and 7.65 deep
  { id: 'airpods-pro-3', name: 'AirPods Pro 3', end: 'tracker', kind: 'oval', values: { width: 6.35, depth: 7.65, snap: 0.6, length: 9 }, ghost: 'airpod' },
  { id: 'tracker-box', name: 'tracker in a box', end: 'tracker', kind: 'box', values: { width: 30, depth: 12, length: 20, lip: 2 } },
  { id: 'tracker-pad', name: 'flat pad', end: 'tracker', kind: 'pad', values: { width: 20, height: 14, thickness: 2 } },
  { id: 'narrow-band', name: 'narrow headband', end: 'headphones', kind: 'band', values: { width: 18, thickness: 6, lip: 2, length: 14 } },
  { id: 'wide-band', name: 'wide headband', end: 'headphones', kind: 'band', values: { width: 32, thickness: 8, lip: 3, length: 16 } },
  { id: 'round', name: 'round clip', end: 'headphones', kind: 'round', values: { diameter: 8, opening: 100, length: 12 } },
  { id: 'slit', name: 'headband with slit', end: 'headphones', kind: 'slit', values: { slit: 4, thickness: 3, overhang: 4, length: 14 } },
  { id: 'pad', name: 'flat pad', end: 'headphones', kind: 'pad', values: { width: 20, height: 14, thickness: 2 } },
];

export const kindOf = (id: string) => kinds.find((k) => k.id === id)!;
export const presetsFor = (end: 'tracker' | 'headphones') => presets.filter((p) => p.end === end);
