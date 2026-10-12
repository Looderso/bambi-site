/*  The clip is two grips joined by a bridge: one holds the head tracker, the other the headphones. Every
    part is a cross-section extruded upwards from the print bed (z = 0), so the clip prints lying flat, with
    no supports. Each grip is built in the same plan: its attachment face on y = 0, the grip itself below it
    (y < 0), and whatever it holds is pushed in from the far side. The headphone grip is used as built; the
    tracker grip is mirrored onto the other end of the bridge. Millimetres throughout. */
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

/** How tight a printed fit is, and how thick its walls: shared by both grips. */
export interface Fit {
  tolerance: number; // clearance added to every surface that meets something, per side
  wall: number;
}

/** A kind of grip: what it asks for, and how it is built from the answers. */
export interface GripKind {
  id: string;
  name: string;
  measures: Measure[];
  /** A schematic of the cross-section, in SVG, with its measures labelled. */
  figure: string;
  build(g: Geometry, v: Record<string, number>, fit: Fit): { solid: Manifold; height: number; width: number };
}

export type End = 'tracker' | 'headphones';

/** A starting point: a kind of grip with values filled in, offered on one end. Choosing one copies its values. */
export interface GripPreset {
  id: string;
  name: string;
  end: End;
  kind: string;
  values: Record<string, number>;
  /** For a preset that holds a known device: a rough solid of it for the preview, never exported. */
  ghost?: 'airpod';
}
