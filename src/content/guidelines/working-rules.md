---
title: the working rules
summary: "The rules every change is held to, whoever makes it."
group: working
order: 2
---

These are rules, not preferences. Most have a page of their own with the detail.

## 1. avoid the build circle

Anything that can be decided without compiling a plugin is decided without compiling a plugin. The musical
logic lives in the core, which carries no JUCE and runs its tests on every save; the plugin is a thin layer over
it. See [where code lives](/contribute/where-code-lives).

## 2. prototype first, port the findings

A question about feel, sound or interaction is settled in a small, self-contained browser prototype before any
C++ is written. What ports is the finding: the numbers and the behaviour, never the prototype's code. A
prototype settles sound and behaviour; how things look is settled by the built interface and the theme.

## 3. design each thing once

The shared component is the reference, and **a copy of it is a defect.** If a plugin needs different behaviour,
the component grows an option. No plugin is the reference for the others, not even the first one built: the
suite is uniform, and where two plugins genuinely differ, the component and the interaction stay the same and
only the labels change. See [the shared system](/contribute/shared-system).

## 4. measure, do not assert

A claim about cost comes from a run, in a Release build, reported as a share of one core at 128 samples and
48 kHz. A number that was not run is marked as an estimate, with what it was estimated from.

## 5. tests are mutation-checked

A test that still passes when the code under it is broken is not a test. See [tests and checks](/contribute/tests).

## 6. nothing on the audio thread allocates, frees or locks

And a bounce matches what was heard. See [the audio thread](/contribute/the-audio-thread).

## 7. discuss before building

A change to the design, to how something behaves for a musician, or to a plugin's parameter keys starts as an
issue, not as code. See [making a change](/contribute/making-a-change).
