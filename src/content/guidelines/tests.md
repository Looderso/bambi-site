---
title: tests and checks
summary: "Logic is tested against its own mistakes; the window is looked at; the sound is heard in a host."
group: working
order: 7
---

## logic: mutation-checked

Every test has been run against a deliberately broken version of the code it guards, and failed. Break the code
the way a real mistake would — drop a sign, skip a reset, read the wrong index — watch the test fail, and say so
in the test:

```cpp
/*  Catches: the hold dropped (the turn advancing whatever the transport does). */
```

A reviewer reads the `Catches:` line first. Prefer round trips, invariants under a transformation, agreement with
a closed form, and identical output at every block size.

## the plugins: checks that click

Each plugin has a check suite that drives the real editor headless. It clicks where a control is drawn rather
than setting the state behind it, because "clicking does nothing" is the failure that would otherwise
pass.

## the window: looked at

Whether something is drawn in the right place is judged by looking at it. Draw it with the picture tools and put
the picture in the pull request. Where a drawing rests on a mapping — a direction to a pixel — test the mapping in
the core; do not build pixel tests.

## the sound: goldens and a host

The goldens render fixed scenarios to audio and control traces and compare them with what was recorded. Every
change says what it did to them; see [making a change](/contribute/making-a-change). What a golden cannot judge
is heard in a host, after a rebuild and a restart of the host.

## where they live

| | what | run by |
|---|---|---|
| `core/tests/` | unit tests, one file per module | `./build/bambi-tests` |
| `tests/golden/` | rendered scenarios | `tools/golden.sh` |
| `plugins/*/Check/` | each plugin's check suite and picture tool | `tools/verify.sh` |
| `tests/conformance/` | every installed plugin, both formats | `tools/conformance.sh` |

Test names say what they check. A concurrency test stops after a number of samples, not after a time. Test
scaffolding is shared: one fake transport serves every check.
