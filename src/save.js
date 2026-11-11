// What's kept on this device: where the ship is, its hull, gold and gear, the chart you've uncovered,
// ports and chests found, and the shipyard's upgrades. Also what each upgrade does.

const KEY = 'saltwind-save';
// pos: { x, z, heading } of the ship, or null before the first voyage.
// seen: the sea chart, one character per square ('1' = sailed near it); see SEEN in main.js.
// ports: ids (map.js PORTS) of ports found so far. lastPort: where you go back to after sinking.
// hp: the hull (null = full). gear: gear ids fitted (up to 3). chests: ids of treasure chests opened.
// story: the story step you're on (story.js). sunk: enemies sunk so far for a "sink" step. bosses: lair ids beaten.
// logs: regions whose shipwreck log you've read. quests: side stories started (sidequests.js). hold: spare gear.
const FRESH = { pos: null, seen: '', ports: ['home'], lastPort: 'home', gold: 0, hp: null, gear: [], chests: [], story: 0, sunk: 0, bosses: [], logs: [], quests: {}, hold: [],
  levels: { hull: 0, sails: 0, cannons: 0 }, seenHelp: false };

export const save = (() => {
  try {
    const stored = JSON.parse(localStorage.getItem(KEY)) ?? {};
    return { ...FRESH, ...stored, levels: { ...FRESH.levels, ...stored.levels } };
  } catch {
    return structuredClone(FRESH);
  }
})();

export function store() {
  try {
    localStorage.setItem(KEY, JSON.stringify(save));
  } catch {
    // Storage blocked (private browsing): progress lasts until the page closes.
  }
}

// Permanent upgrades bought at a port's shipyard. Each has 5 levels.
export const UPGRADES = {
  hull: { name: 'Stronger hull', text: '+15 hull a level',
    icon: '<path d="M3 13h18l-3 6H6z"/><path d="M12 13V4M12 5l6 5h-6"/>' },
  sails: { name: 'Faster sails', text: '+6% speed and turning a level',
    icon: '<path d="M10 3v16M10 4c7 3 9 9 8 13h-8"/><path d="M4 21h16"/>' },
  cannons: { name: 'Heavier cannons', text: '+1 damage a level',
    icon: '<path d="M3 11l14-5 2 6-14 4z"/><circle cx="8" cy="17" r="3"/>' },
};
export const MAX_LEVEL = 5;
const COST = [80, 160, 280, 450, 700];
export const upgradeCost = (id) => COST[save.levels[id]]; // undefined at the top level

// The ship's stats, with the upgrades bought so far.
export function upgradedStats(base) {
  const L = save.levels;
  return { ...base, hp: base.hp + 15 * L.hull, maxSpeed: base.maxSpeed * (1 + 0.06 * L.sails), turn: base.turn * (1 + 0.06 * L.sails) };
}
export const shotDamage = (base) => base + save.levels.cannons;
