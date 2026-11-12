// Trade-wind currents: lanes of fast water between ports. Sail along one (either way) and the ship goes
// twice as fast. Light foam dashes stream along each lane; the sea chart shows them as dotted lines.
import * as THREE from 'three';
import { flat } from './stage.js';
import { PORTS, toWorld, toMap } from './map.js';

const LINKS = [['home', 'reef'], ['reef', 'storm'], ['storm', 'castaway'], ['castaway', 'frozen'], ['frozen', 'floe'], ['home', 'abyss'],
  ['abyss', 'floe']]; // the last one runs up the west side, from the Abyss to the Frozen North
const END = 40; // lanes start and stop this far out from each port
export const WIDTH = 7; // half the width of a lane
export const BOOST = 2; // how much faster you sail along one
const ALONG = 0.5; // how closely the ship must point along the lane (cosine) to ride it
const DASHES = 90, SHOW = 55; // foam dashes drawn, on the stretch of lane within this distance of the ship
const FLOW = 9; // how fast the dashes stream

// Each lane: from a to b in map coordinates, with its direction and length.
export const LANES = LINKS.map(([from, to]) => {
  const [ae, an] = PORTS[from].at, [be, bn] = PORTS[to].at, len = Math.hypot(be - ae, bn - an);
  const ue = (be - ae) / len, un = (bn - an) / len;
  return { a: [ae + ue * END, an + un * END], b: [be - ue * END, bn - un * END], ue, un, len: len - 2 * END };
});

// The lane at (e, n) on the map, and how far along it: { lane, along } or null.
export function laneAt(e, n) {
  for (const lane of LANES) {
    const de = e - lane.a[0], dn = n - lane.a[1], along = de * lane.ue + dn * lane.un;
    if (along < 0 || along > lane.len) continue;
    if (Math.abs(-de * lane.un + dn * lane.ue) < WIDTH) return { lane, along };
  }
  return null;
}
// How far (e, n) is from the nearest lane's middle line.
export function laneDistance(e, n) {
  let best = Infinity;
  for (const lane of LANES) {
    const de = e - lane.a[0], dn = n - lane.a[1], along = Math.max(0, Math.min(lane.len, de * lane.ue + dn * lane.un));
    best = Math.min(best, Math.hypot(e - lane.a[0] - lane.ue * along, n - lane.a[1] - lane.un * along));
  }
  return best;
}

export function createCurrents(scene) {
  const mesh = new THREE.InstancedMesh(new THREE.BoxGeometry(1.4, 0.02, 0.16), flat(0.75, 0xd8f6ff), DASHES);
  mesh.frustumCulled = false;
  scene.add(mesh);
  const m = new THREE.Matrix4(), q = new THREE.Quaternion(), pos = new THREE.Vector3(), one = new THREE.Vector3(1, 1, 1), up = new THREE.Vector3(0, 1, 0);
  // Each dash: a spot across the lane, a speed and a direction (half stream each way).
  const dash = Array.from({ length: DASHES }, (_, i) => ({ across: ((i * 37) % 13) / 6.5 - 1, phase: (i * 0.618) % 1, way: i % 2 ? 1 : -1 }));

  // The ship at world (x, z), heading `heading`: how much faster it sails (1, or BOOST on a lane it's following).
  function boost(x, z, heading) {
    const m0 = toMap(x, z), hit = laneAt(m0.e, m0.n);
    if (!hit) return 1;
    const dir = toMap(Math.cos(heading), Math.sin(heading)); // heading as a map direction
    return Math.abs(dir.e * hit.lane.ue + dir.n * hit.lane.un) > ALONG ? BOOST : 1;
  }

  // Foam streaming along whichever lane is near the ship.
  function update(x, z, t) {
    const me = toMap(x, z);
    let lane = null, at = 0, best = SHOW;
    for (const l of LANES) {
      const de = me.e - l.a[0], dn = me.n - l.a[1], along = Math.max(0, Math.min(l.len, de * l.ue + dn * l.un));
      const d = Math.hypot(de - l.ue * along, dn - l.un * along);
      if (d < best) { best = d; lane = l; at = along; }
    }
    mesh.visible = !!lane;
    if (!lane) return;
    const dirW = toWorld(lane.ue, lane.un), angle = Math.atan2(dirW.z, dirW.x);
    q.setFromAxisAngle(up, -angle);
    dash.forEach((d, i) => {
      const span = 2 * SHOW, u = (((d.phase * span + d.way * t * FLOW) % span) + span) % span; // 0..span, moving
      const along = Math.max(0, Math.min(lane.len, at - SHOW + u));
      const e = lane.a[0] + lane.ue * along - lane.un * d.across * WIDTH * 0.9;
      const n = lane.a[1] + lane.un * along + lane.ue * d.across * WIDTH * 0.9;
      const w = toWorld(e, n);
      pos.set(w.x, 0.03, w.z);
      mesh.setMatrixAt(i, m.compose(pos, q, one));
    });
    mesh.instanceMatrix.needsUpdate = true;
  }

  return { boost, update };
}
