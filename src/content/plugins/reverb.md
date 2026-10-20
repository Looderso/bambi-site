---
name: reverb
summary: "An ambisonic room reverb: early reflections from where the walls are, and a late tail."
colour: "#967bb2"
order: 3
parts:
  - shot: room
    crop: [625, 82, 345, 195]
    label: room
    title: room presets
    text: "Six rooms from ambience to cathedral. Choosing one sets the values below; double-click it to reset them."
    points:
      - "<b>size</b> · when the early reflections arrive, and how dense they are"
      - "<b>decay</b> · the reverb time"
      - "<b>tone</b> · how much faster the highs decay"
      - "<b>roughness</b> · how diffuse the walls are"
  - shot: room
    crop: [625, 285, 345, 170]
    label: room · distance and input
    title: distance, pre-delay, input filter
    text: "Three more room settings."
    points:
      - "<b>distance</b> · how far away the source sounds"
      - "<b>pre-delay</b> · extra delay before the tail"
      - "<b>input</b> · low-cut and high-cut on the reverb input"
  - shot: send
    crop: [620, 45, 350, 390]
    label: send and return
    title: which directions go in, and where the reverb comes back
    text: "Two regions: the directions that feed the reverb, and where the reverb returns. Each can be all directions, a spot, a band, sectors, dots or clouds."
  - shot: send
    crop: [0, 44, 618, 301]
    label: the scene
    title: where each reflection comes from
    text: "Point the probe at a direction, and the 3D view marks each early reflection a source there would get: where it arrives from, and how loud. The diffuse tail has no direction, so it is not drawn."
---

The image method for the reflections, Eyring's reverberation time, and feedback delay networks for the tail,
all on the [foundations](/research/foundations) page.
