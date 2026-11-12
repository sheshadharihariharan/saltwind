// Spending gold: rebuilding Home Harbour, and the Sailmaker's liveries.
//
// Harbour projects are funded at Home Harbour (save.works: ids built) and appear around the town:
// a new quarter on its own island, market stalls by the dock, lanterns, a dry dock, a lighthouse beam
// and a statue of your ship. Two do something too: the market makes gear cheaper at Home Harbour,
// and the dry dock repairs your hull there for free.
// Liveries are sets of ship colours (save.livery, save.liveries owned); legendary ones are won, not bought.
import * as THREE from 'three';
import { toon, flat } from './stage.js';
import { createShip, PLAYER_LOOK } from './ship.js';
import { PORTS, toWorld } from './map.js';

export const WORKS = {
  quarter: { name: 'New Quarter', text: 'Four new homes on an island of their own', price: 600 },
  market: { name: 'Market', text: 'Stalls by the dock. Gear costs a third less here', price: 900 },
  lanterns: { name: 'Lantern Festival', text: 'Lanterns all round the harbour', price: 1200 },
  beam: { name: 'Lighthouse Beam', text: 'A great beam sweeping the sea', price: 1500 },
  drydock: { name: 'Dry Dock', text: 'Free repairs at Home Harbour', price: 2000 },
  statue: { name: "Captain's Statue", text: 'Your ship in gold, in the town square', price: 3000 },
};
export const MARKET_DISCOUNT = 2 / 3;

const L = (hull, deck, sail, stripe, flag) => ({ hull, deck, sail, stripe, flag });
// legend: the lair whose legendary boss gives it.
export const LIVERIES = {
  classic: { name: 'Classic', look: PLAYER_LOOK, price: 0 },
  royal: { name: 'Royal Blue', look: L(0x2f4d63, 0xd9a45b, 0xe8f0ff, 0xf2c230, 0xf2c230), price: 400 },
  crimson: { name: 'Crimson', look: L(0x5a2a2a, 0xc9a46b, 0xd8453a, 0x22272b, 0x22272b), price: 400 },
  seagreen: { name: 'Sea-Green', look: L(0x2f6b5a, 0xd9a45b, 0xe6fff4, 0x2fbfc0, 0x2fbfc0), price: 400 },
  midnight: { name: 'Midnight', look: L(0x22272b, 0x5a5a66, 0x2b2d3a, 0xc9d6df, 0xc9d6df), price: 600 },
  sunset: { name: 'Sunset', look: L(0x8a3a2a, 0xd9a45b, 0xffb347, 0x8e55b0, 0x8e55b0), price: 600 },
  coral: { name: 'Coral Crown', look: L(0xd9b38c, 0xf6dfae, 0xff7a8a, 0xffd166, 0xffd166), legend: 'crab' },
  storm: { name: 'Storm Lord', look: L(0x2b3a52, 0xb08850, 0x2b3a52, 0xffc93c, 0xffc93c), legend: 'flagship' },
  frost: { name: 'Frost Wyrm', look: L(0x3f8fa3, 0xd8f1f4, 0xdff6ff, 0x9fe0e8, 0x9fe0e8), legend: 'serpent' },
  phantom: { name: 'Phantom', look: L(0x5e8f86, 0xcfeee4, 0xbfe9dc, 0x2b3a52, 0xb8ffe9), legend: 'galleon' },
  ink: { name: "Kraken's Ink", look: L(0x3a2a4a, 0x6b4a6b, 0x8e55b0, 0x1a1030, 0xb06ad8), legend: 'kraken' },
};

// A little picture of a livery: its sail with the stripe, on its hull.
export function liveryIcon(id) {
  const c = (n) => '#' + n.toString(16).padStart(6, '0'), l = LIVERIES[id].look;
  return `<svg viewBox="0 0 24 24"><path d="M3 16h18l-3 5H6z" fill="${c(l.hull)}"/><path d="M11 3v12" stroke-width="1.6"/>`
    + `<path d="M11 4c5 2 7 6 6 10h-6z" fill="${c(l.sail)}"/><path d="M11 8.5h6.3" stroke="${c(l.stripe)}" stroke-width="2.4"/></svg>`;
}

const BOX = new THREE.BoxGeometry(1, 1, 1);
const ROOF = new THREE.ConeGeometry(0.85, 0.7, 4).rotateY(Math.PI / 4);
const SAND = new THREE.CylinderGeometry(0.9, 1, 0.6, 14);
const GRASS = new THREE.CylinderGeometry(0.62, 0.72, 0.4, 12);
const POST = new THREE.CylinderGeometry(0.08, 0.08, 1, 6).translate(0, 0.5, 0);
const LAMP = new THREE.SphereGeometry(0.22, 8, 6);
const BEAM = new THREE.ConeGeometry(2.2, 22, 16, 1, true).rotateZ(Math.PI / 2).translate(11, 0, 0);
const PLINTH = new THREE.CylinderGeometry(1.2, 1.4, 1.2, 10);
const m = (c) => toon(c);
const wood = m(0x8a5a33), wall = m(0xfff1d6), roofs = [m(0xd8573f), m(0x3fa7c9), m(0x5bd16a), m(0xf2c230)];
const sandMat = m(0xf2d49b), grassMat = m(0x4fae55), stone = m(0x9a948b);
const glow = new THREE.MeshBasicMaterial({ color: 0xffd36a });
glow.userData.outlineParameters = { visible: false };

// Places around Home Harbour, in map units from the town's middle (north is out to sea, past the dock).
const QUARTER = [-26, 6], DRYDOCK = [22, 4];
export const HARBOUR_HITS = { quarter: { at: QUARTER, r: 5.7 }, drydock: { at: DRYDOCK, r: 3.6 } };

// ocean.addHit(x, z, r): something solid (the new quarter's island, the dry dock).
export function createHarbour(scene, ocean) {
  const [he, hn] = PORTS.home.at;
  const at = (de, dn, y = 0) => { const w = toWorld(he + de, hn + dn); return new THREE.Vector3(w.x, y, w.z); };
  const built = new Map(); // project id -> its group
  let beam = null;

  const builders = {
    quarter(g) {
      const c = at(...QUARTER);
      const sand = new THREE.Mesh(SAND, sandMat), grass = new THREE.Mesh(GRASS, grassMat);
      sand.scale.set(6, 1, 6);
      sand.position.copy(c).setY(0.1);
      grass.scale.set(6, 1, 6);
      grass.position.copy(c).setY(0.5);
      g.add(sand, grass);
      for (let k = 0; k < 4; k++) {
        const a = (k / 4) * 6.28 + 0.4, p = c.clone().add(new THREE.Vector3(Math.cos(a) * 2.4, 0, Math.sin(a) * 2.4));
        const house = new THREE.Mesh(BOX, wall), top = new THREE.Mesh(ROOF, roofs[k]);
        house.scale.set(1.4, 1.2, 1.4);
        house.position.copy(p).setY(1.3);
        top.scale.set(1.75, 1.3, 1.75);
        top.position.copy(p).setY(2.3);
        house.rotation.y = top.rotation.y = a;
        g.add(house, top);
      }
      const w = toWorld(he + QUARTER[0], hn + QUARTER[1]);
      ocean.addHit(w.x, w.z, HARBOUR_HITS.quarter.r);
    },
    market(g) { // three striped stalls on stilts beside the dock
      [-2.4, 2.4, -2.4].forEach((side, k) => {
        const p = at(side, 9 + k * 2.2, 0);
        for (const [dx, dz] of [[-0.6, -0.6], [0.6, -0.6], [-0.6, 0.6], [0.6, 0.6]]) {
          const post = new THREE.Mesh(POST, wood);
          post.scale.y = 1.8;
          post.position.copy(p).add(new THREE.Vector3(dx, 0, dz));
          g.add(post);
        }
        const awning = new THREE.Mesh(BOX, roofs[k]), stall = new THREE.Mesh(BOX, wood);
        awning.scale.set(1.6, 0.15, 1.6);
        awning.position.copy(p).setY(1.85);
        stall.scale.set(1.3, 0.5, 0.9);
        stall.position.copy(p).setY(0.75);
        g.add(awning, stall);
      });
    },
    lanterns(g) { // glowing lanterns on posts round the beach
      for (let k = 0; k < 12; k++) {
        const a = (k / 12) * 6.28, p = at(Math.cos(a) * 7.2, Math.sin(a) * 7.2);
        const post = new THREE.Mesh(POST, wood), lamp = new THREE.Mesh(LAMP, glow);
        post.scale.y = 1.8;
        post.position.copy(p).setY(0.4);
        lamp.position.copy(p).setY(2.3);
        g.add(post, lamp);
      }
    },
    beam(g) { // a beam of light turning slowly from the lighthouse lamp
      const d = toWorld(0, 1), town = at(0, 0);
      const lamp = new THREE.Vector3(town.x - d.z * 4.5, 5, town.z + d.x * 4.5);
      const mat = flat(0.18, 0xfff1a8);
      mat.side = THREE.DoubleSide;
      beam = new THREE.Mesh(BEAM, mat);
      beam.position.copy(lamp);
      g.add(beam);
    },
    drydock(g) { // a U of timber walls in the water, propped with beams
      const c = at(...DRYDOCK);
      for (const [dx, dz, sx, sz] of [[0, -2.6, 6, 0.5], [0, 2.6, 6, 0.5], [-3, 0, 0.5, 5.7]]) {
        const side = new THREE.Mesh(BOX, wood);
        side.scale.set(sx, 1.4, sz);
        side.position.copy(c).add(new THREE.Vector3(dx, 0.4, dz));
        g.add(side);
      }
      const w = toWorld(he + DRYDOCK[0], hn + DRYDOCK[1]);
      ocean.addHit(w.x, w.z, HARBOUR_HITS.drydock.r);
    },
    statue(g) { // your ship in gold on a stone plinth, in the middle of town
      const plinth = new THREE.Mesh(PLINTH, stone);
      plinth.position.copy(at(0, 0, 1.2));
      g.add(plinth);
      const ship = createShip(g, L(0xffc93c, 0xe6b02e, 0xffe08a, 0xffc93c, 0xffc93c));
      ship.root.scale.setScalar(0.7);
      ship.root.position.copy(at(0, 0, 1.8));
      ship.root.rotation.y = Math.PI / 4;
    },
  };

  // Build whatever has been funded and isn't standing yet.
  function show(works) {
    for (const id of works) {
      if (built.has(id)) continue;
      const g = new THREE.Group();
      builders[id](g);
      scene.add(g);
      built.set(id, g);
    }
  }

  function update(t) {
    if (beam) beam.rotation.y = t * 0.6;
  }

  return { show, update };
}
