---
title: regions
summary: "Where on the sphere something happens: a set of weights and an orientation, owned by one plugin."
group: design
order: 24
---

A region says **where** on the sphere something happens: which part of the field an echo hears, where a room
comes back, where a source slows down.

## what a region is

**A set of weights on the spherical harmonics, plus an orientation.** The weights describe a gain by direction,
from 1 where sound passes to 0 where it does not, with a fade between. The orientation is yaw, pitch and roll,
the same rotation a trajectory's placement uses.

Applied to a field, a region is a gain matrix on the ambisonic channels. **Inside** is that matrix, and
**outside** is exactly the rest. Which side a use lets through, and how much, belong to the use and not to the
region: a region says where, its use says what.

## the kinds

| kind | its settings |
|---|---|
| `everywhere` | none: the whole sphere |
| `spot` | size |
| `band` | band elevation, thickness |
| `sectors` | a count, fill |
| `dots` | a count (the corners of a regular solid), dot size |
| `clouds` | coverage, contrast, detail, evolve, and a seed |
| `custom` | the weights themselves, and a gain per order |

Every kind with an edge has a `softness`: how wide the edge fades, in degrees. Clouds and custom have none. Every kind sits the way
it is naturally used at zero orientation: a spot faces front, a band is the horizon, four dots are the corners
of a tetrahedron.

## linear, and honest about it

A region is exactly its weights, with nothing clipped after them. Clipping would itself create new harmonics.
The cost of being linear is ringing: at a sharp edge the gain overshoots a little above 1 and below 0. Softness
and a higher order reduce it. The finest edge an order can draw is roughly 180° / (N + 1), 45° at third order.

In the encoder a region is evaluated directly at the source's direction, with no projection, so there it is
exact: no ringing, no order ceiling, and always between 0 and 1.

## where a region acts

| plugin | regions |
|---|---|
| encoder | one, as a modulation source: its value at the source's direction |
| echo | one: the send, which part of the field the taps hear |
| reverb | two: the send, what enters the room, and the return, where the room comes back |

A **send** is a region on the way in; a **return** is one on the way out. There is no routing between several
sends and returns: once signals sum inside an engine, a send can no longer be traced to a return, and a
routing matrix would promise what it cannot do.

## a region is a plugin's own

Each region is a **fixed slot** with host parameters, the same keys, names and ranges in every plugin. It is
automated by the host and moved by the matrix. **No instance's audio depends on another instance's region.**

The same region in two plugins is made by copying, not by sharing: a copied automation lane, or **copy and
paste** through the clipboard. A paste brings the region's definition and the rows from LFOs set to restart
that drive it; it leaves the side and the amount, which are the use's. Nothing follows afterwards. Other
instances' regions are drawn in the scene, dotted and grey, and nothing drawn reaches the audio.

## what moves

Every continuous setting of a region is a host parameter and a matrix target: the three angles, their three
rates, and each kind's settings. The kind itself, the counts, the clouds' seed and custom weights are chosen
once. Host automation follows the piece ("at bar 64 the send narrows"); the matrix follows the content (a
region that opens with `level`).

A region's turn follows the same `rates continue` switch as everything else that turns: held while stopped and
restarted on play, unless the switch says otherwise.
