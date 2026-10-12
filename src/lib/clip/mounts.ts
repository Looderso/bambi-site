/*  The headphone side. A kind of mount says which measurements it needs and builds itself from them; a
    preset is a kind with values filled in. A new kind is one entry in `kinds`, a new starting point one
    entry in `presets`; nothing else changes. */
import type { Fit, Geometry, MountKind, MountPreset } from './types';

const len = { unit: 'mm', step: 0.1 } as const;

/** A rectangle in the plan, centred on x, from y0 down to y0 - h. */
function slab(g: Geometry, w: number, h: number, y0: number) {
  return g.CrossSection.square([w, h], true).translate(0, y0 - h / 2);
}

const band: MountKind = {
  id: 'band',
  name: 'band',
  measures: [
    { key: 'width', label: 'band width', min: 5, max: 60, ...len, hint: 'across the band, front to back' },
    { key: 'thickness', label: 'band thickness', min: 1, max: 20, ...len, hint: 'through the band, outside to inside' },
    { key: 'lip', label: 'lip', min: 0.5, max: 10, ...len, hint: 'how far the clip reaches round the inside face' },
    { key: 'length', label: 'clip length', min: 5, max: 40, ...len, hint: 'along the band' },
  ],
  figure: `<svg viewBox="14 6 252 100"><rect x="40" y="35" width="120" height="30" fill="none" stroke="currentColor" stroke-dasharray="3 3"/>
<path d="M60 75 H32 V25 H168 V75 H140" fill="none" stroke="currentColor" stroke-width="3"/>
<text x="100" y="18" text-anchor="middle">band width</text><text x="176" y="54">thickness</text><text x="100" y="95" text-anchor="middle">lip ↔ inside</text></svg>`,
  build(g, v, fit: Fit) {
    const w = v.width + 2 * fit.tolerance;
    const t = v.thickness + 2 * fit.tolerance;
    const outerW = w + 2 * fit.wall;
    const outerT = t + 2 * fit.wall;
    const shell = slab(g, outerW, outerT, 0).subtract(slab(g, w, t, -fit.wall));
    //  the open side faces the head: the lips hook round the band's inside face
    const opening = Math.max(1, v.width - 2 * v.lip);
    const section = shell.subtract(slab(g, opening, fit.wall + 1, -outerT + fit.wall));
    return { solid: section.extrude(v.length), height: v.length, width: outerW };
  },
};

const round: MountKind = {
  id: 'round',
  name: 'round',
  measures: [
    { key: 'diameter', label: 'diameter', min: 2, max: 40, ...len, hint: 'of the rod or tube the clip goes round' },
    { key: 'opening', label: 'opening', min: 40, max: 160, unit: '°', step: 1, hint: 'smaller holds tighter, larger snaps on more easily' },
    { key: 'length', label: 'clip length', min: 5, max: 40, ...len, hint: 'along the rod' },
  ],
  figure: `<svg viewBox="14 6 252 100"><circle cx="100" cy="55" r="26" fill="none" stroke="currentColor" stroke-dasharray="3 3"/>
<path d="M82 85 A34 34 0 1 1 118 85" fill="none" stroke="currentColor" stroke-width="3"/>
<text x="100" y="59" text-anchor="middle">diameter</text><text x="100" y="104" text-anchor="middle">opening</text></svg>`,
  build(g, v, fit) {
    const inner = v.diameter / 2 + fit.tolerance;
    const outer = inner + fit.wall;
    let ring = g.CrossSection.circle(outer, 96).subtract(g.CrossSection.circle(inner, 96));
    //  a wedge of the given angle, opening towards the head
    const half = (v.opening / 2) * (Math.PI / 180);
    const r = outer * 2;
    //  counter-clockwise, as a filled contour must be
    const wedge = g.CrossSection.ofPolygons([[0, 0], [-r * Math.sin(half), -r * Math.cos(half)], [0, -r], [r * Math.sin(half), -r * Math.cos(half)]]);
    ring = ring.subtract(wedge).translate(0, -outer);
    return { solid: ring.extrude(v.length), height: v.length, width: 2 * outer };
  },
};

const slit: MountKind = {
  id: 'slit',
  name: 'slit',
  measures: [
    { key: 'slit', label: 'slit width', min: 1, max: 20, ...len, hint: 'the gap the tab goes through' },
    { key: 'thickness', label: 'band thickness', min: 0.5, max: 15, ...len, hint: 'of the band either side of the slit' },
    { key: 'overhang', label: 'overhang', min: 1, max: 15, ...len, hint: 'how far the tab reaches past the slit behind the band' },
    { key: 'length', label: 'tab length', min: 5, max: 40, ...len, hint: 'along the slit; slide it in from the slit’s end' },
  ],
  figure: `<svg viewBox="14 6 252 100"><rect x="20" y="45" width="65" height="18" fill="none" stroke="currentColor" stroke-dasharray="3 3"/><rect x="115" y="45" width="65" height="18" fill="none" stroke="currentColor" stroke-dasharray="3 3"/>
<path d="M60 30 H140 M90 30 V70 M110 30 V70 M70 70 H130" fill="none" stroke="currentColor" stroke-width="3"/>
<text x="100" y="20" text-anchor="middle">slit width</text><text x="186" y="58">thickness</text><text x="100" y="90" text-anchor="middle">overhang</text></svg>`,
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

const pad: MountKind = {
  id: 'pad',
  name: 'flat pad',
  measures: [
    { key: 'width', label: 'pad width', min: 5, max: 60, ...len },
    { key: 'height', label: 'pad height', min: 5, max: 60, ...len },
    { key: 'thickness', label: 'pad thickness', min: 1, max: 6, ...len, hint: 'stuck to the headphones with double-sided tape' },
  ],
  figure: `<svg viewBox="14 6 252 100"><rect x="40" y="40" width="120" height="16" fill="none" stroke="currentColor" stroke-width="3"/>
<path d="M40 70 H160" stroke="currentColor" stroke-dasharray="3 3"/><text x="100" y="30" text-anchor="middle">pad width</text><text x="100" y="90" text-anchor="middle">tape</text></svg>`,
  build(g, v) {
    return { solid: slab(g, v.width, v.thickness, 0).extrude(v.height), height: v.height, width: v.width };
  },
};

export const kinds: MountKind[] = [band, round, slit, pad];

export const presets: MountPreset[] = [
  { id: 'narrow-band', name: 'narrow headband', kind: 'band', values: { width: 18, thickness: 6, lip: 2, length: 14 } },
  { id: 'wide-band', name: 'wide headband', kind: 'band', values: { width: 32, thickness: 8, lip: 3, length: 16 } },
  { id: 'round', name: 'round clip', kind: 'round', values: { diameter: 8, opening: 100, length: 12 } },
  { id: 'slit', name: 'headband with slit', kind: 'slit', values: { slit: 4, thickness: 3, overhang: 4, length: 14 } },
  { id: 'pad', name: 'flat pad', kind: 'pad', values: { width: 20, height: 14, thickness: 2 } },
];

export const kindOf = (id: string) => kinds.find((k) => k.id === id)!;
