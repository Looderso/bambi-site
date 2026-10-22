// A measurement microphone's calibration file, as the makers ship them and REW reads them: a line per frequency,
// "Hz dB" (a phase column after them is ignored), with comment lines and a header such as `"Sens Factor =..."`
// skipped. The dB say how far the microphone reads above the truth, so the truth is the reading less them.

/** The points of a calibration file's text, sorted by frequency: [[hz, db], ...]. Throws when it holds none. */
export function parseCalibration(text) {
  const points = [];
  for (const line of text.split(/\r?\n/)) {
    const t = line.trim();
    if (!t || /^[*#;"'a-z]/i.test(t)) continue; // comments, quoted headers, words
    const [hz, db] = t.split(/[\s,;]+/).map(Number);
    if (Number.isFinite(hz) && Number.isFinite(db) && hz > 0) points.push([hz, db]);
  }
  if (points.length < 2) throw new Error('no frequency and dB pairs in it');
  return points.sort((a, b) => a[0] - b[0]);
}

/** The correction at `hz`: linear in log frequency between the file's points, held flat beyond its ends. */
export function correction(points, hz) {
  if (!points) return 0;
  if (hz <= points[0][0]) return points[0][1];
  const last = points[points.length - 1];
  if (hz >= last[0]) return last[1];
  let i = 1;
  while (points[i][0] < hz) i++;
  const [f0, d0] = points[i - 1], [f1, d1] = points[i];
  return d0 + ((d1 - d0) * Math.log(hz / f0)) / Math.log(f1 / f0);
}
