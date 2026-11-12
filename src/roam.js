// Enemies roaming the open sea. Every so often a group from the region's pool turns up just out of sight;
// enemies left far behind slip away. One group at a time, and none close to a port.
// Now and then a group is led by a wanted pirate with a bounty on their head, and later in the story
// a whole pirate fleet can turn up. In Part Two the Brotherhood of the Grey Flag sails too, and with cargo
// in the hold pirates come sooner and are more often Brotherhood.
import { REGIONS, PORTS, SAFE, toMap } from './map.js';

const SPAWN = [28, 34]; // how far from the ship a group turns up: just off the screen
const GONE = 60; // enemies further away than this slip away
const WAIT = [6, 12]; // seconds of calm after a group is sunk or gone
const HOME_QUIET = 130; // a calm start: nothing turns up this close to Home Harbour
const ONE_EACH = ['gunboat', 'turtle', 'jellies', 'captain', 'eels', 'harpoon']; // at most one of these in a group
const SHIPS = ['sloop', 'gunboat', 'captain', 'harpoon', 'raider', 'ghost', 'fireship', 'brother']; // kinds that can be a wanted pirate
const WANTED = { chance: 0.15, late: 0.3, bounty: 100 }; // how often a group has a wanted leader (late: after the story), the bounty
const NAMES = ['Black Jessa', 'One-Eyed Wick', 'Mad Marlow', 'Salt Annie', 'Captain Gristle', 'Red Rowan', 'Barnacle Bess', 'Iron Tam'];
const FLEET = { chance: 0.06, late: 0.12, after: 6, end: 17, sloops: 4, regions: ['home', 'storm', 'frozen', 'maelstrom'] }; // after / end: story steps

const BROTHERS = { chance: 0.25, laden: 0.5, size: [2, 3] }; // in Part Two: how often a group is Brotherhood (laden: with cargo aboard)
export const RAID = { near: 150, most: 3, wait: 2.5 }; // the raid on Home Harbour: how close, how many at once, seconds between ships
const LADEN_WAIT = 0.6; // with cargo aboard, the calm between groups is this much shorter

const pick = (list) => list[Math.floor(Math.random() * list.length)];

// say(text, small): a banner. story(): the story step reached (a pirate fleet only turns up later on).
// cargo(): crates in the hold. raid(): is the Brotherhood raiding Home Harbour?
export function createRoamers(enemies, say, story, cargo, raid) {
  let wait = 6;

  // p: the player's ship. region: the id of the region it's in.
  return function update(dt, p, region) {
    for (const e of [...enemies.list]) {
      const s = e.body.state;
      if (s.sinking < 0 && Math.hypot(s.x - p.x, s.z - p.z) > GONE) enemies.remove(e);
    }
    const m = toMap(p.x, p.z);
    if (raid() && Math.hypot(PORTS.home.at[0] - m.e, PORTS.home.at[1] - m.n) < RAID.near) { // grey ships keep coming
      wait -= dt;
      if (p.sinking < 0 && wait <= 0 && enemies.alive() < RAID.most && enemies.spawn('brother', p, ...SPAWN)) wait = RAID.wait;
      return;
    }
    if (enemies.alive() > 0 || p.sinking >= 0) return;
    wait -= dt;
    if (wait > 0) return;
    wait = 2; // check again soon if nothing comes this time
    if (Object.entries(PORTS).some(([id, port]) => Math.hypot(port.at[0] - m.e, port.at[1] - m.n) < (id === 'home' ? HOME_QUIET : SAFE))) return;

    const { pool, group } = REGIONS[region];
    const late = story() >= FLEET.end; // the story is over: the pirates come back in force
    const fleet = story() >= FLEET.after && FLEET.regions.includes(region) && Math.random() < (late ? FLEET.late : FLEET.chance);
    const laden = cargo() > 0;
    const brothers = !fleet && story() > FLEET.end && Math.random() < (laden ? BROTHERS.laden : BROTHERS.chance);
    let kinds = [];
    if (fleet) kinds = ['captain', ...Array(FLEET.sloops).fill('sloop')];
    else if (brothers) kinds = Array(BROTHERS.size[0] + Math.floor(Math.random() * (BROTHERS.size[1] - BROTHERS.size[0] + 1))).fill('brother');
    else {
      const size = group[0] + Math.floor(Math.random() * (group[1] - group[0] + 1));
      while (kinds.length < size) {
        const kind = pick(pool);
        if (!(ONE_EACH.includes(kind) && kinds.includes(kind))) kinds.push(kind);
      }
    }
    // A wanted pirate leads the group (always, for a fleet): tougher, and worth a bounty.
    const leader = (fleet || Math.random() < (late ? WANTED.late : WANTED.chance)) ? kinds.findIndex((k) => SHIPS.includes(k)) : -1;
    const name = pick(NAMES);
    let placed = 0;
    kinds.forEach((kind, i) => {
      const got = enemies.spawn(kind, p, ...SPAWN, i === leader ? name : null);
      if (!got) return;
      placed++;
      if (i === leader) got.forEach((e) => { e.bounty = WANTED.bounty; });
    });
    if (!placed) return;
    wait = (WAIT[0] + Math.random() * (WAIT[1] - WAIT[0])) * (laden ? LADEN_WAIT : 1);
    if (brothers && laden && leader < 0) say('Grey flags!', 'The Brotherhood is after your cargo');
    else if (fleet) say('A pirate fleet!', `Led by ${name}: ${WANTED.bounty} gold bounty`);
    else if (leader >= 0) say(`Wanted: ${name}`, `${WANTED.bounty} gold bounty`);
  };
}
