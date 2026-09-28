---
title: the shared system
summary: "What every plugin shares, and the two things each one owns."
group: design
order: 20
---

bambi is several plugins built as one program. A slider, a matrix and an undo stack are written once and used
by every plugin; a plugin that redrew them would be three codebases wearing a family name. The boundary between
shared and owned is not what looks similar, but **what would have to change in two places if it changed at
all.**

## what each plugin owns

Exactly two things: **its engine** and **its parameter set**.

| plugin | takes | gives | engine |
|---|---|---|---|
| encoder | a mono or stereo track | an ambisonic field | places a source on the sphere along a path, moved by the input's own features |
| echo | an ambisonic field | an ambisonic field | four loops fed by one send region, each turned, slid and blurred a little further every pass |
| reverb | an ambisonic field | an ambisonic field | one room: early reflections read from the direction each part of the field arrives from, and a tail |

## what is shared

**The core.** Spherical harmonics, trajectories, features, modulation, regions, state, undo, parameters, the
link bus and the scene's geometry. Every plugin's musical behaviour is here, tested without a host.

**The infrastructure.**

- **Undo and redo**, over the whole document, in the header of every window.
- **State and parameters**: each plugin has its own key list, built with one shared pattern, and blocks that
  every plugin has are stamped from one definition. See [parameters and state](/contribute/parameters-and-state).
- **The link**: one bus, one session per project, every kind of instance on it. Definitions travel; values
  that drive audio do not.
- **Regions**: the concept, the code and the parameter layout. A region itself belongs to one plugin. See
  [regions](/contribute/regions).
- **Ducking**, which is a row in the shared matrix and not a module. See
  [detection and ducking](/contribute/detection-and-ducking).
- **Presets**: one browser and one file format. See [presets](/contribute/presets).

**The window.** One component library, with one file for the look. The layout is the same in every plugin:
the scene top left, the matrix under it, the plugin's tabs on the right, the levels at the far right. The
header, the settings page, the scene, the probe and the region editor are each one component. See
[the look](/contribute/the-look).

**The modulation matrix.** The component and the workflow are shared; the targets each plugin offers are its
own. The generators, three LFOs and three envelopes, are in every plugin. See
[modulation](/contribute/modulation).

## repeating patterns are one component

If the same interaction appears in two places, it is one component or it is a defect. The choice between free
and synced timing appears in the LFOs, in Echo's tap period and in its offset: it is one control, drawn one way,
with one behaviour. A new plugin that needs something close to an existing component extends that component.

## chaining instead of modules

The plugins do not contain each other. An echo of a room is a Reverb followed by an Echo on the same track;
a hole in the field, a spotlight or a tremolo by direction is a region, applied wherever it is wanted. A dry
path is the host's. Keeping each plugin to one engine is what keeps each one small enough to understand.
