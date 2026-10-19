// The phone's orientation and its camera: the W3C DeviceOrientation frame, and where the back camera looks.
//
// World: east, north, up. Device: x right, y the top edge, z out of the screen; the back camera looks along -z,
// its picture's right is +x and its up is +y (the phone held upright). Headings are degrees clockwise from north.

export const rad = Math.PI / 180;

/** W3C DeviceOrientation: R = Rz(alpha) Rx(beta) Ry(gamma), device axes into east-north-up. */
export function deviceToEnu(a, b, g) {
  const ca = Math.cos(a * rad), sa = Math.sin(a * rad), cb = Math.cos(b * rad), sb = Math.sin(b * rad),
    cg = Math.cos(g * rad), sg = Math.sin(g * rad);
  return [
    [ca * cg - sa * sb * sg, -sa * cb, ca * sg + sa * sb * cg],
    [sa * cg + ca * sb * sg, ca * cb, sa * sg - ca * sb * cg],
    [-cb * sg, sb, cb * cg],
  ];
}

export const apply = (R, v) => [0, 1, 2].map((i) => R[i][0] * v[0] + R[i][1] * v[1] + R[i][2] * v[2]);

/** Heading and elevation, degrees, of an east-north-up direction of any length. */
export function anglesOf(d) {
  return { heading: Math.atan2(d[0], d[1]) / rad, elevation: Math.atan2(d[2], Math.hypot(d[0], d[1])) / rad };
}

/** Where the back camera points, as heading and elevation. */
export const cameraAngles = (R) => anglesOf(apply(R, [0, 0, -1]));

/** The fields of view of a picture of `w` by `h` pixels whose longer side spans `longFovDeg`, as the tangents of
 *  half of each. */
export function fovOf(w, h, longFovDeg) {
  const tLong = Math.tan((longFovDeg / 2) * rad);
  const tShort = (tLong * Math.min(w, h)) / Math.max(w, h);
  return w >= h ? { tanX: tLong, tanY: tShort } : { tanX: tShort, tanY: tLong };
}

/** An angle in degrees, brought into -180..180. */
export const wrap = (deg) => ((((deg + 180) % 360) + 360) % 360) - 180;
