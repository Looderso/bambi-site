/*  A binary STL from a mesh: an 80-byte header, the triangle count, and fifty bytes a triangle. */
import type { Mesh } from 'manifold-3d/manifold';

export function binaryStl(mesh: Mesh, header: string): ArrayBuffer {
  const tris = mesh.triVerts.length / 3;
  const buf = new ArrayBuffer(84 + tris * 50);
  const view = new DataView(buf);
  const text = new TextEncoder().encode(header.slice(0, 80));
  new Uint8Array(buf, 0, 80).set(text);
  view.setUint32(80, tris, true);
  const p = mesh.vertProperties;
  const n = mesh.numProp;
  let o = 84;
  for (let t = 0; t < tris; ++t) {
    const [a, b, c] = [0, 1, 2].map((k) => mesh.triVerts[3 * t + k] * n);
    const ux = p[b] - p[a], uy = p[b + 1] - p[a + 1], uz = p[b + 2] - p[a + 2];
    const vx = p[c] - p[a], vy = p[c + 1] - p[a + 1], vz = p[c + 2] - p[a + 2];
    let nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx;
    const l = Math.hypot(nx, ny, nz) || 1;
    nx /= l; ny /= l; nz /= l;
    for (const value of [nx, ny, nz, p[a], p[a + 1], p[a + 2], p[b], p[b + 1], p[b + 2], p[c], p[c + 1], p[c + 2]]) {
      view.setFloat32(o, value, true);
      o += 4;
    }
    view.setUint16(o, 0, true);
    o += 2;
  }
  return buf;
}
