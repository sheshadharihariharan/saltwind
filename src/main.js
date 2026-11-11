import '@fontsource/lilita-one';
import './style.css';
import * as THREE from 'three';
import { createStage } from './stage.js';
import { input, readInput } from './input.js';
import { createShip, PLAYER_STATS } from './ship.js';
import { createFoam } from './world.js';
import { createOcean } from './chunks.js';
import { createEffects } from './effects.js';
import { createEnemies } from './enemies.js';
import { createLoot } from './loot.js';
import { createRoamers } from './roam.js';
import { createWeather } from './weather.js';
import { createFog } from './fog.js';
import { STEPS, PEOPLE, FLAMES, LOGS, COB, target } from './story.js';
import { createBrazier } from './brazier.js';
import { createSideStories, SIDE_PEOPLE } from './sidequests.js';
import { GEAR, gearChoices } from './gear.js';
import { showSeaChart, hideChart, showTalk, showPanel, hidePanel, gearTile, showGear, showTitle, hideTitle, icon } from './screens.js';
import { save, store, UPGRADES, MAX_LEVEL, upgradeCost, upgradedStats, shotDamage } from './save.js';
import { REGIONS, PORTS, LAIRS, LAIR_ENTER, BOUND, toMap, toWorld, regionAt, dockSpot } from './map.js';
import { startDevLog } from './devlog.js';
import { unlockAudio, audioSetting, toggleAudio, sfx, seaSpeed, setMusic } from './audio.js';

const PLAYER_SHOT = 5; // damage per cannonball: a pirate (30) takes about 3 good broadsides
const PIRATE_SHOT = 6; // we (100) can take about 16
const SEEN = 40; // the sea chart is SEEN x SEEN squares (50 units each)
const SIGHT = 90; // squares this close to the ship count as seen
const FIND_PORT = 45; // sail this close to a port to find it
const VISIT = 22; // this close to a port's island, a button lets you go into port
const SAVE_EVERY = 3; // seconds between saves while sailing
const SLOTS = 3; // gear the ship can carry
const PRICE = { gear: 150, repairPerHp: 0.7 };
const CURRENT = 3; // the Maelstrom's swirl: how hard it pushes the ship round (and a little in toward its eye)
const FIREWORKS = 9; // seconds of fireworks when the curse is lifted
const BARK = 4; // seconds each line under a boss's bar stays up
const CAST = { ...PEOPLE, ...SIDE_PEOPLE }; // everyone who talks
const QUOIN = 1.15; // the Gunner's Quoin: cannonballs hit this much harder
const SHEATHING = { sting: 0.75, sand: 0.75 }; // with coral sheathing, stings and sandbars only slow you to this
const DELIVER_HULL = 0.75; // Nix patches your hull to at least this before loading the powder

const stage = createStage(document.getElementById('game'));
// Has the story lifted the curse fog over a region yet? locked: is a spot on the map behind the fog?
const isOpen = (id) => save.story >= REGIONS[id].opens;
function locked(e, n) { return !isOpen(regionAt(e, n)); }
// Treasure chests come and go with their part of the sea; opened ones stay opened.
const treasures = new Map(); // chest id -> its treasure spot (chunks.js), for the shipwreck logs
const ocean = createOcean(stage.scene, {
  load: ({ treasure: t }) => {
    if (!t || save.chests.includes(t.id)) return;
    treasures.set(t.id, t);
    loot.chest(t.x, t.z, t.coins, t.id);
  },
  unload: ({ treasure: t }) => { if (t) loot.removeChest(t.id); },
  locked,
});
const foam = createFoam(stage.scene);
const fx = createEffects(stage.scene, ocean.solidAt);
const loot = createLoot(stage.scene);
const ship = createShip(stage.scene, undefined, undefined, true);
const p = ship.state;
const gear = new Set(save.gear); // gear ids fitted to the ship
const enemies = createEnemies(stage.scene, ocean, fx, loot, {
  shoot(shots, dist) {
    shots.forEach((c) => fx.shoot(c.x, c.z, c.dx, c.dz, hitPlayer));
    sfx.cannon(shots.length, Math.max(0.3, 0.9 - dist / 25));
  },
  hurtPlayer,
  shake: (amount) => { shake = Math.max(shake, amount); },
  slowPlayer: (seconds) => { p.slow = seconds; },
  touchesPlayer: (x, y, z) => ship.touches(x, y, z),
  ink: splatInk,
  sunk(kind, x, z) { // the story's "sink some enemies" steps, and side-story hunts
    sides.sunk(kind, x, z);
    const { sink: n, kind: only } = STEPS[save.story];
    if (!n || fight || (only && kind !== only)) return;
    save.sunk++;
    if (save.sunk >= n) advance();
    showGoal();
  },
}, gear);
const roam = createRoamers(enemies);
const fog = createFog(stage.scene, locked);
const brazier = (() => { // on the beach beside Home Harbour's dock, the other side from the lighthouse
  const town = toWorld(...PORTS.home.at), d = toWorld(0, 1);
  return createBrazier(stage.scene, town.x + d.x * 6.2 + d.z * 2.8, town.z + d.z * 6.2 - d.x * 2.8);
})();
const flamesLit = () => FLAMES.filter((step) => save.story >= step).length;
const sides = createSideStories(stage.scene, save, {
  enemies, ocean, fx, sfx, banner, hurtPlayer, player: p, save: () => keep(), reward: rewardSide,
  start: (id) => { if (id === 'powder') p.hp = Math.max(p.hp, p.maxHp * DELIVER_HULL); }, // Nix patches your planking first
});
const weather = createWeather(stage.scene, fx, { hurtPlayer });

const $ = (id) => document.getElementById(id);
const fireButtons = { left: $('fireL'), right: $('fireR') };
const wasReady = { left: true, right: true };
let mode = 'title'; // 'title' | 'sea' | 'chart' | 'panel' | 'talk'
let region = null; // the region the ship is in (map.js REGIONS)
let gold = save.gold;
let nearPort = null; // the port close enough to visit, or null
let fight = null; // a boss fight at a lair: { id, won (seconds since the boss was beaten, or null) }
const safe = { x: 0, z: 0 }; // the last spot the ship was outside the fog
const seen = save.seen.length === SEEN * SEEN ? save.seen.split('') : Array(SEEN * SEEN).fill('0');

input.onFire = (side) => {
  if (mode !== 'sea') return;
  const shots = ship.fire(side);
  if (!shots) return;
  // Double shot: each cannon fires two balls, spread a little.
  const balls = gear.has('double') ? shots.flatMap((c) => [-0.07, 0.07].map((a) => turn(c, a))) : shots;
  const damage = shotDamage(PLAYER_SHOT) * (gear.has('quoin') ? QUOIN : 1); // heavier with upgrades and the quoin
  balls.forEach((c) => fx.shoot(c.x, c.z, c.dx, c.dz, (x, y, z) => enemies.hitAt(x, y, z, damage)));
  sfx.cannon(shots.length);
};
const turn = (c, a) => ({ ...c, dx: c.dx * Math.cos(a) - c.dz * Math.sin(a), dz: c.dx * Math.sin(a) + c.dz * Math.cos(a) });

// A pirate cannonball at (x, y, z): does it hit us?
function hitPlayer(x, y, z) {
  if (!ship.touches(x, y, z)) return false;
  hurtPlayer(PIRATE_SHOT, x, y, z);
  return true;
}

// Anything that damages us: a flash, a crunch and a shake.
function hurtPlayer(amount, x, y, z) {
  if (p.sinking >= 0) return;
  fx.shipHit(x, y, z);
  sfx.hurt();
  shake = 0.35;
  flash('hull', 'hit');
  if (ship.hurt(amount)) sfx.sink();
}

// Restart a little CSS animation on an element.
function flash(id, cls) {
  $(id).classList.remove(cls);
  void $(id).offsetWidth;
  $(id).classList.add(cls);
}

function banner(text, small = '') {
  $('banner').innerHTML = `${text}<small>${small}</small>`;
  $('banner').classList.add('on');
  clearTimeout(banner.timer);
  banner.timer = setTimeout(() => $('banner').classList.remove('on'), 2800);
}

// Kraken ink: two dark blots land somewhere on the screen, then fade after a few seconds.
function splatInk() {
  for (const blot of $('ink').children) {
    blot.style.left = 15 + Math.random() * 70 + '%';
    blot.style.top = 15 + Math.random() * 70 + '%';
  }
  $('ink').classList.add('on');
  clearTimeout(splatInk.timer);
  splatInk.timer = setTimeout(() => $('ink').classList.remove('on'), 3500);
}

function setGold(value) {
  gold = value;
  $('gold').lastChild.textContent = gold;
}

function repair(amount) {
  p.hp = Math.min(p.maxHp, p.hp + amount);
  flash('hull', 'heal');
  sfx.repair();
}

// Move the ship (and the sea around it) to a spot. hp: the hull it has there (it can't be over the most).
function placeShip(x, z, heading, hp = p.hp) {
  ship.reset(x, z, heading);
  p.hp = Math.min(hp, p.maxHp);
  ocean.update(p.x, p.z, time, true);
  focus.set(p.x, 0, p.z);
}

// Off a port's dock, facing out to sea.
function placeAtPort(id, hp) {
  const at = dockSpot(id), w = toWorld(at.e, at.n), out = toWorld(-PORTS[id].at[0], -PORTS[id].at[1]);
  placeShip(w.x, w.z, Math.atan2(out.z, out.x), hp);
}

// The ship's stats: shipyard upgrades, then each piece of gear. Keeps the hull's damage.
function fitShip() {
  const hp = p.hp;
  ship.resetGear();
  Object.assign(ship.stats, upgradedStats(PLAYER_STATS));
  p.maxHp = ship.stats.hp;
  loot.setMagnet(4);
  loot.setSpotting();
  gear.forEach((id) => GEAR[id].apply?.({ ship, loot }));
  p.hp = Math.min(hp, p.maxHp);
  showGear(gear);
}

// ---------- title and how to play ----------

// The title screen: the ship sails lazy circles off Home Harbour.
function showHome() {
  mode = 'title';
  const at = dockSpot('home'), w = toWorld(at.e, at.n + 30);
  placeShip(w.x, w.z, p.heading);
  showTitle(!!save.pos, {
    sail: () => { sfx.click(); hideTitle(); setSail(); },
    help: () => { sfx.click(); hideTitle(); showHelp(showHome); },
  });
}

// Out to sea: from where you left off, or from Home Harbour the first time.
function setSail() {
  fitShip();
  const at = save.pos && toMap(save.pos.x, save.pos.z);
  if (at && !locked(at.e, at.n)) placeShip(save.pos.x, save.pos.z, save.pos.heading, save.hp ?? Infinity);
  else placeAtPort('home', save.hp ?? Infinity); // first time out (or the save was somewhere the fog now covers)
  setGold(save.gold);
  showGoal();
  region = null; // announce the region on the first frame
  mode = 'sea';
  const next = save.story === 0 ? () => openPort('home') : () => { hidePanel(); mode = 'sea'; }; // the story begins in port
  if (!save.seenHelp) showHelp(next);
  else if (save.story === 0) next();
}

// ---------- the story ----------

// On to the next story step. Any region it opens gets a banner as its fog lifts.
function advance() {
  save.story++;
  save.sunk = 0;
  const opened = Object.values(REGIONS).find((r) => r.opens === save.story);
  if (opened) setTimeout(() => banner('The fog lifts!', `${opened.name} is open`), 400);
  const flame = FLAMES.indexOf(save.story);
  if (flame >= 0) { // a relic in the Brazier: a burst of its colour
    for (let k = 0; k < 8; k++) fx.puff(brazier.x + (Math.random() - 0.5) * 2, 3 + Math.random() * 3, brazier.z + (Math.random() - 0.5) * 2, 1.4, brazier.color(flame));
    sfx.chest();
  }
  fog.refresh();
  showGoal();
  keep();
}

// Where the story wants you: { name, e, n } or null.
function goalPlace() {
  const t = target(save.story);
  if (!t) return null;
  const place = t.kind === 'port' ? PORTS[t.id] : LAIRS[t.id];
  return { name: place.name, e: place.at[0], n: place.at[1] };
}

// The story's goal, with a count for "sink" steps.
function mainGoal() {
  const step = STEPS[save.story];
  return step.sink ? `${step.goal} (${save.sunk} / ${step.sink})` : step.goal;
}
const showGoal = () => { compassText = null; }; // the goal line is redrawn with the compass

// Everything the compass can point at: the story's goal, then each side story's. [{ name, e, n, text, side }]
function aims() {
  const place = goalPlace();
  return [...(place ? [{ ...place, text: mainGoal() }] : []), ...sides.targets().map((t) => ({ ...t, side: true }))];
}

// Going into a port where the story has someone to talk to: the chat first, then the port.
function talkThenPort(id) {
  const step = STEPS[save.story];
  if (step.talk !== id) return false;
  mode = 'talk';
  $('visit').classList.remove('on');
  hidePanel();
  showTalk(CAST, step.who, step.lines, () => {
    advance();
    if (step.end) celebrate();
    else openPort(id);
  });
  return true;
}

// A side story handed in: its gold, and its gear (fitted if there's a free slot, else into the hold).
function rewardSide(amount, id, name) {
  setGold(gold + amount);
  flash('gold', 'pop');
  let note = '';
  if (id) {
    if (gear.size < SLOTS) { gear.add(id); fitShip(); }
    else { save.hold.push(id); note = ' (in your hold: fit it at a Gear shop)'; }
  }
  banner(`${name} complete!`, `+${amount} gold${id ? ` and the ${GEAR[id].name}${note}` : ''}`);
  sfx.victory();
  keep();
}

// The end of the story: fireworks over the harbour, and the sea is yours.
function celebrate() {
  mode = 'panel';
  fireworks = FIREWORKS;
  sfx.victory();
  showPanel({
    title: 'The curse is lifted!',
    text: 'You brought home all four relics and the Heart of the Sea.<br>Thank you for playing! The whole ocean is yours: keep exploring, hunting treasure and sinking pirates.',
    buttons: [{ label: 'Keep sailing', onClick: () => { sfx.click(); hidePanel(); mode = 'sea'; } }],
  });
}
const relics = () => save.bosses.filter((id) => id !== 'kraken').length; // the Kraken's heart isn't one of the four

// Boss lairs: sail into the one the story points at and the rocks rise around you and the boss.
function checkLairs(e, n) {
  const id = STEPS[save.story].boss;
  if (!id || fight) return;
  const lair = LAIRS[id];
  if (Math.hypot(lair.at[0] - e, lair.at[1] - n) > LAIR_ENTER) return;
  const w = toWorld(...lair.at);
  fight = { id, won: null };
  enemies.clear();
  ocean.raiseFence(w.x, w.z);
  enemies.summonBoss(lair.boss, w.x, w.z);
  banner(...lair.title);
  barks.length = 0;
  bark(lair.hint);
  fight.lines = lair.lines.slice(); // [health left, line], said as the boss gets that low
  setMusic('boss');
}

// Lines under the boss's bar: what the boss says or does, one after another.
const barks = [];
let barkTimer = 0;
const bark = (text) => barks.push(text);
function updateBarks(dt) {
  barkTimer -= dt;
  if (barkTimer > 0) return;
  const next = barks.shift();
  $('bark').textContent = next ?? '';
  $('bark').classList.toggle('on', !!next);
  barkTimer = next ? BARK : 0;
}

// The fight goes on until the boss is beaten; then its gold flies to you and the rocks sink away.
function updateFight(dt) {
  if (!fight) return;
  if (fight.won === null) { // the boss's lines, as its bar (the health it has left) gets low enough
    const left = parseFloat($('boss').querySelector('i').style.width) / 100;
    while (fight.lines.length && left <= fight.lines[0][0]) bark(fight.lines.shift()[1]);
  }
  if (fight.won === null && enemies.bossBeaten()) {
    const lair = LAIRS[fight.id];
    fight.won = 0;
    barks.length = 0;
    banner(lair.beaten, `You found ${lair.relic}!`);
    save.bosses.push(fight.id);
    advance();
    setMusic('calm');
  } else if (fight.won !== null) {
    fight.won += dt;
    if (fight.won > 4) {
      enemies.clear();
      ocean.lowerFence();
      fight = null;
    }
  }
}

function showHelp(then) {
  mode = 'panel';
  const svg = (path) => `<svg viewBox="0 0 24 24">${path}</svg>`;
  showPanel({
    title: 'How to play',
    text: 'The whole ocean is yours to explore.',
    tiles: [
      { icon: svg('<circle cx="12" cy="12" r="9"/><circle cx="15" cy="9" r="3"/>'), name: 'Steer',
        text: matchMedia('(pointer: coarse)').matches ? 'Touch the left side and drag' : 'WASD or the arrow keys' },
      { icon: svg('<path d="M3 11l14-5 2 6-14 4z"/><circle cx="8" cy="17" r="3"/>'), name: 'Fire',
        text: 'Fire Left and Fire Right shoot out of each side (Q and E)' },
      { icon: icon('chart'), name: 'Sea chart',
        text: 'The map button (or M) shows where you have sailed' },
      { icon: icon('port'), name: 'Ports',
        text: 'The compass points to the nearest. Repair, buy gear and upgrade there' },
    ],
    buttons: [{ label: 'Got it', onClick: () => { sfx.click(); save.seenHelp = true; store(); then(); } }],
  });
}

// ---------- ports ----------

// In port: the harbour's guns see off anything that followed you in.
function openPort(id) {
  if (talkThenPort(id)) return;
  const side = sides.talkAt(id);
  if (side) { // a side story to start, or one to hand in
    mode = 'talk';
    $('visit').classList.remove('on');
    hidePanel();
    showTalk(CAST, side.who, side.lines, () => { side.done(); openPort(id); });
    return;
  }
  mode = 'panel';
  $('visit').classList.remove('on');
  enemies.clear();
  loot.clear();
  save.lastPort = id;
  keep();
  const missing = Math.ceil(p.maxHp - p.hp), fixable = Math.min(missing, Math.floor(gold / PRICE.repairPerHp));
  const cost = Math.ceil(fixable * PRICE.repairPerHp);
  showPanel({
    title: PORTS[id].name,
    text: `Hull <b>${Math.ceil(p.hp)} / ${p.maxHp}</b> · Gold <b>${gold}</b>`,
    tiles: [
      { icon: REPAIR_ICON, name: 'Repair', text: missing ? `+${fixable} hull` : 'The hull is fine', price: missing ? `${cost} gold` : null,
        disabled: !fixable, onClick: () => { setGold(gold - cost); repair(fixable); openPort(id); } },
      { icon: icon('gear'), name: 'Gear shop', text: `${SLOTS} slots of ship gear`, onClick: () => { sfx.click(); openShop(id); } },
      { icon: `<svg viewBox="0 0 24 24">${UPGRADES.hull.icon}</svg>`, name: 'Shipyard', text: 'Upgrades that last for good',
        onClick: () => { sfx.click(); openShipyard(id); } },
      { icon: icon('chart'), name: 'Sail to…', text: travelTo(id) ? 'Any port you have found' : 'Find more ports first',
        disabled: !travelTo(id), onClick: () => { sfx.click(); openTravel(id); } },
    ],
    buttons: [{ label: 'Set sail', onClick: () => { sfx.click(); hidePanel(); mode = 'sea'; } }],
  });
}
const travelTo = (id) => save.ports.some((to) => to !== id && isOpen(PORTS[to].region));
const REPAIR_ICON = '<svg viewBox="0 0 24 24"><path d="M14 4a4 4 0 0 0 5 5l-9 9a2 2 0 0 1-3-3l9-9"/><path d="M4 20l3-3"/></svg>';
const back = (id) => [{ label: 'Back', quiet: true, onClick: () => { sfx.click(); openPort(id); } }];

// Three pieces of gear for sale, and any gear waiting in your hold (free to fit).
// With every slot full, a new piece swaps out one you pick, which goes into the hold.
function openShop(id, forSale = gearChoices(new Set([...gear, ...save.hold]), 3)) {
  showPanel({
    title: 'Gear shop',
    text: `Gold <b>${gold}</b> · Slots used <b>${gear.size} / ${SLOTS}</b>${save.hold.length ? ' · In your hold: tap to fit' : ''}`,
    tiles: [
      ...save.hold.map((g) => gearTile(g, { price: 'In your hold', onClick: () => fit(g, true) })),
      ...forSale.filter((g) => !gear.has(g) && !save.hold.includes(g)).map((g) => gearTile(g, { price: PRICE.gear, disabled: gold < PRICE.gear, onClick: () => fit(g, false) })),
    ],
    buttons: back(id),
  });
  function fit(g, held) {
    if (gear.size < SLOTS) take(g, held);
    else swapFor(g, held);
  }
  function take(g, held, out) {
    if (held) save.hold.splice(save.hold.indexOf(g), 1);
    else setGold(gold - PRICE.gear);
    if (out) { gear.delete(out); save.hold.push(out); }
    gear.add(g);
    fitShip();
    sfx.buy();
    keep();
    openShop(id, forSale);
  }
  function swapFor(g, held) {
    showPanel({
      title: 'Your slots are full',
      text: `Swap out which piece for the <b>${GEAR[g].name}</b>? It goes into your hold.`,
      tiles: [...gear].map((old) => gearTile(old, { onClick: () => take(g, held, old) })),
      buttons: [{ label: 'Keep them', quiet: true, onClick: () => { sfx.click(); openShop(id, forSale); } }],
    });
  }
}

// Spend gold on upgrades that last for good. Old Cob the shipwright has a word to say.
function openShipyard(id, says = p.hp < p.maxHp * 0.3 ? COB.wrecked : '') {
  showPanel({
    title: 'Shipyard',
    text: `${says ? `<i>Old Cob: "${says}"</i><br>` : ''}Gold <b>${gold}</b>`,
    tiles: Object.entries(UPGRADES).map(([u, up]) => {
      const cost = upgradeCost(u), top = save.levels[u] >= MAX_LEVEL;
      return {
        icon: `<svg viewBox="0 0 24 24">${up.icon}</svg>`, name: up.name, text: up.text, level: save.levels[u],
        price: top ? 'Fully upgraded' : `${cost} gold`, disabled: top || gold < cost,
        onClick: () => {
          setGold(gold - cost);
          save.levels[u]++;
          fitShip();
          if (u === 'hull') p.hp += 15; // the new planks come whole
          sfx.buy();
          keep();
          openShipyard(id, COB[u] ?? '');
        },
      };
    }),
    buttons: back(id),
  });
}

// Sail straight to any other port you've found.
function openTravel(id) {
  showPanel({
    title: 'Sail to…',
    text: 'A quick trip to a port you have already found.',
    tiles: save.ports.filter((to) => to !== id && isOpen(PORTS[to].region)).map((to) => ({
      icon: icon('port'), name: PORTS[to].name, text: REGIONS[PORTS[to].region].name,
      onClick: () => { sfx.click(); placeAtPort(to); openPort(to); },
    })),
    buttons: back(id),
  });
}

// Sunk: half the gold you carry is lost, and a fishing boat tows you back to the last port you visited.
function sunk() {
  mode = 'panel';
  sides.playerSunk();
  if (fight) { // the boss stays in its lair; try again later
    barks.length = 0;
    ocean.lowerFence();
    fight = null;
    setMusic('calm');
  }
  const lost = Math.floor(gold / 2), port = save.lastPort;
  setGold(gold - lost);
  showPanel({
    title: 'Sunk!', tone: 'lost',
    text: `You lost half your gold: <b>${lost}</b>. A fishing boat tows you back to ${PORTS[port].name}.<br><i>Old Cob: "${COB.sunk}"</i>`,
    buttons: [{ label: 'Back to port', onClick: () => {
      sfx.click();
      enemies.clear();
      loot.clear();
      fx.clear();
      placeAtPort(port, Infinity);
      openPort(port);
    } }],
  });
}

// A chest beside a shipwreck holds the wreck's log: one for each region, read once.
function readLog(id) {
  const t = treasures.get(id), m = t && toMap(t.x, t.z), where = m && regionAt(m.e, m.n);
  if (!t?.wreck || !LOGS[where] || save.logs.includes(where)) return;
  save.logs.push(where);
  const [title, text] = LOGS[where];
  mode = 'talk';
  showTalk({}, { name: title, face: null }, [text], () => { mode = 'sea'; });
}

// ---------- the sea chart, exploring and saving ----------

function openChart() {
  if (mode !== 'sea') return;
  mode = 'chart';
  sfx.click();
  const m = toMap(p.x, p.z), dir = toMap(Math.cos(p.heading), Math.sin(p.heading));
  showSeaChart({ seen: seen.join(''), N: SEEN, ports: save.ports, ship: { ...m, heading: Math.atan2(dir.e, dir.n) }, isOpen,
    goals: aims().map((a) => ({ text: a.text, at: [a.e, a.n], side: !!a.side })), relics: relics() }, () => {
    sfx.click();
    hideChart();
    mode = 'sea';
  });
}
addEventListener('keydown', (e) => {
  const k = e.key.toLowerCase();
  if (k === 'm' && mode === 'sea') openChart();
  else if (k === 'm' && mode === 'chart') $('chart').querySelector('.go').click();
  else if (k === 'enter' && mode === 'sea' && nearPort) $('visit').click();
  else if (k === 'c' && mode === 'sea') $('compass').click();
  else if ((k === 'enter' || k === ' ') && mode === 'talk' && !$('talk').dataset.choosing) $('talk').click();
});

// Mark the chart's squares near the ship as seen, and find any port close by.
function explore(e, n) {
  const cell = (2 * BOUND) / SEEN, reach = Math.ceil(SIGHT / cell);
  const ci = Math.floor((e + BOUND) / cell), cj = Math.floor((n + BOUND) / cell);
  for (let i = ci - reach; i <= ci + reach; i++) {
    for (let j = cj - reach; j <= cj + reach; j++) {
      if (i < 0 || j < 0 || i >= SEEN || j >= SEEN) continue;
      if (Math.hypot(-BOUND + (i + 0.5) * cell - e, -BOUND + (j + 0.5) * cell - n) < SIGHT) seen[j * SEEN + i] = '1';
    }
  }
  for (const [id, port] of Object.entries(PORTS)) {
    if (save.ports.includes(id) || Math.hypot(port.at[0] - e, port.at[1] - n) > FIND_PORT) continue;
    save.ports.push(id);
    banner(port.name, 'You found a port!');
    sfx.buy();
    store();
  }
}

function keep() {
  if (mode === 'title') return;
  Object.assign(save, { pos: { x: p.x, z: p.z, heading: p.heading }, hp: p.sinking < 0 ? p.hp : p.maxHp,
    gold, gear: [...gear], seen: seen.join('') });
  store();
}
addEventListener('pagehide', keep);
document.addEventListener('visibilitychange', () => { if (document.hidden) keep(); });

// The compass points where the story wants you, or else at the nearest port found so far.
// The Visit button shows next to any port.
// Tap the compass to switch between goals.
function pointCompass(e, n) {
  let best = null, bestD = Infinity;
  for (const id of save.ports) {
    const d = Math.hypot(PORTS[id].at[0] - e, PORTS[id].at[1] - n);
    if (d < bestD) { bestD = d; best = id; }
  }
  const port = PORTS[best], all = aims();
  compassPick %= Math.max(1, all.length);
  const quest = all[compassPick], goal = quest ?? { name: port.name, e: port.at[0], n: port.at[1], text: mainGoal() };
  $('compass').querySelector('i').style.transform = `rotate(${Math.atan2(goal.e - e, goal.n - n)}rad)`;
  const label = all.length > 1 ? `${goal.name} · ${compassPick + 1}/${all.length}` : goal.name;
  if (label !== compassLabel) $('compass').querySelector('span').textContent = compassLabel = label;
  if (goal.text !== compassText) $('goal').textContent = compassText = goal.text;
  $('compass').classList.toggle('quest', !!quest && !quest.side);
  $('compass').classList.toggle('side', !!quest?.side);
  const visit = mode === 'sea' && p.sinking < 0 && bestD < VISIT ? best : null;
  if (visit !== nearPort) {
    nearPort = visit;
    $('visit').classList.toggle('on', !!visit);
    if (visit) $('visit').textContent = `Visit ${port.name}`;
  }
}
let compassPick = 0, compassLabel = null, compassText = null;
$('compass').onclick = () => { if (mode === 'sea') { compassPick++; sfx.click(); } };
$('visit').onclick = () => { if (nearPort && mode === 'sea') { sfx.click(); openPort(nearPort); } };

// ---------- buttons in the corner: sea chart, music, sound ----------

unlockAudio();
const icons = {
  chart: icon('chart'),
  music: '<svg viewBox="0 0 24 24"><path d="M9 18V5l11-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="17" cy="16" r="3"/></svg>',
  sound: '<svg viewBox="0 0 24 24"><path d="M4 9h4l5-4v14l-5-4H4z"/><path d="M16 9a4 4 0 0 1 0 6M18.5 6.5a8 8 0 0 1 0 11"/></svg>',
};
for (const name of ['chart', 'music', 'sound']) {
  const btn = document.createElement('button');
  btn.className = 'round';
  btn.innerHTML = icons[name];
  if (name === 'chart') {
    btn.id = 'chartBtn';
    btn.title = 'Sea chart (M)';
    btn.onclick = openChart;
  } else {
    btn.title = name === 'music' ? 'Music on/off' : 'Sound effects on/off';
    btn.classList.toggle('off', !audioSetting(name));
    btn.onclick = () => {
      btn.classList.toggle('off', !toggleAudio(name));
      sfx.click();
    };
  }
  $('audio').append(btn);
}

// ---------- every frame ----------

const focus = new THREE.Vector3(); // what the camera looks at
const seaNow = new THREE.Color(REGIONS.home.sea), seaWant = new THREE.Color(REGIONS.home.sea);
let time = 0, shake = 0, saveTimer = SAVE_EVERY, fogNote = 0, fireworks = 0;

function frame(dt) {
  time += dt;
  readInput();
  const sailing = mode === 'sea'; // the world stands still behind the chart and port panels
  const mag = sailing ? Math.hypot(input.x, input.y) : 0;
  // Thumbstick on the screen -> heading in the world (the camera looks along (1,1,1)).
  const want = mag > 0.12 ? Math.atan2(-input.x - input.y, input.x - input.y) : null;
  if (mode === 'title') ship.update(dt, time, p.heading + dt * 0.25, 0.4); // lazy wide circles behind the title
  else {
    // Jellyfish stings and sandbars slow the ship down.
    p.slow = Math.max(0, (p.slow ?? 0) - dt);
    const soft = gear.has('sheathing');
    const drag = (p.slow > 0 ? (soft ? SHEATHING.sting : 0.5) : 1) * (ocean.sandAt(p.x, p.z) ? (soft ? SHEATHING.sand : 0.45) : 1);
    ship.update(dt, time, want, Math.min(1, mag * 1.3) * drag);
  }
  const hit = ocean.collide(p);
  if (hit > 1) { // bump: splash, knock and a little camera shake
    fx.splash(p.hitX, p.hitZ, 0.8);
    sfx.bump();
    shake = Math.min(0.4, hit * 0.06);
  }
  ocean.update(p.x, p.z, time);
  const at = toMap(p.x, p.z);
  if (mode !== 'title' && locked(at.e, at.n)) { // the curse fog won't let you through
    p.x = safe.x;
    p.z = safe.z;
    p.vx *= -0.4;
    p.vz *= -0.4;
    if (!fogNote) banner('A cursed fog blocks the way', 'The story will open it up');
    fogNote = 4;
  } else {
    safe.x = p.x;
    safe.z = p.z;
  }
  fogNote = Math.max(0, fogNote - dt);
  fog.update(p.x, p.z, time);
  brazier.update(time, flamesLit());
  updateBarks(dt);

  // Where are we? A new region gets a banner, its own sea colour and (in the Storm Belt) its weather.
  const m = toMap(p.x, p.z), here = regionAt(m.e, m.n);
  if (mode !== 'title') {
    if (here !== region) {
      const was = region;
      region = here;
      banner(REGIONS[here].name, REGIONS[here].tagline);
      seaWant.set(REGIONS[here].sea);
      document.documentElement.style.setProperty('--sea', '#' + seaWant.getHexString());
      if (!was || !!REGIONS[was].storm !== !!REGIONS[here].storm) weather.start(!!REGIONS[here].storm);
    }
    explore(m.e, m.n);
    pointCompass(m.e, m.n);
    if (mode === 'sea') checkLairs(m.e, m.n);
    saveTimer -= dt;
    if (saveTimer <= 0) {
      saveTimer = SAVE_EVERY;
      keep();
    }
  }
  if (sailing) {
    enemies.update(dt, time, p, stage.camera);
    if (!fight && !sides.busy()) roam(dt, p, region);
    sides.update(dt, time);
    if (region === 'maelstrom' && !fight && p.sinking < 0) { // the swirl carries you round its eye
      const eye = toWorld(...LAIRS.kraken.at), dx = eye.x - p.x, dz = eye.z - p.z, d = Math.hypot(dx, dz) || 1;
      p.vx += ((-dz / d) + (dx / d) * 0.3) * CURRENT * dt;
      p.vz += ((dx / d) + (dz / d) * 0.3) * CURRENT * dt;
    }
    updateFight(dt);
    weather.update(dt, time, [p, ...enemies.list.map((e) => e.body.state)], stage.camera);
    const got = loot.update(dt, time, p, stage.camera, fight?.won != null); // a beaten boss's gold all comes to you
    if (got.repair) repair(got.repair);
    if (got.gold) {
      setGold(gold + got.gold);
      flash('gold', 'pop');
    }
    if (got.chests.length) {
      save.chests.push(...got.chests);
      got.chests.forEach(readLog);
      keep();
    }
    if (p.sinking >= 0 && Math.random() < dt * 8) fx.bubble(p.x, p.z);
    if (p.sinking > 2.5) sunk();
  }
  seaNow.lerp(seaWant, 1 - Math.exp(-dt * 0.8)); // fade slowly into the next region's colour
  stage.setSea(seaNow, false);

  if (fireworks > 0) { // colourful bursts in the sky over the ship
    fireworks -= dt;
    if (Math.random() < dt * 7) {
      const colors = [0xff5a4a, 0xffd24a, 0x5bd16a, 0x6fc3ff, 0xc77dff];
      fx.puff(p.x + (Math.random() - 0.5) * 18, 6 + Math.random() * 4, p.z + (Math.random() - 0.5) * 18, 1.4 + Math.random(), colors[Math.floor(Math.random() * colors.length)]);
      if (Math.random() < 0.5) sfx.thud();
    }
  }
  foam(p.x, p.z, time);
  fx.update(dt);
  seaSpeed(Math.min(1, p.speed / 7));
  $('hull').firstChild.style.width = (100 * p.hp) / p.maxHp + '%';
  $('hull').classList.toggle('low', p.hp <= 30);
  for (const side of ['left', 'right']) {
    const ready = ship.ready(side);
    fireButtons[side].style.setProperty('--ready', ready.toFixed(2));
    if (ready >= 1 && !wasReady[side]) sfx.reloaded();
    wasReady[side] = ready >= 1;
  }

  // Camera: ship in the middle, leaning a little the way it is going.
  const k = 1 - Math.exp(-dt * 3);
  focus.x += (p.x + p.vx * 0.35 - focus.x) * k;
  focus.z += (p.z + p.vz * 0.35 - focus.z) * k;
  shake *= Math.exp(-dt * 8);
  stage.look(focus.clone().add(new THREE.Vector3((Math.random() - 0.5) * shake, 0, (Math.random() - 0.5) * shake)));
  stage.render();
}

showHome();
let last = performance.now();
// On the dev server only: report errors and a heartbeat to the laptop while testing on a phone.
const devlog = import.meta.env.DEV ? startDevLog(stage.renderer.domElement, () => {
  const m = toMap(p.x, p.z);
  return `mode=${mode} region=${region} hp=${Math.round(p.hp)} gold=${gold} chunks=${ocean.count()} at=${Math.round(m.e)},${Math.round(m.n)} ` +
    `enemies=${enemies.list.map((e) => `${e.kind}:${e.mode}`).join(',') || '-'}`;
}) : null;
stage.renderer.setAnimationLoop((now) => {
  const started = performance.now();
  try {
    frame(Math.min(0.05, (now - last) / 1000));
  } catch (err) {
    console.error(err); // one bad frame must never freeze the game: the next frame carries on
    devlog?.error(err);
  }
  devlog?.frame(performance.now() - started);
  last = now;
});

// Lets the browser console inspect the game while developing. teleport(e, n): jump to a spot on the map.
if (import.meta.env.DEV) {
  window.game = { stage, ship, ocean, enemies, loot, fx, gear, save, frame, setSail, openChart, openPort, setGold, advance, sides,
    get fight() { return fight; },
    teleport: (e, n) => { const w = toWorld(e, n); placeShip(w.x, w.z, p.heading); },
    get mode() { return mode; }, get region() { return region; }, get gold() { return gold; } };
}
