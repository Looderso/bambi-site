/*  The clip assembled: the headphone grip, a bridge from its attachment face, and the tracker grip mirrored
    onto the bridge's other end, so that whatever each holds is pushed in from outside. */
import type { Manifold } from 'manifold-3d/manifold';
import { kindOf } from './grips';
import type { Fit, Geometry } from './types';

export interface Grip {
  kind: string;
  values: Record<string, number>;
}

export interface ClipSettings {
  tracker: Grip;
  headphones: Grip;
  fit: Fit;
  reach: number; // the gap the bridge leaves between the two grips
}

const build = (g: Geometry, grip: Grip, fit: Fit) => kindOf(grip.kind).build(g, grip.values, fit);

/** The tracker grip alone, facing +y with its attachment face on y = 0: for a test print, and for the clip. */
export function trackerGrip(g: Geometry, s: Pick<ClipSettings, 'tracker' | 'fit'>) {
  const t = build(g, s.tracker, s.fit);
  return { ...t, solid: t.solid.mirror([0, 1, 0]) };
}

export function clip(g: Geometry, s: ClipSettings): Manifold {
  const headphones = build(g, s.headphones, s.fit);
  const tracker = trackerGrip(g, s);
  const overlap = 0.5; // into each grip, so the union is one solid
  const height = Math.min(headphones.height, tracker.height);
  const bridgeWidth = Math.min(tracker.width, headphones.width, 8);
  const bridge = g.Manifold.cube([bridgeWidth, s.reach + 2 * overlap, height]).translate([-bridgeWidth / 2, -overlap, 0]);
  return g.Manifold.union([headphones.solid, bridge, tracker.solid.translate([0, s.reach, 0])]);
}

/** An AirPod in the oval grip, as a rough solid: stem down, body above. For the preview, never exported. */
export function airpodGhost(g: Geometry, s: ClipSettings): Manifold {
  const v = s.tracker.values;
  const stemLength = 15;
  const body = 10;
  const centre = s.reach + v.depth / 2 + s.fit.tolerance + s.fit.wall;
  const stem = g.CrossSection.circle(1, 64).scale([v.width / 2, v.depth / 2]).extrude(stemLength).translate([0, 0, v.length - stemLength]);
  const bud = g.Manifold.sphere(body, 48).translate([0, body * 0.35, v.length + body * 0.8]);
  return g.Manifold.union([stem, bud]).translate([0, centre, 0]);
}
