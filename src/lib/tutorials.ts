/*  Every tutorial, in reading order. A tutorial is a page in src/pages/tutorial/ named by its id; this list
    puts it on /tutorial, in its group, and gives it its previous and next. A tutorial for one plugin names
    that plugin's id, and wears its colour. */
export interface Tutorial {
  id: string;
  title: string;
  summary: string;
  group: 'every plugin' | 'one plugin or setup';
  kind: string; // the small label on its card
  plugin?: string;
  outline?: { id: string; title: string; text: string }[]; // its parts, until the text exists
}

export const tutorials: Tutorial[] = [
  {
    id: 'the-window',
    title: 'the window',
    summary: 'The parts every bambi plugin shares, and the gestures each takes.',
    group: 'every plugin',
    kind: 'start here',
  },
  { id: 'encoder', title: 'encoder', summary: 'Placing a sound, and moving it with what it plays.', group: 'one plugin or setup', kind: 'plugin', plugin: 'encoder' },
  {
    id: 'echo',
    title: 'echo',
    summary: 'Taps that turn through the field as they repeat.',
    group: 'one plugin or setup',
    kind: 'plugin',
    plugin: 'echo',
    outline: [
      { id: 'taps', title: 'taps', text: 'The row of starting points, the strip of four taps, and choosing one.' },
      { id: 'timing', title: 'taps · timing', text: 'Free or sync: time or steps, offset or offset steps, and swing.' },
      { id: 'axis', title: 'taps · axis', text: 'The direction a tap turns about.' },
      { id: 'every-pass', title: 'taps · every pass', text: 'Spin, skew, feedback and blur, and the band: low cut and high cut.' },
      { id: 'send', title: 'send', text: 'The region the taps hear.' },
      { id: 'scene', title: 'the scene', text: "Each tap's passes drawn where they land." },
    ],
  },
  { id: 'reverb', title: 'reverb', summary: 'A room around the field, and where in it each reflection lands.', group: 'one plugin or setup', kind: 'plugin', plugin: 'reverb' },
  { id: 'decoder', title: 'decoder', summary: 'The field out to loudspeakers or headphones.', group: 'one plugin or setup', kind: 'plugin', plugin: 'decoder' },
  { id: 'host', title: 'the host', summary: 'Setting up a set to play through bambi.', group: 'one plugin or setup', kind: 'setup' },
];

/** The tutorials either side of one, in reading order. */
export function neighbours(id: string) {
  const i = tutorials.findIndex((t) => t.id === id);
  return { previous: tutorials[i - 1], next: tutorials[i + 1] };
}
