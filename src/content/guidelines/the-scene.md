---
title: the scene
summary: "One component draws the sphere in every plugin; orange is what came in, blue is what was added."
group: design
order: 25
---

## one component, several projections

The scene is one component. Drawing, hit-testing, dragging and hover are written once against a projection, so a
new view is a new projection and nothing else.

| view | what it is | editable |
|---|---|---|
| globe | the sphere seen from outside, turnable | yes |
| equirect | azimuth across, elevation up, flat | yes, and the one place elevation is set directly |

The graticule, paths and regions live in world space and are drawn through whichever projection, so no view
has a seam to special-case.

## interaction

- **A drag and a click are told apart by movement**, never by where the press was.
- **A view that turns keeps dragging for the camera.** A flat view has no camera, so a press can place and
  drag in one gesture. The difference follows from the camera; forcing the two to match makes both worse.
- **Nothing is dragged that is not free to move.** A source that sits on its path is not dragged: dragging it turns the
  view instead.

## the colours

| | what it means |
|---|---|
| **orange** | what came into the plugin |
| **blue** | what this plugin added |

It reads the same in every plugin. In a source plugin, orange is the source's position and blue the field it
encodes; in a field effect, orange is the incoming field's energy and blue what the effect adds. The two are never
mixed: a point of the picture is one or the other.

These are roles in the theme, separate from the controls' colours. Changing one never moves the other.

## the energy picture

Every plugin can show **energy by direction**. It is **off when a window opens**, and while it is off the audio
thread gathers nothing; when it is on, the audio thread hands over a small summary of the field and never draws.

## regions in the scene

A region is drawn **in ink**, so colour stays with what came in and what was added: its edge at the half-way
contour, and a light wash where it fades, under the energy. While its tab is open it shows handles, and the
energy dims to half so the wash can be seen. Another instance's region is a dotted grey edge. `regions always`
decides whether every region shows or only the one being edited.

## the probe

**Point at a direction, and the plugin shows what it would do to a sound from there.** One component; each
plugin supplies the answer from its own engine.

The probe is worked out from the parameters, never from audio, so it costs the audio thread nothing and
answers while nothing plays. The direction in is drawn in the incoming colour, the answer in the added colour.
It is an indicator of what would happen, not a measurement, and the measured energy is drawn beside it.

A field effect cannot know where its sources are; it only sees a field. What it can always answer is what it
would do to a direction it is pointed at. That is why field effects have a probe where a source plugin has a source.
