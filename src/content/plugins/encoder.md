---
name: encoder
summary: "A source that travels a path on the sphere, moved by what it plays."
colour: "#d4873a"
order: 1
intro: "its path, how it turns, and how the track sits on it"
parts:
  - shot: trajectory
    crop: [622, 45, 350, 330]
    label: trajectory
    title: the path's shape
    text: "A row of kinds, and under it that kind's own settings, each of which can be automated and modulated, so a path can breathe with the music. Convert to custom turns the path into nodes you edit on the sphere."
    points:
      - "<b>orbit · lissajous · wave · arc · spiral · custom</b>"
      - "drag a node, or its handles; alt-drag a handle for a corner"
      - "click the curve to add a node; shift-click a node to delete it"
  - shot: transform
    crop: [622, 45, 350, 300]
    label: transform
    title: where the path sits and how it turns
    text: "Yaw, pitch and roll, each beside a rate that keeps it turning, and extent: at 1 the path is as drawn, at 0 it closes onto its own centre, at 2 it opens out through the far side."
  - shot: source
    crop: [622, 80, 350, 175]
    label: source · input
    title: one point, or two
    text: "Sum puts one point on the path. Mid/side puts the mid on it and the side either side of it, spread apart; stereo puts left and right on it, offset apart. Input trim sets the level before the features hear it."
    points:
      - "<b>sum · mid/side · stereo</b>"
  - shot: source
    crop: [622, 265, 350, 170]
    label: source · motion
    title: how it travels
    text: "Speed is how fast the source travels, and displace is where on the path it sits. Direction and mode say what happens at the ends."
    points:
      - "<b>wrap · ping-pong · once</b>"
  - shot: source
    crop: [622, 435, 350, 85]
    label: source · render
    title: how wide it sounds
    text: "Width, how far the source spreads over the sphere, and the width range modulation may move it in."
  - shot: trajectory
    crop: [0, 44, 618, 301]
    label: the scene
    title: the path, and the source on it
    text: "The path is drawn in ink on the sphere and the map, with the source on it in the colour of what comes in; every other encoder in the session is drawn beside it in silver."
---

## three things to try

1. **The kick nudges on every hit.** Choose `arc`, click `displace`, click the cell under `attack`, and drag it
   up.
2. **The pad opens up when it rings.** Click `width`, click the cell under `tonal`, and drag.
3. **It drifts slowly, and faster when it is loud.** Set `speed` to a small value, then click `speed` and give
   it depth under `level`.

## what it builds on

The encoding follows the ambisonics literature on the [foundations](/research/foundations) page: the spherical
harmonics, ACN ordering and SN3D normalisation, and the max-rE weighting its width is drawn with.
