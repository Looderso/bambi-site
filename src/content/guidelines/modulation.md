---
title: modulation
summary: "Sources, targets and cells: one matrix, one contract, the same in every plugin."
group: design
order: 22
---

A cell's contribution is **source × the source's amount × the cell's depth**, and the global amount scales
everything. Contributions to one target add up, then clamp to the target's range. That one sentence is the
whole matrix; everything below is what each part promises.

## sources

| kind | what it is | range |
|---|---|---|
| **feature** | a measurement of the input; see [features](/contribute/features) | 0 to 1 |
| **LFO** | a wave in time, free or synced | −1 to 1, reshaped by its polarity |
| **envelope** | a shape set off by a MIDI note or by a feature crossing a threshold | 0 to 1, reshaped by its polarity |
| **region** | in a source plugin: how far the source is inside the plugin's region | exactly 0 to 1 |

Every source is normalised where it enters, so a depth of 1 means the same in every cell: this source at full
deflection covers the target's full span.

## polarity

**A measurement is unipolar; signed behaviour is a routing choice.** A feature answers "how much": it has a
floor and a ceiling and no natural middle, and inventing one would be wrong on half of all material. So
features stay 0 to 1, and a generator's `polarity` decides where it rests: at 0 it pushes one way from zero, at
1 it swings both ways. The ceiling stays at 1 whatever polarity is, so a source never leaves −1 to 1.

## targets

| kind | means | examples |
|---|---|---|
| **rate** | how fast, and which way; integrated | a speed, a turn rate |
| **direct** | where, or how much | an angle, a width, a level |

A rate target accumulates, so a base speed plus modulation gives constant motion, motion that follows the
music, or any mixture, each with its own sign. A direct target is smoothed so a fast source cannot jump it;
an angle is limited in how fast it may turn, and a value that is one turn is smoothed the short way round.

A target owns its **base value**, the parameter itself; a bias never competes for a cell.

Not every parameter can be a target: its effect must be recomputed on the audio thread in bounded work. See
[the audio thread](/contribute/the-audio-thread).

## the clock is not a source

The position along a path is an integrator, not a modulation source. Its rate is a target (`speed`); the clock
itself never passes through the matrix. Constant motion is a non-zero speed, never a cell.

## determinism

Every source kind says why a render repeats; see [the audio thread](/contribute/the-audio-thread).

## the interface

- **The matrix is always on screen**, beside the parameters, never behind a tab.
- **Clicking a value creates its row**, provisional until a cell in it has depth. Clicking another replaces it.
- **Targets are rows, sources are columns.** Targets are the open set; sources are bounded.
- **A column shows what its source is sending** before any depth is set.
- **Clicking a source's name opens its page** in the panel, as a temporary tab.
- **A target's base and its modulation are drawn together**: the value, the reach of its modulation, and a mark
  where the engine has it now.
