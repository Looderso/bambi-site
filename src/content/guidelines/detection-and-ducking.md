---
title: detection and ducking
summary: "Six features anyone can predict, measured locally, and ducking as one row of the matrix."
group: design
order: 23
---

## the features

A feature a user cannot predict is worse than none: they patch it, get something confusing, and blame the
plugin. So bambi offers only **interpretable** features:

| feature | answers | character |
|---|---|---|
| `level` | how loud | continuous |
| `attack` | how sharp the onsets are | impulsive |
| `tonal` | how sustained or pitched | continuous |
| `low`, `mid`, `high` | how much there is in each band | continuous |

`attack` and `tonal` pair well: in a struck note they come one after the other, strike then ring, so routed to
different targets they give "the hit does this, the sustain does that" with no envelope at all.

Measures that are informative but unpredictable — spectral centroid, crest factor, flatness as a control,
pitch, consonance — are not offered. They may be computed internally to build an interpretable feature; the rule
is about what is exposed.

## the contract

Every feature must:

1. **read 0 in silence** — silence must move nothing;
2. **declare whether it follows loudness** — only `level` does, and the bands weakly;
3. **declare its character** — impulsive features suit direct targets, continuous ones suit rates;
4. **be calibrated on real material**, not on test tones — a miscalibrated feature and a bad feature look the
   same downstream, so measure the raw value first;
5. **look ahead by nothing** — latency would break the feel of responding to what you hear, and impose delay
   compensation on plugins that otherwise need none.

## what a field effect hears

The encoder hears its own input. A field effect never sees a source, only the field, so its features read the
**energy of the whole field**, summed over every channel. The first channel alone is wrong: sounds in
antiphase cancel in it, and a field with no omnidirectional part has none. The whole field cannot cancel, and
for a single source it reads exactly what the first channel would, so the calibration carries over. The
spectral features take their shape from the first channel and their level from the field.

**Features are always computed locally.** No plugin reads another's detector: a bounce of one track alone
would then differ from the mix. A **sidechain** is the way to listen to something else: each plugin has an
optional aux input with its own six features on the matrix's `sidechain` tab.

## ducking is a row

Ducking is not a module and has no tab. It is `level`, the input's or the sidechain's, onto `wet`, with a
negative depth. `wet` always has a row, so there is nothing to add.

What makes it musical is `level`'s **release**, set on its own page: how long the detector takes to fall, and so
how long the effect takes to come back. The input and the sidechain each have one. It keeps falling into
digital silence, so a hard stop releases as gently as a fade.
