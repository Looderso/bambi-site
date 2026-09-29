---
title: where code lives
summary: "The core holds everything musical; a plugin owns its engine and its parameters, and nothing else."
group: working
order: 4
---

The question to ask of any piece of code is **what would have to change in two places if it changed at all.**
That decides where it goes.

## the tree

```
core/         the engines, modulation, state and the link bus: C++20, no JUCE
host/         the shared plugin processor: buses, parameters, state handoff, the link
ui/           the shared interface: theme, controls, scene, matrix, header, preset browser
editor/       where ui meets host: the window every plugin runs
plugins/      encoder, echo, reverb: each plugin's processor, panel, check suite and picture tool
tools/        render, bench and inspection tools, and the repository's checks
tests/        golden scenarios and the conformance suite
third_party/  vendored dependencies, and JUCE as a submodule
```

## the core carries no JUCE

Spherical harmonics, trajectories, features, modulation, regions, the engines, state, undo, parameters, the link
bus and the scene's geometry are pure computation, in `core/`, tested without a host or a window. That is what
keeps the loop short, and what keeps the core portable: platform calls sit behind a few small seams, no public
header includes a platform header, and there are no intrinsics or architecture flags.

## the core is layered

| layer | holds |
|---|---|
| 0 | `math`, `io` |
| 1 | `dsp`, `path`, `region` |
| 2 | `patch`: parameters, state, undo |
| 3 | `mod`: the modulation matrix |
| 4 | `link`, `scene`, `encode`, `echo`, `reverb` |

A folder may use its own layer and anything below. `tools/check-layers.sh` fails on an include that runs
upward; when it does, move the type down rather than adding the include. Tests may reach anywhere.

## a plugin owns two things

**Its engine and its parameter set.** The window, the matrix, the scene, regions, presets, undo and the link are
calls into shared layers. A third thing on a plugin's list is the signal to ask whether it belongs in a shared
layer instead.

Each engine lives in the core, in its own library (`bambi-encode`, `bambi-echo`, `bambi-reverb`), and a plugin
links only its own.

## extract on second use

A component is made shared when a second plugin needs it, not before: with one use, the shape of what is shared
is a guess.

## the framework stays swappable

The shared layers name `bambi::ui` aliases for canvases, rectangles, colours and points rather than JUCE's
types, and the whole window is drawn by hand through the theme, with no JUCE sliders, buttons or look-and-feel.
