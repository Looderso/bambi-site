---
name: path encoder
summary: "An ambisonic encoder that moves a source along a path, driven by automation and by the audio itself."
colour: "#d4873a"
order: 1
parts:
  - shot: trajectory
    crop: [622, 45, 350, 330]
    label: trajectory
    title: path shapes
    text: "Five shapes — orbit, lissajous, wave, polygon and spiral — each with its own settings, all automatable and modulatable. Or draw your own: custom."
    points:
      - "<b>convert to custom</b> · turns the shape into points you can drag"
  - shot: transform
    crop: [622, 45, 350, 300]
    label: transform
    title: rotating and scaling the path
    text: "Yaw, pitch and roll, each with a rate for continuous rotation. Extent scales the path: 1 is as drawn, 0 shrinks it to its centre, 2 stretches it through the far side."
  - shot: source
    crop: [622, 80, 350, 175]
    label: source · input
    title: mono, mid/side or stereo
    text: "Sum encodes the input as one source on the path. Mid/side puts the mid on the path and the side on either side of it; stereo puts left and right on the path, offset from each other. Input trim sets the level before the audio analysis."
  - shot: source
    crop: [622, 265, 350, 170]
    label: source · motion
    title: movement
    text: "Speed sets how fast the source moves along the path, direction which way, and displace its position on the path. Mode sets what happens at the end of the path."
    points:
      - "<b>wrap</b> · back to the start"
      - "<b>ping-pong</b> · back the way it came"
      - "<b>once</b> · it stays at the end"
  - shot: source
    crop: [622, 435, 350, 85]
    label: source · render
    title: source width
    text: "How wide the source sounds, and the range modulation can move the width in."
  - shot: trajectory
    crop: [0, 44, 618, 301]
    label: the scene
    title: the path in the 3D view
    text: "The path and the source on it, on the sphere and the flat map. Every other encoder in the session is shown in grey."
---

## three things to try

1. **The kick nudges on every hit.** Choose `polygon`, click `displace`, click the cell under `attack`, and drag it
   up.
2. **The pad opens up when it rings.** Click `width`, click the cell under `tonal`, and drag.
3. **It drifts slowly, and faster when it is loud.** Set `speed` to a small value, then click `speed` and give
   it depth under `level`.

## what it builds on

The encoding follows the ambisonics literature on the [foundations](/research/foundations) page: the spherical
harmonics, ACN ordering and SN3D normalisation, and the max-rE weighting its width is drawn with.
