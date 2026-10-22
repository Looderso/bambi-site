---
name: decoder
summary: "An ambisonic decoder for loudspeakers and binaural headphones, with head tracking."
colour: "#5e8bae"
order: 4
parts:
  - shot: headphones
    crop: [262, 4, 285, 38]
    label: outputs
    title: headphones, speakers, or both
    text: "The outputs sit in the header: tick a box to turn one on, click its name to open its settings. Both can play at once, on their own channels."
  - shot: headphones
    crop: [622, 45, 350, 165]
    label: headphones
    title: personalised binaural
    text: "An HRTF model learned from measured heads, fitted to you with two sliders."
    points:
      - "<b>head</b> · head size"
      - "<b>ears</b> · where the ear's spectral notches sit"
      - "<b>ku100 · sofa file</b> · a measured HRTF instead"
  - shot: headphones
    crop: [622, 225, 350, 165]
    label: headphones · channels and options
    title: channels and a layout on headphones
    text: "The output channel pair, and through the layout: the speakers page's loudspeaker layout played virtually on the headphones."
  - shot: speakers
    crop: [622, 45, 350, 340]
    label: speakers · layout
    title: loudspeaker layouts
    text: "The speakers page opens on three sub-tabs: layout, decoding and fill. On layout, where the loudspeaker layout comes from, and the channels it plays on."
    points:
      - "<b>itu</b> · ten layouts built in"
      - "<b>file</b> · an AllRADecoder or AmbDec layout, or a decoder as SOFA filters"
      - "<b>typed</b> · loudspeakers typed in a table"
  - shot: decoding
    crop: [622, 45, 350, 145]
    label: speakers · decoding
    title: how the layout is decoded
    text: "Who listens, and how the loudspeakers are matched."
    points:
      - "<b>one listener · audience</b> · optimised for the sweet spot, or for a wider audience"
      - "<b>distance compensation</b> · each loudspeaker's gain and delay matched to the farthest"
      - "<b>fold · slice</b> · for a pair: the whole sound scene on it, or only what the listener faces"
  - shot: fill
    crop: [620, 42, 350, 500]
    label: speakers · fill
    title: filling what the layout leaves out
    text: "Directions a layout does not cover, such as above a 7.1 ring, play binaurally on the same loudspeakers through crosstalk cancellation, for one listener in the sweet spot. What the layout covers plays as before, at the same level."
    points:
      - "<b>fill the gaps binaurally</b> · on or off, with the channel separation it reaches"
      - "<b>crossfade</b> · how far from the layout the fill begins, and how wide it fades in"
      - "<b>crosstalk cancellation</b> · how hard it cancels, and up to which frequency"
  - shot: loudspeakers
    crop: [622, 45, 350, 410]
    label: loudspeakers
    title: loudspeaker list
    text: "Direction, distance, gain and delay for each loudspeaker, a test button for each, and a button to add one on the next free channel."
  - shot: headphones
    crop: [0, 352, 612, 228]
    label: orientation
    title: head tracking
    text: "In place of the modulation matrix: head tracking from OSC, AirPods or a phone (AirPods and phone via a helper app on macOS). Yaw, pitch and roll rotate the scene by hand, each with a rate; a double-click resets an angle and what its rate has added."
    points:
      - "<b>recentre</b> · sets the direction you face as the front"
      - "<b>setup…</b> · the tracker's own settings"
      - "<b>flip</b> · inverts the tracker on that axis"
  - shot: tracking
    crop: [622, 45, 350, 270]
    label: orientation · setup
    title: the tracker's settings
    text: "The tracker's own page, beside the output's: for OSC its port and message format, for AirPods and a phone their connection."
    points:
      - "<b>tracks the head</b> · compensates your head movement, so the sound stays put in the room while you turn"
      - "<b>rotates the scene</b> · one more rotation of the sound scene, for every output: a performer turning the mix"
  - shot: speakers
    crop: [0, 44, 618, 301]
    label: the scene
    title: the layout in the 3D view
    text: "The sources, the loudspeakers and the triangulation between them, on the sphere and the flat map."
---

This page is being written.
