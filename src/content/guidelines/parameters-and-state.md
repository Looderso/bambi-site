---
title: parameters and state
summary: "Keys are forever: append, never rename, never remove. Everything else is read by name."
group: working
order: 8
---

A host saves automation and sessions by a parameter's key. A key that changes breaks every project that used
it. So each plugin's parameter list follows three rules, written at its top:

- **never rename a key;**
- **never remove one;**
- **append new parameters at the end.**

## one list, everything in it

Each plugin's parameters are one table: group, key, display name, unit, type, range, default and choices, one
row per parameter. It is the only place a range or a default is written; the engine, the window and the host
all read it from there. Blocks every plugin shares — a region slot, the generators, the rates switch, the
detectors' release — are stamped from one shared definition, so they have the same keys, names and ranges in
every plugin.

Keys are named by position (`region1`, `lfo2`) and display names by role (`send size`), so a slot's key does
not change when its role is named differently.

## what is a parameter and what is state

| a parameter, when | state, when |
|---|---|
| a host should automate it | it is chosen once and changes what a thing *is*: a region's kind, a trajectory's nodes |
| it moves smoothly and may be modulated | it cannot be a number: a list, a name, a set of weights |

How the window is looked at — the camera, the open tab, the selected instance — is neither, and is never
saved.

## reading state

State is read **by name**. A missing key takes its default, an unknown one is ignored, and a value that is not
valid loads as something that can be evaluated. A document made today opens after a parameter is added
tomorrow: the format grows by name.

## what a preset holds

A preset is the state without what makes an instance *this* instance: its identity, its name, and which input
it is plugged into. See [presets](/contribute/presets).
