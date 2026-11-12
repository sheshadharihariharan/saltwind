// Every enemy kind and how it behaves. Sunk ones drop gold.
//   sloop:   chases you, turns side-on and fires its cannons.
//   gunboat: keeps its distance and lobs shells; a red circle shows where each will land.
//   turtle:  slow; circles you and drops floating mines behind it.
//   shark:   circles under the water, comes up to charge, then is tired for a moment.
//   jelly / puffer (Coral Reef): drifting stingers; a fish that puffs up and bursts spikes.
//   fireship (Storm Belt): a burning wreck that steers straight at you and explodes.
//   captain:  a big black-and-gold ship firing a fan of five cannonballs.
//   harpoon:  aims a yellow line, fires a harpoon, and tows you about on its rope.
//   eel:      storm eels come in pairs with lightning crackling between them.
//   raider (Frozen North): an ice-breaker with an iron prow; a red strip warns, then it rams you.
//   ghost (Abyss): a see-through pirate that fades away (cannonballs pass through) and back again to fire.
//   angler (Abyss): lurks under the water with only its glowing lure showing, then lunges up to bite.
//   tower / fortTower: the cannon tower of a pirate camp or a sea fort. Stands still and fires at you when close.
//   brother (Part Two): a Brotherhood of the Grey Flag sloop. Fights like a pirate sloop.
//   chief: a Brotherhood bounty captain (bounties.js), a big grey ship firing fans of cannonballs, with one trick (e.trick):
//            reinforce: whistles up two more Brotherhood sloops once it's half sunk.
//            fireships: sends a fire ship at you every so often.
//            ram:       fights like an ice-breaker (red strip, then a ram), and drops mines as it goes.
//            fade:      fades away like a ghost ship (cannonballs pass through) and back again.
import * as THREE from 'three';
import { createShip, wrap } from './ship.js';
import { createTurtle, createShark, createMines, createJelly, createPuffer, PUFF_REACH, createFlames, createEel, createAngler, createTower } from './creatures.js';
import { createKraken } from './kraken.js';
import { createCrab } from './crab.js';
import { createFlagship, BLACK_TIDE } from './flagship.js';
import { createSerpent } from './serpent.js';
import { createGalleon } from './galleon.js';
import { flat } from './stage.js';
import { SHELL_RADIUS } from './effects.js';
import { sfx } from './audio.js';
import { toon } from './stage.js';

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const SLOOP = { look: { hull: 0x5a3a2a, deck: 0x9c7a52, sail: 0xc4372c, stripe: 0x2a2e33, flag: 0x22272b }, stats: { maxSpeed: 5.2, turn: 1.8, reload: 2.4, hp: 30 } };
const GUNBOAT = { look: { hull: 0x3e4a57, deck: 0x8a8f99, sail: 0x5d6b7a, stripe: 0xffc93c, flag: 0xffc93c }, stats: { maxSpeed: 4.5, turn: 1.6, reload: 99, hp: 30 } };
const MORTAR = new THREE.CylinderGeometry(0.28, 0.36, 0.7, 10);
const MORTAR_MAT = toon(0x2a2e33);

const SIGHT = 24; // how close you must be before a sloop chases
const BROADSIDE = 9; // the distance sloops like to fight at
const RANGE = 12.5;
const DAMAGE = { shell: 12, ram: 10, mine: 15 };
// Shark timings in seconds: aiming (red strip showing), the charge, and resting after a bite or a miss.
const SHARK = { aim: 1.5, charge: 1.2, restBite: 3.5, restMiss: 3.2 };
const BLAST = 2.8; // a mine hurts everything this close
const CRATE_CHANCE = 0.35; // a sunk enemy leaves a repair crate this often (less as the seas get harder)
const THREAT = { hp: 1, crates: 0.5 }; // at full threat (0..1, see setThreat): this much more health, this much fewer crates
const LEGEND = 0.5; // a legendary boss takes only this much of each hit (so twice the health)

const STING = { damage: 5, slow: 1.5, reach: 1.5, every: 2 }; // a jellyfish: damage, seconds it slows you, how close, how often
const PUFF = { near: 4.5, swell: 1, damage: 10, rest: 2.5 }; // a pufferfish: puffs up when this close, for this long
const SAND_DRAG = 0.45; // ships on a sandbar only get this much of their speed

const FIRESHIP = { look: { hull: 0x3a2a20, deck: 0x5a4030, sail: 0xff8a3c, stripe: 0x2a1a10, flag: 0xff8a3c }, stats: { maxSpeed: 6, turn: 1.7, reload: 99, hp: 15 } };
const CAPTAIN = { look: { hull: 0x2e1d14, deck: 0xb08850, sail: 0x23262b, stripe: 0xffc93c, flag: 0xffc93c }, stats: { maxSpeed: 4.6, turn: 1.4, reload: 3, hp: 70, size: 1.35 } };
const BROTHER = { look: { hull: 0x3a3d42, deck: 0x8a8478, sail: 0x9aa0a6, stripe: 0x2a2e33, flag: 0xc9ccd0 }, stats: { maxSpeed: 5.3, turn: 1.8, reload: 2.4, hp: 34 } };
const CHIEF = { look: { hull: 0x26282c, deck: 0x6b6458, sail: 0x6d737a, stripe: 0xd9dde0, flag: 0xd9dde0 }, stats: { maxSpeed: 4.8, turn: 1.5, reload: 2.6, hp: 70, size: 1.35 } };
const HARPOONER = { look: { hull: 0x4a5a3a, deck: 0xa8a070, sail: 0xd9d0b0, stripe: 0x4a7a3a, flag: 0x4a7a3a }, stats: { maxSpeed: 5.8, turn: 2, reload: 99, hp: 25 } };
const FIRE = { near: 2.6, blast: 18, radius: 3.2 }; // a fire ship blows up this close, hurting everything within radius
const FAN = [-0.3, -0.15, 0, 0.15, 0.3]; // a captain's broadside: five balls spread out
const HARPOON = { aim: 1, speed: 22, range: 15, damage: 6, tow: 2.5, pull: 5, every: 5 }; // tow: seconds tied; pull: how hard
const ARC = { charge: 1.2, on: 3, rest: 2.5, damage: 8, apart: 7, every: 1 }; // storm eels' lightning, in seconds
const RAIDER = { look: { hull: 0x3d5a73, deck: 0xc9d6df, sail: 0xe8f1f5, stripe: 0x6fa8c8, flag: 0x6fa8c8 }, stats: { maxSpeed: 5, turn: 1.7, reload: 99, hp: 40 } };
const RAM_CHARGE = { aim: 1.2, charge: 1.3, rest: 2.8, damage: 14, push: 8, reach: 2.9 }; // a raider's ram, in seconds
const GHOST = { look: { hull: 0x8fd0bd, deck: 0xcfeee4, sail: 0xeafff8, stripe: 0x5fae98, flag: 0x5fae98 }, stats: { maxSpeed: 5.5, turn: 2, reload: 2.6, hp: 30 } };
const HAUNT = { show: [5, 7], fade: 2.6, seen: 0.75, unseen: 0.07, lantern: 0.3 }; // a ghost ship: seconds seen, seconds faded, opacity
const BITE = { near: 4.5, lunge: 0.6, up: 3, rest: 2, damage: 12 }; // an anglerfish's bite, in seconds
const TOWER = { reach: 17, every: 2.6, lead: 0.5 }; // a cannon tower fires this far, this often, aiming a little ahead
const PROW = new THREE.ConeGeometry(0.5, 1.4, 4).rotateZ(-Math.PI / 2);
const STRIP_GEO = new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2).translate(0.5, 0, 0);
const TRICK = { fireEvery: 9, fireMax: 2, mineEvery: 3.5 }; // bounty captains: seconds between fire ships (and how many at once), between mines
const ELITE = { hp: 3, size: 1.25, gold: 3 }; // a named enemy: three times as tough, a bit bigger, three times the gold
const SPEAR = new THREE.CylinderGeometry(0.05, 0.05, 1.6, 6).rotateZ(Math.PI / 2);
const ROPE = new THREE.CylinderGeometry(0.04, 0.04, 1, 4).translate(0, 0.5, 0);
const AIM = new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2).translate(0.5, 0, 0);
const up = new THREE.Vector3(0, 1, 0), span = new THREE.Vector3();

// Kinds that stand still: no wind, bumps or steering move them.
export const STILL = ['tower', 'fortTower'];

export const BOSSES = { kraken: createKraken, crab: createCrab, flagship: createFlagship, serpent: createSerpent, galleon: createGalleon,
  blacktide: (...args) => createFlagship(...args, BLACK_TIDE) };

// Gear effects on enemies.
const SLOW = 3; // seconds a chain shot slows an enemy, to half speed
const BURN = { time: 3, perSecond: 2 }; // a fire shot's burn
const RAM = 12; // damage when you sail into an enemy with ram spikes

// world: rocks. fx: effects. loot: gold. gear: the player's gear ids (a Set).
// api.shoot(shots, dist): a sloop fires cannonballs at the player.
// api.hurtPlayer(amount, x, y, z): something other than a cannonball hit the player.
// api.ink(), api.shake(amount): the Kraken's ink on the screen, and a camera shake.
// api.slowPlayer(seconds): a jellyfish sting. api.sunk(kind): an enemy was sunk. api.bounty(name, gold): a wanted pirate was.
// An enemy can be sent after another ship instead of the player (e.target: that ship's state, with hurtBy(amount)).
export function createEnemies(scene, world, fx, loot, api, gear) {
  const list = [];
  let boss = null; // the Kraken or the Crab King, while it's being fought
  const bars = document.getElementById('bars');
  const mines = createMines(scene, fx, (x, z) => blast(x, z, DAMAGE.mine, BLAST));
  let player = { x: 0, z: 0 }, now = 0, threat = 0, legend = false;

  // An explosion: hurts the player and every enemy within `radius`.
  function blast(x, z, amount, radius) {
    if (Math.hypot(player.x - x, player.z - z) < radius) api.hurtPlayer(amount, player.x, 1, player.z);
    for (const e of [...list]) {
      const s = e.body.state;
      if (Math.hypot(s.x - x, s.z - z) < radius) damage(e, amount, s.x, 1, s.z);
    }
  }

  const KINDS = {
    sloop: { gold: 5, barY: 3.3, hitColor: 0x8a5a33, make: () => createShip(scene, SLOOP.look, SLOOP.stats), think: sloop },
    gunboat: { gold: 6, barY: 3.3, hitColor: 0x8a5a33, make: makeGunboat, think: gunboat },
    turtle: { gold: 7, barY: 2.4, hitColor: 0x5c7a35, make: () => createTurtle(scene), think: turtle },
    shark: { gold: 4, barY: 1.9, hitColor: 0x6d8796, make: () => createShark(scene), think: shark },
    jelly: { gold: 1, barY: 1.6, hitColor: 0xff8fc8, make: () => createJelly(scene), think: jelly },
    puffer: { gold: 3, barY: 2.2, hitColor: 0xf2c14e, make: () => createPuffer(scene), think: puffer },
    fireship: { gold: 3, barY: 3.3, hitColor: 0x3a2a20, make: makeFireship, think: fireship },
    captain: { gold: 12, barY: 4.4, hitColor: 0x8a5a33, make: () => createShip(scene, CAPTAIN.look, CAPTAIN.stats), think: sloop },
    harpoon: { gold: 5, barY: 3.3, hitColor: 0x8a5a33, make: makeHarpooner, think: harpoon },
    eel: { gold: 3, barY: 2.2, hitColor: 0x2f4f5f, make: () => createEel(scene), think: eel },
    raider: { gold: 7, barY: 3.3, hitColor: 0x8a5a33, make: makeRaider, think: raider },
    ghost: { gold: 6, barY: 3.3, hitColor: 0x8fd0bd, make: makeGhost, think: ghost },
    angler: { gold: 5, barY: 2.4, hitColor: 0x3a3550, make: () => createAngler(scene), think: angler },
    tower: { gold: 8, barY: 4.8, hitColor: 0x8a5a33, make: () => createTower(scene, false), think: tower },
    fortTower: { gold: 12, barY: 5, hitColor: 0x9a948b, make: () => createTower(scene, true), think: tower },
    brother: { gold: 6, barY: 3.3, hitColor: 0x8a5a33, make: () => createShip(scene, BROTHER.look, BROTHER.stats), think: sloop },
    chief: { gold: 15, barY: 4.6, hitColor: 0x8a5a33, make: makeChief, think: chief },
  };

  // An ice-breaker: an iron prow on the bow and a red strip on the water before it rams.
  function makeRaider() {
    const ship = createShip(scene, RAIDER.look, RAIDER.stats);
    const prow = new THREE.Mesh(PROW, MORTAR_MAT);
    prow.position.set(2.1, 0.35, 0);
    ship.body.add(prow);
    const strip = new THREE.Mesh(STRIP_GEO, flat(0, 0xff4a3a));
    strip.scale.set(13, 1, 2);
    strip.position.set(1, 0.06, 0);
    strip.visible = false;
    ship.root.add(strip);
    ship.warn = (on, t = 0) => { strip.visible = on; strip.material.opacity = 0.4 + 0.15 * Math.sin(t * 18); };
    ship.onSink = () => { strip.visible = false; };
    const remove = ship.remove;
    ship.remove = () => { remove(); strip.material.dispose(); };
    return ship;
  }

  // A ghost ship: its own see-through copies of the ship colours, so it can fade in and out.
  function makeGhost() {
    const ship = createShip(scene, GHOST.look, GHOST.stats);
    const mats = [];
    ship.body.traverse((o) => {
      if (!o.isMesh) return;
      o.material = o.material.clone();
      o.material.transparent = true;
      mats.push(o.material);
    });
    ship.fade = (opacity) => mats.forEach((m) => { m.opacity = opacity; });
    const remove = ship.remove;
    ship.remove = () => { remove(); mats.forEach((m) => m.dispose()); };
    return ship;
  }

  // A bounty captain's ship. Ready for any trick: an iron prow and a ram strip (shown only for a rammer),
  // and its own see-through colours so it can fade.
  function makeChief() {
    const ship = createShip(scene, CHIEF.look, CHIEF.stats);
    const prow = new THREE.Mesh(PROW, MORTAR_MAT);
    prow.position.set(2.1, 0.35, 0);
    prow.visible = false;
    ship.body.add(prow);
    ship.prow = prow;
    const strip = new THREE.Mesh(STRIP_GEO, flat(0, 0xff4a3a));
    strip.scale.set(13, 1, 2);
    strip.position.set(1, 0.06, 0);
    strip.visible = false;
    ship.root.add(strip);
    ship.warn = (on, t = 0) => { strip.visible = on; strip.material.opacity = 0.4 + 0.15 * Math.sin(t * 18); };
    const mats = [];
    ship.body.traverse((o) => {
      if (!o.isMesh || o === prow) return;
      o.material = o.material.clone();
      o.material.transparent = true;
      mats.push(o.material);
    });
    ship.fade = (opacity) => mats.forEach((m) => { m.opacity = opacity; });
    ship.onSink = () => { strip.visible = false; ship.fade(1); };
    const remove = ship.remove;
    ship.remove = () => { remove(); strip.material.dispose(); mats.forEach((m) => m.dispose()); };
    return ship;
  }

  // A burning wreck: flames on deck.
  function makeFireship() {
    const ship = createShip(scene, FIRESHIP.look, FIRESHIP.stats);
    const flames = createFlames();
    flames.position.y = 0.3;
    ship.body.add(flames);
    ship.flames = flames;
    return ship;
  }

  // A light boat with a harpoon gun: its aim line, the harpoon and its rope live in the scene.
  function makeHarpooner() {
    const ship = createShip(scene, HARPOONER.look, HARPOONER.stats);
    const aim = new THREE.Mesh(AIM, flat(0, 0xffd23a));
    aim.scale.set(HARPOON.range, 1, 0.5);
    const spear = new THREE.Mesh(SPEAR, MORTAR_MAT), rope = new THREE.Mesh(ROPE, toon(0x8a6a40));
    aim.visible = spear.visible = rope.visible = false;
    scene.add(aim, spear, rope);
    ship.gun = { aim, spear, rope };
    ship.onSink = () => { aim.visible = spear.visible = rope.visible = false; };
    const remove = ship.remove;
    ship.remove = () => { remove(); scene.remove(aim, spear, rope); aim.material.dispose(); };
    return ship;
  }

  function makeGunboat() {
    const ship = createShip(scene, GUNBOAT.look, GUNBOAT.stats);
    const mortar = new THREE.Mesh(MORTAR, MORTAR_MAT);
    mortar.position.set(1, 0.65, 0);
    mortar.rotation.z = -0.5; // tipped forward, ready to lob
    ship.body.add(mortar);
    return ship;
  }

  // A new enemy in open water between `near` and `far` away from p (a ship's state), facing it.
  // 'jellies' is a swarm of four jellyfish, 'eels' a pair. Returns the enemies placed, or null if there was no room.
  // elite: a name; the enemy is three times as tough and a little bigger.
  function spawn(kind, p, near = 17, far = 22, elite = null) {
    for (let tries = 0; tries < 40; tries++) {
      const a = Math.random() * Math.PI * 2, d = near + Math.random() * (far - near);
      const x = p.x + Math.cos(a) * d, z = p.z + Math.sin(a) * d, face = a + Math.PI;
      if (!world.clearAt(x, z, 2.5) || list.some((e) => Math.hypot(e.body.state.x - x, e.body.state.z - z) < 6)) continue;
      let placed;
      if (kind === 'jellies') placed = [0, 1, 2, 3].map((i) => place('jelly', x + Math.cos(i * 1.57) * 1.8, z + Math.sin(i * 1.57) * 1.8, face));
      else if (kind === 'eels') { // a pair: the leader handles the lightning between them
        const a = place('eel', x, z, face), b = place('eel', x + Math.cos(face + 1.57) * 3, z + Math.sin(face + 1.57) * 3, face);
        Object.assign(a, { lead: true, partner: b, angle: Math.random() * 6.28, mode: 'rest' });
        b.partner = a;
        placed = [a, b];
      } else placed = [place(kind, x, z, face)];
      if (elite) {
        for (const e of placed) {
          e.elite = elite;
          e.body.state.hp = e.body.state.maxHp = e.body.state.maxHp * ELITE.hp;
          e.body.root.scale.setScalar(ELITE.size);
        }
      }
      fx.splash(x, z, 1.4);
      return placed;
    }
    return null;
  }

  function place(kind, x, z, heading) {
    const body = KINDS[kind].make();
    body.reset(x, z, heading);
    body.state.hp = body.state.maxHp = body.state.maxHp * (1 + THREAT.hp * threat); // tougher seas
    if (kind === 'shark' || kind === 'angler') body.state.under = true;
    const bar = document.createElement('div');
    bar.className = 'ebar';
    bar.innerHTML = '<i></i>';
    bars.append(bar);
    const e = { kind, body, bar, roam: Math.random() < 0.5 ? 1 : -1, roamTimer: 3, aim: 0.4, timer: 2 + Math.random() * 2, mode: 'circle', slow: 0, burn: 0, rammed: 0 };
    list.push(e);
    return e;
  }

  function drop(e) {
    e.body.remove();
    e.bar.remove();
    list.splice(list.indexOf(e), 1);
  }

  // Hurt an enemy. Sinks it and drops its gold when that was the last of its health.
  // quiet: no hit flash or crack (a burn ticking down).
  function damage(e, amount, x, y, z, quiet = false) {
    const s = e.body.state;
    if (s.sinking >= 0) return;
    if (!quiet) {
      if (e.kind === 'shark') fx.splash(x, z, 0.8);
      fx.shipHit(x, y, z, KINDS[e.kind].hitColor);
      sfx.crack();
    }
    if (e.body.hurt(amount)) {
      e.sunk = true;
      api.sunk(e.kind, s.x, s.z);
      if (e.kind === 'jelly') sfx.plop();
      else sfx.sink();
      e.body.onSink?.();
      if (e.kind === 'fireship') explode(e);
      const g = KINDS[e.kind].gold * (e.elite ? ELITE.gold : 1);
      loot.drop(s.x, s.z, g - 1 + Math.floor(Math.random() * 3));
      if (e.bounty) { // a wanted pirate: the bounty spills out too
        loot.drop(s.x, s.z, e.bounty / 5);
        api.bounty?.(e.elite, e.bounty);
      }
      // A repair crate: sometimes, and always from the last enemy left afloat if your hull is below half.
      if (Math.random() < CRATE_CHANCE * (1 - THREAT.crates * threat) || (alive() === 0 && player.hp < player.maxHp / 2)) loot.crate(s.x, s.z);
      if (e.kind === 'shark') e.body.warn(false);
    }
  }

  // ---------- how each kind thinks: returns [heading it wants, throttle] ----------

  function sloop(e, dt, p, dist, toP) {
    const s = e.body.state;
    if (p.sinking >= 0 || dist >= SIGHT) return roam(e, dt, toP);
    let want, throttle;
    if (dist > BROADSIDE + 3) {
      want = toP; // chase
      throttle = 1;
    } else { // turn side-on, whichever way is quicker
      const a = toP + Math.PI / 2, b = toP - Math.PI / 2;
      want = Math.abs(wrap(a - s.heading)) < Math.abs(wrap(b - s.heading)) ? a : b;
      if (dist < BROADSIDE - 3) want += (wrap(want - toP) > 0 ? 0.5 : -0.5); // edge away when too close
      throttle = 0.5;
    }
    // Fire when the player sits in a side's line of fire, after a short aim.
    for (const [side, off] of [['left', -Math.PI / 2], ['right', Math.PI / 2]]) {
      if (dist < RANGE && Math.abs(wrap(s.heading + off - toP)) < 0.35 && e.body.ready(side) >= 1) {
        e.aim -= dt;
        if (e.aim <= 0) {
          const shots = e.body.fire(side);
          if (shots) api.shoot(e.kind === 'captain' || e.kind === 'chief' ? fan(s, shots[0]) : shots, dist);
          e.aim = 0.4;
        }
      }
    }
    return [want, throttle];
  }

  // A bounty captain: fights like a pirate captain, plus its trick.
  function chief(e, dt, p, dist, toP) {
    const s = e.body.state;
    if (e.trick === 'reinforce' && !e.called && s.hp < s.maxHp / 2) {
      e.called = true;
      const help = [spawn('brother', p, 16, 22), spawn('brother', p, 16, 22)].filter(Boolean);
      if (help.length) api.say?.(`${e.elite} whistles for help!`, 'More grey flags join the fight');
    }
    if (e.trick === 'fireships' && p.sinking < 0 && dist < 30) {
      e.fire = (e.fire ?? 3) - dt;
      if (e.fire <= 0 && list.filter((f) => f.kind === 'fireship' && !f.sunk).length < TRICK.fireMax) {
        e.fire = TRICK.fireEvery;
        if (spawn('fireship', p, 16, 22) && !e.warned) { e.warned = true; api.say?.(`${e.elite} lights a fire ship!`, 'Sink it from afar: it blows up'); }
      }
    }
    if (e.trick === 'ram') {
      e.body.prow.visible = true;
      e.drop = (e.drop ?? TRICK.mineEvery) - dt;
      if (e.drop <= 0 && dist < 24 && p.sinking < 0 && mines.count() < 10) {
        e.drop = TRICK.mineEvery;
        mines.drop(s.x - Math.cos(s.heading) * 2.4, s.z - Math.sin(s.heading) * 2.4);
      }
      return raider(e, dt, p, dist, toP);
    }
    if (e.trick === 'fade') return ghost(e, dt, p, dist, toP);
    return sloop(e, dt, p, dist, toP);
  }

  // Lazy curves that slowly drift toward the player.
  function roam(e, dt, toP) {
    e.roamTimer -= dt;
    if (e.roamTimer <= 0) { e.roam = -e.roam; e.roamTimer = 3 + Math.random() * 4; }
    return [toP + e.roam * 1.1, 0.45];
  }

  // Stays 13 to 19 away and lobs a shell every few seconds at where you are heading.
  function gunboat(e, dt, p, dist, toP) {
    const s = e.body.state;
    e.timer -= dt;
    if (e.timer <= 0 && p.sinking < 0 && dist < 24) {
      e.timer = 3.4 + Math.random();
      const flight = 1.8;
      const tx = p.x + p.vx * flight * 0.6 + (Math.random() - 0.5) * 2.5;
      const tz = p.z + p.vz * flight * 0.6 + (Math.random() - 0.5) * 2.5;
      fx.lob(s.x, s.z, tx, tz, flight, (x, z) => {
        if (p.sinking < 0 && Math.hypot(p.x - x, p.z - z) < SHELL_RADIUS + 0.6) api.hurtPlayer(DAMAGE.shell, p.x, 1, p.z);
      });
      sfx.mortar(flight);
    }
    if (p.sinking >= 0) return roam(e, dt, toP);
    if (dist > 19) return [toP, 0.8];
    if (dist < 13) return [toP + Math.PI + e.roam * 0.5, 1]; // back off
    return [toP + e.roam * Math.PI / 2, 0.35]; // drift sideways
  }

  // Circles about 9 away from you, leaving a mine every few seconds.
  function turtle(e, dt, p, dist, toP) {
    const s = e.body.state;
    e.timer -= dt;
    if (e.timer <= 0 && dist < 22 && p.sinking < 0 && mines.count() < 10) {
      e.timer = 2.8;
      mines.drop(s.x - Math.cos(s.heading) * 1.8, s.z - Math.sin(s.heading) * 1.8);
    }
    return [toP + e.roam * (Math.PI / 2 - clamp((dist - 9) * 0.12, -0.8, 0.8)), 1];
  }

  // Circles under the water, then comes up, aims (red strip), charges, and is tired after.
  function shark(e, dt, p, dist, toP) {
    const s = e.body.state;
    e.timer -= dt;
    if (e.mode === 'circle') {
      if (e.timer <= 0 && dist < 13 && p.sinking < 0) {
        e.mode = 'aim';
        e.timer = SHARK.aim;
        s.under = false;
        e.body.warn(true);
        sfx.sharkWarn();
      }
      return [toP + e.roam * (Math.PI / 2 - clamp((dist - 7) * 0.15, -0.9, 0.9)), 1];
    }
    if (e.mode === 'aim') {
      if (e.timer <= 0) {
        e.mode = 'charge';
        e.timer = SHARK.charge;
        e.dir = s.heading;
        e.body.warn(false);
        sfx.sharkGo();
      }
      return [Math.atan2(p.z + p.vz * 0.3 - s.z, p.x + p.vx * 0.3 - s.x), 0.05];
    }
    if (e.mode === 'charge') {
      if (p.sinking < 0 && dist < 2.7) { // bite
        api.hurtPlayer(DAMAGE.ram, p.x, 1, p.z);
        sfx.bite();
        p.vx += Math.cos(e.dir) * 7;
        p.vz += Math.sin(e.dir) * 7;
        s.vx *= -0.3;
        s.vz *= -0.3;
        e.mode = 'tired';
        e.timer = SHARK.restBite;
      } else if (e.timer <= 0) {
        e.mode = 'tired';
        e.timer = SHARK.restMiss;
      }
      return [e.dir, 1.75];
    }
    if (e.timer <= 0) { // done resting: back under
      e.mode = 'circle';
      e.timer = 4 + Math.random() * 3;
      s.under = true;
    }
    return [s.heading + 0.3 * e.roam, 0.1];
  }

  // A captain's broadside: five balls fanning out from the middle of its side.
  function fan(s, shot) {
    const a0 = Math.atan2(shot.dz, shot.dx), x = s.x + shot.dx * 1.2, z = s.z + shot.dz * 1.2;
    return FAN.map((a) => ({ x, z, dx: Math.cos(a0 + a), dz: Math.sin(a0 + a) }));
  }

  // Steers straight at you and blows up alongside. Sinking it sets it off too, so do it from afar.
  function fireship(e, dt, p, dist, toP) {
    const s = e.body.state;
    e.body.flames.userData.flicker(now);
    if (Math.random() < dt * 5) fx.puff(s.x + (Math.random() - 0.5), 1.8, s.z + (Math.random() - 0.5), 0.8, Math.random() < 0.5 ? 0x5a6066 : 0xff9a3c);
    if (dist < 12 && Math.random() < dt * 1.5) sfx.crackle();
    if (p.sinking < 0 && dist < FIRE.near) {
      e.body.hurt(999);
      explode(e);
      return [s.heading, 0];
    }
    return p.sinking >= 0 ? roam(e, dt, toP) : [toP, 1];
  }

  function explode(e) {
    const s = e.body.state;
    e.body.flames.visible = false;
    fx.boom(s.x, s.z);
    blast(s.x, s.z, FIRE.blast, FIRE.radius);
  }

  // Keeps 8 to 12 away; aims (a yellow line), fires a harpoon, and if it hits, tows you about on the rope.
  function harpoon(e, dt, p, dist, toP) {
    const s = e.body.state, { aim, spear, rope } = e.body.gun;
    e.timer -= dt;
    if (e.mode === 'circle') {
      if (e.timer <= 0 && dist < 14 && p.sinking < 0) {
        e.mode = 'aim';
        e.timer = HARPOON.aim;
        aim.visible = true;
        sfx.reloaded();
      }
      if (p.sinking >= 0) return roam(e, dt, toP);
      if (dist > 12) return [toP, 1];
      if (dist < 8) return [toP + Math.PI + e.roam * 0.4, 1];
      return [toP + e.roam * Math.PI / 2, 0.6];
    }
    if (e.mode === 'aim') { // the yellow line follows you until it fires
      e.dir = toP;
      aim.position.set(s.x, 0.08, s.z);
      aim.rotation.y = -toP;
      aim.material.opacity = 0.35 + 0.25 * Math.sin(now * 20);
      if (e.timer <= 0) {
        e.mode = 'fly';
        e.fly = 1;
        aim.visible = false;
        spear.visible = rope.visible = true;
        sfx.twang();
      }
      return [toP, 0.1];
    }
    if (e.mode === 'fly') {
      e.fly += dt * HARPOON.speed;
      const x = s.x + Math.cos(e.dir) * e.fly, z = s.z + Math.sin(e.dir) * e.fly;
      spear.position.set(x, 0.9, z);
      spear.rotation.y = -e.dir;
      tie(rope, s.x, s.z, x, z);
      if (api.touchesPlayer(x, 0.8, z)) {
        api.hurtPlayer(HARPOON.damage, x, 0.8, z);
        e.mode = 'tow';
        e.timer = HARPOON.tow;
      } else if (e.fly > HARPOON.range || world.solidAt(x, 0.8, z)) {
        e.mode = 'circle';
        e.timer = HARPOON.every;
        spear.visible = rope.visible = false;
      }
      return [e.dir, 0.1];
    }
    // Towing: the boat pulls away and drags your ship after it.
    spear.position.set(p.x, 0.9, p.z);
    tie(rope, s.x, s.z, p.x, p.z);
    if (dist > 4) {
      p.vx -= ((p.x - s.x) / dist) * HARPOON.pull * dt;
      p.vz -= ((p.z - s.z) / dist) * HARPOON.pull * dt;
    }
    if (e.timer <= 0 || p.sinking >= 0) {
      e.mode = 'circle';
      e.timer = HARPOON.every;
      spear.visible = rope.visible = false;
      sfx.snap();
    }
    return [toP + Math.PI, 1];
  }

  // Stretch a rope between two points on the water.
  function tie(rope, ax, az, bx, bz) {
    span.set(bx - ax, 0, bz - az);
    rope.position.set(ax, 0.9, az);
    rope.scale.y = span.length();
    rope.quaternion.setFromUnitVectors(up, span.normalize());
  }

  // Storm eels swim to either side of where you're heading, then lightning crackles between them:
  // a flicker first, then a full bolt. Sink either eel and the lightning stops.
  function eel(e, dt, p, dist, toP) {
    const s = e.body.state;
    const mate = e.partner && list.includes(e.partner) && e.partner.body.state.sinking < 0 ? e.partner : null;
    const lead = e.lead || !mate ? e : e.partner;
    const still = mate && (lead.mode === 'charge' || lead.mode === 'on'); // both hold still while the bolt is up
    if (lead === e && !still) e.angle = (e.angle ?? Math.random() * 6.28) + dt * 0.3;
    const side = e === lead ? 1 : -1, cx = p.x + p.vx * 0.8, cz = p.z + p.vz * 0.8;
    const tx = cx + Math.cos(lead.angle) * (ARC.apart / 2) * side, tz = cz + Math.sin(lead.angle) * (ARC.apart / 2) * side;
    let throttle = still ? 0 : Math.min(1, Math.hypot(tx - s.x, tz - s.z) / 3);
    if (e.lead) {
      const m = mate?.body.state;
      if (!mate || p.sinking >= 0) {
        e.body.arc(0, 0, 0, 0, 'off');
      } else {
        e.timer -= dt;
        e.sting = (e.sting ?? 0) - dt;
        if (e.timer <= 0) {
          e.mode = { rest: 'charge', charge: 'on', on: 'rest' }[e.mode] ?? 'rest';
          e.timer = ARC[e.mode] ?? ARC.rest;
          if (e.mode === 'charge') sfx.charge();
        }
        e.body.arc(s.x, s.z, m.x, m.z, { rest: 'off', charge: 'charge', on: 'on' }[e.mode] ?? 'off', now, dt);
        if (e.mode === 'on') {
          if (Math.random() < dt * 6) sfx.zap();
          // Is the player across the bolt?
          const dx = m.x - s.x, dz = m.z - s.z, len = Math.hypot(dx, dz) || 1;
          const along = clamp(((p.x - s.x) * dx + (p.z - s.z) * dz) / len, 0, len);
          if (e.sting <= 0 && Math.hypot(p.x - s.x - (dx / len) * along, p.z - s.z - (dz / len) * along) < 1.1) {
            e.sting = ARC.every;
            api.hurtPlayer(ARC.damage, p.x, 1, p.z);
            api.slowPlayer(1);
          }
        }
      }
    }
    return [Math.atan2(tz - s.z, tx - s.x), throttle];
  }

  // Drifts toward you, wobbling; stings and slows you if you sail through it.
  function jelly(e, dt, p, dist, toP) {
    e.timer -= dt;
    if (dist < STING.reach && e.timer <= 0 && p.sinking < 0) {
      e.timer = STING.every;
      api.hurtPlayer(STING.damage, p.x, 1, p.z);
      api.slowPlayer(STING.slow);
      sfx.zap();
      const s = e.body.state; // bounces back off the hull
      s.vx -= Math.cos(toP) * 3;
      s.vz -= Math.sin(toP) * 3;
    }
    return [toP + Math.sin(e.roamTimer += dt) * 0.8, 0.8];
  }

  // Swims at you; close up it puffs into a spiky ball, then bursts its spikes out. Then it rests.
  function puffer(e, dt, p, dist, toP) {
    const b = e.body;
    e.timer -= dt;
    if (e.mode === 'circle') { // swimming at you
      b.puff = 0;
      if (dist < PUFF.near && p.sinking < 0) { e.mode = 'swell'; e.timer = PUFF.swell; sfx.inflate(); }
      return [toP, 1];
    }
    if (e.mode === 'swell') {
      b.puff = 1;
      if (e.timer <= 0) {
        const s = b.state;
        fx.shipHit(s.x, 1, s.z, 0xc98a2c);
        fx.splash(s.x, s.z, 1.6);
        sfx.spikes();
        if (p.sinking < 0 && Math.hypot(p.x - s.x, p.z - s.z) < PUFF_REACH + 0.6) api.hurtPlayer(PUFF.damage, p.x, 1, p.z);
        e.mode = 'rest';
        e.timer = PUFF.rest;
      }
      return [toP, 0];
    }
    b.puff = 0; // resting: drifts away a little
    if (e.timer <= 0) e.mode = 'circle';
    return [toP + Math.PI, 0.3];
  }

  // Circles you 9 to 13 away; then a red strip, then a charge along it. A hit rams you hard; then it rests.
  function raider(e, dt, p, dist, toP) {
    const s = e.body.state;
    e.timer -= dt;
    if (e.mode === 'circle') {
      e.body.warn(false);
      if (e.timer <= 0 && dist < 15 && p.sinking < 0) { e.mode = 'aim'; e.timer = RAM_CHARGE.aim; sfx.sharkWarn(); }
      if (p.sinking >= 0 || dist > 22) return roam(e, dt, toP);
      if (dist > 13) return [toP, 1];
      return [toP + e.roam * (Math.PI / 2 - clamp((dist - 10) * 0.15, -0.8, 0.8)), 0.8];
    }
    if (e.mode === 'aim') {
      e.body.warn(true, now);
      if (e.timer <= 0) { e.mode = 'charge'; e.timer = RAM_CHARGE.charge; e.dir = s.heading; e.body.warn(false); sfx.sharkGo(); }
      return [Math.atan2(p.z + p.vz * 0.4 - s.z, p.x + p.vx * 0.4 - s.x), 0.1];
    }
    if (e.mode === 'charge') {
      if (p.sinking < 0 && dist < RAM_CHARGE.reach) {
        if (p.hurtBy) p.hurtBy(RAM_CHARGE.damage);
        else api.hurtPlayer(RAM_CHARGE.damage * (gear.has('plow') ? 0.5 : 1), p.x, 1, p.z); // the ice-plow takes half
        sfx.bump();
        api.shake(0.5);
        p.vx += Math.cos(e.dir) * RAM_CHARGE.push;
        p.vz += Math.sin(e.dir) * RAM_CHARGE.push;
        s.vx *= -0.2;
        s.vz *= -0.2;
        e.mode = 'rest';
        e.timer = RAM_CHARGE.rest;
      } else if (e.timer <= 0) {
        e.mode = 'rest';
        e.timer = RAM_CHARGE.rest;
      }
      return [e.dir, 1.9];
    }
    if (e.timer <= 0) { e.mode = 'circle'; e.timer = 2 + Math.random() * 2; }
    return [s.heading + 0.3 * e.roam, 0.2];
  }

  // Seen: fights like a pirate sloop. Then it fades away (cannonballs pass through), slips round you,
  // and comes back somewhere else.
  function ghost(e, dt, p, dist, toP) {
    e.timer -= dt;
    if (e.hidden === undefined) { e.hidden = false; e.seen = 0; e.timer = HAUNT.show[0] + Math.random() * (HAUNT.show[1] - HAUNT.show[0]); }
    const unseen = gear.has('lantern') ? HAUNT.lantern : HAUNT.unseen; // the abyssal lantern shows faded ghosts
    e.seen += ((e.hidden ? unseen : HAUNT.seen) - e.seen) * Math.min(1, dt * 3);
    e.body.fade(e.seen);
    if (e.timer <= 0) {
      e.hidden = !e.hidden;
      e.timer = e.hidden ? HAUNT.fade : HAUNT.show[0] + Math.random() * (HAUNT.show[1] - HAUNT.show[0]);
    }
    if (e.hidden) return [toP + e.roam * 1.4, 1.3]; // slip round to another side
    return sloop(e, dt, p, dist, toP);
  }

  // Creeps up under the water, lure glowing; close enough, it lunges up and bites, then stays up a moment.
  function angler(e, dt, p, dist, toP) {
    const s = e.body.state;
    e.timer -= dt;
    if (e.mode === 'circle') { // lurking
      s.under = true;
      if (e.timer <= 0 && dist < BITE.near && p.sinking < 0) {
        e.mode = 'lunge';
        e.timer = BITE.lunge;
        s.under = false;
        fx.splash(s.x, s.z, 1.4);
        sfx.splashBig();
      }
      return p.sinking >= 0 ? roam(e, dt, toP) : [toP, dist > 8 ? 0.9 : 0.45];
    }
    if (e.mode === 'lunge') {
      if (p.sinking < 0 && dist < 2.6 && !e.bit) {
        e.bit = true;
        api.hurtPlayer(BITE.damage, p.x, 1, p.z);
        sfx.bite();
      }
      if (e.timer <= 0) { e.mode = 'up'; e.timer = BITE.up; e.bit = false; }
      return [toP, 2.2];
    }
    if (e.timer <= 0) { e.mode = 'circle'; e.timer = BITE.rest; s.under = true; } // 'up': easy to hit for a moment
    return [toP + Math.PI, 0.25];
  }

  // Turns to follow you; fires a cannonball when you're in reach.
  function tower(e, dt, p, dist, toP) {
    const s = e.body.state;
    e.timer -= dt;
    if (e.timer <= 0 && dist < TOWER.reach && p.sinking < 0) {
      e.timer = TOWER.every;
      const tx = p.x + p.vx * TOWER.lead, tz = p.z + p.vz * TOWER.lead, d = Math.hypot(tx - s.x, tz - s.z) || 1;
      const dx = (tx - s.x) / d, dz = (tz - s.z) / d;
      api.shoot([{ x: s.x + dx * 1.5, z: s.z + dz * 1.5, dx, dz }], dist);
    }
    return [toP, 0];
  }

  // p: the player's ship state.
  function update(dt, t, p, camera) {
    player = p;
    now = t;
    for (const e of [...list]) {
      const s = e.body.state;
      if (s.sinking >= 0) {
        e.body.update(dt, t);
        if (Math.random() < dt * 8) fx.bubble(s.x, s.z);
        if (s.sinking > 3) drop(e);
        continue;
      }
      const tgt = e.target && e.target.sinking < 0 ? e.target : p; // the player, or the ship it was sent after
      const dx = tgt.x - s.x, dz = tgt.z - s.z, dist = Math.hypot(dx, dz), toP = Math.atan2(dz, dx);
      let [want, throttle] = KINDS[e.kind].think(e, dt, tgt, dist, toP);
      // Gear effects: slowed by chain shot, burning from fire shot.
      e.rammed -= dt;
      if (e.slow > 0) { e.slow -= dt; throttle *= 0.5; }
      if (e.kind !== 'jelly' && world.sandAt(s.x, s.z)) throttle *= SAND_DRAG;
      if (e.burn > 0) {
        e.burn -= dt;
        if (Math.random() < dt * 6) fx.puff(s.x + (Math.random() - 0.5) * 1.5, 1, s.z + (Math.random() - 0.5) * 1.5, 0.7, 0xff9a3c);
        damage(e, BURN.perSecond * dt, s.x, 1, s.z, true);
        if (s.sinking >= 0) continue;
      }
      // Steer around rocks a few lengths ahead (a charging shark doesn't look).
      const still = STILL.includes(e.kind);
      if (!still && e.mode !== 'charge' && !world.clearAt(s.x + Math.cos(want) * 4, s.z + Math.sin(want) * 4, 1)) want += 1.3 * e.roam;
      e.body.update(dt, t, want, throttle);
      if (!still) world.collide(s, e.kind === 'turtle' ? 1.3 : 1);
    }
    mines.update(dt, t, p);
    boss?.update(dt, t, boss.local);
    separate(p);

    // Health bars float above enemies that have been hit.
    for (const e of list) {
      const s = e.body.state;
      const show = s.hp < s.maxHp && s.sinking < 0;
      e.bar.style.display = show ? '' : 'none';
      if (!show) continue;
      const v = e.body.root.position.clone().setY(KINDS[e.kind].barY).project(camera);
      e.bar.style.transform = `translate(${((v.x + 1) / 2) * innerWidth}px, ${((1 - v.y) / 2) * innerHeight}px) translate(-50%, -50%)`;
      e.bar.firstChild.style.width = (100 * s.hp) / s.maxHp + '%';
    }
  }

  // Ships and creatures push each other apart instead of overlapping.
  // With ram spikes, sailing hard into an enemy hurts it.
  function separate(p) {
    // Jellyfish are soft and eels swim underneath, so ships pass through them.
    const all = [p, ...list.filter((e) => e.body.state.sinking < 0 && e.kind !== 'jelly' && e.kind !== 'eel')];
    const fixed = (a) => a !== p && STILL.includes(a.kind); // towers don't get pushed
    const state = (a) => (a === p ? p : a.body.state);
    for (let i = 0; i < all.length; i++) {
      for (let j = i + 1; j < all.length; j++) {
        const a = state(all[i]), b = state(all[j]), dx = b.x - a.x, dz = b.z - a.z, d = Math.hypot(dx, dz);
        if (d >= 2.4 || d === 0 || a.sinking >= 0) continue;
        const nx = dx / d, nz = dz / d, fa = fixed(all[i]), fb = fixed(all[j]);
        const push = fa || fb ? 2.4 - d : (2.4 - d) / 2;
        if (!fa) { a.x -= nx * push; a.z -= nz * push; }
        if (!fb) { b.x += nx * push; b.z += nz * push; }
        const e = all[j];
        if (a === p && gear.has('ram') && e.rammed <= 0 && p.vx * nx + p.vz * nz > 2.5) { // heading into it
          e.rammed = 0.8;
          sfx.bump();
          damage(e, RAM, b.x - nx, 0.8, b.z - nz);
        }
      }
    }
  }

  // A player's cannonball at (x, y, z): damage the enemy or set off the mine it touches. Returns true on a hit.
  function hitAt(x, y, z, amount) {
    if (boss?.hitAt(x - boss.cx, y, z - boss.cz, amount * (legend ? LEGEND : 1))) return true;
    const e = list.find((e) => !e.hidden && e.body.touches(x, y, z));
    if (e) {
      if (gear.has('chain')) e.slow = SLOW;
      if (gear.has('fire')) e.burn = BURN.time;
      damage(e, e.kind === 'puffer' && e.body.puff ? amount * 2 : amount, x, y, z); // a puffed-up pufferfish takes double
    }
    return !!e || mines.hitAt(x, y, z);
  }

  function clear() {
    [...list].forEach(drop);
    mines.clear();
    if (boss) {
      boss.remove();
      scene.remove(boss.group);
    }
    boss = null;
  }

  // Enemies still afloat (sinking ones don't count).
  const alive = () => list.filter((e) => e.body.state.sinking < 0).length;
  // A boss (a key of BOSSES) whose lair's middle is at world (cx, cz).
  // The bosses work around their own (0, 0), so each gets its own little frame: a group placed at the lair,
  // and effects, loot, the player and the api all shifted to match.
  function summonBoss(name, cx, cz) {
    const group = new THREE.Group();
    group.position.set(cx, 0, cz);
    scene.add(group);
    const lfx = {
      puff: (x, y, z, ...rest) => fx.puff(x + cx, y, z + cz, ...rest),
      splash: (x, z, ...rest) => fx.splash(x + cx, z + cz, ...rest),
      shipHit: (x, y, z, ...rest) => fx.shipHit(x + cx, y, z + cz, ...rest),
      bubble: (x, z) => fx.bubble(x + cx, z + cz),
      boom: (x, z) => fx.boom(x + cx, z + cz),
      lob: (x, z, tx, tz, flight, landed) => fx.lob(x + cx, z + cz, tx + cx, tz + cz, flight, (lx, lz) => landed(lx - cx, lz - cz)),
    };
    const lloot = { drop: (x, z, n) => loot.drop(x + cx, z + cz, n), crate: (x, z) => loot.crate(x + cx, z + cz) };
    const lapi = {
      ...api,
      hurtPlayer: (amount, x, y, z) => api.hurtPlayer(amount, x + cx, y, z + cz),
      shoot: (shots, dist) => api.shoot(shots.map((c) => ({ ...c, x: c.x + cx, z: c.z + cz })), dist),
      spawn: (kind) => spawn(kind, player),
      mine: (x, z) => { if (mines.count() < 12) mines.drop(x + cx, z + cz); },
    };
    const local = new Proxy({}, { // the player, seen from the lair's middle
      get: (_, k) => (k === 'x' ? player.x - cx : k === 'z' ? player.z - cz : player[k]),
      set: (_, k, v) => { player[k] = k === 'x' ? v + cx : k === 'z' ? v + cz : v; return true; },
    });
    boss = { ...BOSSES[name](group, lfx, lloot, lapi), group, local, cx, cz };
  }
  const bossBeaten = () => !!boss?.beaten();

  // An enemy standing at (x, z) (a camp or fort's tower).
  const placeAt = (kind, x, z) => place(kind, x, z, 0);
  // How hard the seas are, 0..1: new enemies get more health and drop fewer crates.
  const setThreat = (t) => { threat = t; };
  // A legendary rematch: the boss shrugs off half of every hit.
  const setLegend = (on) => { legend = on; };
  return { spawn, placeAt, remove: drop, update, hitAt, clear, disarm: mines.clear, alive, summonBoss, bossBeaten, list, setThreat, setLegend };
}
