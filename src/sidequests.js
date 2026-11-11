// Side stories (saltwind_story_and_lore_bible.md, section 5): eight small quests handed out at ports.
// Go into the giver's port once the story has got far enough and they tell you their trouble; finish the
// job, come back, and they pay you (gold, and usually a piece of gear you can't buy).
//
// A quest's job is one of:
//   sites:   places marked by a pillar of light. Sail close and its guards turn up (a named elite among them);
//            sink them all and that place is done. Sail away or sink and the guards come back next time.
//   hunt:    sink so many of some kinds in one region ({ region, kinds: { kind: count } }). Sinking starts it over.
//   deliver: carry cargo to another port without your hull dropping below half; fire ships come after you.
//   escort:  a slow barge sails to a buoy while you stay close; raiders come for it in waves.
// save.quests[id]: { cleared: [true/false a site], counts: { kind: n }, arrived, done } once started.
import * as THREE from 'three';
import { flat } from './stage.js';
import { createShip } from './ship.js';
import { PORTS, REGIONS, toWorld, toMap, regionAt, dockSpot } from './map.js';
import { PEOPLE } from './story.js';

// The side-story cast; short names and faces as in story.js.
export const SIDE_PEOPLE = {
  pip: { name: 'Pip the Chart-Boy', short: 'Pip', face: { skin: 0xf3c9a3, hair: 0xa0522d, hat: 'straw', hatColor: 0xf2c230, freckles: true } },
  sallow: { name: 'Madame Sallow', short: 'Madame Sallow', face: { skin: 0xe8b98f, hair: 0x2b1d14, hat: 'tricorn', hatColor: 0x6a2c8e, earrings: true, collar: 0x1f8f5a } },
  nix: { name: 'Quartermaster Nix', short: 'Nix', face: { skin: 0xd6a37a, hair: 0x3b2a1f, hat: 'bandage', hatColor: 0xf4efe6, collar: 0x2f4d63 } },
  bjorn: { name: 'Bjorn the Bell-Maker', short: 'Bjorn', face: { skin: 0xf2c4a8, hair: 0xc8452a, hat: 'none', hatColor: 0, beard: true } },
  cob: { name: 'Old Cob', short: 'Old Cob', face: { skin: 0xe0a97e, hair: 0xd9d9d9, hat: 'bald', hatColor: 0, moustache: true, collar: 0x7a4a2a } },
};

export const QUESTS = {
  taxchest: {
    name: 'The Tax-Chest Overboard', port: 'home', who: 'pip', after: 3, gold: 120, gear: 'spyglass',
    goal: 'Fish up the tax-chest at Gull-Cry Wreck',
    sites: [{ name: 'Gull-Cry Wreck', at: [250, -800], guards: [['shark', 'Great Fin'], 'gunboat', 'gunboat'], prize: 'The tax-chest' }],
    start: [
      "Skipper, please! Before Mara checks the customs ledger! I was bringing the harbour dues across the sandbar when a Great Fin Shark rammed my dinghy!",
      "The iron chest sank by Gull-Cry Wreck, east along the coast, and that shark's still circling it like it's waiting for change! Fish it up and I'll give you my grandad's brass spyglass!",
    ],
    end: ["You got it! And the lock's only got two shark-teeth stuck in it! Here, take the Lookout's Spyglass before Mara sees me sweating."],
  },
  venom: {
    name: 'Venom for Velvet', port: 'smuggler', who: 'sallow', after: 3, gold: 250, gear: 'sheathing',
    goal: 'Sink pufferfish and a poacher sloop in the Reef', hunt: { region: 'reef', kinds: { puffer: 5, sloop: 1 } },
    start: [
      'Careful where you step on my dock, darling. Half these crates are contraband, and the other half explode if you sneeze.',
      'The apothecaries in the south pay a king\'s ransom for Puffer-Spine Oil. Sink five pufferfish and one of the poachers who hunt them. Try not to sink yourself: a sunk ship spills everything.',
    ],
    end: ['Still have all your fingers AND all your hull planks? Colour me impressed. Here is your cut, plus a little sheathing I lifted from an Imperial brig.'],
  },
  powder: {
    name: "The Mutineer's Powder-Run", port: 'castaway', who: 'nix', after: 6, gold: 400, gear: 'ramrod',
    goal: 'Carry the powder to Gale Roost, hull above half', deliver: { to: 'storm', who: 'bram', ambush: 3 },
    start: [
      "Thank the stars, a hull that isn't on fire! I mutinied against Admiral Kross last week, when he ordered us to shell a flock of seagulls for treason.",
      "I salvaged four barrels of Dry Imperial Powder, and Bram at Gale Roost will pay handsomely for them. But if your hull drops below half on the way, the powder goes boom. Mind the fire-ships!",
    ],
    end: ["DRY IMPERIAL TRIPLE-GRAIN?! Nix actually stole the Admiral's private reserve! Here's your hazard pay, skipper, and take my old ramrod. Your guns will thank you."],
  },
  gannet: {
    name: 'The Ghost of the Iron Gannet', port: 'storm', who: 'bram', after: 8, gold: 450, gear: 'quoin',
    goal: "Sink Captain Harrow's crew at Chain-Link Cove",
    sites: [{ name: 'Chain-Link Cove', at: [60, 230], guards: [['captain', 'Captain Harrow'], 'harpoon', 'harpoon'], prize: "Harrow's logbook" }],
    start: [
      "WITH THE FLAGSHIP ON THE BOTTOM, most of the Seventh Squadron has found peace. All except Captain Harrow, the Harpoon-Hound.",
      'He took two harpoon boats to Chain-Link Cove, west of here, and drags merchant skiffs onto the rocks. Sink him and bring me his logbook, so I can cross the last name off my roster.',
    ],
    end: ["So Harrow finally met a broadside he couldn't grapple out of. That closes the book on the Seventh Squadron. Take my old sighting-wedge: it'll put more bite in every shot."],
  },
  carillon: {
    name: 'The Sunken Carillon', port: 'floe', who: 'bjorn', after: 9, gold: 600, gear: 'plow',
    goal: 'Salvage the bell-fragments from the wrecks',
    sites: [
      { name: 'First wreck', at: [-350, 680], guards: [['raider', 'Ice-Fang'], 'raider'], prize: 'A bell-fragment' },
      { name: 'Second wreck', at: [50, 720], guards: ['raider', 'raider', 'sloop'], prize: 'A bell-fragment' },
      { name: 'Third wreck', at: [-100, 930], guards: [['raider', 'Old Crusher'], 'gunboat'], prize: 'A bell-fragment' },
    ],
    start: [
      "You've got keen eyes, skipper. Maybe you can spot what the raiders lost.",
      'I cast a three-ton bronze fog-bell so our whalers could find home in a whiteout. The Ice-Breaker Raiders stole it, then got their barge crushed between two bergs. Bring me the three fragments before the ice takes them!',
    ],
    end: ['All three pieces, and not a crack in the crown-loop! This coast will hear Rime-Post from ten leagues out. Here, I forged an ice-plow for your bow out of the scrap.'],
  },
  convoy: {
    name: 'The Warm-Milk Convoy', port: 'frozen', who: 'ylva', after: 11, gold: 750,
    goal: 'Escort the Blubber-Duck to the southern buoy', escort: { to: [-120, 600], waves: 3, hp: 80 },
    start: [
      "Now that the Serpent isn't boiling the channel, my cousin's sailing a barge of whale-oil and furs south to trade for timber.",
      'His tub sails like a wet brick, and the leftover raiders smell easy loot. Stay alongside the Blubber-Duck to the southern buoy and keep the raiders off her.',
    ],
    end: ['Not a single leak in the oil casks! Never thought I would see the Blubber-Duck make it in one piece. Take half the charter purse, southerner.'],
  },
  lures: {
    name: 'Lures in the Dark', port: 'abyss', who: 'orin', after: 12, gold: 900, gear: 'lantern',
    goal: 'Hunt the Elder Anglers at the false lights',
    sites: [
      { name: 'First false light', at: [-800, -350], guards: [['angler', 'Elder Angler'], 'ghost'], prize: 'A prism-lamp' },
      { name: 'Second false light', at: [-620, -60], guards: [['angler', 'Elder Angler'], 'ghost'], prize: 'A prism-lamp' },
      { name: 'Third false light', at: [-880, -620], guards: [['angler', 'Elder Angler'], 'ghost', 'angler'], prize: 'A prism-lamp' },
    ],
    start: [
      'Captain, if you see a warm golden light bobbing near the western shoals... do NOT drop anchor. Those are not harbour buoys.',
      'Three Elder Anglers swallowed my spare prism-lamps when the top of the lighthouse fell. Now they dangle them above the waves to lure lost sloops in. Bring my lamps back, please.',
    ],
    end: ['My prisms! A bit chewed around the frames, perhaps, but they still catch the light beautifully. Keep this smaller lantern for your bow. It shows what hides in the dark.'],
  },
  figurehead: {
    name: "The Ancestor's Figurehead", port: 'home', who: 'cob', after: 15, gold: 1500, gear: 'figurehead',
    goal: 'Find the four figurehead pieces',
    sites: [
      { name: 'Reef smuggler cove', at: [480, -250], guards: [['sloop', 'Reef Corsair'], 'jellies', 'puffer'], prize: 'A figurehead piece' },
      { name: 'Storm smuggler cove', at: [430, 380], guards: [['captain', 'Squall-Captain'], 'fireship', 'harpoon'], prize: 'A figurehead piece' },
      { name: 'Ice smuggler cove', at: [-380, 790], guards: [['raider', 'Frost-Jaw'], 'raider', 'captain'], prize: 'A figurehead piece' },
      { name: 'Abyss smuggler cove', at: [-560, -250], guards: [['ghost', 'The Pale Corsair'], 'ghost', 'angler'], prize: 'A figurehead piece' },
    ],
    start: [
      "You've sailed every sea on the chart now, skipper. Time I told you where your little sloop got her ribs.",
      "Nineteen years ago only one vessel broke out of the Maelstrom: Artificer Penrose's courier sloop, the Saltwind. That's her keel under your boots!",
      'Before Penrose died, the old figurehead was hidden in four smuggler coves: Reef, Storm, Ice and Abyss. I have marked them on your chart. Bring me the pieces and I will mount her true prow again.',
    ],
    end: ["By the deep... look at the grain on that heart-oak. Doesn't rot, doesn't splinter, and the sea itself parts to let her pass. She's the true Saltwind again, Captain."],
  },
};

// Every quest place, so chunks.js keeps the water around them clear.
export const QUEST_SPOTS = Object.values(QUESTS).flatMap((q) => [...(q.sites ?? []).map((s) => s.at), ...(q.escort ? [q.escort.to] : [])]);

const SITE = { reach: 25, guards: [12, 18], leave: 70 }; // sail this close for the guards; they give up this far away
const AMBUSH = { first: 20, every: 25, from: 60 }; // fire ships on a powder run: seconds, and only once this far out
const BARGE = { look: { hull: 0x7a5a3a, deck: 0xc9a46b, sail: 0xe8dcc0, stripe: 0x9a6a3e, flag: 0x5a8fb0 }, stats: { maxSpeed: 2.4, turn: 1.2, reload: 99, hp: 80 },
  follow: 20, arrive: 12 }; // it only sails while you're this close; it's there this close to the buoy
const BEAM = new THREE.CylinderGeometry(1.4, 1.4, 30, 14, 1, true).translate(0, 15, 0);
const RING = new THREE.RingGeometry(2.2, 3, 28).rotateX(-Math.PI / 2);

// api: enemies, ocean, fx, sfx, banner(text, small), player (the ship's state), hurtPlayer(amount, x, y, z),
// save() (keep progress), reward(gold, gearId, questName), start(questId) (a side story has just begun).
export function createSideStories(scene, save, api) {
  const { enemies, ocean, fx, sfx, banner, player: p } = api;
  const beams = new Map(); // 'quest:site' -> a pillar of light over a place you still need to visit
  const fights = new Map(); // 'quest:site' -> the guards fighting there now
  let barge = null, ambush = null;

  const state = (id) => save.quests[id];
  const short = (who) => (SIDE_PEOPLE[who] ?? PEOPLE[who]).short;
  const active = (id) => state(id) && !state(id).done;
  const whereIs = (x, z) => { const m = toMap(x, z); return regionAt(m.e, m.n); };

  // Is the quest's job done (ready to collect the reward)?
  function finished(id) {
    const q = QUESTS[id], st = state(id);
    if (q.sites) return st.cleared.every(Boolean);
    if (q.hunt) return Object.entries(q.hunt.kinds).every(([k, n]) => (st.counts[k] ?? 0) >= n);
    if (q.escort) return !!st.arrived;
    return true; // a delivery is done by reaching the port
  }

  // The quest's goal line, with progress.
  function goal(id) {
    const q = QUESTS[id], st = state(id);
    if (finished(id) && !q.deliver) return `Go back to ${short(q.who)} at ${PORTS[q.port].name}`;
    if (q.sites) return `${q.goal} (${st.cleared.filter(Boolean).length} / ${q.sites.length})`;
    if (q.hunt) return `${q.goal} (${Object.entries(q.hunt.kinds).map(([k, n]) => `${Math.min(n, st.counts[k] ?? 0)}/${n}`).join(', ')})`;
    return q.goal;
  }

  // A chat to play on going into this port, or null: a reward to hand over first, else a new side story.
  // Returns { who, lines, done() }.
  function talkAt(port) {
    for (const [id, q] of Object.entries(QUESTS)) {
      if (!active(id)) continue;
      const back = q.deliver ? q.deliver.to : q.port, who = q.deliver ? q.deliver.who : q.who;
      if (back === port && finished(id)) return { who, lines: q.end, done: () => reward(id) };
    }
    for (const [id, q] of Object.entries(QUESTS)) {
      if (q.port !== port || state(id) || save.story < q.after) continue;
      return { who: q.who, lines: q.start, done: () => begin(id) };
    }
    return null;
  }

  function begin(id) {
    const q = QUESTS[id];
    save.quests[id] = { cleared: (q.sites ?? []).map(() => false), counts: {}, arrived: false, done: false };
    banner('New side story', q.name);
    sfx.chest();
    showBeams();
    if (q.deliver) ambush = { id, timer: AMBUSH.first, left: q.deliver.ambush };
    api.start(id);
    if (q.escort) launchBarge(id);
  }

  function reward(id) {
    const q = QUESTS[id];
    save.quests[id].done = true;
    if (q.deliver) ambush = null;
    showBeams();
    api.reward(q.gold, q.gear, q.name);
  }

  // A side story fails (you sank, the cargo blew up, the barge went down): it can be started again in port.
  function fail(id, why) {
    delete save.quests[id];
    if (barge?.id === id) removeBarge();
    if (ambush?.id === id) ambush = null;
    showBeams();
    banner(why, `Talk to ${short(QUESTS[id].who)} again to try once more`);
  }

  // Pillars of light over every place you still need to visit.
  function showBeams() {
    const want = new Set();
    for (const [id, q] of Object.entries(QUESTS)) {
      if (!active(id)) continue;
      (q.sites ?? []).forEach((s, i) => { if (!state(id).cleared[i]) want.add(`${id}:${i}`); });
      if (q.escort && !state(id).arrived) want.add(`${id}:buoy`);
    }
    for (const [k, b] of beams) if (!want.has(k)) { scene.remove(b); b.children.forEach((m) => m.material.dispose()); beams.delete(k); }
    for (const k of want) {
      if (beams.has(k)) continue;
      const [id, i] = k.split(':'), q = QUESTS[id], at = i === 'buoy' ? q.escort.to : q.sites[+i].at, w = toWorld(...at);
      const g = new THREE.Group(), beam = new THREE.Mesh(BEAM, flat(0.22, 0xffe27a)), ring = new THREE.Mesh(RING, flat(0.7, 0xffe27a));
      beam.material.side = THREE.DoubleSide;
      ring.position.y = 0.08;
      g.add(beam, ring);
      g.position.set(w.x, 0, w.z);
      scene.add(g);
      beams.set(k, g);
    }
  }

  // ---------- the escort ----------

  function launchBarge(id) {
    const q = QUESTS[id], from = dockSpot(q.port), w = toWorld(from.e, from.n), to = toWorld(...q.escort.to);
    const ship = createShip(scene, BARGE.look, { ...BARGE.stats, hp: q.escort.hp });
    ship.reset(w.x + 4, w.z + 4, Math.atan2(to.z - w.z, to.x - w.x));
    const s = ship.state;
    s.hurtBy = (amount) => {
      fx.shipHit(s.x, 1, s.z);
      sfx.crack();
      if (ship.hurt(amount)) sfx.sink();
    };
    const total = Math.hypot(to.x - s.x, to.z - s.z);
    barge = { id, ship, to, total, waves: q.escort.waves, sent: 0 };
    const bar = document.getElementById('boss');
    bar.querySelector('b').textContent = 'The Blubber-Duck';
    bar.querySelector('.pips').innerHTML = '';
    bar.classList.add('on');
  }

  function removeBarge() {
    barge.ship.remove();
    barge = null;
    document.getElementById('boss').classList.remove('on');
  }

  function updateBarge(dt, t) {
    const s = barge.ship.state, { to } = barge, left = Math.hypot(to.x - s.x, to.z - s.z);
    const near = Math.hypot(p.x - s.x, p.z - s.z) < BARGE.follow;
    let want = Math.atan2(to.z - s.z, to.x - s.x);
    if (!ocean.clearAt(s.x + Math.cos(want) * 5, s.z + Math.sin(want) * 5, 1.2)) want += 1.2; // round rocks and ice
    barge.ship.update(dt, t, want, near && s.sinking < 0 ? 1 : 0);
    ocean.collide(s, 1.2);
    document.querySelector('#boss i').style.width = (100 * s.hp) / s.maxHp + '%';
    // Raiders come in waves as the barge gets further along.
    const along = 1 - left / barge.total;
    if (barge.sent < barge.waves && along > (barge.sent + 0.4) / (barge.waves + 0.5)) {
      barge.sent++;
      banner('Raiders!', 'Keep them off the Blubber-Duck');
      for (let k = 0; k < 2; k++) enemies.spawn('raider', s, 16, 20)?.forEach((e) => { e.target = s; });
    }
    if (s.sinking > 2) fail(barge.id, 'The Blubber-Duck sank!');
    else if (left < BARGE.arrive && s.sinking < 0) {
      state(barge.id).arrived = true;
      banner('The Blubber-Duck made it!', 'Report back to Ylva at Rime-Post');
      sfx.victory();
      removeBarge();
      showBeams();
    }
  }

  // ---------- every frame, while sailing ----------

  function update(dt, t) {
    for (const [k, b] of beams) { // the pillars of light shimmer
      b.children[0].material.opacity = 0.18 + 0.08 * Math.sin(t * 2 + b.position.x);
      b.children[1].scale.setScalar(1 + 0.08 * Math.sin(t * 3));
    }
    // Places with guards: sail close and they turn up; sink them all and the place is done.
    for (const [id, q] of Object.entries(QUESTS)) {
      if (!active(id) || !q.sites) continue;
      q.sites.forEach((site, i) => {
        const key = `${id}:${i}`, w = toWorld(...site.at), d = Math.hypot(p.x - w.x, p.z - w.z);
        if (state(id).cleared[i]) return;
        const guards = fights.get(key);
        if (!guards) {
          if (d > SITE.reach || p.sinking >= 0) return;
          const elite = site.guards.find((g) => Array.isArray(g));
          fights.set(key, site.guards.flatMap((g) => enemies.spawn(...(Array.isArray(g) ? [g[0], p, ...SITE.guards, g[1]] : [g, p, ...SITE.guards])) ?? []));
          banner(site.name, elite ? `${elite[1]} is here!` : 'Guards!');
          sfx.sharkWarn();
          return;
        }
        if (guards.every((e) => e.sunk)) { // all sunk: the prize is yours
          fights.delete(key);
          state(id).cleared[i] = true;
          banner(`${site.prize} recovered!`, goal(id));
          sfx.chest();
          showBeams();
          api.save();
        } else if (d > SITE.leave || guards.some((e) => !e.sunk && !enemies.list.includes(e))) {
          fights.delete(key); // you left: the guards will be back next time
        }
      });
    }
    // A powder run: fire ships come after you, and the powder goes up if the hull drops below half.
    if (ambush) {
      const from = toWorld(...PORTS[QUESTS[ambush.id].port].at);
      if (p.sinking < 0 && p.hp < p.maxHp / 2) {
        fx.boom(p.x, p.z);
        api.hurtPlayer(10, p.x, 1, p.z);
        fail(ambush.id, 'The powder went up!');
      } else if (ambush.left > 0 && Math.hypot(p.x - from.x, p.z - from.z) > AMBUSH.from && whereIs(p.x, p.z) === 'storm') {
        ambush.timer -= dt;
        if (ambush.timer <= 0 && enemies.spawn('fireship', p, 22, 28)) {
          ambush.left--;
          ambush.timer = AMBUSH.every;
          banner('A fire ship!', 'Sink it from afar: it blows up');
        }
      }
    }
    if (barge) updateBarge(dt, t);
  }

  // An enemy was sunk: count it for a hunt.
  function sunk(kind, x, z) {
    for (const [id, q] of Object.entries(QUESTS)) {
      if (!active(id) || !q.hunt || !(kind in q.hunt.kinds) || whereIs(x, z) !== q.hunt.region) continue;
      const st = state(id);
      if ((st.counts[kind] ?? 0) >= q.hunt.kinds[kind]) continue;
      st.counts[kind] = (st.counts[kind] ?? 0) + 1;
      if (finished(id)) banner(q.name, goal(id));
    }
  }

  // The player sank: hunts start over, cargo and convoys are lost, guards will be back.
  function playerSunk() {
    fights.clear();
    for (const [id, q] of Object.entries(QUESTS)) {
      if (!active(id)) continue;
      if (q.hunt && !finished(id)) state(id).counts = {};
      if (q.deliver || (q.escort && !state(id).arrived)) fail(id, 'Side story failed');
    }
  }

  // Where active side stories want you: [{ name, e, n }], each with its goal text.
  function targets() {
    const out = [];
    for (const [id, q] of Object.entries(QUESTS)) {
      if (!active(id)) continue;
      const text = goal(id);
      if (finished(id) || q.deliver) {
        const port = q.deliver ? q.deliver.to : q.port;
        out.push({ name: PORTS[port].name, e: PORTS[port].at[0], n: PORTS[port].at[1], text });
      } else if (q.sites) {
        const i = state(id).cleared.indexOf(false), site = q.sites[i];
        out.push({ name: site.name, e: site.at[0], n: site.at[1], text });
      } else if (q.escort) {
        const at = barge ? toMap(barge.ship.state.x, barge.ship.state.z) : { e: q.escort.to[0], n: q.escort.to[1] };
        out.push({ name: 'Blubber-Duck', e: at.e, n: at.n, text });
      } else {
        const at = REGIONS[q.hunt.region].at; // a hunt: anywhere in its region
        out.push({ name: REGIONS[q.hunt.region].name, e: at[0], n: at[1], text });
      }
    }
    return out;
  }

  // Is a side-story fight on (so no other enemies should roam in)?
  const busy = () => fights.size > 0 || !!barge;

  // Coming back to a saved game: an escort under way starts over (the barge isn't saved); a powder run carries on.
  for (const [id, q] of Object.entries(QUESTS)) {
    if (!active(id)) continue;
    if (q.escort && !state(id).arrived) delete save.quests[id];
    if (q.deliver) ambush = { id, timer: AMBUSH.first, left: q.deliver.ambush };
  }
  showBeams();
  return { talkAt, update, sunk, playerSunk, targets, busy, active };
}
