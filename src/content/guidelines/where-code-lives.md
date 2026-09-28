---
title: where code lives
summary: "The core holds everything musical; a plugin owns its engine and its parameters, and nothing else."
group: working
order: 3
---

The question to ask of any piece of code is not what it looks like, but **what would have to change in two
places if it changed at all**. That decides where it goes.

## the tree

```
core/         the engines, modulation, state and the link bus: C++20, no JUCE, tested in seconds
host/         the shared plugin processor: buses, parameters, state handoff, the link
ui/           the shared interface: theme, controls, scene, matrix, header, preset browser
editor/       where ui meets host: the window every plugin runs
plugins/      encoder, echo, reverb: each plugin's processor, panel, check suite and picture tool
tools/        render, bench and inspection tools, and the repository's checks
tests/        golden scenarios and the host-contract conformance suite
third_party/  vendored dependencies, and JUCE as a submodule
```

## the core carries no JUCE

Everything musical is pure computation over buffers: spherical harmonics, trajectories, features, modulation,
regions, the engines, state, undo, parameters, the link bus and the scene's geometry. It lives in `core/`, builds
without JUCE and is tested without a host, a window or a plugin build. This is what makes the loop short, and
it is also what keeps the core portable: a port to another platform is a question about a handful of files,
not about the whole tree.

## the core is layered

The core is several libraries, and nothing includes upward:

| layer | holds |
|---|---|
| 0 | `math`, `io`: vectors, spherical harmonics, WAV |
| 1 | `dsp`, `path`, `region`: the FFT and features, trajectories, regions |
| 2 | `patch`: parameters, state, undo, identity |
| 3 | `mod`: the modulation matrix |
| 4 | `link`, `scene`, `encode`, `echo`, `reverb`: the bus, the scene's geometry, the engines |

A folder may use its own layer and anything below it. `tools/check-layers.sh` fails on an include that runs
upward. When it fails, move the type down; do not add the include. Tests are exempt: a test may reach anywhere.

## a plugin owns two things

**Its engine and its parameter set.** Everything else — the window, the matrix, the scene, regions, presets,
undo, the link — is a call into a shared layer. If a third thing appears on a plugin's list, that is the signal
to ask whether it belongs in a shared layer instead.

Owning an engine does not mean housing it. Each engine lives in the core, in its own folder and library
(`bambi-encode`, `bambi-echo`, `bambi-reverb`), where it can be tested in seconds. Ownership is expressed by
the build: the encoder links its own engine and never links the reverb's.

## extract on second use

A shared component is extracted when a second plugin needs it, not before: with one use, the shape of what is
shared is a guess. With three plugins there is a second use for almost everything, and the shared layers are
where new work starts.

## the framework stays swappable

The shared UI and host layers are written against `bambi::ui` aliases for canvases, rectangles, colours and
points, rather than naming JUCE's types directly. The whole window is drawn by hand through the theme and a
few drawing helpers, with no JUCE sliders, buttons or look-and-feel. A change of framework would then be an
edit to two libraries rather than a rewrite.

## platform code

- A platform API enters the core only behind a seam that already exists: shared memory, the cross-process
  clock and segment names each have one.
- No filesystem location is written inline; it goes through a call that knows where such files live.
- Compiler flags belong in a per-compiler function, not a literal list another compiler would ignore.
