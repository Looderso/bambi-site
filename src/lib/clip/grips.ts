/*  The grips, and the presets that fill them in. A new kind is one entry in `kinds`, a new starting point
    one entry in `presets`; the form builds itself from them. Every kind can be used on either end. */
import type { Fit, Geometry, GripKind, GripPreset } from './types';

const len = { unit: 'mm', step: 0.05 } as const;
/*  Every diagram in one frame, 280 by 120, drawn about x = 140 with its labels inside the frame, so all of
    them sit and size alike. Dashed is what is held, solid is the grip. */
const svg = (body: string) => `<svg viewBox="0 0 280 120">${body}</svg>`;
const dashed = 'fill="none" stroke="currentColor" stroke-dasharray="3 3"';
const solid = 'fill="none" stroke="currentColor" stroke-width="3"';

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
  defaults: { width: 6.35, depth: 7.65, snap: 0.6, length: 9 },
  measures: [
    { key: 'width', label: 'width', min: 1, max: 40, ...len, hint: 'across the opening, side to side' },
    { key: 'depth', label: 'depth', min: 1, max: 40, ...len, hint: 'through, from the opening to the bridge; equal to width for a circle' },
    { key: 'snap', label: 'snap', min: 0, max: 3, ...len, hint: 'how far each side of the opening reaches past the widest point' },
    { key: 'length', label: 'grip length', min: 3, max: 40, ...len, hint: 'how much of it the grip holds' },
  ],
  figure: svg(`<ellipse cx="140" cy="56" rx="24" ry="30" ${dashed}/><path d="M126 90 A32 38 0 1 1 154 90" ${solid}/>
<text x="140" y="61" text-anchor="middle">width</text><text x="182" y="50">depth</text><text x="140" y="114" text-anchor="middle">snap ↔ opening</text>`),
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
  defaults: { width: 30, depth: 12, length: 20, lip: 2 },
  measures: [
    { key: 'width', label: 'box width', min: 3, max: 80, ...len, hint: 'across the box, side to side' },
    { key: 'depth', label: 'box depth', min: 2, max: 40, ...len, hint: 'through the box, from its face to the bridge' },
    { key: 'length', label: 'box length', min: 3, max: 80, ...len, hint: 'how much of the box the cradle holds; it slides in from the top' },
    { key: 'lip', label: 'lip', min: 0.5, max: 10, ...len, hint: 'how far the cradle reaches over the box’s face' },
  ],
  figure: svg(`<rect x="84" y="34" width="112" height="40" ${dashed}/><path d="M104 86 H72 V22 H208 V86 H176" ${solid}/>
<text x="140" y="15" text-anchor="middle">box width</text><text x="214" y="59">depth</text><text x="140" y="112" text-anchor="middle">lip ↔ face</text>`),
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
  defaults: { width: 18, thickness: 6, lip: 2, length: 14 },
  measures: [
    { key: 'width', label: 'band width', min: 5, max: 60, ...len, hint: 'across the band, front to back' },
    { key: 'thickness', label: 'band thickness', min: 1, max: 20, ...len, hint: 'through the band, outside to inside' },
    { key: 'lip', label: 'lip', min: 0.5, max: 10, ...len, hint: 'how far the clip reaches round the inside face' },
    { key: 'length', label: 'clip length', min: 5, max: 40, ...len, hint: 'along the band' },
  ],
  figure: svg(`<rect x="84" y="38" width="112" height="32" ${dashed}/><path d="M104 82 H72 V26 H208 V82 H176" ${solid}/>
<text x="140" y="17" text-anchor="middle">band width</text><text x="214" y="59">thickness</text><text x="140" y="110" text-anchor="middle">lip ↔ inside</text>`),
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
  defaults: { diameter: 8, opening: 100, length: 12 },
  measures: [
    { key: 'diameter', label: 'diameter', min: 2, max: 40, ...len, hint: 'of the rod or tube the clip goes round' },
    { key: 'opening', label: 'opening', min: 40, max: 160, unit: '°', step: 1, hint: 'smaller holds tighter, larger snaps on more easily' },
    { key: 'length', label: 'clip length', min: 5, max: 40, ...len, hint: 'along the rod' },
  ],
  figure: svg(`<circle cx="140" cy="54" r="24" ${dashed}/><path d="M122 84 A32 32 0 1 1 158 84" ${solid}/>
<text x="180" y="40">diameter</text><text x="140" y="112" text-anchor="middle">opening</text>`),
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
  defaults: { slit: 4, thickness: 3, overhang: 4, length: 14 },
  measures: [
    { key: 'slit', label: 'slit width', min: 1, max: 20, ...len, hint: 'the gap the tab goes through' },
    { key: 'thickness', label: 'band thickness', min: 0.5, max: 15, ...len, hint: 'of the band either side of the slit' },
    { key: 'overhang', label: 'overhang', min: 1, max: 15, ...len, hint: 'how far the tab reaches past the slit behind the band' },
    { key: 'length', label: 'tab length', min: 5, max: 40, ...len, hint: 'along the slit; slide it in from the slit’s end' },
  ],
  figure: svg(`<rect x="70" y="50" width="60" height="18" ${dashed}/><rect x="150" y="50" width="60" height="18" ${dashed}/>
<path d="M100 34 H180 M133 34 V82 M147 34 V82 M110 82 H170" ${solid}/>
<text x="140" y="20" text-anchor="middle">slit width</text><text x="64" y="64" text-anchor="end">thickness</text><text x="140" y="108" text-anchor="middle">overhang</text>`),
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
  defaults: { width: 20, height: 14, thickness: 2 },
  measures: [
    { key: 'width', label: 'pad width', min: 5, max: 60, ...len },
    { key: 'height', label: 'pad height', min: 5, max: 60, ...len },
    { key: 'thickness', label: 'pad thickness', min: 1, max: 6, ...len, hint: 'stuck on with double-sided tape' },
  ],
  figure: svg(`<rect x="84" y="48" width="112" height="16" ${solid}/><path d="M84 78 H196" ${dashed}/>
<text x="140" y="34" text-anchor="middle">pad width</text><text x="140" y="104" text-anchor="middle">tape</text>`),
  build(g, v) {
    return { solid: slab(g, v.width, v.thickness, 0).extrude(v.height), height: v.height, width: v.width };
  },
};

export const kinds: GripKind[] = [ovalGrip, box, band, round, slit, pad];

/*  Devices whose grip is known: choosing one sets the primitive and its dimensions. Each was measured, and
    printed before it was listed. */
export const presets: GripPreset[] = [
  //  the stem as seen looking at the ear, 6.35 wide and 7.65 deep
  { id: 'airpods-pro-3', name: 'AirPods Pro 3', end: 'tracker', kind: 'oval', values: { width: 6.35, depth: 7.65, snap: 0.6, length: 9 }, ghost: 'airpod' },
];

export const kindOf = (id: string) => kinds.find((k) => k.id === id)!;
export const presetsFor = (end: 'tracker' | 'headphones') => presets.filter((p) => p.end === end);
