// Bounty captains (Part Two): the four captains of the Brotherhood of the Grey Flag. When the story sends you
// after one, a grey pillar of light marks their hideout; sail close and the captain comes out with a crew.
// Sink the captain (the crew can be left) for the bounty. Sail away or sink and they're back next time.
// Each captain has one trick (enemies.js chief): reinforce, fireships, ram or fade.
import * as THREE from 'three';
import { flat } from './stage.js';
import { toWorld } from './map.js';

// at: the hideout (map coordinates). tough: health on top of a named enemy's. face: their portrait (screens.js).
export const CAPTAINS = {
  garrick: { name: 'Gull-Eye Garrick', hideout: 'Gull Shoals', at: [700, -420], trick: 'reinforce', tough: 1.2, crew: ['brother', 'brother'], reward: 300,
    poster: 'Whistles up his crew the moment a fight turns against him.',
    face: { skin: 0xd9a37a, hair: 0x5a4636, hat: 'tricorn', hatColor: 0x4a4e55, beard: true, collar: 0x9aa0a6, eyes: 0xcfe8ff } },
  vex: { name: 'Widow Vex', hideout: 'Cinder Reach', at: [250, 40], trick: 'fireships', tough: 1.4, crew: ['brother', 'fireship'], reward: 400,
    poster: 'Sets her own ships alight and sends them at you.',
    face: { skin: 0xf0c8b0, hair: 0x22272b, hat: 'hood', hatColor: 0x3a2a2a, earrings: true, collar: 0xff8a3c } },
  ironjaw: { name: 'Hob Ironjaw', hideout: 'the Grinding Floes', at: [120, 720], trick: 'ram', tough: 1.6, crew: ['brother', 'raider'], reward: 500,
    poster: 'Rams with an iron jaw and leaves mines in his wake.',
    face: { skin: 0xe8c0a0, hair: 0x8a5a33, hat: 'fur', hatColor: 0x6a6e75, beard: true, patch: true } },
  murk: { name: 'Mother Murk', hideout: 'the Drowned Lanterns', at: [-850, -250], trick: 'fade', tough: 1.8, crew: ['brother', 'ghost'], reward: 600,
    poster: 'Fades into the dark like the ghost ships. Shoot when you can see her.',
    face: { skin: 0xb8c4c8, hair: 0xd9d9d9, hat: 'hood', hatColor: 0x2b2838, eyes: 0x8fffd0, collar: 0x55506a } },
};
export const BOUNTY_SPOTS = Object.values(CAPTAINS).map((c) => c.at); // chunks.js keeps the water here clear

const REACH = 25, LEAVE = 70; // sail this close and the captain comes out; they give up this far away
const OUT = [12, 16], CREW = [15, 20]; // how far off the captain and the crew turn up
const BEAM = new THREE.CylinderGeometry(1.6, 1.6, 34, 14, 1, true).translate(0, 17, 0);
const RING = new THREE.RingGeometry(2.4, 3.3, 28).rotateX(-Math.PI / 2);
const COLOR = 0xc9ccd0; // the Brotherhood's grey

// api: enemies, sfx, banner(text, small), player (the ship's state),
// wanted() (the captain id the story is after, or null), reward(id) (that captain is sunk).
export function createBounties(scene, api) {
  const { enemies, sfx, banner, player: p } = api;
  const bar = document.getElementById('boss');
  let beam = null, marked = null, fight = null; // fight: { id, chief }

  // The pillar of light over the hideout of the captain the story wants.
  function mark(id) {
    if (marked === id) return;
    if (beam) { scene.remove(beam); beam.children.forEach((m) => m.material.dispose()); beam = null; }
    marked = id;
    if (!id) return;
    const w = toWorld(...CAPTAINS[id].at), shaft = new THREE.Mesh(BEAM, flat(0.22, COLOR)), ring = new THREE.Mesh(RING, flat(0.7, COLOR));
    shaft.material.side = THREE.DoubleSide;
    ring.position.y = 0.08;
    beam = new THREE.Group();
    beam.add(shaft, ring);
    beam.position.set(w.x, 0, w.z);
    scene.add(beam);
  }

  function end() {
    fight = null;
    bar.classList.remove('on');
  }

  function update(dt, t) {
    const id = api.wanted();
    mark(id);
    if (beam) {
      beam.children[0].material.opacity = 0.18 + 0.08 * Math.sin(t * 2);
      beam.children[1].scale.setScalar(1 + 0.08 * Math.sin(t * 3));
    }
    if (!id) { if (fight) end(); return; }
    const c = CAPTAINS[id], w = toWorld(...c.at), d = Math.hypot(p.x - w.x, p.z - w.z);
    if (!fight) {
      if (d > REACH || p.sinking >= 0) return;
      const chief = enemies.spawn('chief', p, ...OUT, c.name)?.[0];
      if (!chief) return;
      const s = chief.body.state;
      s.hp = s.maxHp = s.maxHp * c.tough;
      chief.trick = c.trick;
      c.crew.forEach((k) => enemies.spawn(k, p, ...CREW));
      fight = { id, chief };
      bar.querySelector('b').textContent = c.name;
      bar.querySelector('.pips').innerHTML = '';
      bar.classList.add('on');
      banner(c.hideout, `${c.name} is here!`);
      sfx.sharkWarn();
      return;
    }
    const s = fight.chief.body.state;
    bar.querySelector('i').style.width = (100 * Math.max(0, s.hp)) / s.maxHp + '%';
    if (fight.chief.sunk) {
      end();
      api.reward(id);
    } else if (d > LEAVE || !enemies.list.includes(fight.chief)) end(); // you sailed off: they'll be back next time
  }

  return {
    update,
    playerSunk: () => { if (fight) end(); },
    busy: () => !!fight, // no other pirates roam in during a bounty fight
  };
}
