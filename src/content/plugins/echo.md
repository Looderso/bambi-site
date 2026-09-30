---
name: echo
summary: "Four echoes that turn through the field as they repeat."
colour: "#6f9a74"
order: 2
---

Echo repeats an ambisonic field. Each of its four taps is a loop: every pass comes back a little later, turned
further round an axis, and a little quieter and vaguer than the one before. A single sound walks round the
room; a whole mix rotates, gathers or spreads as it repeats.

Its window is the one every bambi plugin has, described in the [tutorial](/tutorial). What is Echo's own
is its two tabs.

## taps

The row at the top chooses a starting point for all four taps; double-click it to bring its values back. Under it, a strip shows the four taps on one time line, each with its on/off at the left and its
level at the right. Click a row to choose a tap. Its settings come in three groups:

- **timing**: how long a pass lasts, `free` in milliseconds or `sync`ed in sixteenths of the bar, and how late
  the tap starts. `swing` shuffles a tap against the others.
- **axis**: the direction the tap turns about.
- **every pass**: how far it turns (`spin`), how far it slides along its axis (`skew`), how much quieter it gets
  (`feedback`) and how much vaguer (`blur`), and a `low cut` and `high cut` applied every pass.

A spin of 180° is a ping-pong: twice round is back where it started.

## send

The region of the field the taps hear. By default it is `everywhere`; see [regions](/tutorial#regions).

## what it builds on

The slide along an axis is the warp of Pomberger and Zotter, on the [foundations](/foundations) page.
