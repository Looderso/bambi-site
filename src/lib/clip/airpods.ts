/*  The AirPod side of the clip, per generation. The claw holds the stem from below the body, and its opening
    faces away from the headphones so the stem is pushed in from outside. Numbers are the stem as measured;
    the claw adds the print tolerance and the wall to them. */
export interface AirPodModel {
  id: string;
  name: string;
  stem: {
    width: number; // across the stem, side to side
    depth: number; // through the stem, front to back
    corner: number; // the radius its cross-section's corners round off with
    length: number; // from where it leaves the body to its tip
  };
  grip: {
    length: number; // how much of the stem the claw holds
    snap: number; // how far each side of the opening reaches past the stem's widest point
  };
  body: { radius: number }; // drawn in the preview only, to show which way up the AirPod goes
}

export const airpods: AirPodModel[] = [
  {
    id: 'pro-3',
    name: 'AirPods Pro 3',
    stem: { width: 5.6, depth: 6.4, corner: 2.4, length: 15 },
    grip: { length: 9, snap: 0.6 },
    body: { radius: 10 },
  },
];

/*  While the fit is tuned by printing, any stem or grip number can be overridden from the page's address --
    `?stem.width=5.8&grip.snap=0.7` -- and the values that fit go into the table above. */
export function withOverrides(model: AirPodModel, params: URLSearchParams): AirPodModel {
  const m = structuredClone(model);
  for (const [group, values] of [['stem', m.stem], ['grip', m.grip]] as const) {
    for (const key of Object.keys(values) as (keyof typeof values)[]) {
      const raw = params.get(`${group}.${key}`);
      const n = raw === null ? NaN : Number(raw);
      if (Number.isFinite(n) && n > 0) (values as Record<string, number>)[key] = n;
    }
  }
  return m;
}
