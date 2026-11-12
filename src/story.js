// The story (from saltwind_story_and_lore_bible.md). Nineteen years ago High Navigator Vane broke the
// Tide-Spire, tore out the Heart of the Sea and scattered four relics; the sea answered with the Maelstrom
// and walls of Curse Fog. The Bone-Needle Compass points to the relics; each one brought home to the
// Harbour Brazier lights a flame that burns away the next fog wall.
//
// The story is a list of steps; save.story is the index of the step you're on. Each step has a goal
// (shown under the compass) and one way to finish it:
//   talk: a port id. Go into that port and a chat plays (who: a person below; lines: see below;
//         end: { title, text } the last chat of a part of the story: fireworks and that message).
//   sink: a number of enemies to sink (kind: only that kind counts; raid: they come at Home Harbour).
//   boss: a lair id (map.js LAIRS). Beat the boss there.
//   trade: { good, count, at } (Part Two). Sell that many crates of a good (trade.js GOODS) at port `at`.
//   bounty: a captain id (bounties.js CAPTAINS). Sink that Brotherhood captain at their hideout.
// heard: a captain's wanted poster goes up on the Bounty Board once this chat is done.
// board: the Bounty Board appears in ports once this chat is done.
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
  { goal: 'Carry the Heart of the Sea home', talk: 'home', who: 'mara', lines: [
    'Breathe that in, skipper! Pure salt wind from the west, not a speck of grey rot in it!',
    { who: 'kaelen', text: 'The reef has gone quiet as a lagoon! Even the puffers deflated enough for me to sail down with a barrel of spiced rum!' },
    { who: 'bram', text: 'AND THE THUNDER BROKE OVER GALE ROOST AT NOON! Saw the sun for the first time in nineteen years. Nearly blinded my one good eye!' },
    { who: 'ylva', text: "Don't get soft on us, southerner. The northern passages are clear, and there's still plenty of pirate gold frozen in the floes." },
    'You saved Home Harbour, Captain. The Bone-Needle is yours to keep, the fog is gone for good, and the whole Sundered Reach is open water. Sail wherever the wind takes you!',
  ], end: { title: 'The curse is lifted!',
    text: 'You brought home all four relics and the Heart of the Sea.<br>The whole ocean is yours! And word has come from Coral Cay: Kaelen has news.' } },

  // ================= Part Two: the Grey Flag =================

  // ---------- Chapter 5: Grey Flags ----------
  { goal: 'Kaelen has news at Coral Cay', talk: 'reef', who: 'kaelen', lines: [
    'Captain! Look at the harbour. Three merchant ketches this week! With the fog gone, the whole Reach wants to trade again.',
    "Coral Cay's pearl beds are full to bursting, and Bram's lot up at Gale Roost would swap their own boots for something shiny.",
    "Here's the trick: buy a thing where it's made, and sell it where it isn't. The further you carry it, the more it fetches.",
    { choice: [
      ['Easy money, then.', 'Easy? Two ketches went missing off the Reef last week. Not a plank found. Just a grey flag drifting on the tide.'],
      ['What could go wrong?', 'Funny you should ask. Two ketches went missing off the Reef last week. Not a plank found. Just a grey flag drifting on the tide.'],
    ] },
    "Take five crates of pearls up to Gale Roost, and keep your guns loaded. The Market here will sell you as many as your hold can carry.",
  ] },
  { goal: 'Sell 5 crates of pearls at Gale Roost', trade: { good: 'pearls', count: 5, at: 'storm' } },
  { goal: 'Talk to Bram at Gale Roost', talk: 'storm', who: 'bram', heard: 'garrick', lines: [
    "PEARLS! The lads will be wearing them in their beards by supper. Fine haul, skipper.",
    'Grey flags, you say? Aye, I know that rag. The Brotherhood of the Grey Flag.',
    "While the fog lay thick, no navy in the world could find them. Smugglers, wreckers, cut-throats. They grew fat in the grey, and now the fog's gone they're hungry.",
    "Their nearest nest is out on the Reef: a captain called Gull-Eye Garrick, hiding at Gull Shoals, east of Coral Cay.",
    "He whistles like a bosun when a fight turns against him, and his whole crew comes running. Sink him fast, and keep an eye on the horizon.",
  ] },
  { goal: 'Sink Gull-Eye Garrick at Gull Shoals', bounty: 'garrick' },
  { goal: "Show Garrick's flag to Madame Sallow at Smuggler's Atoll", talk: 'smuggler', who: 'sallow', board: true, lines: [
    'Well, well. Garrick\'s grey flag, still reeking of his cheap tobacco. You have been busy, darling.',
    'Yes, I know that mark. Before the fog lifted I ran cargo for the Brotherhood. Everybody did. It was that or starve.',
    'Their master is Silas Mourne. They call him the Fog-King. For nineteen years he ruled the grey, and he wants it back.',
    { choice: [
      ['How do you bring fog back?', 'Only one way, darling. Throw the Heart of the Sea back into the trench. And it sits in your harbour\'s Brazier, does it not?'],
      ['Why tell me any of this?', 'Because Mourne never pays his debts, and you always do. Besides, the Heart sits in your harbour\'s Brazier. He will come for it.'],
    ] },
    'Mourne keeps four captains between himself and trouble. Garrick was the first. I shall pin the others on a Bounty Board in every port, as I hear of them.',
    'And sail carefully with a full hold. The Brotherhood can smell cargo from three leagues off.',
  ] },

  // ---------- Chapter 6: Fire on the Water ----------
  { goal: 'Sell 6 crates of storm-canvas at Rime-Post', trade: { good: 'canvas', count: 6, at: 'frozen' } },
  { goal: 'Talk to Ylva at Rime-Post', talk: 'frozen', who: 'ylva', heard: 'vex', lines: [
    'Storm-canvas. Good. Ours froze and split like kindling. Now my sledge-boats can sail again.',
    'Not that there is much left to sail. My fur convoy went south three days ago. One ship came back, and that one was on fire.',
    'A woman in black stood on the deck of a grey ship, laughing, and every boat she touched went up like a torch.',
    { choice: [
      ['Where did she go?', 'Back to her nest at Cinder Reach, south-west of Gale Roost. The smoke hangs over it like a flag.'],
      ['Who was she?', 'Bram calls her Widow Vex. Buried three husbands, and burned the ships of all three. She hides at Cinder Reach, south-west of Gale Roost.'],
    ] },
    'She sends burning ships at anything that floats. Sink them from far off, southerner, or they will take your planks with them.',
  ] },
  { goal: 'Sink Widow Vex at Cinder Reach', bounty: 'vex' },

  // ---------- Chapter 7: Iron in the Ice ----------
  { goal: 'Sell 6 crates of furs at Lantern Spire', trade: { good: 'furs', count: 6, at: 'abyss' } },
  { goal: 'Talk to Orin at Lantern Spire', talk: 'abyss', who: 'orin', heard: 'ironjaw', lines: [
    "Furs! How thoughtful. I don't feel the cold myself, you understand, but the new lamplighters do. Since the fog lifted, the living have come back to the Spire.",
    'And I can see a long way from the top of the tower, now the night is not so thick. Last week I saw something I did not like.',
    'A grey ship with an iron jaw, Captain, grinding through the ice floes east of Rime-Post. It broke a whaler in two with one bite.',
    { choice: [
      ['Who sails her?', 'A great bear of a man with an iron plate on his chin. The whalers call him Hob Ironjaw. His nest is the Grinding Floes.'],
      ['A ship that bites?', 'Rams, I should say. The whalers call her master Hob Ironjaw, for the iron on his chin and the iron on his prow. His nest is the Grinding Floes.'],
    ] },
    'When the red line shows on the water, steer aside. And mind the black kegs he leaves behind him. They are not full of tea.',
  ] },
  { goal: 'Sink Hob Ironjaw at the Grinding Floes', bounty: 'ironjaw' },

  // ---------- Chapter 8: Lights in the Murk ----------
  { goal: 'Sell 6 crates of lantern oil at Home Harbour', trade: { good: 'oil', count: 6, at: 'home' } },
  { goal: 'Talk to Mara at Home Harbour', talk: 'home', who: 'mara', heard: 'murk', lines: [
    'Lantern oil! Bless you, skipper. With trade back, the harbour stays open past dark, and the lamps drink it by the barrel.',
    "But I've had a letter from the lamplighters at Lantern Spire. Ships are going missing in the west again, and these ones were following lights.",
    "Not anglerfish this time. A grey ship hung with drowned lanterns, that fades into the dark like one of Vane's ghosts.",
    { choice: [
      ['Another Grey Flag captain.', "Mother Murk, the letter says. The last of Mourne's four. She hides at the Drowned Lanterns, north-west of the Spire."],
      ['Ghosts again?', "No ghost, skipper. A woman called Mother Murk who has learned the ghosts' tricks. She hides at the Drowned Lanterns, north-west of the Spire."],
    ] },
    'Shoot only when you can see her, same as the Galleon. And come home safe.',
  ] },
  { goal: 'Sink Mother Murk at the Drowned Lanterns', bounty: 'murk' },

  // ---------- Finale: the Fog-King ----------
  { goal: "All four captains are sunk. Tell Madame Sallow at Smuggler's Atoll", talk: 'smuggler', who: 'sallow', lines: [
    'Four grey flags on my wall, darling. Mourne must be chewing his own hat.',
    'Which is exactly what worries me. A man with no captains left has nothing left to lose.',
    'My little birds say he has gathered every Brotherhood ship in the Reach, and they sailed this morning. South.',
    { choice: [
      ['Home Harbour!', 'Home Harbour. He is going for the Heart in your Brazier, and he is going for it now.'],
      ["What's south?", 'Your Home Harbour, darling. And the Heart of the Sea, sitting in its Brazier.'],
    ] },
    'Sail, darling. Sail like the fog is on your heels, because it will be.',
  ] },
  { goal: 'Drive the Grey Flag out of Home Harbour', sink: 8, kind: 'brother', raid: true },
  { goal: 'Check on Mara at Home Harbour', talk: 'home', who: 'mara', lines: [
    'You came! They were at the dock, skipper. They were at the BRAZIER.',
    "The Heart's safe. Old Cob dropped the first one who touched it with a caulking mallet. But Mourne himself never came ashore.",
    'He watched from his flagship, the Black Tide, and when your sails came over the horizon he turned and ran.',
    "Kaelen's fishermen saw him go: north-east, far past Gale Roost, to a hidden cove the smugglers call Grey Haven.",
    { choice: [
      ['Then that is where I am going.', "I thought you'd say that. Old Cob has patched every plank he could reach. Go and finish it."],
      ['Is the town all right?', "A few burnt awnings and a lot of angry fishwives. We'll mend. Now go and finish it, skipper."],
    ] },
    "She's a big ship, like the Admiral's, only meaner. Knock out her cannons first, and watch the water behind her.",
  ] },
  { goal: 'Sink the Black Tide at Grey Haven', boss: 'greyhaven' },
  { goal: "Bring Mourne's grey flag home", talk: 'home', who: 'mara', lines: [
    "There it is! The Fog-King's own flag. We'll hang it from the lighthouse, skipper, so every ship in the Reach can see it.",
    { who: 'sallow', text: 'I came the moment I heard, darling. Silas Mourne, sunk. I shall have to find a new line of work. Perhaps an honest one. Perhaps.' },
    { who: 'kaelen', text: 'The pearl boats are already lining up! Not a grey flag between here and the Reef.' },
    { who: 'bram', text: "AND I'M BUYING THE RUM. ALL OF IT." },
    { who: 'ylva', text: 'Hmph. Not bad, southerner. Not bad at all.' },
    { who: 'orin', text: "I'll keep the Spire lit for you, Captain. A keeper's work is never quite done." },
    "The fog's gone, the Grey Flag's gone, and the sea belongs to everyone who sails it. Thanks to you. Fair winds, skipper.",
  ], end: { title: 'The Grey Flag is struck!',
    text: "You sank Mourne's four captains, saved Home Harbour and sent the Black Tide to the bottom.<br>Thank you for playing! The Reach is free: keep trading, hunting legends and exploring." } },
  { goal: 'The Grey Flag is struck. Trade, hunt and sail wherever you like!' },
];
// The step once the curse is lifted (the start of Part Two).
export const END = 17;

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
  if (s?.trade) return { kind: 'port', id: s.trade.at };
  if (s?.talk) return { kind: 'port', id: s.talk };
  if (s?.boss) return { kind: 'lair', id: s.boss };
  return null;
}
