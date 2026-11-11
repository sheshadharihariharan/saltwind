// The ocean of Saltwind: one fixed sea split into regions, each with its own look, plus the ports.
//
// Map coordinates: e (east) and n (north), in world units, with Home Harbour in the south.
// The camera looks along (1,1,1), so on screen north is "up" and east is "right";
// toWorld/toMap convert between map (e, n) and the 3D world's (x, z).

export const BOUND = 1000; // the ocean runs from -BOUND to +BOUND both ways: about 5 minutes to cross
const R2 = Math.SQRT1_2;
export const toWorld = (e, n) => ({ x: (e - n) * R2, z: (-e - n) * R2 });
export const toMap = (x, z) => ({ e: (x - z) * R2, n: -(x + z) * R2 });
// The heading (as used by ship.js) of a ship sailing due north.
export const NORTH = -Math.PI * 0.75;

// opens: the story step (story.js) at which the curse fog over the region lifts.
// pool: enemy kinds that roam the region ('jellies' is a swarm of four, 'eels' a pair); group: how many come at once [min, max].
// coins: how many coins (5 gold each) a treasure chest holds here.
// look: how a region's sea is built (see world.js).
//   rocks: colours. sand / grass: island colours. tree: 'palm', 'pine' or null. coral: coral heads instead of rocks.
//   sandbars / bergs: how many sandbars / drifting icebergs a chunk tries for. spires: tall rocks. spots: how many rock clusters or islands a chunk tries for.
//   isles: how often a spot is an island instead of rocks. houses: wall and roof colours in its ports.
export const REGIONS = {
  home: {
    name: 'Home Waters', tagline: 'Warm, calm and full of pirates', at: [0, -700], size: 1, sea: 0x2aa6b8,
    opens: 0,
    pool: ['sloop', 'sloop', 'shark', 'gunboat', 'turtle'], group: [1, 2], coins: 4,
    look: { rocks: [0x8a8f99, 0x7b8089, 0x9a948b], sand: 0xf2d49b, grass: 0x4fae55, tree: 'palm', spots: 4, isles: 0.4,
      houses: [0xfff1d6, 0xd8573f] },
  },
  reef: {
    name: 'The Coral Reef', tagline: 'Jellyfish, sandbars and the Crab King', at: [650, -350], size: 1, sea: 0x2fbfc0,
    opens: 3,
    pool: ['sloop', 'jellies', 'puffer', 'shark'], group: [2, 2], coins: 5,
    look: { rocks: [0xd9b38c, 0xc9a27a, 0xe3c39d], sand: 0xf6dfae, grass: 0x5cbf5a, tree: 'palm', spots: 4, isles: 0.35,
      coral: true, sandbars: 2, houses: [0xfde7f0, 0x3fa7c9] },
  },
  storm: {
    name: 'The Storm Belt', tagline: 'Wind, rain and the Admiral', at: [200, 300], size: 1, sea: 0x2d6a7d,
    opens: 6,
    pool: ['sloop', 'fireship', 'harpoon', 'eels', 'captain'], group: [2, 3], coins: 6,
    look: { rocks: [0x5d6670, 0x4f5862, 0x6a737d], sand: 0xc9b98f, grass: 0x3f7d48, tree: 'palm', spots: 3, isles: 0.3,
      houses: [0xd9d2c3, 0x55606b] }, storm: true,
  },
  frozen: {
    name: 'The Frozen North', tagline: 'Ice, snow and something long in the water', at: [0, 850], size: 1, sea: 0x4f86a0,
    opens: 9,
    pool: ['sloop', 'raider', 'raider', 'gunboat', 'captain'], group: [2, 3], coins: 7,
    look: { rocks: [0xe8f3f8, 0xcfe3ee, 0xb7d3e2], sand: 0xdfe9ee, grass: 0xffffff, tree: 'pine', spots: 3, isles: 0.35, bergs: 2,
      houses: [0xa0643a, 0x2f4d63] },
  },
  abyss: {
    name: 'The Abyss', tagline: 'Dark water where the ghosts sail', at: [-700, -150], size: 1, sea: 0x1f3d5a,
    opens: 12,
    pool: ['ghost', 'ghost', 'angler', 'sloop', 'eels'], group: [2, 3], coins: 7,
    look: { rocks: [0x4a4458, 0x3d3a4d, 0x55506a], sand: 0x5d5866, grass: 0x3f4a44, tree: null, spots: 3, isles: 0.25,
      spires: true, houses: [0x6c6880, 0x2b2838] },
  },
  maelstrom: {
    name: 'The Maelstrom', tagline: 'Where the curse began', at: [-280, 120], size: 0.45, sea: 0x264e66,
    opens: 15,
    pool: ['sloop', 'raider', 'ghost', 'angler', 'fireship', 'harpoon', 'captain'], group: [3, 3], coins: 8,
    look: { rocks: [0x36393f, 0x2d3036, 0x41454c], sand: 0x4d4a52, grass: 0x3a4240, tree: null, spots: 1, isles: 0.1,
      spires: true, houses: [0x6c6880, 0x2b2838] },
  },
};

// Which region (map coordinates)? The nearest region centre wins, with a wobble so borders aren't straight lines.
const LIST = Object.entries(REGIONS);
export function regionAt(e, n) {
  let best = 'home', bestD = Infinity;
  LIST.forEach(([id, r], i) => {
    const wobble = 45 * Math.sin(e * 0.009 + i * 1.7) * Math.cos(n * 0.011 + i * 2.3) + 25 * Math.sin((e + n) * 0.023 + i);
    const d = (Math.hypot(e - r.at[0], n - r.at[1]) + wobble) / r.size;
    if (d < bestD) { bestD = d; best = id; }
  });
  return best;
}

// Ports: towns you can dock at. at: map position of the town's island. small: a little settlement (fewer houses).
export const PORTS = {
  home: { name: 'Home Harbour', at: [0, -880], region: 'home', lighthouse: true },
  reef: { name: 'Coral Cay', at: [560, -560], region: 'reef' },
  storm: { name: 'Gale Roost', at: [380, 180], region: 'storm' },
  frozen: { name: 'Rime-Post', at: [-150, 760], region: 'frozen' },
  abyss: { name: 'Lantern Spire', at: [-640, -420], region: 'abyss' },
  smuggler: { name: "Smuggler's Atoll", at: [820, -600], region: 'reef', small: true },
  castaway: { name: 'Castaway Rock', at: [-20, 420], region: 'storm', small: true },
  floe: { name: 'Floe-Edge Camp', at: [-550, 860], region: 'frozen', small: true },
};
export const PORT_CLEAR = 34; // open water kept around each port's island

// Boss lairs: a ring of rocks with gaps; sail in and more rocks rise to shut you in with the boss.
// title: [name, subtitle] shown as it arrives. hint: how to beat it. beaten: the banner when it is.
// relic: what it guards. lines: [health left (1 = at the start), what's said or what happens] shown under its bar.
export const LAIRS = {
  crab: { name: 'Sunken Crown Atoll', at: [800, -200], boss: 'crab', relic: 'the Tide-Chime Conch',
    title: ['The Crab King', 'Monarch of the Shallows'], hint: 'Shoot off its claws, then its soft middle', beaten: 'Crab King defeated!',
    lines: [[0.5, 'The Crab King slams its pincers together, and the Conch on its back booms through the water!']] },
  flagship: { name: 'Tempest Bastion', at: [200, 430], boss: 'flagship', relic: 'the Fulmen Lodestone',
    title: ["The Admiral's Flagship", 'Wrath of the Seventh Squadron'], hint: 'Knock out its cannons, then sink the hull', beaten: 'Flagship sunk!',
    lines: [[1, 'Admiral Kross: "Unauthorised vessel in Imperial waters! Run out the lower batteries!"'],
      [0.5, 'Admiral Kross: "More powder to the guns! The Seventh Squadron never strikes its colours!"']] },
  serpent: { name: 'Boiling Caldron', at: [250, 880], boss: 'serpent', relic: 'the Sun-Amber Lens',
    title: ['The Sea Serpent', 'Leviathan of the Pack-Ice'], hint: "Shoot it while it's up, and dodge its lunge", beaten: 'Sea Serpent defeated!',
    lines: [[0.5, 'The Sun-Amber glows through its scales. The Serpent is furious, and faster!']] },
  galleon: { name: "Dead Man's Anchorage", at: [-850, -100], boss: 'galleon', relic: 'the Soul-Bell',
    title: ['The Ghost Galleon', 'Flagship of Navigator Vane'], hint: 'Only shoot it while you can see it', beaten: 'Ghost Galleon sunk!',
    lines: [[1, 'Vane: "Bind the wind! Chain the tide! No hand leaves the deck while the bell still rings!"'],
      [0.5, 'The Soul-Bell tolls three times, and ghost ships rise from the deep!']] },
  kraken: { name: 'Eye of the Maelstrom', at: [-280, 120], boss: 'kraken', relic: 'the Heart of the Sea',
    title: ['The Kraken', 'Devourer of the Tide'], hint: 'Shoot its tentacles, then its head', beaten: 'Kraken defeated!',
    lines: [[0.6, 'The Kraken roars and whips the water into a frenzy!'], [0.25, 'The Cursed Heart flares crimson in its maw!']] },
};
export const LAIR_RING = 30; // radius of a lair's ring of rocks
export const LAIR_ENTER = 22; // the fight starts when you're this close to the middle
export const SAFE = 70; // no enemies turn up this close to a port
// Where a ship waits off a port's dock (map coordinates). Docks point toward the middle of the ocean.
export function dockSpot(id) {
  const [e, n] = PORTS[id].at, len = Math.hypot(e, n);
  return { e: e - (e / len) * 18, n: n - (n / len) * 18 };
}
