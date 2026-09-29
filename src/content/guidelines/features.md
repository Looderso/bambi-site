---
title: features
summary: "What a feature must promise before it is offered: predictable, silent in silence, computed locally."
group: design
order: 23
---

A feature is a measurement of the input that the matrix can route. A musician patches it and expects to predict
what it does, so a feature is judged by whether it can be understood, not by how much it encodes.

## the set

| feature | answers | character |
|---|---|---|
| `level` | how loud | continuous |
| `attack` | how sharp the onsets are | impulsive |
| `tonal` | how sustained or pitched | continuous |
| `low`, `mid`, `high` | how much there is in each band | continuous |

Measures that are informative but hard to predict — spectral centroid, crest factor, flatness as a control,
pitch — are not offered. They may be computed inside a feature; the rule is about what is exposed.

## what a feature must promise

1. **It reads 0 in silence.** Silence must move nothing.
2. **It says whether it follows loudness.** Only `level` does; a second feature that tracks loudness is `level`
   again under another name.
3. **It says its character.** Impulsive features suit direct targets, continuous ones suit rates.
4. **It is calibrated on real material**, not on test tones. Measure the raw value before judging the normalised
   one: a miscalibrated feature and a bad feature look the same downstream.
5. **It looks ahead by nothing.** Latency would break the feel of responding to what you hear.

## where a feature listens

- **Always to the plugin's own input.** No plugin reads another's detector, so a track bounced alone sounds as
  it does in the mix.
- **A field effect listens to the whole field**, its energy summed over every channel, never to the first channel
  alone, which cancels on sounds in antiphase.
- **A sidechain** is how a plugin listens to something else: an optional aux input with its own set of features.

`level` has one setting beside its amount, its release: how quickly it falls when the sound stops. With it, a row
from `level` onto the wet level with a negative depth is a ducker, with no module of its own.
