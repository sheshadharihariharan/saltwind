// Enemies roaming the open sea. Every so often a group from the region's pool turns up just out of sight;
// enemies left far behind slip away. One group at a time, and none close to a port.
// Now and then a group is led by a wanted pirate with a bounty on their head, and later in the story
// a whole pirate fleet can turn up.
import { REGIONS, PORTS, SAFE, toMap } from './map.js';

const SPAWN = [28, 34]; // how far from the ship a group turns up: just off the screen
const GONE = 60; // enemies further away than this slip away
const WAIT = [6, 12]; // seconds of calm after a group is sunk or gone
const HOME_QUIET = 130; // a calm start: nothing turns up this close to Home Harbour
const ONE_EACH = ['gunboat', 'turtle', 'jellies', 'captain', 'eels', 'harpoon']; // at most one of these in a group
const SHIPS = ['sloop', 'gunboat', 'captain', 'harpoon', 'raider', 'ghost', 'fireship']; // kinds that can be a wanted pirate
const WANTED = { chance: 0.15, bounty: 100 }; // how often a group has a wanted leader, and the bounty in gold
const NAMES = ['Black Jessa', 'One-Eyed Wick', 'Mad Marlow', 'Salt Annie', 'Captain Gristle', 'Red Rowan', 'Barnacle Bess', 'Iron Tam'];
const FLEET = { chance: 0.06, after: 6, sloops: 4, regions: ['home', 'storm', 'frozen', 'maelstrom'] }; // after: story step

const pick = (list) => list[Math.floor(Math.random() * list.length)];

// say(text, small): a banner. story(): the story step reached (a pirate fleet only turns up later on).
export function createRoamers(enemies, say, story) {
  let wait = 6;

  // p: the player's ship. region: the id of the region it's in.
  return function update(dt, p, region) {
    for (const e of [...enemies.list]) {
      const s = e.body.state;
      if (s.sinking < 0 && Math.hypot(s.x - p.x, s.z - p.z) > GONE) enemies.remove(e);
    }
    if (enemies.alive() > 0 || p.sinking >= 0) return;
    wait -= dt;
    if (wait > 0) return;
    wait = 2; // check again soon if nothing comes this time
    const m = toMap(p.x, p.z);
    if (Object.entries(PORTS).some(([id, port]) => Math.hypot(port.at[0] - m.e, port.at[1] - m.n) < (id === 'home' ? HOME_QUIET : SAFE))) return;

    const { pool, group } = REGIONS[region];
    const fleet = story() >= FLEET.after && FLEET.regions.includes(region) && Math.random() < FLEET.chance;
    let kinds = [];
    if (fleet) kinds = ['captain', ...Array(FLEET.sloops).fill('sloop')];
    else {
      const size = group[0] + Math.floor(Math.random() * (group[1] - group[0] + 1));
      while (kinds.length < size) {
        const kind = pick(pool);
        if (!(ONE_EACH.includes(kind) && kinds.includes(kind))) kinds.push(kind);
      }
    }
    // A wanted pirate leads the group (always, for a fleet): tougher, and worth a bounty.
    const leader = (fleet || Math.random() < WANTED.chance) ? kinds.findIndex((k) => SHIPS.includes(k)) : -1;
    const name = pick(NAMES);
    let placed = 0;
    kinds.forEach((kind, i) => {
      const got = enemies.spawn(kind, p, ...SPAWN, i === leader ? name : null);
      if (!got) return;
      placed++;
      if (i === leader) got.forEach((e) => { e.bounty = WANTED.bounty; });
    });
    if (!placed) return;
    wait = WAIT[0] + Math.random() * (WAIT[1] - WAIT[0]);
    if (fleet) say('A pirate fleet!', `Led by ${name}: ${WANTED.bounty} gold bounty`);
    else if (leader >= 0) say(`Wanted: ${name}`, `${WANTED.bounty} gold bounty`);
  };
}
