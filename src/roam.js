// Enemies roaming the open sea. Every so often a group from the region's pool turns up just out of sight;
// enemies left far behind slip away. One group at a time, and none close to a port.
import { REGIONS, PORTS, SAFE, toMap } from './map.js';

const SPAWN = [28, 34]; // how far from the ship a group turns up: just off the screen
const GONE = 60; // enemies further away than this slip away
const WAIT = [10, 18]; // seconds of calm after a group is sunk or gone
const HOME_QUIET = 130; // a calm start: nothing turns up this close to Home Harbour
const ONE_EACH = ['gunboat', 'turtle', 'jellies', 'captain', 'eels', 'harpoon']; // at most one of these in a group

const pick = (list) => list[Math.floor(Math.random() * list.length)];

export function createRoamers(enemies) {
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
    const size = group[0] + Math.floor(Math.random() * (group[1] - group[0] + 1)), kinds = [];
    while (kinds.length < size) {
      const kind = pick(pool);
      if (!(ONE_EACH.includes(kind) && kinds.includes(kind))) kinds.push(kind);
    }
    let placed = 0;
    for (const kind of kinds) if (enemies.spawn(kind, p, ...SPAWN)) placed++;
    if (placed) wait = WAIT[0] + Math.random() * (WAIT[1] - WAIT[0]);
  };
}
