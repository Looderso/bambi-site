---
name: reverb
summary: "One room around the whole field, reflections and tail."
colour: "#967bb2"
order: 3
---

Reverb puts an ambisonic field in a room: early reflections from the room's walls, read from the direction
each part of the field arrives from, and a diffuse tail after them. Whatever comes in, whether encoded sources,
a recording or a whole mix, keeps its directions in the room.

Its window is the one every bambi plugin has, described in the [tutorial](/tutorial). What is Reverb's
own is its three tabs.

## room

A row of rooms to start from. Choosing one sets the numbers under it, which you can then change freely:

- `size`, in metres, sets when the reflections arrive and how dense they are;
- `decay` is how long the room rings;
- `tone` is how much faster the highs die than the lows;
- `roughness` is how much the walls scatter: smooth walls give clear mirror reflections;
- `distance` is how far away the sound is assumed to be;
- `pre-delay` adds time before the room answers;
- `low cut` and `high cut` shape what goes into the room.

Double-click a room to bring its numbers back.

## send and return

Two regions: which part of the field goes into the room, and where the room comes back. See
[regions](/tutorial#regions).

## what it builds on

The image method for the reflections, Eyring's reverberation time, and feedback delay networks for the tail,
all on the [foundations](/foundations) page.
