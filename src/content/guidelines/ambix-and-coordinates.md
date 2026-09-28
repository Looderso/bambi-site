---
title: AmbiX and coordinates
summary: "ACN ordering, SN3D normalisation, x front, y left, z up. Degrees outside, radians inside."
group: design
order: 21
---

## the format

bambi speaks **AmbiX**: channels in **ACN** order, normalised **SN3D**. It is the format most ambisonic tools
agree on, and bambi reads and writes nothing else on the bus. The older FuMa convention is not used.

There is no normalisation setting anywhere. A field is SN3D in every plugin, so one plugin's output is always
the next one's input.

## the order

A plugin runs at the **highest order the track's channels hold**: (N+1)² channels for order N. On a track with
more channels than a whole order uses, the rest are silent: 10 channels are order 2 and one unused. The order is
shown on the settings page and in the footer.

VST3 describes ambisonic layouts up to 7th order. CLAP has no ceiling of its own, and the core is verified far
beyond anything a session needs.

## coordinates

- **Right-handed: x to the front, y to the left, z up.**
- **Azimuth** is measured from the front, counter-clockwise seen from above: +90° is left.
- **Elevation** is positive upwards: +90° is straight up.

The equirect draws the same convention: back, left, front, right, back from left to right.

## units

**Degrees at the interface and in the parameters, radians everywhere inside.** A parameter is stored and
automated in degrees, because that is what a user reads. It becomes radians once, where it is read into the
engine, and nothing inside works in degrees.

Milliseconds likewise exist only at the interface. Inside, every time is in seconds, and a name says so.

## rotations

An orientation is three angles, **yaw · pitch · roll**, the same rotation for a trajectory's placement and for
a region. Each angle is one full turn and wraps: dragged past 180° it comes back in at −180°. Each has a rate
beside it that keeps it turning. The number is always what was set; the turn a rate has added is shown beside
it, and double-clicking the angle clears both.
