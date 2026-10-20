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
    crop: [622, 220, 350, 175]
    label: headphones · channels and options
    title: channels and personalisation
    text: "The output channel pair, an optional virtual loudspeaker layout, and personalise: set the head sliders by comparing with a real loudspeaker."
  - shot: speakers
    crop: [622, 45, 350, 125]
    label: speakers
    title: loudspeaker layouts
    text: "Where the loudspeaker layout comes from."
    points:
      - "<b>itu</b> · ten layouts built in"
      - "<b>file</b> · an AllRADecoder or AmbDec layout, or a decoder as SOFA filters"
      - "<b>typed</b> · loudspeakers typed in a table"
  - shot: speakers
    crop: [622, 190, 350, 280]
    label: speakers · channels and options
    title: channels and listening area
    text: "The first output channel, and the channels in use."
    points:
      - "<b>one listener · audience</b> · optimised for the sweet spot, or for a wider audience"
      - "<b>distance compensation</b> · each loudspeaker's gain and delay matched to the farthest"
  - shot: loudspeakers
    crop: [622, 45, 350, 410]
    label: loudspeakers
    title: loudspeaker list
    text: "Direction, distance, gain and delay for each loudspeaker, a test button for each, and a button to add one on the next free channel."
  - shot: headphones
    crop: [0, 352, 612, 228]
    label: orientation
    title: head tracking
    text: "In place of the modulation matrix: head tracking from OSC, AirPods or a phone (AirPods and phone via a helper app on macOS). Yaw, pitch and roll rotate the scene by hand, each with a rate."
    points:
      - "<b>head · scene</b> · whether the tracker rotates the listener or the scene"
      - "<b>recentre</b> · sets the direction you face as the front"
      - "<b>static</b> · stops the yaw, pitch and roll rotation"
  - shot: speakers
    crop: [0, 44, 618, 301]
    label: the scene
    title: the layout in the 3D view
    text: "The sources, the loudspeakers and the triangulation between them, on the sphere and the flat map."
---

This page is being written.
