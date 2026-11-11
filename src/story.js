// The story (from saltwind_story_and_lore_bible.md). Nineteen years ago High Navigator Vane broke the
// Tide-Spire, tore out the Heart of the Sea and scattered four relics; the sea answered with the Maelstrom
// and walls of Curse Fog. The Bone-Needle Compass points to the relics; each one brought home to the
// Harbour Brazier lights a flame that burns away the next fog wall.
//
// The story is a list of steps; save.story is the index of the step you're on. Each step has a goal
// (shown under the compass) and one way to finish it:
//   talk: a port id. Go into that port and a chat plays (who: a person below; lines: see below;
//         end: the last chat of the story).
//   sink: a number of enemies to sink (kind: only that kind counts).
//   boss: a lair id (map.js LAIRS). Beat the boss there.
// A line is a string (said by `who`), { who, text } (someone else speaks), or
// { choice: [[button, reply], [button, reply]] }: two buttons; the reply to the one picked is said next.
// A region's fog lifts once save.story reaches the step in its `opens` (map.js REGIONS).

// short: what others call them. face: how their portrait is drawn (screens.js): skin, hair and hat colours, hat: cap / straw / bandana /
// fur / hood / none, and extras: beard, patch (eye patch), freckles, marks (cheek marks colour),
// collar (coat collar colour), goggles, eyes (eye colour), ghost (see-through and glowing).
export const PEOPLE = {
  mara: { name: 'Harbourmaster Mara', short: 'Mara', face: { skin: 0xd9a066, hair: 0xb8b8b8, hat: 'cap', hatColor: 0x2f4d63, collar: 0xf2c230 } },
  kaelen: { name: 'Kaelen "Coral-Thumb"', short: 'Kaelen', face: { skin: 0xb9773f, hair: 0xf3e0a0, hat: 'bandana', hatColor: 0x2fbfc0, marks: 0xe0469a } },
  bram: { name: 'Master Gunner Bram', short: 'Bram', face: { skin: 0xead8c8, hair: 0x4a4a4e, hat: 'none', hatColor: 0x000000, beard: true, patch: true, collar: 0xb83a2e } },
  ylva: { name: 'Ylva Frost-Tooth', short: 'Ylva', face: { skin: 0xf6d2c0, hair: 0xf4efe6, hat: 'fur', hatColor: 0xf4efe6, goggles: true, freckles: true } },
  orin: { name: 'Orin the Keeper', short: 'Orin', face: { skin: 0x9fe3ea, hair: 0xd9c8ff, hat: 'none', hatColor: 0x000000, collar: 0x5a4a8e, eyes: 0xffc94a, ghost: true } },
};

export const STEPS = [
  // ---------- Prologue: the dying tide ----------
  { goal: 'Talk to Harbourmaster Mara', talk: 'home', who: 'mara', lines: [
    "You're awake. Good. Half the skippers in Home Harbour packed their sea-chests last night and rowed south before the tide died completely.",
    "Look at the breakwater. The Salt-Shroud crept another three boat-lengths closer before dawn, and the wind won't even lift a harbour pennant.",
    { choice: [
      ["Why haven't you packed, Mara?", "Because I built this jetty with my own two hands, skipper, and I'm too stubborn to let a wall of haunted mist evict me."],
      ['My hull is sound. What needs doing?', "That's the salt talking. I knew there was a reason I kept your mooring fee paid up."],
    ] },
    'Nineteen years ago, High Navigator Vane broke the great Tide-Spire out in the Maelstrom. Whatever he woke in the deep is choking the sea to death, region by region.',
    "Take this. It washed out of the fog yesterday in an iron strongbox. It's the Bone-Needle Compass.",
    "It doesn't point north. It points to the four Wayfinder Relics. Bring them back to our Harbour Brazier, and its fire will burn the Curse Fog right off the water.",
    "But first, prove your guns aren't rusted shut. Two Cutthroat Sloops have been looting the supply skiffs out in Home Waters. Sink them and report back.",
  ] },
  { goal: 'Sink 2 Cutthroat Sloops in Home Waters', sink: 2, kind: 'sloop' },
  { goal: 'Report back to Mara', talk: 'home', who: 'mara', lines: [
    'Clean shooting. Saw the smoke from my tower. Old Cob has the Shipyard open, so spend that gold on your planking before you push east.',
    'See how the Bone-Needle twitches toward the sunrise? The eastern fog wall is thin around the Reef.',
    'Find a reef-fisher called Kaelen at Coral Cay. Kaelen knows those shallows better than the eels do. Bring the first relic home, skipper.',
  ] },

  // ---------- Chapter 1: Crown of the Carapace ----------
  { goal: 'Sail east to Coral Cay', talk: 'reef', who: 'kaelen', lines: [
    'Mind your keel on the brain-coral, skipper! Scrape a plank here and the reef-worms will eat your rudder before you drop anchor.',
    "Hold on, is that a Bone-Needle humming on your binnacle? Haven't seen brass like that since the old Meridian fleet went down.",
    { choice: [
      ['Mara sent me. The fog is swallowing Home Harbour.', "So it's reached the south bay too. Out here the mist boxed us in three moons back. The jellyfish grew big as rowboats."],
      ["The needle points here. What's hiding in your reef?", 'Hiding? Friend, you could spot him from the moon if the clouds cleared.'],
    ] },
    'A bronze-and-shell horn washed out of the Maelstrom: the Tide-Chime Conch. Hums like a church organ under the water.',
    'The Crab King took a shine to it and wedged it right into the crown of his shell. Every time it hums, every puffer and shark for leagues goes barking mad.',
    "He's holed up in Sunken Crown Atoll, north-east of here. Snap off his claws, then hit the soft middle. Bring me peace and quiet, and the Conch is yours.",
  ] },
  { goal: 'Defeat the Crab King at Sunken Crown Atoll', boss: 'crab' },
  { goal: 'Take the Tide-Chime Conch to the Brazier', talk: 'home', who: 'mara', lines: [
    "Listen to that... the water against the pilings just rose three inches. That's the first real tide Home Harbour has felt in a year!",
    'Look north on your Sea Chart. The chime tore a channel straight through the northern shroud into the Storm Belt.',
    "Fair warning: the Imperial Navy's Seventh Squadron was up there when the curse hit. Their flagship never came back, and neither did the sun. Find Bram at Gale Roost.",
  ] },

  // ---------- Chapter 2: The Admiral Who Refused the Shore ----------
  { goal: 'Sail north to Gale Roost', talk: 'storm', who: 'bram', lines: [
    "SPEAK UP IF YOU'RE BUYING POWDER! The thunder's hammered this rock for nineteen years, and my left ear's only good for keeping my hat level!",
    'Wait... I know that compass case. Artificer Penrose made it, on the Meridian. Which means you are hunting the Fulmen Lodestone.',
    { choice: [
      ['Who bolted a storm-relic onto a warship?', "A man who couldn't stomach losing a war that was already over."],
      ['That Navy coat. Was that your fleet?', 'Was. Until I chose a leaky rowboat over a madhouse with sixty cannons.'],
    ] },
    'When Vane broke the sea, Admiral Kross fished the Lodestone out of the wreckage and bolted it to his flagship. It pulls lightning out of the clouds to feed his guns.',
    "He thinks if the storm never ends, the battle never ends. He circles Tempest Bastion, north-west of here.",
    'Watch for the red band on the water: that side is about to fire. Knock out his cannons, then sink the hull. Give the old fool the burial at sea he is nineteen years late for.',
  ] },
  { goal: 'Sink the Admiral at Tempest Bastion', boss: 'flagship' },
  { goal: 'Take the Fulmen Lodestone to the Brazier', talk: 'home', who: 'mara', lines: [
    'Felt the hair on my arms stand up from a mile off! The storm-swell has broken, and the trade wind is finally in the rigging.',
    'North of the Storm Belt lies the Frozen North. It was a summer whaling passage before the curse turned it into a grinding mill of pack-ice.',
    'The needle is pulling toward Rime-Post. Watch for the Ice-Breaker Raiders: iron prows and no manners. Ask for a trapper called Ylva.',
  ] },

  // ---------- Chapter 3: The Fire Under the Flake ----------
  { goal: 'Sail far north to Rime-Post', talk: 'frozen', who: 'ylva', lines: [
    'Tie your mooring line with a slip-knot, southerner. Leave wet hemp on these bollards for ten minutes and you will need an axe to cast off.',
    'Here, drink this. Seal-broth and crushed pepper. Tastes like an old boot, stops your teeth from cracking.',
    { choice: [
      ['(Drink it) That burns all the way to my boots!', "Means your stomach hasn't frozen yet. You'll live till Tuesday."],
      ["I'm looking for a relic that fell into the ice.", "It didn't fall into the ice. If it had, the ice would have melted."],
    ] },
    "When the Tide-Spire blew apart, its great heating lens, the Sun-Amber, dropped into the northern trench. Then the Great Sea Serpent swallowed it whole.",
    'Now the beast has a furnace in its belly. It melts tunnels through the pack-ice and leads the raiders straight to our stores.',
    'Its lair is the Boiling Caldron, east of here. Keep moving so the bergs do not pin you, shoot it whenever it rears up, and dodge the red strip when it lunges.',
  ] },
  { goal: 'Defeat the Sea Serpent at the Boiling Caldron', boss: 'serpent' },
  { goal: 'Take the Sun-Amber Lens to the Brazier', talk: 'home', who: 'mara', lines: [
    "Look at the gulls circling the masthead, skipper. First time they've come back to nest since the frost set in.",
    'Three relics home, one left. And the fog wall that just dropped is the one none of us wanted to look behind.',
    "The Abyss lies far to the west, where Vane's own flagship drifted after the Maelstrom spat it out. Find Lantern Spire, and don't follow stray lights in the water. Half of them have teeth.",
  ] },

  // ---------- Chapter 4: The Toll of the Unburied ----------
  { goal: 'Sail far west to Lantern Spire', talk: 'abyss', who: 'orin', lines: [
    "Ah, the supply sloop from Home Harbour! You're a touch late, Captain. My pocket-watch stopped on the eleventh of November, and I'm nearly out of whale-oil.",
    'Wait. Why can I see the rigging of your ship right through the back of my hand? Oh dear. Have I been dead long?',
    { choice: [
      ['Nineteen years, Orin. Since Vane broke the Spire.', 'Nineteen years? I thought it was just a remarkably long winter night. No wonder my tea went cold.'],
      ['Your light still kept me off the rocks.', "Did it? That's a comfort. A keeper hates to think a ship went down on his watch."],
    ] },
    "I'd have let go long ago, truly. Except Vane's Ghost Galleon never stops ringing that dreadful Soul-Bell. Every toll drags the drowned back to their stations.",
    'Even the anglerfish have learned to mimic our deck-lanterns, to lure living ships down.',
    "The Galleon prowls Dead Man's Anchorage, north-west of here. You cannot strike her while she fades away. Wait until she turns solid, then loose your broadside. Let us sleep, Captain.",
  ] },
  { goal: "Defeat the Ghost Galleon at Dead Man's Anchorage", boss: 'galleon' },
  { goal: 'Take the Soul-Bell to the Brazier', talk: 'home', who: 'mara', lines: [
    "Four flames burning bright... and the Bone-Needle isn't twitching any more. It's pointing dead into the Maelstrom.",
    'Every monster in the sea is being pulled into that whirlpool to guard its master. At the centre sits the Kraken, clutching the Cursed Heart.',
    'Check your gear, see Old Cob about your hull, and make ready. Tear that Heart away from the beast, skipper, and give us back our ocean.',
  ] },

  // ---------- Finale: the Heart of the Sea ----------
  { goal: 'Defeat the Kraken in the Eye of the Maelstrom', boss: 'kraken' },
  { goal: 'Carry the Heart of the Sea home', talk: 'home', who: 'mara', end: true, lines: [
    'Breathe that in, skipper! Pure salt wind from the west, not a speck of grey rot in it!',
    { who: 'kaelen', text: 'The reef has gone quiet as a lagoon! Even the puffers deflated enough for me to sail down with a barrel of spiced rum!' },
    { who: 'bram', text: 'AND THE THUNDER BROKE OVER GALE ROOST AT NOON! Saw the sun for the first time in nineteen years. Nearly blinded my one good eye!' },
    { who: 'ylva', text: "Don't get soft on us, southerner. The northern passages are clear, and there's still plenty of pirate gold frozen in the floes." },
    'You saved Home Harbour, Captain. The Bone-Needle is yours to keep, the fog is gone for good, and the whole Sundered Reach is open water. Sail wherever the wind takes you!',
  ] },
  { goal: 'The curse is lifted. The sea is yours!' },
];

// The steps at which each Brazier flame lights (once each relic is handed in at home), then the Heart of the Sea.
export const FLAMES = [6, 9, 12, 15, 17];

// Shipwreck logs: found in chests beside wrecks, one for each region.
export const LOGS = {
  home: ['Log of the Brine-Swallow', "14th of Frost-Moon: The fog crept past the outer buoy today. Pulled up a bucket of salt-crust thick as porridge. If we don't sail south by noon, our rudder will set like stone."],
  reef: ['Log of the Gilded Guppy', 'Note to self: do NOT anchor near the giant singing seashell. The crew could not sleep for the humming, and at dawn a crab the size of a tavern climbed aboard and ate the capstan.'],
  storm: ['Log of the Thunderchild', 'Day 4,210 of the Northern Patrol: The Admiral court-martialled the barometer for predicting fair weather. Gunner Bram slipped over the side at midnight. Wish I had gone with him.'],
  frozen: ["Log of the Narwhal's Tooth", 'The water under the ice-shelf is steaming hot, while our sails are frozen stiff as boards. Saw a golden light moving under the floe, thirty fathoms long and coiled like a watch-spring.'],
  abyss: ["Log of the Meridian's Wake", 'Vane lied to us. The Spire was never meant to calm the sea. It was a harpoon rig to cage the beast at the bottom. When his silver bell rings, my hands go back to the oars whether I will it or not.'],
};

// Old Cob, the shipwright, has something to say in the shipyard.
export const COB = {
  wrecked: 'Did you sail here, or did a whale chew your hull and spit you onto my slipway? Hold still while I fetch the oakum.',
  hull: "Double-seasoned ironwood planks. Even the Crab King'll chip a claw trying to pinch through that.",
  sails: "Stitched from storm-canvas and greased with tallow. Catch a quarter-knot of breeze and you'll outrun a cannonball.",
  sunk: 'Fished you out of the kelp with half your pockets empty, skipper. The sea always takes her salvage fee.',
};

// Where the current step wants you to go: { kind: 'port' | 'lair', id } or null.
export function target(step) {
  const s = STEPS[step];
  if (s?.talk) return { kind: 'port', id: s.talk };
  if (s?.boss) return { kind: 'lair', id: s.boss };
  return null;
}
