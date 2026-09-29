---
name: encoder
summary: "A source that travels a path on the sphere, moved by what it plays."
colour: "#5e8bae"
order: 1
---

The encoder places a mono or stereo track in the ambisonic field and moves it along a path you draw on the
sphere. How fast it travels can follow the input: silence parks the source, loud material moves it. It is the
first plugin on a track: it takes one or two channels in and gives an ambisonic field out.

Its window is the one every bambi plugin has, described in the [tutorial](/tutorial). What is the
encoder's own is its three tabs.

## trajectory

The path's shape. The row at the top chooses a kind: `orbit`, `lissajous`, `wave`, `arc`, `spiral`, or
`custom`. Under it are that kind's own settings, and each can be automated and modulated, so a path can
breathe with the music.

`convert to custom` turns the path into nodes you edit on the sphere:

- **drag a node** to move it, and its handles to bend the curve; **alt-drag** a handle to make a corner;
- **click the curve** to add a node there;
- **shift-click a node** to delete it.

The kind you converted from is kept, so you can go back to it.

## transform

Where the path sits and how it turns: `yaw`, `pitch` and `roll`, each beside a rate that keeps it turning,
and `extent`. At 1 the path is as drawn, at 0 it closes onto its own centre, and at 2 it opens out through the
far side.

## source

- **The input**: `sum` puts one point on the path. `mid/side` puts the mid on the path and the side either
  side of it, `spread` apart. `stereo` puts left and right on the path, `offset` apart. `input trim` sets
  the level before the features hear it.
- **motion**: `speed` is how fast the source travels, and `displace` is where on the path it sits.
  `direction` and `mode` (`wrap`, `ping-pong` or `once`) say what happens at the ends.
- **render**: `width`, how far the source spreads over the sphere, and the `width range` modulation may move
  it in.

## three things to try

1. **The kick nudges on every hit.** Choose `arc`, click `displace`, click the cell under `attack`, and drag it
   up.
2. **The pad opens up when it rings.** Click `width`, click the cell under `tonal`, and drag.
3. **It drifts slowly, and faster when it is loud.** Set `speed` to a small value, then click `speed` and give
   it depth under `level`.

## what it builds on

The encoding follows the ambisonics literature on the [foundations](/foundations) page: the spherical
harmonics, ACN ordering and SN3D normalisation, and the max-rE weighting its width is drawn with.
