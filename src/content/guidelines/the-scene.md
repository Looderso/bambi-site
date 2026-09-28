---
title: the scene
summary: "One component draws the sphere in every plugin; orange is what came in, blue is what was added."
group: design
order: 25
---

## one component, several projections

The scene is one component. A projection is a pair of functions, from a direction to a point on the screen and
back. Drawing, hit-testing, dragging and hover are written once against that pair, so a new view costs about
fifteen lines.

| view | what it is | editable |
|---|---|---|
| globe | the sphere seen from outside, turnable | yes |
| equirect | azimuth across, elevation up, flat | yes, and the one place elevation is set directly |

The graticule, paths and regions live in world space and are drawn through whichever projection, so no view
has a seam to special-case.

## interaction

- **A drag and a click are told apart by movement**, 4 pixels of slop, never by where the press was.
- **A view that turns keeps dragging for the camera.** A flat view has no camera, so a press can place and
  drag in one gesture. The difference follows from the camera; forcing the two to match makes both worse.
- **Nothing is dragged that is not free to move.** An encoder's source is on its path, so dragging it turns the
  view instead.
- **A held handle is re-applied every frame**, not only when the pointer moves, so a region turning under a
  rate does not slip out from under a still pointer.

## the colours

| | what it means |
|---|---|
| **orange** | what came into the plugin |
| **blue** | what this plugin added |

It reads the same in every plugin. In the encoder, orange is the source's position and blue the field it
encodes; in an effect, orange is the incoming field's energy and blue what the effect adds. The two are never
mixed: a point of the picture is one or the other.

These are roles in the theme, separate from the controls' colours. Changing one never moves the other.

## the energy picture

Every plugin can show **energy by direction**, drawn through the same projections as everything else. It is
the one thing in a window that costs, so it is **off when a window opens**, and while it is off the audio thread
gathers nothing. The audio thread hands over a small per-block summary of the field and never draws.

A window can show another instance's energy: it asks, and that instance gathers only while someone is asking.

## regions in the scene

A region is drawn **in ink**, so colour stays with what came in and what was added: its edge at the half-way
contour, and a light wash where it fades, under the energy. While its tab is open it shows handles, and the
energy dims to half so the wash can be seen. Another instance's region is a dotted grey edge. `regions always`
decides whether every region shows or only the one being edited.

## the probe

**Point at a direction, and the plugin shows what it would do to a sound from there.** One component; each
plugin supplies the answer. Echo draws every tap's repeats as they travel; Reverb draws the early reflections
where they arrive.

The probe is worked out from the parameters, never from audio, so it costs the audio thread nothing and
answers while nothing plays. The direction in is drawn in the incoming colour, the answer in the added colour.
It is an indicator of what would happen, not a measurement, and the measured energy is drawn beside it.

A field effect cannot know where its sources are; it only sees a field. What it can always answer is what it
would do to a direction it is pointed at. That is why effects have a probe where the encoder has a source.

## what the tests cannot see

Tests check what is computed, not what is drawn, and a defect in the drawing passes all of them. Look at the
picture: the picture tools draw every view to a PNG. See
[building and checking](/contribute/building).
