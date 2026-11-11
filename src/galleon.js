// The Ghost Galleon: the Abyss's boss, sailing the Drowned Bay with the Moon Lantern aboard.
// It fades in somewhere around the bay, sails a stretch, and fires broadsides (a red band on the water shows
// which side, then a fan of ghostly cannonballs). Then it fades away (cannonballs pass straight through)
// and comes back somewhere else. At half health it calls two ghost ships.
import * as THREE from 'three';
import { toon, flat } from './stage.js';
import { sfx } from './audio.js';

const L = 5, W = 1.9; // half length and half width of the hull
const HULL = (() => {
  const s = new THREE.Shape(); // seen from above: x is forward
  s.moveTo(L + 1, 0);
  s.quadraticCurveTo(L - 0.5, W, L - 2, W);
  s.lineTo(-L + 0.6, W);
  s.quadraticCurveTo(-L, W, -L, W - 0.6);
  s.lineTo(-L, -W + 0.6);
  s.quadraticCurveTo(-L, -W, -L + 0.6, -W);
  s.lineTo(L - 2, -W);
  s.quadraticCurveTo(L - 0.5, -W, L + 1, 0);
  const g = new THREE.ExtrudeGeometry(s, { depth: 1.5, bevelSize: 0.1, bevelThickness: 0.1, bevelSegments: 1, curveSegments: 10 });
  g.rotateX(-Math.PI / 2);
  g.translate(0, -0.4, 0);
  return g;
})();
const BOX = new THREE.BoxGeometry(1, 1, 1);
const MAST = new THREE.CylinderGeometry(0.15, 0.2, 1, 8).translate(0, 0.5, 0);
const BAND = new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2);
const BALL = new THREE.SphereGeometry(1, 10, 8);

const HP = 240;
const T = { appear: 1, sail: [6, 4.5], vanish: 1, gone: 1.4 }; // seconds; sail: calm / angry
const SAIL = { radius: 11, speed: 2.6 };
const BROADSIDE = { every: 2.6, warn: 0.9, reach: 14, fan: [-0.35, -0.2, -0.07, 0.07, 0.2, 0.35] };
const SEEN = 0.8; // how solid it looks when it's here

// scene: the group it is built in; the middle of its lair is that group's (0, 0).
// api: shoot(shots, dist), shake(amount), spawn(kind). loot: for the gold it drops.
export function createGalleon(scene, fx, loot, api) {
  const root = new THREE.Group(), body = new THREE.Group();
  root.add(body);
  scene.add(root);
  const mats = [];
  const see = (color) => { const m = toon(color, { transparent: true, opacity: 0 }); mats.push(m); return m; };
  const hullMat = see(0x5e8f86), trim = see(0xbfe9dc), sailMat = see(0xe4fff6), wood = see(0x4a6a64);
  const glow = new THREE.MeshBasicMaterial({ color: 0xb8ffe9, transparent: true, opacity: 0 });
  glow.userData.outlineParameters = { visible: false };
  mats.push(glow);

  body.add(mesh(HULL, hullMat, [0, 0, 0]));
  body.add(mesh(BOX, trim, [0, 0.95, W + 0.02], [2 * L - 1, 0.16, 0.08]), mesh(BOX, trim, [0, 0.95, -W - 0.02], [2 * L - 1, 0.16, 0.08]));
  body.add(mesh(BOX, hullMat, [-L + 1.3, 1.8, 0], [2.3, 1.5, 2 * W - 0.2])); // the stern castle
  for (const [x, h] of [[2.4, 6], [0, 7], [-2.2, 5.5]]) {
    body.add(mesh(MAST, wood, [x, 1.2, 0], [1, h, 1]));
    // Tattered sails: two strips with a gap.
    body.add(mesh(BOX, sailMat, [x, 1.2 + h * 0.62, 0.15], [0.1, h * 0.28, 2 * W]));
    body.add(mesh(BOX, sailMat, [x, 1.2 + h * 0.3, -0.2], [0.1, h * 0.18, 2 * W - 0.6]));
  }
  const lantern = mesh(BALL, glow, [-L + 1.3, 3, 0], [0.45, 0.45, 0.45]); // the Moon Lantern, on the stern
  body.add(lantern);
  const band = new THREE.Mesh(BAND, flat(0, 0xff4a3a));
  band.visible = false;
  scene.add(band);

  const bar = document.getElementById('boss');
  bar.querySelector('b').textContent = 'The Ghost Galleon';
  bar.querySelector('.pips').innerHTML = '';
  bar.classList.add('on');

  const s = { angle: Math.random() * 6.28, x: 0, z: 0, heading: 0, seen: 0, dir: 1 }; // dir: which way round the bay
  let phase = 'appear', phaseTime = 0, hp = HP, broadside = 1.5, warnSide = 0, called = false;

  const sideOf = (p) => Math.sign(-(p.x - s.x) * Math.sin(s.heading) + (p.z - s.z) * Math.cos(s.heading)) || 1;
  function relative(p) {
    const ux = Math.cos(s.heading), uz = Math.sin(s.heading), dx = p.x - s.x, dz = p.z - s.z;
    return { along: dx * ux + dz * uz, out: Math.abs(-dx * uz + dz * ux) };
  }

  // A fan of ghostly cannonballs out of one side.
  function fire(side, p) {
    const ux = Math.cos(s.heading), uz = Math.sin(s.heading), a0 = Math.atan2(ux * side, -uz * side);
    const x = s.x - uz * side * (W + 0.6), z = s.z + ux * side * (W + 0.6);
    api.shoot(BROADSIDE.fan.map((a) => ({ x, z, dx: Math.cos(a0 + a), dz: Math.sin(a0 + a) })), Math.hypot(p.x - s.x, p.z - s.z) * 0.5);
    api.shake(0.3);
  }

  function update(dt, t, p) {
    phaseTime += dt;
    const angry = hp < HP / 2;
    if (phase === 'appear' && phaseTime > T.appear) { phase = 'sail'; phaseTime = 0; }
    else if (phase === 'sail' && phaseTime > T.sail[angry ? 1 : 0] && !warnSide) { phase = 'vanish'; phaseTime = 0; sfx.wave(); }
    else if (phase === 'vanish' && phaseTime > T.vanish + T.gone) { // reappear somewhere else round the bay
      phase = 'appear';
      phaseTime = 0;
      s.angle += 2 + Math.random() * 2.3;
      if (Math.random() < 0.5) s.dir = -s.dir;
    }
    if (phase !== 'beaten') {
      s.angle += (s.dir * SAIL.speed / SAIL.radius) * dt;
      s.x = Math.cos(s.angle) * SAIL.radius;
      s.z = Math.sin(s.angle) * SAIL.radius;
      s.heading = s.angle + s.dir * Math.PI / 2;
    }
    const want = phase === 'appear' || phase === 'sail' || phase === 'beaten' ? SEEN : phase === 'vanish' ? 0.06 : 0;
    s.seen += (want - s.seen) * Math.min(1, dt * 3);
    mats.forEach((m) => { m.opacity = s.seen; });
    glow.opacity = s.seen * (0.7 + 0.3 * Math.sin(t * 3));
    root.position.set(s.x, 0, s.z);
    root.rotation.y = -s.heading;
    body.position.y = Math.sin(t * 1.4) * 0.08 + (phase === 'beaten' ? -phaseTime * phaseTime * 0.25 : 0);
    body.rotation.x = Math.sin(t * 1.1) * 0.03;

    if (phase === 'sail' && p.sinking < 0) {
      broadside -= dt;
      const rel = relative(p);
      if (!warnSide && broadside <= 0 && rel.out < BROADSIDE.reach && Math.abs(rel.along) < L + 4) {
        warnSide = sideOf(p);
        broadside = BROADSIDE.warn;
        sfx.sharkWarn();
      } else if (warnSide && broadside <= 0) {
        fire(warnSide, p);
        warnSide = 0;
        broadside = BROADSIDE.every;
      }
    } else if (phase !== 'sail') {
      warnSide = 0;
    }
    band.visible = warnSide !== 0;
    if (band.visible) {
      const ux = Math.cos(s.heading), uz = Math.sin(s.heading), out = (W + BROADSIDE.reach / 2) * warnSide;
      band.position.set(s.x - uz * out, 0.07, s.z + ux * out);
      band.rotation.y = -s.heading;
      band.scale.set(2 * L + 2, 1, BROADSIDE.reach);
      band.material.opacity = 0.25 + 0.15 * Math.sin(t * 16);
    }
    if (!called && angry) { // half beaten: it calls up two ghost ships
      called = true;
      sfx.roar();
      api.spawn('ghost');
      api.spawn('ghost');
    }
    // You can't sail through it while it's here.
    if (p.sinking < 0 && phase !== 'beaten' && s.seen > 0.4) {
      const ux = Math.cos(s.heading), uz = Math.sin(s.heading);
      const along = Math.max(-L, Math.min(L, (p.x - s.x) * ux + (p.z - s.z) * uz));
      const cx = s.x + ux * along, cz = s.z + uz * along, d = Math.hypot(p.x - cx, p.z - cz), min = W + 1;
      if (d < min && d > 0) { p.x = cx + ((p.x - cx) / d) * min; p.z = cz + ((p.z - cz) / d) * min; }
    }
    if (phase === 'beaten' && Math.random() < dt * 12) fx.bubble(s.x + (Math.random() - 0.5) * 8, s.z + (Math.random() - 0.5) * 8);
    bar.querySelector('i').style.width = (100 * hp) / HP + '%';
  }

  // A player's cannonball: it only lands while the galleon can be seen.
  function hitAt(x, y, z, amount) {
    if (phase === 'beaten' || s.seen < 0.5 || y > 3) return false;
    const ux = Math.cos(s.heading), uz = Math.sin(s.heading);
    const along = (x - s.x) * ux + (z - s.z) * uz, out = Math.abs(-(x - s.x) * uz + (z - s.z) * ux);
    if (Math.abs(along) > L + 1 || out > W + 0.9) return false;
    fx.shipHit(x, y, z, 0x5e8f86);
    sfx.crack();
    hp = Math.max(0, hp - amount);
    if (hp === 0) {
      phase = 'beaten';
      phaseTime = 0;
      band.visible = false;
      sfx.sink();
      sfx.roar();
      api.shake(0.8);
      loot.drop(s.x, s.z, 30);
      loot.crate(s.x + 3, s.z);
      loot.crate(s.x - 3, s.z);
    }
    return true;
  }

  function remove() {
    scene.remove(root, band);
    band.material.dispose();
    mats.forEach((m) => m.dispose());
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
