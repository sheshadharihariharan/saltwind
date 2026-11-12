// The open ocean, streamed in square chunks: only the chunks around the ship exist at any time.
// Every chunk is built from the same fixed seed, so islands and rocks are always in the same place.
// Also answers what ships and cannonballs bump into, and raises the rocks that shut you in with a boss.
import * as THREE from 'three';
import { seeded, rock, coral, sandbar, island, town, berg, wreck, camp, fort, castaway, bottle, bake } from './world.js';
import { laneDistance, WIDTH } from './currents.js';
import { BOUND, toMap, toWorld, regionAt, REGIONS, PORTS, PORT_CLEAR, LAIRS, LAIR_RING } from './map.js';
import { QUEST_SPOTS } from './sidequests.js';
import { BOUNTY_SPOTS } from './bounties.js';

const SIZE = 64; // chunk width in world units
const KEEP = 1; // chunks this far from the ship's chunk are kept built (3 x 3)
const DROP = 2; // chunks further than this are removed
const SEED = 20261111;
const EDGE_GAP = 3.4; // spacing of the rocks walling in the world's edge
const TREASURE = 0.15; // how often a chunk has a treasure spot: a little island with a chest beside it
const SPOT_CLEAR = 22; // open water kept around each side-story place
// Places to find, by chance per chunk. camp: a pirate camp in calm seas, a sea fort in rough ones; also stranded sailors and bottles.
const FIND = { camp: 0.09, castaway: 0.05, bottle: 0.07 };
const CALM = ['home', 'reef']; // regions with pirate camps; the others have sea forts
const RING_ROCKS = 12; // rocks in a lair's ring, with gaps to sail through
const FENCE = { radius: 28, rocks: 48, rise: 1.5, depth: 4 }; // the rocks that rise to shut you in with a boss (rise: seconds)

const regionOf = (x, z) => {
  const m = toMap(x, z);
  return REGIONS[regionAt(m.e, m.n)];
};
const lookAt = (x, z) => regionOf(x, z).look;

// Room for something at (x, z): inside the ocean and away from ports, boss lairs, side-story places and currents.
function open(x, z) {
  const m = toMap(x, z);
  if (Math.abs(m.e) > BOUND - 12 || Math.abs(m.n) > BOUND - 12) return false;
  if (Object.values(LAIRS).some((l) => Math.hypot(m.e - l.at[0], m.n - l.at[1]) < LAIR_RING + 8)) return false;
  if ([...QUEST_SPOTS, ...BOUNTY_SPOTS].some(([e, n]) => Math.hypot(m.e - e, m.n - n) < SPOT_CLEAR)) return false;
  if (laneDistance(m.e, m.n) < WIDTH + 4) return false;
  return Object.values(PORTS).every((p) => Math.hypot(m.e - p.at[0], m.n - p.at[1]) > PORT_CLEAR);
}

// on.load(chunk) / on.unload(chunk): a chunk was built or removed. A chunk's treasure is
// { id, x, z, coins, wreck (beside a shipwreck, not an island) } or null; the chest itself is looked after by whoever listens.
// A chunk's find is { id, kind: 'camp' | 'fort' | 'castaway' | 'bottle', x, z, towers: [{ x, z }], arm / person / bottle meshes } or null.
// on.locked(e, n): is this spot (map coordinates) behind the curse fog? Nothing roams there.
export function createOcean(scene, on) {
  const chunks = new Map(); // 'i,j' -> chunk
  let fence = null; // the rocks around a boss fight: a chunk of its own, rising or sinking
  const fixed = []; // solid things added later (Home Harbour's new buildings)

  function build(i, j) {
    const c = { i, j, group: new THREE.Group(), hits: [], rings: [], sandbars: [], movers: [], treasure: null, find: null };
    const rnd = seeded(SEED + i * 7919, j * 104729 + 13);
    const x0 = i * SIZE, z0 = j * SIZE;
    const inside = (x, z) => x >= x0 && x < x0 + SIZE && z >= z0 && z < z0 + SIZE;

    // A port town, if one stands in this chunk. Its dock points toward the middle of the ocean.
    for (const port of Object.values(PORTS)) {
      const w = toWorld(...port.at);
      if (!inside(w.x, w.z)) continue;
      const len = Math.hypot(...port.at), dir = toWorld(-port.at[0] / len, -port.at[1] / len);
      town(c, w.x, w.z, rnd, REGIONS[port.region].look, dir.x, dir.z, port.lighthouse, port.small);
    }

    // The edge of the world: a wall of big rocks along the border, too close together to slip through.
    const corners = [[x0, z0], [x0 + SIZE, z0], [x0, z0 + SIZE], [x0 + SIZE, z0 + SIZE]].map(([x, z]) => toMap(x, z));
    if (corners.some((m) => Math.max(Math.abs(m.e), Math.abs(m.n)) > BOUND - 6)) {
      const B = BOUND + 1.5;
      for (let t = -B; t <= B; t += EDGE_GAP) {
        for (const [e, n] of [[t, -B], [t, B], [-B, t], [B, t]]) {
          const w = toWorld(e, n);
          if (inside(w.x, w.z)) rock(c, w.x, w.z, 2 + rnd() * 0.7, rnd, lookAt(w.x, w.z));
        }
      }
    }

    // Boss lairs: a ring of big rocks with gaps between them.
    for (const lair of Object.values(LAIRS)) {
      for (let k = 0; k < RING_ROCKS; k++) {
        const a = (k / RING_ROCKS) * Math.PI * 2, w = toWorld(lair.at[0] + Math.cos(a) * LAIR_RING, lair.at[1] + Math.sin(a) * LAIR_RING);
        if (inside(w.x, w.z)) rock(c, w.x, w.z, 2.2 + rnd() * 0.6, rnd, lookAt(w.x, w.z));
      }
    }

    // Rocks, coral, islands and sandbars, spread out, each in the style of its region.
    const spots = [], mid = lookAt(x0 + SIZE / 2, z0 + SIZE / 2);
    for (let tries = 0; tries < 30 && spots.length < mid.spots; tries++) {
      const x = x0 + 6 + rnd() * (SIZE - 12), z = z0 + 6 + rnd() * (SIZE - 12);
      if (!open(x, z) || spots.some((s) => Math.hypot(s.x - x, s.z - z) < 14)) continue;
      spots.push({ x, z });
      const look = lookAt(x, z);
      if (rnd() < look.isles) {
        island(c, x, z, 2.6 + rnd() * 1.6, rnd, look);
      } else {
        for (let k = 1 + Math.floor(rnd() * 3); k > 0; k--) {
          const rx = x + (rnd() - 0.5) * 4, rz = z + (rnd() - 0.5) * 4, r = 0.9 + rnd() * 1.1;
          if (look.coral) coral(c, rx, rz, r, rnd);
          else rock(c, rx, rz, r, rnd, look);
        }
      }
    }
    // Icebergs (the Frozen North): they drift, so they get plenty of room.
    for (let tries = 0; tries < 20 && c.movers.length < (mid.bergs ?? 0); tries++) {
      const x = x0 + 12 + rnd() * (SIZE - 24), z = z0 + 12 + rnd() * (SIZE - 24);
      if (!open(x, z) || spots.some((s) => Math.hypot(s.x - x, s.z - z) < 18)) continue;
      spots.push({ x, z });
      c.movers.push(berg(c, x, z, 2.2 + rnd() * 1.2, rnd));
    }

    // Treasure: a small island or a shipwreck, with a chest bobbing in the water beside it.
    if (rnd() < TREASURE) {
      for (let tries = 0; tries < 20 && !c.treasure; tries++) {
        const x = x0 + 10 + rnd() * (SIZE - 20), z = z0 + 10 + rnd() * (SIZE - 20), a = rnd() * 6.28;
        const cx = x + Math.cos(a) * 4.5, cz = z + Math.sin(a) * 4.5;
        if (!open(x, z) || spots.some((s) => Math.hypot(s.x - x, s.z - z) < 12)) continue;
        spots.push({ x, z });
        const wrecked = rnd() < 0.5;
        if (wrecked) wreck(c, x, z, rnd);
        else island(c, x, z, 2.4, rnd, lookAt(x, z));
        c.treasure = { id: `${i},${j}`, x: cx, z: cz, coins: regionOf(x, z).coins + Math.floor(rnd() * 2), wreck: wrecked };
      }
    }
    // A place to find, now and then (not in a chunk that already has treasure).
    const roll = rnd(), here = regionAt(toMap(x0 + SIZE / 2, z0 + SIZE / 2).e, toMap(x0 + SIZE / 2, z0 + SIZE / 2).n);
    const calm = CALM.includes(here);
    const kind = c.treasure ? null : roll < FIND.camp ? (calm ? 'camp' : 'fort') : roll < FIND.camp + FIND.castaway ? 'castaway'
      : roll < FIND.camp + FIND.castaway + FIND.bottle ? 'bottle' : null;
    for (let tries = 0; kind && tries < 20 && !c.find; tries++) {
      const x = x0 + 12 + rnd() * (SIZE - 24), z = z0 + 12 + rnd() * (SIZE - 24);
      if (!open(x, z) || spots.some((s) => Math.hypot(s.x - x, s.z - z) < 16)) continue;
      spots.push({ x, z });
      const look = lookAt(x, z), a = rnd() * 6.28, find = { id: `${i},${j}`, kind, x, z, towers: [] };
      if (kind === 'camp') {
        camp(c, x, z, rnd, look);
        find.towers.push({ x: x + Math.cos(a) * 6, z: z + Math.sin(a) * 6 });
      } else if (kind === 'fort') {
        fort(c, x, z, rnd, look);
        find.towers.push({ x: x + Math.cos(a) * 6.5, z: z + Math.sin(a) * 6.5 }, { x: x - Math.cos(a) * 6.5, z: z - Math.sin(a) * 6.5 });
      } else if (kind === 'castaway') Object.assign(find, castaway(c, x, z, rnd, look));
      else find.bottle = bottle(c, x, z);
      c.find = find;
    }

    for (let tries = 0; tries < 20 && c.sandbars.length < (mid.sandbars ?? 0); tries++) {
      const x = x0 + 6 + rnd() * (SIZE - 12), z = z0 + 6 + rnd() * (SIZE - 12), r = 2.5 + rnd() * 1.8;
      if (open(x, z) && spots.every((s) => Math.hypot(s.x - x, s.z - z) > r + 6)) sandbar(c, x, z, r);
    }

    c.baked = bake(c); // one mesh for all the still pieces
    scene.add(c.group);
    chunks.set(`${i},${j}`, c);
    on.load(c);
  }

  // Keep the chunks around (x, z) built and drop far ones. Builds one chunk a call (no stutter),
  // or all that are missing when `all` is set (a fresh start or a jump across the sea).
  let lastT = 0;
  function update(x, z, t, all = false) {
    const dt = Math.min(0.05, Math.max(0, t - lastT));
    lastT = t;
    const ci = Math.floor(x / SIZE), cj = Math.floor(z / SIZE);
    for (const [k, c] of chunks) {
      if (Math.abs(c.i - ci) > DROP || Math.abs(c.j - cj) > DROP) {
        scene.remove(c.group);
        c.baked?.dispose();
        chunks.delete(k);
        on.unload(c);
      }
    }
    const missing = [];
    for (let i = ci - KEEP; i <= ci + KEEP; i++) {
      for (let j = cj - KEEP; j <= cj + KEEP; j++) if (!chunks.has(`${i},${j}`)) missing.push([i, j]);
    }
    missing.sort((a, b) => Math.hypot(a[0] - ci, a[1] - cj) - Math.hypot(b[0] - ci, b[1] - cj));
    for (const [i, j] of all ? missing : missing.slice(0, 1)) build(i, j);
    for (const c of [...chunks.values(), ...(fence ? [fence] : [])]) {
      for (const f of c.rings) f.ring.scale.setScalar(f.r * (1 + 0.05 * Math.sin(t * 1.5 + f.phase)));
    }
    for (const c of chunks.values()) {
      for (const m of c.movers) { // icebergs drifting back and forth
        const off = Math.sin(t * m.speed + m.phase) * m.amp;
        m.hit.x = m.x0 + m.dx * off;
        m.hit.z = m.z0 + m.dz * off;
        m.g.position.set(m.hit.x, Math.sin(t * 0.7 + m.phase) * 0.08, m.hit.z);
        m.ring.position.set(m.hit.x, 0.03, m.hit.z);
      }
    }
    if (fence) { // rocks rising up out of the sea, or sinking back down
      fence.up = Math.max(0, Math.min(1, fence.up + (fence.sinking ? -dt : dt) / FENCE.rise));
      fence.group.position.y = -FENCE.depth * (1 - fence.up);
      if (fence.sinking && fence.up <= 0) {
        scene.remove(fence.group);
        fence = null;
      }
    }
  }

  // Shut the player in around a boss lair (world x, z): a ring of rocks rises out of the sea.
  function raiseFence(x, z) {
    if (fence) scene.remove(fence.group);
    fence = { group: new THREE.Group(), hits: [], rings: [], sandbars: [], up: 0, sinking: false };
    const look = lookAt(x, z);
    for (let k = 0; k < FENCE.rocks; k++) {
      const a = (k / FENCE.rocks) * Math.PI * 2;
      rock(fence, x + Math.cos(a) * FENCE.radius, z + Math.sin(a) * FENCE.radius, 1.8 + Math.random() * 0.8, Math.random, look);
    }
    fence.group.position.y = -FENCE.depth;
    scene.add(fence.group);
  }
  // Let the rocks sink away again (straight away: nothing to bump into while they go).
  function lowerFence() {
    if (!fence) return;
    fence.sinking = true;
    fence.hits = [];
  }

  // Everything solid near (x, z): the chunk it's in and the ones around it.
  function* hitsNear(x, z) {
    const ci = Math.floor(x / SIZE), cj = Math.floor(z / SIZE);
    for (let i = ci - 1; i <= ci + 1; i++) {
      for (let j = cj - 1; j <= cj + 1; j++) {
        const c = chunks.get(`${i},${j}`);
        if (c) yield* c.hits;
      }
    }
    if (fence) yield* fence.hits;
    yield* fixed;
  }

  // Something solid that isn't part of any chunk: a circle of radius r at world (x, z).
  const addHit = (x, z, r) => { fixed.push({ x, z, r, top: 2, kind: 'island' }); };

  // Push a ship out of rocks and bounce it. Returns how hard it hit (0 if it didn't).
  function collide(s, radius = 1) {
    const m = toMap(s.x, s.z), B = BOUND - 1;
    if (Math.abs(m.e) > B || Math.abs(m.n) > B) { // backstop in case anything squeezes past the edge rocks
      const w = toWorld(Math.max(-B, Math.min(B, m.e)), Math.max(-B, Math.min(B, m.n)));
      s.x = w.x;
      s.z = w.z;
    }
    let hardest = 0;
    for (const h of hitsNear(s.x, s.z)) {
      const dx = s.x - h.x, dz = s.z - h.z, d = Math.hypot(dx, dz), min = h.r + radius;
      if (d >= min || d === 0) continue;
      const nx = dx / d, nz = dz / d, vn = s.vx * nx + s.vz * nz;
      s.x = h.x + nx * min;
      s.z = h.z + nz * min;
      if (vn < 0) {
        s.vx -= 1.3 * vn * nx;
        s.vz -= 1.3 * vn * nz;
        hardest = Math.max(hardest, -vn);
        s.hitX = h.x + nx * h.r;
        s.hitZ = h.z + nz * h.r;
      }
    }
    return hardest;
  }

  // What a cannonball at this spot and height would hit: 'rock', 'island' or null for open water.
  function solidAt(x, y, z) {
    for (const h of hitsNear(x, z)) if (y < h.top + 0.2 && Math.hypot(x - h.x, z - h.z) < h.r) return h.kind;
    return null;
  }

  // Is (x, z) on a sandbar?
  function sandAt(x, z) {
    const c = chunks.get(`${Math.floor(x / SIZE)},${Math.floor(z / SIZE)}`);
    return !!c && c.sandbars.some((s) => Math.hypot(x - s.x, z - s.z) < s.r);
  }

  // Is there open water within `margin` of (x, z)? Water behind the curse fog doesn't count.
  function clearAt(x, z, margin) {
    const m = toMap(x, z);
    if (Math.abs(m.e) > BOUND - 3 - margin || Math.abs(m.n) > BOUND - 3 - margin || on.locked(m.e, m.n)) return false;
    for (const h of hitsNear(x, z)) if (Math.hypot(x - h.x, z - h.z) < h.r + margin) return false;
    return true;
  }

  return { update, collide, solidAt, sandAt, clearAt, raiseFence, lowerFence, addHit, count: () => chunks.size };
}
