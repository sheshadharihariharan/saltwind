// The Sea Serpent: the Frozen North's boss, coiled around the Frost Bell in Serpent's Reach.
// It swims round under the water (only a ripple shows where its head is), rears up with its humps out of
// the water to spit ice balls (a red circle shows where each lands; a hit chills and slows you),
// then a red strip shows where it will lunge, and it lunges along it. Shoot it whenever it's up.
import * as THREE from 'three';
import { toon, flat } from './stage.js';
import { sfx } from './audio.js';
import { SHELL_RADIUS } from './effects.js';

const SEGMENTS = 12, SPACING = 1.25; // body pieces behind the head, and the gap between them
const HP = 220;
const T = { swim: [3.5, 2.2], rise: 0.6, spit: 3.4, aim: 1, lunge: 0.6, dive: 0.7 }; // seconds; swim: calm / angry
const SWIM = { radius: 11, speed: 6, turn: 2.2 };
const ICE = { every: [1.1, 0.7], flight: 1.3, damage: 8, chill: 1.5 }; // seconds between spits: calm / angry
const LUNGE = { speed: 20, damage: 16, reach: 2.2, length: 14 };
const BALL = new THREE.SphereGeometry(1, 12, 9);
const HORN = new THREE.ConeGeometry(0.18, 0.7, 6);
const STRIP = new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2).translate(0.5, 0, 0);
const RING = new THREE.RingGeometry(1, 1.4, 24).rotateX(-Math.PI / 2);
const skin = toon(0x3f8fa3), belly = toon(0xd8f1f4), fin = toon(0x9fe0e8), eyeMat = toon(0x16262c);

// scene: the group it is built in; the middle of its lair is that group's (0, 0).
// api: hurtPlayer(amount, x, y, z), slowPlayer(seconds), shake(amount). loot: for the gold it drops.
export function createSerpent(scene, fx, loot, api) {
  // The head, looking along +x.
  const head = new THREE.Group();
  const skull = mesh(BALL, skin, [0, 0, 0], [1.25, 0.8, 0.85]);
  const jaw = mesh(BALL, belly, [0.45, -0.35, 0], [0.9, 0.35, 0.65]);
  const eyes = [-0.45, 0.45].map((z) => mesh(BALL, eyeMat, [0.55, 0.35, z], [0.16, 0.18, 0.12]));
  const horns = [-0.35, 0.35].map((z) => {
    const h = mesh(HORN, fin, [-0.5, 0.75, z]);
    h.rotation.z = 0.6;
    return h;
  });
  head.add(skull, jaw, ...eyes, ...horns);
  scene.add(head);
  // The body: balls getting smaller toward the tail, with a fin on every other one.
  const body = Array.from({ length: SEGMENTS }, (_, i) => {
    const r = 1 - (i / SEGMENTS) * 0.55;
    const g = new THREE.Group();
    g.add(mesh(BALL, i % 3 === 1 ? belly : skin, [0, 0, 0], [r, r * 0.85, r]));
    if (i % 2 === 0) g.add(mesh(HORN, fin, [0, r * 0.8, 0], [1.2, 1, 1.2]));
    scene.add(g);
    return { g, r };
  });
  const ripple = new THREE.Mesh(RING, flat(0.6));
  ripple.position.y = 0.05;
  const strip = new THREE.Mesh(STRIP, flat(0, 0xff4a3a));
  strip.scale.set(LUNGE.length, 1, 2);
  strip.position.y = 0.07;
  strip.visible = false;
  scene.add(ripple, strip);

  const bar = document.getElementById('boss');
  bar.querySelector('b').textContent = 'The Sea Serpent';
  bar.querySelector('.pips').innerHTML = '';
  bar.classList.add('on');

  // Head position and heading on the water; the trail its body follows (newest first).
  const s = { x: SWIM.radius, z: 0, heading: Math.PI / 2, up: 0 }; // up: 0 under the water .. 1 reared up
  const trail = [{ x: s.x, z: s.z }];
  let phase = 'swim', phaseTime = 0, hp = HP, angle = 0, spit = 0, dir = 0, bit = false;
  const angry = () => hp < HP / 2;

  function turnToward(want, dt, rate) {
    const d = Math.atan2(Math.sin(want - s.heading), Math.cos(want - s.heading));
    s.heading += Math.max(-rate * dt, Math.min(rate * dt, d));
  }

  function go(next) {
    phase = next;
    phaseTime = 0;
  }

  // Lob an ice ball at where you're heading.
  function spitIce(p) {
    const tx = p.x + p.vx * ICE.flight * 0.6 + (Math.random() - 0.5) * 2, tz = p.z + p.vz * ICE.flight * 0.6 + (Math.random() - 0.5) * 2;
    fx.lob(s.x, s.z, tx, tz, ICE.flight, (x, z) => {
      fx.puff(x, 0.5, z, 1.6, 0xdff6ff);
      if (p.sinking < 0 && Math.hypot(p.x - x, p.z - z) < SHELL_RADIUS + 0.6) {
        api.hurtPlayer(ICE.damage, p.x, 1, p.z);
        api.slowPlayer(ICE.chill);
      }
    });
    sfx.mortar(ICE.flight);
  }

  function update(dt, t, p) {
    phaseTime += dt;
    let speed = 0;
    if (phase === 'swim') { // round the reach under the water
      angle += (SWIM.speed / SWIM.radius) * dt;
      turnToward(Math.atan2(Math.sin(angle + 0.6) * SWIM.radius - s.z, Math.cos(angle + 0.6) * SWIM.radius - s.x), dt, SWIM.turn);
      speed = SWIM.speed;
      if (phaseTime > T.swim[angry() ? 1 : 0] && p.sinking < 0) { go('rise'); sfx.splashBig(); fx.splash(s.x, s.z, 2.2); }
    } else if (phase === 'rise' || phase === 'spit') { // rear up, face you, spit ice
      turnToward(Math.atan2(p.z - s.z, p.x - s.x), dt, 3);
      speed = 1.2;
      if (phase === 'rise' && phaseTime > T.rise) { go('spit'); spit = 0.4; sfx.roar(); }
      if (phase === 'spit') {
        spit -= dt;
        if (spit <= 0 && p.sinking < 0) { spit = ICE.every[angry() ? 1 : 0]; spitIce(p); }
        if (phaseTime > T.spit) { go('aim'); dir = Math.atan2(p.z - s.z, p.x - s.x); sfx.sharkWarn(); }
      }
    } else if (phase === 'aim') { // the red strip: where it will lunge
      dir = Math.atan2(p.z - s.z, p.x - s.x);
      turnToward(dir, dt, 6);
      if (phaseTime > T.aim) { go('lunge'); bit = false; sfx.sharkGo(); }
    } else if (phase === 'lunge') {
      s.heading = dir;
      speed = LUNGE.speed;
      if (!bit && p.sinking < 0 && Math.hypot(p.x - s.x, p.z - s.z) < LUNGE.reach) {
        bit = true;
        api.hurtPlayer(LUNGE.damage, p.x, 1, p.z);
        api.shake(0.5);
        sfx.bite();
        p.vx += Math.cos(dir) * 6;
        p.vz += Math.sin(dir) * 6;
      }
      if (phaseTime > T.lunge) { go('dive'); fx.splash(s.x, s.z, 2.2); }
    } else if (phase === 'dive') {
      speed = 3;
      if (phaseTime > T.dive) { go('swim'); angle = Math.atan2(s.z, s.x); }
    }
    // Stay inside the reach.
    s.x += Math.cos(s.heading) * speed * dt;
    s.z += Math.sin(s.heading) * speed * dt;
    const d = Math.hypot(s.x, s.z);
    if (d > 22) { s.x *= 22 / d; s.z *= 22 / d; }

    // Up or under, smoothly.
    const wantUp = phase === 'swim' || phase === 'dive' || phase === 'beaten' ? 0 : 1;
    s.up += (wantUp - s.up) * Math.min(1, dt * (phase === 'beaten' ? 0.8 : 5));
    if (Math.hypot(s.x - trail[0].x, s.z - trail[0].z) > 0.25) {
      trail.unshift({ x: s.x, z: s.z });
      if (trail.length > 200) trail.pop();
    }
    const lift = (y) => -2.6 + (y + 2.6) * s.up; // under the water (hidden) .. its height when up
    head.position.set(s.x, lift(1.7 + Math.sin(t * 3) * 0.1), s.z);
    head.rotation.set(0, -s.heading, phase === 'aim' ? 0.35 : 0.1);
    jaw.rotation.z = phase === 'spit' || phase === 'lunge' ? -0.4 : -0.05;
    // Each body piece sits along the trail; humps arc out of the water when it's up.
    let along = 0, k = 0;
    body.forEach((b, i) => {
      const want = (i + 1) * SPACING;
      while (k < trail.length - 1 && along + Math.hypot(trail[k + 1].x - trail[k].x, trail[k + 1].z - trail[k].z) < want) {
        along += Math.hypot(trail[k + 1].x - trail[k].x, trail[k + 1].z - trail[k].z);
        k++;
      }
      const pt = trail[k];
      b.g.position.set(pt.x, lift(Math.max(-0.8, 1.1 * Math.sin(t * 2 - i * 0.7)) * (1 - i / SEGMENTS * 0.4)), pt.z);
      b.y = b.g.position.y;
    });
    ripple.visible = s.up < 0.5 && phase !== 'beaten';
    ripple.position.set(s.x, 0.05, s.z);
    ripple.scale.setScalar(1.4 + Math.sin(t * 8) * 0.2);
    strip.visible = phase === 'aim';
    if (strip.visible) {
      strip.position.set(s.x, 0.07, s.z);
      strip.rotation.y = -dir;
      strip.material.opacity = 0.35 + 0.15 * Math.sin(t * 18);
    }
    if (phase === 'beaten' && Math.random() < dt * 10) fx.bubble(s.x + (Math.random() - 0.5) * 6, s.z + (Math.random() - 0.5) * 6);
    bar.querySelector('i').style.width = (100 * hp) / HP + '%';
  }

  // A player's cannonball at (x, y, z): hits the head or any part of the body that's out of the water.
  function hitAt(x, y, z, amount) {
    if (phase === 'beaten' || s.up < 0.5) return false;
    const parts = [{ x: head.position.x, y: head.position.y, z: head.position.z, r: 1.3 },
      ...body.map((b) => ({ x: b.g.position.x, y: b.y, z: b.g.position.z, r: b.r + 0.3 }))];
    const part = parts.find((q) => q.y > -0.5 && Math.hypot(x - q.x, z - q.z) < q.r && y < q.y + q.r + 0.6);
    if (!part) return false;
    fx.shipHit(x, y, z, 0x3f8fa3);
    sfx.crack();
    hp = Math.max(0, hp - amount);
    if (hp === 0) {
      go('beaten');
      strip.visible = false;
      sfx.roar();
      sfx.sink();
      api.shake(0.8);
      loot.drop(s.x, s.z, 30);
      loot.crate(s.x + 3, s.z);
      loot.crate(s.x - 3, s.z);
    }
    return true;
  }

  function remove() {
    scene.remove(head, ripple, strip, ...body.map((b) => b.g));
    ripple.material.dispose();
    strip.material.dispose();
    bar.classList.remove('on');
  }

  return { update, hitAt, remove, beaten: () => phase === 'beaten' && phaseTime > 2.5 };
}

function mesh(geo, material, [x, y, z], [sx, sy, sz] = [1, 1, 1]) {
  const o = new THREE.Mesh(geo, material);
  o.position.set(x, y, z);
  o.scale.set(sx, sy, sz);
  return o;
}
