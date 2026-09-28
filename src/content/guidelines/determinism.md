---
title: determinism
summary: "An offline bounce equals realtime playback, in every sample, at every block size."
group: working
order: 5
---

A musician hears a mix, bounces it, and expects the file to be what they heard. bambi holds itself to that
exactly: **an offline render equals realtime playback in every sample**, and **a render is identical at every
block size from 1 to 1024**. Both are checked, by the golden renders and by the conformance suite.

## nothing depends on another instance

A host freezes tracks and bounces stems one at a time. A plugin that read another instance's live value would
render differently alone than in the mix. So the link between instances carries **definitions and edits,
never values that drive audio**: features are always computed from the plugin's own input, and a region
copied from another instance is a copy, not a connection.

## what each source owes

| source | deterministic because |
|---|---|
| a feature | it is a function of the audio |
| a synced LFO set to restart | it is a function of the song position, from any start point |
| a free LFO, sample-and-hold, and anything that turns at a rate | they restart on play, locate and loop, so a render agrees from the same start point |
| a random source | it is seeded |
| a region as a source | it reads the position the previous control step produced, on the fixed grid |

The one deliberate exception is the musician's choice: an LFO or the rates set to **continue** keep running through the
transport, and the window says that a bounce will then differ.

Whether a new source may exist at all is decided by this table. It is checked when the source is designed, not
when a bug is filed.

## within one build

Bit-identity is promised within one build on one platform. A different compiler, a different maths library or
another processor family moves results by a rounding step; a render made on another system is not required to
null against this one. The session file, by contrast, is identical everywhere: it is JSON, keyed by name.

So:

- `-ffast-math` and its relatives are refused;
- anything a golden depends on uses a hand-written random generator, never a standard-library distribution,
  whose sequence differs between libraries;
- a value that crosses a threshold, like a gate opening, is where a rounding step can become audible, so it is
  named when a change touches one.
