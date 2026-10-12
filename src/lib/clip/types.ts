/*  The clip is three parts joined at one point: the AirPod's claw, a bridge, and a mount that holds the
    headphones. Every part is a cross-section extruded upwards from the print bed (z = 0), so the clip prints
    lying flat, with no supports. In the plan the bridge runs along +y: a mount's attachment face lies on y = 0
    with the mount below it (y < 0), and the claw's back sits where the bridge ends. Millimetres throughout. */
import type { CrossSection, Manifold } from 'manifold-3d/manifold';

export type Geometry = { CrossSection: typeof CrossSection; Manifold: typeof Manifold };

/** One number the user sets, as the form shows it. */
export interface Measure {
  key: string;
  label: string;
  unit: 'mm' | '°';
  min: number;
  max: number;
  step: number;
  hint?: string;
}

/** How tight a printed fit is, and how thick its walls: shared by every part. */
export interface Fit {
  tolerance: number; // clearance added to every surface that meets something, per side
  wall: number;
}

/** A kind of mount: what it asks for, and how it is built from the answers. */
export interface MountKind {
  id: string;
  name: string;
  measures: Measure[];
  /** A schematic of the cross-section, in SVG, with each measure labelled by its key. */
  figure: string;
  /** The mount in its own plan: attachment face on y = 0, extruded from z = 0 to the returned height. */
  build(g: Geometry, v: Record<string, number>, fit: Fit): { solid: Manifold; height: number; width: number };
}

/** A starting point: a kind of mount with values filled in. Choosing one copies its values; the user edits from there. */
export interface MountPreset {
  id: string;
  name: string;
  kind: string;
  values: Record<string, number>;
}
