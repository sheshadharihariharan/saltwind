// A living sea around the ship: fish jumping, dolphins leaping alongside when you sail fast, a whale
// surfacing now and then to blow, gulls wheeling overhead, and barrels drifting by with a few coins inside.
// Nearly all of it is just to look at; only the barrels can be picked up.
import * as THREE from 'three';
import { toon } from './stage.js';

const BALL = new THREE.SphereGeometry(1, 10, 8);
const FIN = new THREE.ConeGeometry(0.5, 1, 4);
const WING = new THREE.BoxGeometry(0.7, 0.04, 0.22);
const BARREL = new THREE.CylinderGeometry(0.45, 0.45, 1, 10);
const HOOP = new THREE.TorusGeometry(0.46, 0.05, 4, 14);
const mats = { fish: toon(0x9fb8c8), glow: new THREE.MeshBasicMaterial({ color: 0x7ff0e0 }), dolphin: toon(0x7d98b0), belly: toon(0xe6eef2),
  whale: toon(0x3d4f63), gull: toon(0xffffff), wood: toon(0x8a5a33), hoop: toon(0x3a3a3a) };
mats.glow.userData.outlineParameters = { visible: false };

const FISH = { every: [1.5, 3], near: [6, 14], time: 0.8, height: 1.3 }; // seconds; distance from the ship
const DOLPHINS = { every: [30, 50], time: 7, minSpeed: 4, regions: ['home', 'reef', 'storm'] };
const WHALE = { every: [45, 80], near: [16, 22], rise: 2, stay: 4, regions: ['home', 'reef', 'storm', 'frozen'] };
const GULLS = { every: [25, 40], time: 10, height: 7, radius: 6 };
const BARRELS = { most: 2, every: [12, 20], near: [16, 24], pick: 2, coins: 2, gone: 60 };
const between = ([a, b]) => a + Math.random() * (b - a);

function mesh(geo, material, [x, y, z], [sx, sy, sz] = [1, 1, 1]) {
  const o = new THREE.Mesh(geo, material);
  o.position.set(x, y, z);
  o.scale.set(sx, sy, sz);
  return o;
}

// fx: splashes and puffs. loot: coins from barrels.
export function createSeaLife(scene, fx, loot) {
  // A jumping fish (one at a time is plenty).
  const fish = mesh(BALL, mats.fish, [0, -5, 0], [0.35, 0.18, 0.14]);
  const fishTail = mesh(FIN, mats.fish, [-0.4, 0, 0], [0.4, 0.4, 0.1]);
  fishTail.rotation.z = Math.PI / 2;
  fish.add(fishTail);
  scene.add(fish);
  let fishJump = null, fishWait = 2;

  // Three dolphins.
  const dolphins = [0, 1, 2].map(() => {
    const g = new THREE.Group();
    g.add(mesh(BALL, mats.dolphin, [0, 0, 0], [1.1, 0.32, 0.32]), mesh(BALL, mats.belly, [0.2, -0.1, 0], [0.8, 0.2, 0.26]),
      mesh(FIN, mats.dolphin, [0, 0.35, 0], [0.5, 0.6, 0.12]), mesh(BALL, mats.dolphin, [1, -0.05, 0], [0.35, 0.12, 0.12]));
    g.visible = false;
    scene.add(g);
    return g;
  });
  let pod = null, podWait = between(DOLPHINS.every);

  // A whale: its back and its tail.
  const whale = new THREE.Group();
  whale.add(mesh(BALL, mats.whale, [0, 0, 0], [4.5, 1.4, 1.8]), mesh(BALL, mats.belly, [1.5, -0.6, 0], [2.5, 0.6, 1.2]));
  const fluke = new THREE.Group();
  fluke.add(mesh(BALL, mats.whale, [0, 0, 0.9], [0.6, 0.12, 1]), mesh(BALL, mats.whale, [0, 0, -0.9], [0.6, 0.12, 1]));
  fluke.position.set(-4.6, 0, 0);
  whale.add(fluke);
  whale.visible = false;
  scene.add(whale);
  let blow = null, whaleWait = between(WHALE.every);

  // A few gulls.
  const gulls = [0, 1, 2, 3].map(() => {
    const g = new THREE.Group(), l = mesh(WING, mats.gull, [0, 0, 0.32]), r = mesh(WING, mats.gull, [0, 0, -0.32]);
    g.add(mesh(BALL, mats.gull, [0, 0, 0], [0.32, 0.14, 0.14]), l, r);
    g.userData.wings = [l, r];
    g.visible = false;
    scene.add(g);
    return g;
  });
  let flock = null, gullWait = between(GULLS.every);

  const barrels = [];
  let barrelWait = 4;

  // Somewhere around (x, z), between `near` distances away, preferring the way the ship is going.
  const around = (p, [a, b], ahead = 0) => {
    const ang = Math.atan2(p.vz, p.vx) + (Math.random() - 0.5) * (Math.PI * 2 - ahead), d = a + Math.random() * (b - a);
    return { x: p.x + Math.cos(ang) * d, z: p.z + Math.sin(ang) * d };
  };

  // p: the player's ship. region: where it is. clear(x, z): open water there? Returns nothing; barrels drop coins.
  function update(dt, t, p, region, clear) {
    // Fish: one jump every few seconds, a little splash at each end.
    fishWait -= dt;
    if (!fishJump && fishWait <= 0) {
      const at = around(p, FISH.near), a = Math.random() * 6.28;
      fishJump = { ...at, dx: Math.cos(a), dz: Math.sin(a), t: 0 };
      fish.material = region === 'abyss' ? mats.glow : mats.fish; // glowing fish in the dark
      fishTail.material = fish.material;
      fx.splash(at.x, at.z, 0.4);
    }
    if (fishJump) {
      fishJump.t += dt / FISH.time;
      const u = fishJump.t;
      fish.position.set(fishJump.x + fishJump.dx * u * 2, Math.sin(u * Math.PI) * FISH.height, fishJump.z + fishJump.dz * u * 2);
      fish.rotation.set(0, -Math.atan2(fishJump.dz, fishJump.dx), Math.cos(u * Math.PI) * 0.9);
      if (u >= 1) {
        fx.splash(fish.position.x, fish.position.z, 0.4);
        fish.position.y = -5;
        fishJump = null;
        fishWait = between(FISH.every);
      }
    }

    // Dolphins: a pod leaps alongside when you're sailing fast in warm water.
    podWait -= dt;
    if (!pod && podWait <= 0 && p.speed > DOLPHINS.minSpeed && DOLPHINS.regions.includes(region)) pod = { t: 0, side: Math.random() < 0.5 ? 1 : -1 };
    if (pod) {
      pod.t += dt;
      const h = Math.atan2(p.vz, p.vx), sx = -Math.sin(h) * pod.side, sz = Math.cos(h) * pod.side;
      dolphins.forEach((d, i) => {
        const leap = Math.sin(pod.t * 3 - i * 0.9), up = Math.max(0, leap);
        d.visible = pod.t < DOLPHINS.time;
        d.position.set(p.x + sx * (4.5 + i * 1.6) + Math.cos(h) * (2 - i * 2.2), up * 1.4 - 0.4, p.z + sz * (4.5 + i * 1.6) + Math.sin(h) * (2 - i * 2.2));
        d.rotation.set(0, -h, Math.cos(pod.t * 3 - i * 0.9) * 0.6);
        if (leap > 0.97 && Math.random() < 0.3) fx.splash(d.position.x, d.position.z, 0.5);
      });
      if (pod.t >= DOLPHINS.time) { pod = null; podWait = between(DOLPHINS.every); }
    }

    // A whale: rises, blows, shows its tail and dives.
    whaleWait -= dt;
    if (!blow && whaleWait <= 0 && WHALE.regions.includes(region)) {
      const at = around(p, WHALE.near);
      if (clear(at.x, at.z, 5)) {
        blow = { ...at, t: 0, h: Math.random() * 6.28 };
        whale.position.set(at.x, -3, at.z);
        whale.rotation.y = blow.h;
        whale.visible = true;
      } else whaleWait = 3;
    }
    if (blow) {
      blow.t += dt;
      const rise = Math.min(1, blow.t / WHALE.rise), sink = Math.max(0, blow.t - WHALE.rise - WHALE.stay) / WHALE.rise;
      whale.position.y = -3 + 3.1 * rise - 3.5 * sink;
      fluke.rotation.z = sink > 0 ? Math.min(1.2, sink * 2.5) : 0;
      if (blow.t > WHALE.rise && !blow.blew) { // a spout of spray
        blow.blew = true;
        for (let k = 0; k < 5; k++) setTimeout(() => fx.puff(blow?.x ?? whale.position.x, 2.5 + k * 0.6, blow?.z ?? whale.position.z, 1.2, 0xeef8ff), k * 90);
        fx.splash(whale.position.x, whale.position.z, 2);
      }
      if (sink >= 1) { whale.visible = false; blow = null; whaleWait = between(WHALE.every); }
    }

    // Gulls wheel overhead for a while.
    gullWait -= dt;
    if (!flock && gullWait <= 0 && region !== 'abyss') flock = { ...around(p, [4, 8]), t: 0 };
    if (flock) {
      flock.t += dt;
      gulls.forEach((g, i) => {
        const a = flock.t * 0.8 + (i / gulls.length) * 6.28;
        g.visible = flock.t < GULLS.time;
        g.position.set(flock.x + Math.cos(a) * GULLS.radius, GULLS.height + Math.sin(t * 2 + i) * 0.3, flock.z + Math.sin(a) * GULLS.radius);
        g.rotation.y = -a - Math.PI / 2;
        g.userData.wings.forEach((w, k) => { w.rotation.x = (k ? -1 : 1) * Math.sin(t * 9 + i) * 0.5; });
      });
      if (flock.t >= GULLS.time) { flock = null; gullWait = between(GULLS.every); }
    }

    // Barrels drift by; sail into one for a few coins.
    barrelWait -= dt;
    if (barrels.length < BARRELS.most && barrelWait <= 0) {
      barrelWait = between(BARRELS.every);
      const at = around(p, BARRELS.near, Math.PI);
      if (clear(at.x, at.z, 2)) {
        const g = new THREE.Group();
        g.add(mesh(BARREL, mats.wood, [0, 0, 0]), mesh(HOOP, mats.hoop, [0, 0.3, 0]), mesh(HOOP, mats.hoop, [0, -0.3, 0]));
        g.children[1].rotation.x = g.children[2].rotation.x = Math.PI / 2;
        g.rotation.z = Math.PI / 2;
        g.position.set(at.x, 0.2, at.z);
        scene.add(g);
        barrels.push({ g, x: at.x, z: at.z, phase: Math.random() * 6 });
      }
    }
    for (const b of [...barrels]) {
      b.g.position.y = 0.15 + Math.sin(t * 2 + b.phase) * 0.08;
      b.g.rotation.y = Math.sin(t * 0.5 + b.phase) * 0.6;
      const d = Math.hypot(p.x - b.x, p.z - b.z);
      if (d < BARRELS.pick || d > BARRELS.gone) {
        if (d < BARRELS.pick) { loot.drop(b.x, b.z, BARRELS.coins); fx.splash(b.x, b.z, 0.6); }
        scene.remove(b.g);
        barrels.splice(barrels.indexOf(b), 1);
      }
    }
  }

  return { update };
}
