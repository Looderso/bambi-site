---
title: the working rules
summary: "Seven rules every change is held to, whoever makes it."
group: working
order: 2
---

These are rules, not preferences. Each exists because breaking it has cost something real, and each has a
page of its own below where there is more to say.

## 1. avoid the build circle

Anything that can be decided without compiling a plugin is decided without compiling a plugin. The core
carries no JUCE, builds in about a second and runs its tests on every save. That short loop is the project's
central discipline: a question answered in the core is answered in seconds, the same question answered in a
host costs minutes and a restart. So the musical logic lives in the core, and the plugin is a thin layer over
it. See [where code lives](/bambi-site/contribute/where-code-lives).

## 2. prototype in the browser, port the findings

A question about feel, sound or interaction is settled in a small, self-contained HTML prototype before any C++
is written: it is fast, disposable and visible. What ports is the finding, the numbers and the behaviour. The
prototype's code does not.

## 3. design each thing once

The shared component is the reference. **A copy of a shared component is a defect.** If a plugin needs a
component to behave differently, the component grows an option, or the difference is argued and recorded.
The standing example is the choice between free timing and timing synced to the host: it appears in the LFOs,
in Echo's taps and in its offsets, and it is one control with one interaction, not three. See
[the shared system](/bambi-site/contribute/shared-system).

## 4. measure, do not assert

Every number about cost comes from a run, in a Release build. A Debug build gives an entirely wrong picture of
what costs what. Cost is reported as a share of one core at 128 samples and 48 kHz. See
[measuring](/bambi-site/contribute/measuring).

## 5. tests are mutation-checked

A test that still passes when the code under it is broken is not a test. Every test names the mistake it
catches, and it has been seen to fail against that mistake. See [tests](/bambi-site/contribute/tests).

## 6. nothing on the audio thread allocates, frees or locks

The audio thread computes and nothing else. State reaches it as a finished snapshot, adopted by pointer; what
it produces leaves the same way. See [the audio thread](/bambi-site/contribute/the-audio-thread).

## 7. a bounce matches what was heard

An offline render equals the realtime playback in every sample, at every block size. Nothing depends on another
instance's live value, because a host freezes and bounces tracks one at a time. See
[determinism](/bambi-site/contribute/determinism).

## and in the code itself

- **Comments say what the code does**: units, invariants, which thread, a reason a reader needs now. Never a
  history, a ticket, or who decided. Comment only what the code cannot say for itself. See
  [code style](/bambi-site/contribute/code-style).
- **One concept, one place.** A value's range and default live once, in the plugin's parameter list; a colour
  lives once, in the theme file. A second copy drifts.
- **Unused code is removed**, not kept for later.
