// Pieces of the sea, built in code: rocks, coral heads, sandbars, drifting icebergs, shipwrecks, islands with trees,
// port towns, and places to find (pirate camps, sea forts, stranded sailors, bottles).
// Each builder adds its meshes to a chunk ({ group, hits, rings, sandbars }, see chunks.js) and records
// what ships bump into. Also the drifting foam dashes that make the water look like it is moving.
import * as THREE from 'three';
import { toon, flat } from './stage.js';

const ROCK = new THREE.IcosahedronGeometry(1, 0);
const RING = new THREE.RingGeometry(1, 1.45, 24).rotateX(-Math.PI / 2);
const SAND = new THREE.CylinderGeometry(0.9, 1, 0.6, 14);
const GRASS = new THREE.CylinderGeometry(0.62, 0.72, 0.4, 12);
const TRUNK = new THREE.CylinderGeometry(0.1, 0.17, 2.2, 6);
const LEAF = new THREE.SphereGeometry(1, 6, 4);
const CONE = new THREE.ConeGeometry(1, 1, 7);
const BRANCH = new THREE.CylinderGeometry(0.12, 0.2, 1, 6).translate(0, 0.5, 0);
const BUD = new THREE.SphereGeometry(0.22, 8, 6);
const SANDBAR = new THREE.CircleGeometry(1, 24).rotateX(-Math.PI / 2);
const BOX = new THREE.BoxGeometry(1, 1, 1);
const ROOF = new THREE.ConeGeometry(0.85, 0.7, 4).rotateY(Math.PI / 4);
const TOWER = new THREE.CylinderGeometry(0.55, 0.8, 1, 10);
const mats = new Map();
const mat = (c) => mats.get(c) ?? mats.set(c, toon(c)).get(c);
const CORAL = [0xff7a8a, 0xff9f5a, 0xc77dff, 0xffd166];
const trunkMat = mat(0x7a5230), leafMat = mat(0x2f9a4a), pineMat = mat(0x2e6b4f), plankMat = mat(0x9a6a3e);
const foamMat = flat(0.55), sandbarMat = flat(0.55, 0xf6e3b4), sandbarEdge = flat(0.35, 0xffffff);
const lampMat = new THREE.MeshBasicMaterial({ color: 0xfff1a8 });
const iceMat = mat(0xf4fbff), deepIceMat = mat(0xa9d8ea);

// Same numbers, same sea, every time.
export function seeded(i, j) {
  let a = (Math.imul(i, 374761393) ^ Math.imul(j, 668265263)) >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const pick = (list, rnd) => list[Math.floor(rnd() * list.length)];

// A ring of foam that breathes around something standing in the water.
function foamRing(c, x, z, r, rnd) {
  const ring = new THREE.Mesh(RING, foamMat);
  ring.position.set(x, 0.03, z);
  c.group.add(ring);
  c.rings.push({ ring, r, phase: rnd() * 6 });
}

// look: the region's look (map.js). Spires stand tall and thin.
export function rock(c, x, z, r, rnd, look) {
  const m = new THREE.Mesh(ROCK, mat(pick(look.rocks, rnd)));
  const tall = look.spires ? 1.6 + rnd() : 0.8;
  m.scale.set(r, r * tall, r);
  m.position.set(x, r * 0.25, z);
  m.rotation.y = rnd() * 6;
  c.group.add(m);
  foamRing(c, x, z, r * 1.05, rnd);
  c.hits.push({ x, z, r: r * 0.95, top: r * tall * 1.3, kind: 'rock' });
}

// A coral head: a low mound with bright branches and buds. Solid like a rock.
export function coral(c, x, z, r, rnd) {
  const g = new THREE.Group();
  const mound = new THREE.Mesh(ROCK, mat(pick(CORAL, rnd)));
  mound.scale.set(r, r * 0.45, r);
  g.add(mound);
  for (let n = 4 + Math.floor(rnd() * 3); n > 0; n--) {
    const branch = new THREE.Mesh(BRANCH, mat(pick(CORAL, rnd)));
    const a = rnd() * 6.28, d = rnd() * r * 0.5, h = 0.7 + rnd() * r * 0.6;
    branch.position.set(Math.cos(a) * d, r * 0.2, Math.sin(a) * d);
    branch.scale.set(1, h, 1);
    branch.rotation.set((rnd() - 0.5) * 0.9, 0, (rnd() - 0.5) * 0.9);
    const bud = new THREE.Mesh(BUD, branch.material);
    bud.position.y = 1;
    bud.scale.set(1, 1 / h, 1);
    branch.add(bud);
    g.add(branch);
  }
  g.position.set(x, 0, z);
  c.group.add(g);
  foamRing(c, x, z, r * 1.05, rnd);
  c.hits.push({ x, z, r: r * 0.95, top: r * 0.9 + 0.6, kind: 'rock' });
}

// An iceberg: solid like a rock, but it drifts slowly back and forth along a line.
// Returns it for chunks.js to move: { g, ring, hit, x0, z0, dx, dz, amp, phase, speed }.
export function berg(c, x, z, r, rnd) {
  const g = new THREE.Group();
  const base = new THREE.Mesh(ROCK, deepIceMat), top = new THREE.Mesh(ROCK, iceMat);
  base.scale.set(r * 1.15, r * 0.3, r);
  top.scale.set(r, r * 0.95, r * 0.85);
  top.position.y = r * 0.3;
  top.rotation.y = rnd() * 6;
  g.add(base, top);
  g.position.set(x, 0, z);
  const ring = new THREE.Mesh(RING, foamMat);
  ring.position.set(x, 0.03, z);
  c.group.add(g, ring);
  c.rings.push({ ring, r: r * 1.1, phase: rnd() * 6 });
  const hit = { x, z, r: r * 0.95, top: r * 1.3, kind: 'rock' };
  c.hits.push(hit);
  const a = rnd() * 6.28;
  return { g, ring, hit, x0: x, z0: z, dx: Math.cos(a), dz: Math.sin(a), amp: 6 + rnd() * 5, phase: rnd() * 6, speed: 0.12 + rnd() * 0.06 };
}

// A shipwreck: a broken hull tipped half under the water, its mast snapped and leaning. Solid.
export function wreck(c, x, z, rnd) {
  const g = new THREE.Group();
  const hull = new THREE.Mesh(BOX, mat(0x5a3a2a)), deck = new THREE.Mesh(BOX, plankMat);
  hull.scale.set(4.2, 1.2, 1.7);
  deck.scale.set(3.4, 0.15, 1.3);
  deck.position.y = 0.62;
  const mast = new THREE.Mesh(TRUNK, trunkMat);
  mast.position.set(0.4, 1.6, 0);
  mast.rotation.z = -0.7;
  const rag = new THREE.Mesh(BOX, mat(0xd8cdb0));
  rag.scale.set(0.08, 0.9, 1.1);
  rag.position.set(1.1, 2.2, 0);
  rag.rotation.z = -0.7;
  g.add(hull, deck, mast, rag);
  g.position.set(x, 0.05, z);
  g.rotation.set(0.25, rnd() * 6.28, 0.18); // tipped over and sinking by the stern
  c.group.add(g);
  foamRing(c, x, z, 2.4, rnd);
  c.hits.push({ x, z, r: 2, top: 1.6, kind: 'rock' });
}

// A pirate camp: a small island with tents and a campfire. Its cannon tower (an enemy, enemies.js) stands beside it.
export function camp(c, x, z, rnd, look) {
  island(c, x, z, 3, rnd, { ...look, tree: null });
  for (const [a, color] of [[0.4, 0xd8453a], [2.6, 0xe8dcc0]]) {
    const tent = new THREE.Mesh(ROOF, mat(color));
    tent.scale.set(1.6, 1.6, 1.6);
    tent.position.set(x + Math.cos(a) * 1.3, 1.3, z + Math.sin(a) * 1.3);
    tent.rotation.y = a;
    c.group.add(tent);
  }
  const fire = new THREE.Mesh(BUD, lampMat);
  fire.scale.set(1.4, 2, 1.4);
  fire.position.set(x - 0.6, 0.95, z - 0.8);
  fire.userData.outlineParameters = { visible: false };
  c.group.add(fire);
}

// A sea fort: a grey rock with stone walls and a flag. Its two cannon towers stand either side.
export function fort(c, x, z, rnd, look) {
  rock(c, x, z, 3.2, rnd, { ...look, spires: false });
  const wall = mat(0x8f8a82);
  for (let k = 0; k < 4; k++) {
    const a = (k / 4) * 6.28 + 0.4, w = new THREE.Mesh(BOX, wall);
    w.scale.set(2.6, 1.2, 0.5);
    w.position.set(x + Math.cos(a) * 1.6, 2.4, z + Math.sin(a) * 1.6);
    w.rotation.y = -a + Math.PI / 2;
    c.group.add(w);
  }
  const pole = new THREE.Mesh(TRUNK, trunkMat), flag = new THREE.Mesh(BOX, mat(0x22272b));
  pole.position.set(x, 3.6, z);
  flag.scale.set(0.9, 0.5, 0.05);
  flag.position.set(x + 0.45, 4.4, z);
  c.group.add(pole, flag);
}

// A stranded sailor on a tiny sandy islet, waving. Returns { person, arm } so they can wave and be rescued.
export function castaway(c, x, z, rnd, look) {
  island(c, x, z, 1.6, rnd, { ...look, tree: null });
  const person = new THREE.Group();
  const body = new THREE.Mesh(BOX, mat(0x3f6fb0)), head = new THREE.Mesh(BUD, mat(0xe0b08a));
  body.scale.set(0.45, 0.8, 0.35);
  body.position.y = 1.15;
  head.scale.setScalar(1.3);
  head.position.y = 1.8;
  const arm = new THREE.Group(), stick = new THREE.Mesh(TRUNK, trunkMat), rag = new THREE.Mesh(BOX, mat(0xffffff));
  stick.scale.set(0.4, 0.5, 0.4);
  stick.position.y = 0.5;
  rag.scale.set(0.5, 0.35, 0.05);
  rag.position.set(0.25, 1, 0);
  arm.add(stick, rag);
  arm.position.set(0.25, 1.45, 0);
  person.add(body, head, arm);
  person.position.set(x, 0, z);
  c.group.add(person);
  return { person, arm };
}

// A bottle bobbing on the water with a rolled-up map inside. Returns it, so it can bob and be picked up.
export function bottle(c, x, z) {
  const g = new THREE.Group();
  const glass = new THREE.Mesh(TRUNK, mat(0x5fae6a)), cork = new THREE.Mesh(BUD, plankMat);
  glass.scale.set(1.6, 0.35, 1.6);
  glass.rotation.z = Math.PI / 2 - 0.3;
  cork.position.set(0.45, 0.15, 0);
  g.add(glass, cork);
  g.position.set(x, 0.15, z);
  c.group.add(g);
  foamRing(c, x, z, 0.7, Math.random);
  return g;
}

// A sandbar: pale shallow water that slows ships down. Not solid.
export function sandbar(c, x, z, r) {
  const m = new THREE.Mesh(SANDBAR, sandbarMat), edge = new THREE.Mesh(RING, sandbarEdge);
  m.scale.setScalar(r);
  m.position.set(x, 0.025, z);
  edge.scale.setScalar(r / 1.2);
  edge.position.set(x, 0.026, z);
  c.group.add(m, edge);
  c.sandbars.push({ x, z, r });
}

function palm(x, z, rnd) {
  const g = new THREE.Group();
  const trunk = new THREE.Mesh(TRUNK, trunkMat);
  trunk.position.y = 1.1;
  trunk.rotation.z = (rnd() - 0.5) * 0.3;
  g.add(trunk);
  for (let k = 0; k < 5; k++) {
    const arm = new THREE.Group();
    arm.position.set(trunk.rotation.z * -1.1, 2.2, 0);
    arm.rotation.y = (k / 5) * Math.PI * 2;
    const leaf = new THREE.Mesh(LEAF, leafMat);
    leaf.scale.set(0.8, 0.1, 0.28);
    leaf.position.set(0.7, -0.1, 0);
    leaf.rotation.z = -0.35;
    arm.add(leaf);
    g.add(arm);
  }
  g.position.set(x, 0.3, z);
  return g;
}

// A snowy pine: two stacked cones.
function pine(x, z, rnd) {
  const g = new THREE.Group(), s = 0.8 + rnd() * 0.4;
  [[1.1, 1.6, 1.2], [0.75, 1.3, 2.1]].forEach(([w, h, y]) => {
    const cone = new THREE.Mesh(CONE, pineMat);
    cone.scale.set(w * s, h * s, w * s);
    cone.position.y = y * s;
    g.add(cone);
  });
  g.position.set(x, 0.5, z);
  return g;
}

export function island(c, x, z, R, rnd, look) {
  const sand = new THREE.Mesh(SAND, mat(look.sand));
  sand.scale.set(R, 1, R);
  sand.position.set(x, 0.1, z);
  const grass = new THREE.Mesh(GRASS, mat(look.grass));
  grass.scale.set(R, 1, R);
  grass.position.set(x, 0.5, z);
  c.group.add(sand, grass);
  foamRing(c, x, z, R * 1.02, rnd);
  const tree = look.tree === 'palm' ? palm : look.tree === 'pine' ? pine : null;
  if (tree) {
    for (let n = 1 + Math.floor(rnd() * 3); n > 0; n--) {
      const a = rnd() * 6.28, d = rnd() * R * 0.4;
      c.group.add(tree(x + Math.cos(a) * d, z + Math.sin(a) * d, rnd));
    }
  }
  c.hits.push({ x, z, r: R * 0.95, top: 1, kind: 'island' });
}

// A port town: a big island with houses, a wooden dock reaching out toward (dx, dz), and maybe a lighthouse.
// small: a little settlement, three huts.
export function town(c, x, z, rnd, look, dx, dz, lighthouse, small) {
  const R = 8;
  island(c, x, z, R, () => 0.99, { ...look, tree: null }); // no trees: the houses go there
  const [wall, roof] = look.houses;
  const houses = small ? 3 : 6;
  for (let k = 0; k < houses; k++) {
    const a = (k / houses) * 6.28 + rnd() * 0.5, d = 2.2 + rnd() * 3, s = (small ? 0.9 : 1.2) + rnd() * 0.5;
    const hx = x + Math.cos(a) * d, hz = z + Math.sin(a) * d;
    const house = new THREE.Mesh(BOX, mat(wall));
    house.scale.set(s, s * 0.9, s);
    house.position.set(hx, 0.7 + s * 0.45, hz);
    house.rotation.y = a;
    const top = new THREE.Mesh(ROOF, mat(roof));
    top.scale.set(s * 1.25, s, s * 1.25);
    top.position.set(hx, 0.7 + s * 0.9 + s * 0.35, hz);
    top.rotation.y = a;
    c.group.add(house, top);
  }
  // The dock: planks on posts, from the shore out over the water.
  const dock = new THREE.Mesh(BOX, plankMat);
  dock.scale.set(1.6, 0.2, 6);
  dock.position.set(x + dx * (R + 2), 0.45, z + dz * (R + 2));
  dock.rotation.y = Math.atan2(dx, dz);
  c.group.add(dock);
  if (lighthouse) {
    const lx = x - dz * 4.5, lz = z + dx * 4.5;
    [0xffffff, 0xd8573f, 0xffffff].forEach((color, i) => {
      const band = new THREE.Mesh(TOWER, mat(color));
      band.scale.set(1 - i * 0.12, 1.3, 1 - i * 0.12);
      band.position.set(lx, 1.3 + i * 1.3, lz);
      c.group.add(band);
    });
    const lamp = new THREE.Mesh(BOX, lampMat);
    lamp.scale.setScalar(0.8);
    lamp.position.set(lx, 5, lz);
    lamp.userData.outlineParameters = { visible: false };
    c.group.add(lamp);
  }
}

// Light dashes that breathe in and out across the water, wrapping around the camera.
export function createFoam(scene) {
  const N = 200, S = 70, rnd = seeded(7, 11);
  const mesh = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 0.02, 0.14), flat(1, 0x8fdce6), N);
  mesh.frustumCulled = false;
  scene.add(mesh);
  const dash = Array.from({ length: N }, () => ({ x: rnd() * S, z: rnd() * S, phase: rnd() * 6.28, len: 0.6 + rnd() }));
  const m = new THREE.Matrix4(), q = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI / 4);
  const p = new THREE.Vector3(), sc = new THREE.Vector3();
  return (cx, cz, t) => {
    dash.forEach((d, i) => {
      p.set(d.x + S * Math.round((cx - d.x) / S), 0.02, d.z + S * Math.round((cz - d.z) / S));
      sc.set(d.len * (0.5 + 0.5 * Math.sin(t * 1.2 + d.phase) ** 2), 1, 1);
      mesh.setMatrixAt(i, m.compose(p, q, sc));
    });
    mesh.instanceMatrix.needsUpdate = true;
  };
}
