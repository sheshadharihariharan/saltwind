# Saltwind: plan

Chosen 2026-11-11. Third game, after River Puzzle and Tidebound. Built from a copy of Tidebound.

**Progress:** Milestones 1 to 3 played on the phone 2026-11-11. Milestones 4 to 6 (story), the lore bible's main story, and its 8 side stories (src/sidequests.js: 3 new settlements, guarded places, a hunt, a powder run, an escort, 7 reward gears and a gear hold) built the same day, played on the phone. Published 2026-11-11 at https://sheshadharihariharan.github.io/saltwind/ (repo github.com/sheshadharihariharan/saltwind). 2026-11-12: built and pushed live trade-wind currents (src/currents.js), places to find (pirate camps, sea forts, stranded sailors, bottles with treasure maps), a living sea (src/life.js) and busier seas (wanted pirates with bounties, pirate fleets). Also 2026-11-12: enemies scale with your shipyard levels and the end of the story (up to double health, 1.6x damage, half the crates), more wanted pirates and fleets after the story, legendary boss rematches that win special sails, a Harbour Fund to rebuild Home Harbour (src/harbour.js), and the Sailmaker's liveries. Pushed live 2026-11-12 (fc9e140), with panels that fit short screens and dolphins that swim their own course. Also live 2026-11-12 (6edcb52): each chunk's still scenery merged into one mesh (Reef lag fix) and a western current from Lantern Spire to Floe-Edge Camp. Still to do: balancing.

**Part Two: The Grey Flag** (chosen 2026-11-12: a Part Two after the Kraken, with trading and bounty captains, villain the Brotherhood of the Grey Flag led by Silas Mourne, the Fog-King; full plan in the approved plan file, summarised here). Chapters: 5 Grey Flags (Kaelen teaches trading, pearls to Gale Roost, Bram names Gull-Eye Garrick, Sallow puts up the Bounty Board), 6 Fire on the Water (Widow Vex, Storm Belt), 7 Iron in the Ice (Hob Ironjaw, Frozen North), 8 Lights in the Murk (Mother Murk, Abyss), Finale (raid on Home Harbour, Grey Haven, the Black Tide). **Milestone 7 built 2026-11-12 (live as 26b4ed8):** src/trade.js (6 goods, markets at the 6 ports that make one, 12-crate hold, prices by distance with a per-visit drift and a sell-down, no fast travel with cargo, cargo lost on sinking, pirates come sooner and more often Brotherhood when laden), src/bounties.js (4 captains with hideouts, grey pillar, captain + crew, boss bar, bounty paid on sinking), enemies brother and chief kinds (Garrick whistles up help at half health), Chapter 5 story steps 17-21, the Bounty Board. **Milestone 8 built 2026-11-12 (live as 26b4ed8):** Widow Vex (fire ships), Hob Ironjaw (rams and drops mines), Mother Murk (fades like a ghost), chapters 6-8 (trade runs: storm-canvas to Rime-Post, furs to Lantern Spire, lantern oil to Home Harbour), Sallow's warning, the raid on Home Harbour (sink 8 Brotherhood ships, smoke over the town), Grey Haven (800, 550) and the Black Tide (the Admiral's fight in grey with Brotherhood helpers, mines astern and smoke), the second ending (story steps 22-36), Black Tide legendary sails. Also fixed: a lair just won no longer starts its legendary rematch until you sail out. Still to do: balancing after the phone test.

## Context
Tidebound is finished and live: 3 voyages, 3 bosses, a shipyard and saving. The user loves it and wants the next game, **Saltwind**. Unlike Tidebound's short voyages, Saltwind is an **open world**: one large ocean you sail around freely, with a simple **story** running through it.

**Decided with the user (2026-11-11):**
- **Story: the cursed compass.**
  - Home Harbour is cursed. An old compass points to the relics that can lift the curse, each guarded by a boss.
  - The story is kept simple: short chats with a few characters at ports, plus a marker showing where to sail next.
- **One world with the story inside it, on a single save.**
  - Quests point the way, but you can roam anywhere you've unlocked.
  - After the ending you keep sailing.
- **Size:** crossing the whole ocean takes about **5 minutes** at the starting sail speed (about 2,000 × 2,000 units; the ship's top speed is 7). It can grow later.
- **Layout: regions on a map that looks like a real sea.** The regions are listed under "The ocean" below.

Saltwind starts as a **copy of Tidebound**, so Tidebound stays live and unchanged. Saltwind gets its own GitHub repo and Pages link.

## How it's built
- **New folder** `D:\Game devo\New Game Ideas\saltwind\`:
  - Copy `tidebound/` without `.git`, `node_modules` or `dist`.
  - Start a new git repo and a new public GitHub repo `saltwind`, with the same Pages workflow (`.github/workflows`).
  - Add the dev server to `.claude/launch.json` on port **5175**, with `--host` so the phone can open it.
- Write `saltwind/PLAN.md` (these contents, in plain words), and add Saltwind to the memory file.

**Kept as they are:**
- `ship.js` (`steer`, `createShip`, `stats.size`), `input.js`, `effects.js`, `audio.js`, `loot.js`
- `creatures.js`, `enemies.js` (KINDS, `think`, `spawn`), `kraken.js`, `crab.js`, `flagship.js`
- `weather.js`, `gear.js`, `devlog.js` and the Vite phone-log plugin

**Adapted:**
- `stage.js`: the sea colour fades smoothly between regions, using `setSea`.
- `world.js`: `build(seed, kind, look)` becomes `buildChunk(cx, cz)`. Collision only checks nearby chunks.
- `save.js`: add the ship's position, the chart you've uncovered, story progress and the gear fitted to the ship.
- `screens.js`: add a dialogue box and the sea chart.
- `main.js`: modes become title / sea / port / dialogue / chart.

**Removed:**
- `voyage.js`, and the wave flow in `battle.js`. The boss banner and arena fence are kept for boss lairs.

**New files:**

| File | What it does |
|---|---|
| `src/map.js` | The fixed ocean: region shapes, region colours and enemy pools (taken from Tidebound's VOYAGES), and hand-placed key places (ports, boss lairs, relic spots, curse fog walls). |
| `src/chunks.js` | Streams the ocean in 64-unit squares, keeping only the squares around the ship loaded. Each square is built from a fixed world seed, so islands are always in the same place. Shared meshes and materials keep phones smooth. |
| `src/roam.js` | Spawns enemies around the ship from the current region's pool, out of view, and removes them when far away. At most about 4 at once. |
| `src/story.js` | Chapters as simple steps (talk to, sail to, beat, bring back), the current objective, and the quest marker. |
| `src/ports.js` | What each port offers: repair, gear shop, shipyard (permanent upgrades, now bought at ports), and fast travel to ports you've visited. |

## The ocean (south to north and west to east)
| Region | Where | Enemies | Boss / relic |
|---|---|---|---|
| **Home Waters** (Shallows) | south, warm | sloop, gunboat, turtle, shark | Home Harbour (start) |
| **The Reef** | east | jelly, puffer, sandbars, coral | Crab King → Relic 1 |
| **Storm Belt** | north | fire ship, captain, harpooner, eels, weather | Admiral's Flagship → Relic 2 |
| **Frozen North** | far north | **new:** drifting icebergs, ice-breaker raiders | **new:** Sea Serpent → Relic 3 |
| **The Abyss** | far west, dark | **new:** ghost ships that fade in and out, anglerfish lure lights | **new:** Ghost Galleon → Relic 4 |
| **The Maelstrom** | centre-west | everything | **Kraken** (finale, holds the cursed heart) |

- **Curse fog:** a wall of fog closes off each region until the previous relic is brought home. That's both the story gate and the difficulty gate.
- **Boss lairs:** fixed spots. Rocks rise around you when you enter, so the fight works like a Tidebound boss arena.
- **Small places to find:** treasure coves (`loot.chest`), wrecks and pirate camps. Each region also has 1–2 ports.

## Rules for the open sea
- **Sinking:** you lose half the gold you were carrying and wake up at the last port you visited. Gear and upgrades are kept.
- **Gear:** bought at ports or found in chests. Up to **3 slots**, kept until you swap it.
- **Map and sailing aids:**
  - A small compass at the top shows the quest marker and the nearest port.
  - A **sea chart** button opens a map of the regions. Unexplored areas stay hidden until you sail near them.
- **Fast travel:** between ports you've already visited, from the chart.

## Story outline (short chats with code-drawn portraits)
| Chapter | Where | What happens |
|---|---|---|
| Prologue | Home Harbour | The harbourmaster gives you the compass. First steps teach sailing and fighting. |
| 1 | The Reef | A reef fisher asks for help. Beat the Crab King, bring home Relic 1. Storm Belt fog lifts. |
| 2 | Storm Belt | An old navy gunner. Beat the Admiral, Relic 2. Frozen North fog lifts. |
| 3 | Frozen North | A trapper on an ice port. Beat the Sea Serpent, Relic 3. Abyss fog lifts. |
| 4 | The Abyss | A ghostly lighthouse keeper. Beat the Ghost Galleon, Relic 4. Maelstrom opens. |
| Finale | The Maelstrom | Beat the Kraken and bring the cursed heart home. The curse lifts, the town celebrates, and you sail on freely. |

## Milestones (each one tested on the phone before the next)
1. **Open sea:**
   - Copy the project, set up the repo and the dev server.
   - Streamed 2,000-unit ocean with region colours, Home Harbour, compass, sea chart with hidden areas, and save position.
   - Sailing only.
   - **Test the phone's frame rate with the heartbeat log.**
2. **Life at sea:**
   - Enemies roaming each region, loot and repair crates, treasure coves.
   - Ports with repair, shop, shipyard and fast travel.
   - Sinking sends you back to the last port; full saving.
3. **Story, part 1:**
   - Dialogue box and portraits, quests and the marker, curse fog walls.
   - Prologue plus chapters 1–2, using the existing Crab King and Flagship in their lairs.
4. **Frozen North:** icebergs, ice-breaker raiders, the Sea Serpent, chapter 3.
5. **The Abyss:** ghost ships, anglerfish, the Ghost Galleon, chapter 4.
6. **Finale and polish:**
   - The Maelstrom and the Kraken, the ending, and free sailing after it.
   - Title screen, how to play, balancing, publish to GitHub Pages.

## Verification (every milestone)
1. **Laptop (built-in browser preview):**
   - Step frames with `window.game.frame(1/30)`, because the pane is hidden.
   - Use helpers such as teleporting the ship, setting the chapter and giving gold to reach each region quickly.
   - Check there are no console errors.
2. **Phone over Wi-Fi** (`http://192.168.1.9:5175`):
   - The user plays, and the devlog heartbeat reports the frame rate and slowest frame.
   - In Milestone 1 especially, check streaming doesn't stutter. If it does, shrink the loaded area or the number of objects per square.
3. **Production build:** `npm run build` compiles, and `__log` isn't in `dist`.
4. **Publishing:** push to GitHub Pages only when the user says "Push it live", then check the live page serves the new build.

## Working rules (carried over)
- The user doesn't read code: explain in plain words, and confirm before building.
- One milestone at a time. New ideas go into a "Later" list in `saltwind/PLAN.md`.

## Later (parking lot)
Ideas that come up while building go here, not into the current milestone.
- ~~More settlements~~, ~~delivery missions~~, ~~convoy guarding~~ and ~~short stories for each region~~: done as the side stories (2026-11-11).

**Ideas suggested by Claude (2026-11-11), not chosen yet:**
- ~~**Messages in bottles:**~~ (done 2026-11-12, as bottles with treasure maps) bottles float by with a torn map; follow the clues to dig up buried treasure on an island.
- **Bounty board** (partly there: wanted pirates roam with bounties): each port posts a named pirate captain (a tougher, unique enemy) to hunt for big gold.
- **Captain's logbook:** a book that fills in as you meet creatures, bosses, ports and people, with a line of lore for each.
- **Day and night:** lanterns on ships at night, darker water, anglerfish lures that matter more.
- **Bigger ships:** buy a brig or a frigate at a shipyard, with more hull, more cannons and more gear slots.
- **Crew:** hire a gunner, navigator or carpenter at ports for a small bonus each (faster reload, faster sails, slow self-repair).
- ~~**Sail colours and flags:**~~ (done 2026-11-12, the Sailmaker) spend spare gold on how the ship looks.
- ~~**Legendary bosses:**~~ (done 2026-11-12) after the story, each boss can be fought again, harder, for a rare reward.
