---
title: measuring
summary: "Every number about cost comes from a run, in Release, as a share of one core."
group: working
order: 7
---

**Measure, do not assert**, and measure in Release. An unoptimised build does not just run slower; it runs
slower by different amounts in different code, so it ranks the parts wrongly. A library that is several times
faster than an alternative in Release can look several times slower in Debug.

## how to report a cost

As **a share of one core at 128 samples and 48 kHz**, which is 2.667 ms. Never a speedup without the absolute
cost beside it: "twice as fast" at 0.01 % of a core is not worth any clarity.

If you did not run it, say "estimated", and say from what.

## the tools

- `bambi-bench` times the core, headless.
- `bambi-plugin-bench` times a plugin's own code without a host, and separates the audio thread from a window
  redrawing, which a host's CPU meter cannot.
- Every window shows its instance's share of a core in the footer.

## what to look for first

1. **Cost that grows with the wrong thing.** A path is drawn, hit-tested and edited from one fixed table of
   1,024 points, so a frame costs the same whether the path has three nodes or twenty. That shape of fix beats
   any constant factor.
2. **Work done per sample that could be done per control step.** Per-order gains, region matrices and cap
   weights change at control rate.
3. **Compute nothing that nothing uses.** A feature no cell routes to is not computed.

## what not to do

- **No hand-written SIMD, no intrinsics** in the core. The compiler already vectorises plain loops over
  contiguous arrays, and the encode is bound by memory, not arithmetic: switching vectorisation off entirely
  changes its cost by less than half a percent. Hand SIMD needs a measurement that says otherwise.
- **No `-march`, `-ffast-math` or `-Ofast`.** The tree is `-O3 -DNDEBUG` and nothing else.
- **Do not trade clarity for a fraction of a percent.** An encoder instance costs well under a tenth of a
  percent of a core. The field effects are where the real cost is; spend attention there.
