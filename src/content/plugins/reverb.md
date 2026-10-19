---
name: reverb
summary: "One room around the whole field, reflections and tail."
colour: "#967bb2"
order: 3
intro: "its room, its send and return, and where the reflections land"
parts:
  - shot: room
    crop: [625, 82, 345, 195]
    label: room
    title: a room to start from
    text: "A row of rooms sets the numbers under it, which you can then change freely; double-click a room to bring its numbers back."
    points:
      - "<b>ambience · room · chamber · hall · large hall · cathedral</b>"
      - "<b>size</b> · in metres: when the reflections arrive and how dense they are"
      - "<b>decay</b> · how long the room rings"
      - "<b>tone</b> · how much faster the highs die than the lows"
      - "<b>roughness</b> · how much the walls scatter"
  - shot: room
    crop: [625, 285, 345, 170]
    label: room · distance and input
    title: how far, how late, what goes in
    text: "How far away the sound is taken to be, how much longer the tail waits after the reflections, and the band that goes into the room."
    points:
      - "<b>distance · pre-delay</b>"
      - "<b>input</b> · low cut · high cut"
  - shot: send
    crop: [620, 45, 350, 390]
    label: send and return
    title: which part goes in, and where it comes back
    text: "Two regions: the part of the field that goes into the room, and where the room comes back — everywhere, a spot, a band, sectors, dots or clouds."
  - shot: send
    crop: [0, 44, 618, 301]
    label: the scene
    title: every reflection where it arrives
    text: "Point the probe at a direction, and Reverb answers with a mark for each reflection a source there would get, where it arrives from and at its weight. What the walls scatter goes into the tail and has no direction to draw."
---

The image method for the reflections, Eyring's reverberation time, and feedback delay networks for the tail,
all on the [foundations](/research/foundations) page.
