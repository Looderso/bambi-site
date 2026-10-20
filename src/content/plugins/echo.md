---
name: echo
summary: "An ambisonic delay with four taps that rotate around the listener as they repeat."
colour: "#7cb27b"
order: 2
parts:
  - shot: window
    crop: [625, 75, 340, 185]
    label: taps
    title: four delay taps
    text: "Presets for all four taps at once — even, ping-pong, spiral, cascade, single; double-click one to reset its values. Below, the four taps on a timeline: click a row to edit that tap."
  - shot: window
    crop: [620, 265, 348, 280]
    label: taps · timing
    title: delay time
    text: "In milliseconds, or synced to the tempo in sixteenth notes."
    points:
      - "<b>time · steps</b> · the delay time"
      - "<b>offset · offset steps</b> · when the tap starts"
      - "<b>swing</b> · shifts a synced tap off the grid"
  - shot: axis
    crop: [620, 265, 348, 120]
    label: taps · axis
    title: rotation axis
    text: "Each tap rotates around its own axis, set by azimuth and elevation. Pointing straight up, the tap circles the listener."
  - shot: every-pass
    crop: [620, 265, 348, 280]
    label: taps · every pass
    title: what changes with each repeat
    text: "Applied again on every repeat, so the echoes move, fade and blur."
    points:
      - "<b>spin</b> · rotation per repeat; 180° is a ping-pong"
      - "<b>skew</b> · how far each repeat slides along the axis"
      - "<b>feedback · blur</b> · how quickly the repeats fade, and how diffuse they get"
      - "<b>band</b> · low-cut and high-cut filters in the feedback path"
  - shot: regions
    crop: [620, 42, 348, 350]
    label: send
    title: which directions go into the delay
    text: "The send region picks the directions that feed the delay: all of them by default, or a spot, a band, sectors, dots or clouds."
  - shot: skew
    crop: [0, 44, 618, 301]
    label: the scene
    title: where each echo comes from
    text: "Point the probe at a direction, and the 3D view shows where each echo of a sound from there arrives, as dots along a spiral around the tap's axis, over the incoming signal's energy."
---

The slide along an axis is the warp of Pomberger and Zotter, on the [foundations](/research/foundations) page.
