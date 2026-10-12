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
}

export const tutorials: Tutorial[] = [
  {
    id: 'the-window',
    title: 'the window',
    summary: 'The parts every bambi plugin shares, and the gestures each takes.',
    group: 'every plugin',
    kind: 'start here',
  },
];

/** The tutorials either side of one, in reading order. */
export function neighbours(id: string) {
  const i = tutorials.findIndex((t) => t.id === id);
  return { previous: tutorials[i - 1], next: tutorials[i + 1] };
}
