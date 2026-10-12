/*  The clip assembled: the mount, a bridge from its attachment face, and the claw on the bridge's end. */
import type { Manifold } from 'manifold-3d/manifold';
import type { AirPodModel } from './airpods';
import { kindOf } from './mounts';
import type { Fit, Geometry } from './types';

export interface ClipSettings {
  airpod: AirPodModel;
  mount: string; // a kind's id
  values: Record<string, number>;
  fit: Fit;
  reach: number; // the gap the bridge leaves between the headphones and the AirPod
}

/** The cross-section of the stem, centred on the origin. */
function stem(g: Geometry, a: AirPodModel, grow: number) {
  const r = Math.min(a.stem.corner, a.stem.width / 2, a.stem.depth / 2);
  return g.CrossSection.square([a.stem.width - 2 * r, a.stem.depth - 2 * r], true).offset(r + grow, 'Round', 2, 48);
}

/** The claw alone, with its back on y = 0 and the stem's centre at y = its returned `centre`. */
export function claw(g: Geometry, a: AirPodModel, fit: Fit): { solid: Manifold; centre: number; width: number } {
  const inside = stem(g, a, fit.tolerance);
  const outside = stem(g, a, fit.tolerance + fit.wall);
  //  the opening faces away from the headphones (+y), narrower than the stem by the snap on each side
  const opening = Math.max(0.8, a.stem.width - 2 * a.grip.snap);
  const reachOut = a.stem.depth / 2 + fit.tolerance + fit.wall + 1;
  const section = outside
    .subtract(inside)
    .subtract(g.CrossSection.square([opening, reachOut], false).translate(-opening / 2, 0));
  const centre = a.stem.depth / 2 + fit.tolerance + fit.wall;
  return { solid: section.translate(0, centre).extrude(a.grip.length), centre, width: a.stem.width + 2 * (fit.tolerance + fit.wall) };
}

export function clip(g: Geometry, s: ClipSettings): Manifold {
  const mount = kindOf(s.mount).build(g, s.values, s.fit);
  const c = claw(g, s.airpod, s.fit);
  const overlap = 0.5; // into each part, so the union is one solid
  const height = Math.min(mount.height, s.airpod.grip.length);
  const bridgeWidth = Math.min(c.width, mount.width, 8);
  const bridge = g.Manifold.cube([bridgeWidth, s.reach + 2 * overlap, height]).translate([-bridgeWidth / 2, -overlap, 0]);
  return g.Manifold.union([mount.solid, bridge, c.solid.translate([0, s.reach, 0])]);
}

/** The AirPod as a rough solid, where the claw holds it: for the preview, never exported. */
export function ghost(g: Geometry, s: ClipSettings): Manifold {
  const a = s.airpod;
  const c = claw(g, a, s.fit);
  const below = a.stem.length - a.grip.length;
  const st = stem(g, a, 0).extrude(a.stem.length).translate([0, 0, -below]);
  const body = g.Manifold.sphere(a.body.radius, 48).translate([0, a.body.radius * 0.35, a.grip.length + a.body.radius * 0.8]);
  return g.Manifold.union([st, body]).translate([0, s.reach + c.centre, 0]);
}
