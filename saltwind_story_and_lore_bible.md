# Saltwind: Story, Lore & Dialogue Bible

** Saltwind** takes place across the **Sundered Reach**, a circular basin of the world-ocean where the tides broke nineteen years ago. Built around a 65-to-80-minute open-world progression loop, the narrative blends maritime folklore with compact, mobile-friendly dialogue boxes designed for `src/story.js` and `src/screens.js`.

---

## 1. World Lore: The Mythos of the Salt-Shroud

### The Breaking of the Tide
Nineteen years ago, the bustling port of **Home Harbour** funded the **Grand Meridian Expedition**. Led by High Navigator **Mordecai Vane**, a fleet of twelve iron-ribbed ships sailed to the centre-west waters to construct the **Tide-Spire**—a monumental lighthouse engineered with four astronomical relics to calm the ocean's deadliest currents.

When Vane reached the bottomless trench at the heart of the Reach, he found something older than the currents: the **Slumbering Kraken**, coiled around the **Living Heart of the Sea**. Instead of sealing the trench, Vane struck a bargain for eternal dominion over the waves. He wrenched the **Heart of the Sea** from the seabed, shattered the Tide-Spire's mechanism into **Four Wayfinder Relics**, and scattered them to the four corners of the ocean.

The sea retaliated instantly. The central waters collapsed into a roaring funnel known as **The Maelstrom**, swallowing Vane's fleet, while the surrounding ocean fractured into unnatural climate zones locked behind towering walls of **Curse Fog**.

### How the Curse Works in Gameplay
* **The Salt-Shroud (Curse Fog):** A dense, wind-eating wall of pale grey mist that divides the ocean's six regions. Any ship that sails into an unlifted fog wall has its sails go dead and its timbers violently pushed back by phantom currents. To the townsfolk, the fog is worse than a wall—it slowly creeps inward every year, turning fish to chalk, rusting iron overnight, and erasing the memories of anyone who breathes it too long.
* **The Bone-Needle Compass (The Cursed Compass):** Crafted by Vane's betrayed chief artificer before he went overboard, this brass-and-whalebone instrument does not point north. Its needle is magnetised to the resonance of the **Four Relics** and the **Cursed Heart**, humming louder as you sail near a boss lair.
* **The Harbour Brazier:** Located on the stone breakwater of Home Harbour, this ancient beacon housing is where each recovered Relic must be slotted. Restoring a Relic ignites a new harmonic flame in the brazier, burning away the specific fog wall guarding the next region.

### The Four Relics & The Cursed Heart
| Item | Region | Guardian Boss | Lore & Function |
|---|---|---|---|
| **1. The Tide-Chime Conch** | The Reef | **Crab King** | A spiral fossil inlaid with bronze astrolabe rings that governs shallow currents. The Crab King wedged it into his shell as a vibrating crown; its hum drives the reef's creatures into a territorial frenzy. |
| **2. The Fulmen Lodestone** | Storm Belt | **Admiral's Flagship** | A crackling core of sky-iron that drinks lightning. The mad Imperial Admiral bolted it to his prow to summon an endless hurricane so his war-fleet would never have to surrender. |
| **3. The Sun-Amber Lens** | Frozen North | **Sea Serpent** | A massive prism of volcanic amber that radiates perpetual heat. Swallowed by the ancient Sea Serpent, it keeps the beast's blood boiling while the surrounding sea freezes into deadly icebergs. |
| **4. The Soul-Bell of Vane** | The Abyss | **Ghost Galleon** | A silver ship's bell hanging from the mainmast of Vane's sunken flagship. Every time the waves rock it, its toll binds sunken crews to the dark water as flickering phantoms. |
| **5. The Cursed Heart** | The Maelstrom | **The Kraken** | The petrified, black-veined Heart of the Sea clutched inside the Kraken's central maw. Cleansing it in Home Harbour's brazier restores the true wind to the entire ocean. |

---

## 2. Gameplay Pacing & 75-Minute Runtime Architecture

To hit a natural **65 to 80 minutes** of total gameplay without artificial padding, each chapter combines exploration across the $2000 \times 2000$ unit ocean, shipyard upgrades to survive tougher enemy pools, main boss arenas, and regional side stories.

| Phase | Region | Core Activities | Est. Time |
|---|---|---|---|
| **Prologue** | Home Waters (Shallows) | Learn steering & cannon fire, sink 2 scout sloops, salvage a wreck for starting gold, unlock the Compass. | 8 mins |
| **Chapter 1** | The Reef | Sail east, visit Coral Cay Port, buy Hull/Cannon Tier 1, complete 2 Reef side quests, defeat **Crab King**, fast-travel/sail back to Home Harbour. | 15 mins |
| **Chapter 2** | Storm Belt | Sail north through squalls & eels, visit Gale Roost Port, unlock Gear Slot 2, complete 2 Storm side quests, defeat **Admiral's Flagship**, return Relic 2. | 18 mins |
| **Chapter 3** | Frozen North | Navigate drifting icebergs, visit Rime-Post Port, buy Speed/Ram upgrades, complete 2 Ice side quests, defeat **Sea Serpent**, return Relic 3. | 18 mins |
| **Chapter 4** | The Abyss | Navigate dark waters & angler lures, visit Lantern Spire, equip endgame gear, complete 2 Abyss side quests, defeat **Ghost Galleon**, return Relic 4. | 16 mins |
| **Finale & Post-Game** | The Maelstrom | Breach the centre-west vortex, survive the multi-enemy gauntlet, defeat **The Kraken**, return the **Cursed Heart**, celebration + epilogue quest. | 15 mins |

---

## 3. Character Bible (with Code-Portrait Specs)

Each character is designed so their portrait in `src/screens.js` can be drawn cleanly with simple 2D canvas shapes, bold silhouettes, and distinct colour palettes, while their voice feels distinct and grounded.

### Main Story Cast

1. **Mara "Barnacle" Vance — The Harbourmaster (Home Harbour)**
   * **Code Portrait Spec:** Warm ochre skin, sharp square jaw, bright yellow oilskin collar, grey braided hair tucked under a dark navy cap, brass spyglass slung across chest.
   * **Personality:** Pragmatic, sharp-tongued, fiercely protective of her dying town. Treats the apocalypse like a badly balanced shipping ledger that needs fixing before supper.
2. **Kaelen "Coral-Thumb" — The Reef Fisher (Coral Cay, The Reef)**
   * **Code Portrait Spec:** Sun-bronzed skin, messy bleached-blonde hair, turquoise bandana, glowing magenta coral-ink markings on cheeks, wide grin with a reed pipe.
   * **Personality:** Unbothered, observant, cheerfully fatalistic. Talks about twenty-foot man-eating crustaceans the way a gardener talks about cabbage worms.
3. **Master Gunner Bram "Lockjaw" (Gale Roost, Storm Belt)**
   * **Code Portrait Spec:** Soot-smudged pale skin, thick charcoal-grey beard, red tattered navy coat, brass ear-trumpet held to left side, iron eye-patch over right eye.
   * **Personality:** Gruff, guilt-ridden deserter from the Imperial Fleet. Shouts slightly because twenty years of broadsides ruined his eardrums.
4. **Ylva Frost-Tooth — The Ice Trapper (Rime-Post, Frozen North)**
   * **Code Portrait Spec:** Rosy windburned cheeks, thick white seal-fur hood framing her face, amber snow-goggles pushed up on forehead, scarred bridge of nose.
   * **Personality:** Dry, deadpan northern wit. Wastes zero words when a blizzard is coming, respects anyone who doesn't complain about frozen rigging.
5. **Orin — The Ghostly Lighthouse Keeper (Lantern Spire, The Abyss)**
   * **Code Portrait Spec:** Translucent cyan-and-violet skin with a subtle glow effect, tall collar of an old-fashioned keeper's coat, eyes like twin golden lantern flames, flickering edges.
   * **Personality:** Gentle, polite, melancholic, and slightly unstuck in time. He still winds the clockwork of his ruined lighthouse every evening, unaware he drowned nineteen years ago.

### Recurring & Side-Quest Cast

6. **Old Cob — The Master Shipwright (All Port Shipyards)**
   * **Code Portrait Spec:** Bald head, thick leather apron, walrus moustache, wooden callipers tucked behind ear.
   * **Personality:** Judges human beings entirely by how many barnacles they let grow on their rudder.
7. **Pip the Chart-Boy (Home Harbour Jetty)**
   * **Code Portrait Spec:** Oversized oilskin hat falling over eyes, freckled face, clutching a rolled parchment scroll.
8. **Madame Sallow — The Salvage Broker (Smuggler's Atoll, The Reef)**
   * **Code Portrait Spec:** Purple velvet tricorn hat, gold hoop earrings, emerald-green shawl, shrewd half-smile.
9. **Quartermaster Nix (Castaway Rock, Storm Belt)**
   * **Code Portrait Spec:** Bandaged forehead, torn striped shirt, clutching a charred ship's wheel.
10. **Bjorn the Bell-Maker (Floe-Edge Camp, Frozen North)**
    * **Code Portrait Spec:** Braided red beard with icicles in it, bronze hammer over shoulder.

---

## 4. Complete Main Storyline & Dialogue Script

> **Implementation Note for `src/story.js`:** Each dialogue block is formatted in compact 2–4 line beats so it fits comfortably inside a phone dialogue box without scrolling. `[Player Choice]` prompts require only a simple two-button branch that converges right back into the main text.

---

### PROLOGUE: The Dying Tide (Home Waters)

**Scene 1: Waking at the Jetty**
*(The player's small sloop rocks beside the stone pier of Home Harbour. The water is dull grey-green near the outer breakwater, where a wall of Curse Fog looms across the northern and eastern horizons. Harbourmaster Mara waits on the dock.)*

* **Mara:** "You're awake. Good. Half the skippers in Home Harbour packed their sea-chests last night and rowed south before the tide died completely."
* **Mara:** "Look at the breakwater. The Salt-Shroud crept another three boat-lengths closer before dawn. The herrings are floating belly-up, stiff as chalk, and the wind won't even lift a harbour pennant."
* **[Player Choice]:**
  * *Option A: "Then why haven't you packed your chest, Mara?"*
    * **Mara:** "Because I built this jetty with my own two hands, skipper, and I'm too stubborn to let a wall of haunted mist evict me."
  * *Option B: "My hull's still sound. Tell me what needs doing."*
    * **Mara:** "That's the salt talking. I knew there was a reason I kept your mooring fee paid up."
* **Mara:** "Nineteen years ago, High Navigator Vane broke the Great Tide-Spire out in the Maelstrom. Whatever he woke up in the deep is choking the sea to death, region by region."
* **Mara:** "Take this. Pulled it out of an iron strongbox that washed out of the fog yesterday. It's the **Bone-Needle Compass**."
* **Mara:** "Doesn't point north—never has. It points toward the **Four Wayfinder Relics** scattered when the Spire broke. Bring those relics back to our **Harbour Brazier**, and its fire will burn the Curse Fog right off the water."
* **Mara:** "Before I send you into the Reef, prove your guns aren't rusted shut. Two **Cutthroat Sloops** have been looting the supply skiffs outside the bay. Sink 'em, grab whatever gold they drop, and report back."

**Quest Marker 0.1:** *Sink the 2 Cutthroat Sloops in Home Waters and collect their loot crates.*

**Scene 2: Returning to Home Harbour**
*(Triggered when the player docks at Home Harbour after sinking the sloops.)*

* **Mara:** "Clean shooting. Saw the smoke over the sandbar from my tower. Old Cob's opened the **Shipyard** down the slipway—use that gold to patch your planking before you push east."
* **Mara:** "See how the Bone-Needle is twitching toward the sunrise? The eastern fog wall is thin around **The Reef**."
* **Mara:** "Find a reef-fisher named **Kaelen** at **Coral Cay Port**. He knows those shallows better than the eels do. Find the first Relic, skipper, and bring it home before our harbour freezes into salt."

**Quest Marker 0.2:** *Sail East into The Reef and dock at Coral Cay Port.*

---

### CHAPTER 1: Crown of the Carapace (The Reef)

**Region Atmosphere:** Turquoise water fading into sharp coral heads and pale yellow sandbars. Jellyfish drift in clusters; pufferfish swell with spines when approached.

**Scene 1: Arrival at Coral Cay Port**
*(A stilts-and-driftwood settlement perched atop a ring of brain coral. Kaelen is sitting on an overturned crab pot, scraping glowing pink slime off a harpoon.)*

* **Kaelen:** "Mind your keel on the brain-coral, skipper! Scrape a plank here and the reef-worms will eat your rudder before you can drop anchor."
* **Kaelen:** "Hold on—is that a Bone-Needle humming on your binnacle? Haven't seen brass work like that since the old Meridian fleet went down."
* **[Player Choice]:**
  * *Option A: "Mara sent me. The fog is swallowing Home Harbour."*
    * **Kaelen:** "So it's reached the south bay too, eh? Around here, the mist boxed us in three moons back. Turned the water so warm and stagnant the jellyfish grew big as rowboats."
  * *Option B: "The needle points east. What's hiding in your reef?"*
    * **Kaelen:** "Hiding? Friend, you could spot him from the moon if the clouds cleared."
* **Kaelen:** "Something washed out of the Maelstrom during the last blood-tide—a bronze-and-shell horn called the **Tide-Chime Conch**. Kept humming like a church organ under the water."
* **Kaelen:** "Problem is, the **Crab King** took a shine to it. Wedged the Relic right into the crown of his shell. Every time that conch vibrates, every puffer and reef-shark within ten leagues goes barking mad."
* **Kaelen:** "He's holed up in **Sunken Crown Atoll** to the south-east. Watch his mortar-bubbles and aim for his eyes when he drops his claws. Crack his shell, take the Conch, and maybe my lobster pots will stop biting back."

**Quest Marker 1.1:** *Sail to Sunken Crown Atoll in The Reef and defeat the Crab King.*

**Scene 2: Boss Lair — Sunken Crown Atoll**
*(As the ship crosses the threshold, jagged coral pillars rise from the seabed, fencing the arena. A shadow the size of a brigantine shifts beneath the turquoise surface.)*
* **Boss Banner:** **THE CRAB KING — MONARCH OF THE SHALLOWS**
* **Mid-Fight Bark ($50\%$ HP):** *The Crab King slams both pincers together, sending a shockwave through the Tide-Chime Conch on its back!*
* **Victory Loot Drop:** **Relic 1: The Tide-Chime Conch** ($+250$ Gold, Reef-Plated Hull schematic unlocked at Shipyard).
* **Compass Prompt:** *"The Tide-Chime Conch hums with a low tidal note. Return it to the Brazier at Home Harbour."*

**Scene 3: Igniting the First Flame (Home Harbour)**
*(The player slots the Tide-Chime Conch into the Harbour Brazier. A spiral of turquoise flame shoots into the sky, sending a ringing chime across the sea. To the north, the wall of Curse Fog shivers and parts.)*

* **Mara:** "Listen to that... the water against the pilings just rose three inches. That's the first real tide Home Harbour's felt in a year!"
* **Mara:** "Look north on your **Sea Chart**. The chime tore a channel straight through the northern shroud into the **Storm Belt**."
* **Mara:** "Fair warning, skipper: the Imperial Navy's Seventh Squadron was patrolling up there when the curse hit. Their flagship never came back, and neither did the sun. Stock up on iron and repair timbers—then go find **Bram** at **Gale Roost**."

**Quest Marker 1.2:** *Sail North into the Storm Belt and dock at Gale Roost Port.*

---

### CHAPTER 2: The Admiral Who Refused the Shore (Storm Belt)

**Region Atmosphere:** Slate-grey waves, rolling thunder, sudden wind gusts, electric eels lighting up the troughs, and blazing fire-ships barrelling out of the rain.

**Scene 1: Arrival at Gale Roost Port**
*(A fortified sea-stack wrapped in iron chains and lightning rods. Master Gunner Bram stands beneath a leaking tarpaulin, squinting through the rain.)*

* **Bram:** "SPEAK UP IF YOU'RE BUYING POWDER! The thunder's been hammering this rock for nineteen years straight, and my left ear's only good for keeping my hat level!"
* **Bram:** "Wait... I know that compass case. That belonged to Artificer Venn on the *Meridian*. Which means you're hunting the **Fulmen Lodestone**."
* **[Player Choice]:**
  * *Option A: "Who bolted a storm-relic onto a warship?"*
    * **Bram:** "A man who couldn't stomach losing a war that was already over."
  * *Option B: "You're wearing an Imperial Navy coat. Was that your fleet?"*
    * **Bram:** "Was. Until I chose a leaky rowboat over an insane asylum with sixty cannons."
* **Bram:** "When Vane broke the sea, **Admiral Kross** was ordered to evacuate the northern narrows. Instead, he fished the **Fulmen Lodestone** out of the wreckage and bolted it to the bowsprit of his **Flagship**."
* **Bram:** "The stone pulls lightning straight out of the clouds to feed his boilers and powder-kegs. He thinks if the storm never ends, the battle never ends—and his crew is too terrified of him to die."
* **Bram:** "He circles **Tempest Bastion** to the north-east. Watch his broadside telegraphs, steer clear of his fire-ship escorts, and shoot that cursed Lodestone right off his prow. Give the old bastard the burial at sea he's nineteen years overdue for."

**Quest Marker 2.1:** *Sail to Tempest Bastion in the Storm Belt and defeat the Admiral's Flagship.*

**Scene 2: Boss Lair — Tempest Bastion**
*(Basalt sea-stacks erupt around the arena as lightning strikes the water. A towering three-decker warship emerges through the squall, electricity arcing between its yardarms.)*
* **Boss Banner:** **THE ADMIRAL'S FLAGSHIP — WRATH OF THE SEVENTH SQUADRON**
* **Admiral Kross (Boss Bark):** *"Unauthorised vessel in Imperial waters! Run out the lower batteries! No quarter for deserters!"*
* **Mid-Fight Bark ($50\%$ HP):** *"More powder to the furnace! Call down the squall! The Seventh Squadron never strikes its colours!"*
* **Victory Loot Drop:** **Relic 2: The Fulmen Lodestone** ($+500$ Gold).
* **Compass Prompt:** *"Sparks dance across the Fulmen Lodestone. Return it to the Brazier at Home Harbour."*

**Scene 3: Igniting the Second Flame (Home Harbour)**
*(Slotting the Lodestone into the Harbour Brazier sends an arc of violet lightning skyward. The barometer on the pier clicks upward, and the far-northern fog wall shatters like glass.)*

* **Mara:** "Felt the hair on my arms stand up from a mile off! Look at the bay—the storm-swell's broken, and the trade wind is finally blowing through the rigging."
* **Mara:** "Your chart's opening up fast now. North of the Storm Belt lies the **Frozen North**. Used to be a summer whaling passage before the curse turned it into a grinding mill of pack-ice."
* **Mara:** "The needle's pulling toward **Rime-Post Port**. Watch out for the **Ice-Breaker Raiders** up there—they've got iron prows and zero manners. Ask for a trapper named **Ylva**."

**Quest Marker 2.2:** *Sail Far North into the Frozen North and dock at Rime-Post Port.*

---

### CHAPTER 3: The Fire Under the Flake (Frozen North)

**Region Atmosphere:** Deep cobalt water strewn with pale blue drifting icebergs. Snow flurries blow across the screen, and iron-prowed raider ships crunch through the slush.

**Scene 1: Arrival at Rime-Post Port**
*(A village built inside the ribs of three colossal whale skeletons frozen into a glacier shelf. Ylva Frost-Tooth is boiling a pot over a blubber lamp.)*

* **Ylva:** "Tie your mooring line with a slip-knot, southerner. Leave wet hemp on these bollards for ten minutes and you'll need an axe to cast off."
* **Ylva:** "Here—drink this. It's seal-broth and crushed pepper. Tastes like an old boot, stops your teeth from cracking."
* **[Player Choice]:**
  * *Option A: "(Drink it) Gods above, that burns all the way to my boots."*
    * **Ylva:** "Means your stomach hasn't frozen yet. You'll live till Tuesday."
  * *Option B: "I'm looking for a Relic that fell into the ice."*
    * **Ylva:** "Oh, it didn't fall into the ice. If it had, the ice would've melted."
* **Ylva:** "When the Tide-Spire blew apart, its great heating lens—the **Sun-Amber**—dropped into the northern trench. Kept the deep water warm as a bathhouse while the surface froze solid."
* **Ylva:** "Then the **Great Sea Serpent** swallowed it whole. Now the beast has a furnace in its belly. It melts tunnels through the pack-ice, calves giant icebergs onto our hunting boats, and leads the **Ice-Breaker Raiders** straight to our stores."
* **Ylva:** "You'll find its lair at the **Boiling Caldron** near the polar shelf. Keep moving so the drifting bergs don't pin your hull, and fire into its maw when the amber glows through its throat."

**Quest Marker 3.1:** *Sail to the Boiling Caldron in the Frozen North and defeat the Sea Serpent.*

**Scene 2: Boss Lair — The Boiling Caldron**
*(Jagged walls of glacier ice rise to seal the ring. Steam hisses off the dark water as long, armoured serpentine coils break the surface, a golden glow pulsing beneath its scales.)*
* **Boss Banner:** **THE SEA SERPENT — LEVIATHAN OF THE PACK-ICE**
* **Mid-Fight Bark ($50\%$ HP):** *The Sea Serpent dives beneath the floes, sending razor-sharp icebergs drifting across the arena before lunging from the steam!*
* **Victory Loot Drop:** **Relic 3: The Sun-Amber Lens** ($+800$ Gold).
* **Compass Prompt:** *"The Sun-Amber Lens radiates a steady golden warmth. Return it to Home Harbour."*

**Scene 3: Igniting the Third Flame (Home Harbour)**
*(As the Sun-Amber Lens clicks into the Harbour Brazier, a beam of warm golden sunlight cuts through the western sky, dissolving the black fog banking the far west.)*

* **Mara:** "Look at the gulls circling the masthead, skipper. First time they've come back to nest since the frost set in."
* **Mara:** "Three relics home, one left. And the last fog wall that just dropped... is the one none of us wanted to look behind."
* **Mara:** "**The Abyss** lies to the far west. That's where the sun doesn't reach the bottom, and where Vane's own flagship drifted after the Maelstrom spat it out. Follow the golden beam to **Lantern Spire**, and don't follow any stray lights in the water—half of 'em have teeth."

**Quest Marker 3.2:** *Sail Far West into The Abyss and dock at Lantern Spire Port.*

---

### CHAPTER 4: The Toll of the Unburied (The Abyss)

**Region Atmosphere:** Pitch-indigo water, bioluminescent spores, eerie green anglerfish lure-lights bobbing in the dark, and translucent ghost ships that fade out of sight before reappearing for a broadside.

**Scene 1: Arrival at Lantern Spire Port**
*(A solitary, crumbling stone lighthouse rising from a black volcanic rock. At its base sits a ghostly wharf where Orin floats a few inches above the planks, polishing a cracked lens with a phantom rag.)*

* **Orin:** "Ah, the supply sloop from Home Harbour! You're a touch late, Captain—my pocket-watch stopped on the eleventh of November, and I'm nearly out of whale-oil."
* **Orin:** "...Wait. Why can I see the rigging of your ship right through the back of my hand? Oh dear. Have I been dead long?"
* **[Player Choice]:**
  * *Option A: "Nineteen years, Orin. Since the night Vane broke the Spire."*
    * **Orin:** "Nineteen years? And here I thought it was just a remarkably long winter night. No wonder my tea went cold."
  * *Option B: "Your light still kept me off the rocks. You did your duty."*
    * **Orin:** "Did I? That's a comfort. A keeper hates to think a ship went down on his watch."
* **Orin:** "I remember now... I wanted to rest when the wave took the tower, truly I did. Come dawn, I'd have let go. Except **Vane's Ghost Galleon** never stops ringing that dreadful **Soul-Bell**."
* **Orin:** "Every time the swell rocks his mainmast, the silver bell tolls across the Abyss and yanks every drowned sailor back to their stations. Even the anglerfish have learned to mimic our deck-lanterns to lure living ships down."
* **Orin:** "The **Ghost Galleon** prowls **Dead Man's Anchorage** to the west. You cannot strike her while she fades into the ether—wait until the Soul-Bell rings and her timbers turn solid to loose your broadside. Silence that bell, Captain, and let us finally go to sleep."

**Quest Marker 4.1:** *Sail to Dead Man's Anchorage in The Abyss and defeat the Ghost Galleon.*

**Scene 2: Boss Lair — Dead Man's Anchorage**
*(Obsidian spires rise like tombstones around the dark water. A massive, tattered galleon glowing with spectral green fire materialises out of the mist, a silver bell tolling from its broken mast.)*
* **Boss Banner:** **THE GHOST GALLEON — FLAGSHIP OF NAVIGATOR VANE**
* **Spectral Voice of Vane (Boss Bark):** *"Bind the wind! Chain the tide! No hand leaves the deck while the bell still rings!"*
* **Mid-Fight Bark ($50\%$ HP):** *The Soul-Bell tolls thrice! The Ghost Galleon fades into phantom mist, summoning spectral escorts from the deep!*
* **Victory Loot Drop:** **Relic 4: The Soul-Bell of Vane** ($+1200$ Gold).
* **Compass Prompt:** *"The Soul-Bell falls silent and warm in your hands. Bring the final Relic to Home Harbour."*

**Scene 3: Igniting the Fourth Flame (Home Harbour)**
*(When the Soul-Bell is mounted atop the Harbour Brazier, all four relics resonate together. A chord of wind, thunder, warmth, and silver bell-tone sweeps across the sea, tearing open the vortex wall around the centre-west ocean.)*

* **Mara:** "Four flames burning bright... and the Bone-Needle isn't twitching anymore. It's pointing dead-centre into **The Maelstrom**."
* **Mara:** "All the monsters from every corner of the sea are being pulled into that whirlpool to guard their master. At the centre of it sits the **Kraken**, clutching the **Cursed Heart** in its jaws."
* **Mara:** "Check your 3 Gear Slots, max out your hull with Old Cob, and make sure you're ready. Tear that Heart away from the beast, skipper, and give us back our ocean."

**Quest Marker 4.2:** *Sail into The Maelstrom (Centre-West) and defeat the Kraken.*

---

### FINALE: The Heart of the Sea (The Maelstrom)

**Region Atmosphere:** Swirling vortex currents, purple-black storm clouds, crashing lightning, and every enemy type in the ocean patrolling the outer rings of the whirlpool.

**Scene 1: Boss Lair — Eye of the Maelstrom**
*(At the dead centre of the map, basalt monoliths—the shattered ruins of the original Tide-Spire—rise from the churning foam. A shadow larger than an island rises from the trench, eight colossal tentacles slamming onto the surface as a bioluminescent heart beats inside its maw.)*
* **Boss Banner:** **THE KRAKEN — DEVOURER OF THE TIDE**
* **Mid-Fight Bark (Phase 2 — $60\%$ HP):** *The Kraken roars, whipping the water into a maelstrom and slamming tentacles across the arena while ink clouds blind the surface!*
* **Mid-Fight Bark (Phase 3 — $25\%$ HP):** *The Cursed Heart flares crimson! The Kraken goes into a frenzy, hurling wreckage and lightning-charged waves!*
* **Victory Loot Drop:** **The Cursed Heart (Cleansed into the Living Heart of the Sea)** ($+2500$ Gold).
* **Compass Prompt:** *"The Kraken sinks into the trench. Carry the Heart of the Sea home to Home Harbour."*

**Scene 2: The Lifting of the Curse (Home Harbour Ending & Post-Game Unlock)**
*(As the player places the Heart into the centre of the Harbour Brazier, a wave of brilliant azure light sweeps across the entire $2000 \times 2000$ ocean. The dark patches of sea turn clear sapphire, lanterns string up across the rigging of Home Harbour, and townsfolk gather on the pier.)*

* **Mara:** "Breathe that in, skipper! Pure salt wind from the west, not a speck of grey rot in it!"
* **Kaelen (Visiting):** "The reef's gone quiet as a lagoon! Even the puffers deflated enough for me to sail down and bring a barrel of spiced rum!"
* **Bram (Visiting):** "And the thunder broke over Gale Roost at noon. Saw the sun for the first time in nineteen years—nearly blinded me in my one good eye!"
* **Ylva (Visiting):** "Don't get soft on us, southerner. The northern passages are clear, and there's still plenty of pirate gold frozen in the floes."
* **Mara:** "You saved Home Harbour, Captain. The Bone-Needle's yours to keep, the fog is gone for good, and the whole Sundered Reach is open water. Sail wherever the wind takes you!"

**Post-Game State Unlocked:** *All Curse Fog walls permanently removed; full open-sea roaming, treasure hunting, and remaining side stories remain active.*

---

## 5. Detailed Side Stories & Regional Quests

These **8 Side Quests** use the mechanics already built into *Saltwind* (roaming enemies, `loot.chest` treasure coves, shipwrecks, pirate camps, and port fast-travel) while incorporating the delivery and escort hooks from the plan. Together, they add **25–35 minutes** of rich gameplay.

---

### Side Story 1: The Tax-Chest Overboard (Home Waters)
* **Quest Giver:** Pip the Chart-Boy (Home Harbour)
* **Trigger:** Available immediately after the Prologue.
* **The Hook:** Pip accidentally dropped the harbour's iron strongbox into the eastern shallows while fleeing a giant shark.
* **Dialogue (Start):**
  * **Pip:** "Skipper, please! Before Mara checks the customs ledger—I was bringing the harbour dues across the sandbar when a **Great Fin Shark** rammed my dinghy!"
  * **Pip:** "The iron chest sank right by **Gull-Cry Wreck** to the south-east, and that shark is still circling it like he's waiting for change! Fish it up for me and I'll give you my grandfather's brass spyglass!"
* **Objective:** Sail to Gull-Cry Wreck (`cx: +3, cz: -2` from Harbour), defeat the Named Elite Shark + 2 Gunboats, and open the sunken chest.
* **Dialogue (Return):**
  * **Pip:** "You got it! And the lock's only got two shark-teeth stuck in it! Here—take this **Lookout's Spyglass** (Gear: $+15\%$ Loot Detection Range) before Mara sees me sweating."
* **Reward:** $120$ Gold + **Lookout's Spyglass** (Gear).

---

### Side Story 2: Venom for Velvet (The Reef)
* **Quest Giver:** Madame Sallow (Smuggler's Atoll — 2nd Port in The Reef)
* **Trigger:** Unlocks upon entering The Reef.
* **The Hook:** Madame Sallow runs a black-market apothecary and needs volatile spine-glands from the Reef's pufferfish and pirates who poach them.
* **Dialogue (Start):**
  * **Madame Sallow:** "Careful where you step on my dock, darling—half these crates are contraband, and the other half explode if you sneeze."
  * **Madame Sallow:** "The apothecaries in the south pay a king's ransom for **Puffer-Spine Oil**. Clear out the **Three Spine-Shoals** north of the atoll and bring me 5 intact glands. Try not to pop yourself while you're at it."
* **Objective:** Defeat 5 Pufferfish and 1 Pirate Poacher Sloop in the northern Reef without sinking.
* **Dialogue (Return):**
  * **Madame Sallow:** "Still have all your fingers AND all your hull planks? Colour me impressed. Here's your cut, plus a little reinforcement I lifted from an Imperial brig."
* **Reward:** $250$ Gold + **Coral-Fused Copper Sheathing** (Gear: $-20\%$ Reef/Sandbar & Poison Damage).

---

### Side Story 3: The Mutineer's Powder-Run (Storm Belt — Delivery Mission)
* **Quest Giver:** Quartermaster Nix (Castaway Rock, Storm Belt)
* **Trigger:** Found stranded on a small rocky outpost west of Gale Roost.
* **The Hook:** A volatile timed/no-sink delivery mission carrying dry gunpowder through lightning and fire-ships.
* **Dialogue (Start):**
  * **Quartermaster Nix:** "Thank the stars, a hull that isn't on fire! Look, I mutinied against Admiral Kross last week when he ordered us to shell a flock of seagulls for treason."
  * **Quartermaster Nix:** "I salvaged four barrels of **Dry Imperial Powder**, and Bram at Gale Roost will pay handsomely for 'em. Problem is, if you take more than three cannon hits—or sink—on the way there, the powder goes boom. Think you can steer clean through the fire-ships?"
* **Objective:** Sail from Castaway Rock to Gale Roost Port (approx. $600$ units) without your hull dropping below $50\%$ HP while 3 Fire Ships ambush the route.
* **Dialogue (Arrival at Gale Roost):**
  * **Bram:** "Dry Imperial triple-grain?! By the prophets, Nix actually stole the Admiral's private reserve! Here's your hazard pay, skipper—and keep a keg for your own cannons!"
* **Reward:** $400$ Gold + **Powder-Monkey's Ramrod** (Gear: $+20\%$ Cannon Reload Speed).

---

### Side Story 4: The Ghost of the *Iron Gannet* (Storm Belt)
* **Quest Giver:** Master Gunner Bram (Gale Roost Port)
* **Trigger:** Available after beating the Admiral's Flagship.
* **The Hook:** Hunting down the Admiral's cruelest subordinate, Captain Harrow ("The Harpoon-Hound"), who runs a fortified pirate camp in the western Storm Belt.
* **Dialogue (Start):**
  * **Bram:** "With the Flagship on the bottom, most of the Seventh Squadron's ghosts have found peace. All except **Captain Harrow**."
  * **Bram:** "He took two Harpooner brigs to **Chain-Link Cove** and started dragging merchant skiffs onto the rocks with grappling irons. Sink his camp and bring me his logbook so I can cross the last name off my roster."
* **Objective:** Sail to Chain-Link Cove, defeat 2 Elite Harpooner Ships + 1 Captain Ship guarding a Pirate Camp chest.
* **Dialogue (Return):**
  * **Bram:** "So Harrow finally met a broadside he couldn't grapple out of. That closes the book on the Seventh Squadron, skipper. Take my old sighting-wedge."
* **Reward:** $450$ Gold + **Gunner's Quoin** (Gear: $+15\%$ Cannon Damage).

---

### Side Story 5: The Sunken Carillon (Frozen North)
* **Quest Giver:** Bjorn the Bell-Maker (Floe-Edge Camp — 2nd Port in Frozen North)
* **Trigger:** Available upon entering the Frozen North.
* **The Hook:** Ice-breaker raiders stole the town's massive bronze fog-bell, only for an iceberg to sink their barge across three different ice-fields.
* **Dialogue (Start):**
  * **Bjorn:** "You've got keen eyes, skipper. Maybe you can spot what the raiders lost."
  * **Bjorn:** "I cast a three-ton bronze fog-bell so our whalers could find home in a whiteout. Those **Ice-Breaker Raiders** stole it right off my sled—and promptly got their barge crushed between two bergs! Recover the **3 Bronze Bell-Fragments** from the northern wrecks before the pack-ice freezes over them forever."
* **Objective:** Locate 3 glowing Shipwrecks among the drifting icebergs in the Frozen North (guarded by Ice-Breaker Raiders) and salvage all 3 fragments.
* **Dialogue (Return):**
  * **Bjorn:** "All three pieces, and not a crack in the crown-loop! Give me an hour with my forge and this coast will hear Rime-Post from ten leagues out. Here—forged an ice-plow for your bow out of the scrap iron!"
* **Reward:** $600$ Gold + **Iron Ice-Plow** (Gear: $-50\%$ Collision Damage from Icebergs & Ramming Enemies).

---

### Side Story 6: The Warm-Milk Convoy (Frozen North — Escort Mission)
* **Quest Giver:** Ylva Frost-Tooth (Rime-Post Port)
* **Trigger:** Unlocks after defeating the Sea Serpent.
* **The Hook:** Escorting a slow merchant supply barge from Rime-Post down to the Storm Belt border past a gauntlet of raiders.
* **Dialogue (Start):**
  * **Ylva:** "Now that the Serpent isn't boiling the channel, my cousin's trying to sail a barge of whale-oil and furs south to trade for timber."
  * **Ylva:** "His tub sails like a wet brick, and the leftover raiders smell easy loot. Sail alongside the *Blubber-Duck* to the southern buoy and keep the raiders off his stern."
* **Objective:** Escort the friendly NPC ship across 4 chunks of the Frozen North, sinking 3 waves of 2 Raiders before they destroy the barge.
* **Dialogue (Completion):**
  * **Ylva:** "Not a single leak in the oil casks! Never thought I'd see the *Blubber-Duck* make port in one piece. Take half the charter purse, southerner."
* **Reward:** $750$ Gold.

---

### Side Story 7: Lures in the Dark (The Abyss)
* **Quest Giver:** Orin the Lighthouse Keeper (Lantern Spire Port)
* **Trigger:** Available upon entering The Abyss.
* **The Hook:** Giant abyssal anglerfish have swallowed three of Lantern Spire's spare beacon crystals, using them to mimic port lights and wreck ships on the western reefs.
* **Dialogue (Start):**
  * **Orin:** "Captain, if you see a warm golden light bobbing near the western shoals... do NOT drop anchor. Those aren't harbour buoys."
  * **Orin:** "Three **Elder Angler-Beasts** swallowed my spare prism-lamps when the top of the lighthouse collapsed. Now they dangle them just above the waves to lure lost sloops into their jaws. Hunt them down and bring back my lamps before another crew falls for the trick."
* **Objective:** Sail to 3 false-light markers in The Abyss, trigger the Elder Angler ambushes (supported by Ghost Ships), and recover the 3 Prism-Lamps.
* **Dialogue (Return):**
  * **Orin:** "My prisms! A bit chewed around the brass frames, perhaps, but they still catch the light beautifully. Keep this smaller lens for your bow—it will pierce the darkest water."
* **Reward:** $900$ Gold + **Abyssal Lantern** (Gear: Reveals faded Ghost Ships and hidden rocks from further away).

---

### Side Story 8: The Ancestor's Figurehead (Post-Game / Late Abyss)
* **Quest Giver:** Old Cob (Home Harbour Shipyard — unlocked once all 4 regions are visited)
* **Trigger:** Spoken at any shipyard after unlocking The Maelstrom.
* **The Hook:** A lore-rich treasure hunt across four hidden coves in the four outer regions to reassemble the legendary figurehead of the *Saltwind*, the only ship to ever escape the Maelstrom nineteen years ago.
* **Dialogue (Start):**
  * **Old Cob:** "You've sailed every sea on the chart now, skipper. Time I told you where your little sloop got her ribs."
  * **Old Cob:** "Nineteen years ago, only one vessel broke out of the Maelstrom alive—Artificer Venn's courier sloop, the *Saltwind*. That's her keel right under your boots! Before Venn died, he hid her carved **Siren Figurehead** in four smuggler coves—one in the Reef, one in the Storm, one in the Ice, and one in the Abyss."
  * **Old Cob:** "Follow the four X-marks I just scratched onto your Sea Chart. Bring me those four timber pieces, and I'll mount the true prow back onto your ship."
* **Objective:** Visit 4 hidden Treasure Coves across the 4 outer regions, defeat the elite pirate/ghost guards at each, and loot the 4 Figurehead pieces.
* **Dialogue (Return):**
  * **Old Cob:** "By the deep... look at the grain on that heart-oak. Doesn't rot, doesn't splinter, and the sea itself parts to let her pass. She's the true *Saltwind* again, Captain."
* **Reward:** $1500$ Gold + **Figurehead of the Saltwind** (Ultimate Gear: $+15\%$ Top Sail Speed, $+15\%$ Hull Armour, $+15\%$ Cannon Fire Rate).

---

## 6. Environmental Lore: Wreck Logs & Port Barks

To make the open ocean feel alive between boss fights without adding heavy systems, these short 1–2 line strings can pop up in the dialogue box whenever the player salvages a **Shipwreck** or chats with **Old Cob** at a port.

### Salvaged Shipwreck Logs (Randomly drawn on Wreck pickup)
1. **Log of the *Brine-Swallow* (Home Waters):** *"14th of Frost-Moon: The fog crept past the outer buoy today. Dropped a bucket over the side and pulled up salt-crust thick as porridge. If we don't sail south by noon, our rudder will set like stone."*
2. **Log of the *Gilded Guppy* (The Reef):** *"Note to self: do NOT anchor near the giant singing seashell. The crew couldn't sleep for the humming, and at dawn a crab the size of a tavern climbed aboard and ate the capstan."*
3. **Log of the *HMS Thunderchild* (Storm Belt):** *"Day 4,210 of the Northern Patrol: The Admiral court-martialled the barometer this morning for predicting fair weather. Master Gunner Bram slipped over the side with the jolly-boat at midnight. Wish I'd gone with him."*
4. **Log of the *Narwhal's Tooth* (Frozen North):** *"The water under the ice-shelf is steaming hot, while our sails are frozen stiff as boards. Saw a golden light moving under the floe—thirty fathoms long and coiled like a watch-spring."*
5. **Log of the *Meridian's Wake* (The Abyss):** *"Vane lied to us. The Spire wasn't meant to calm the sea—it was a harpoon rig to cage the beast at the bottom. Every time his silver bell rings in the dark, my hands go back to the oars whether I will it or not."*

### Old Cob's Shipyard Barks (`src/ports.js`)
* **When entering Shipyard below $30\%$ HP:** *"Did you sail here, or did you let a whale chew your hull and spit you onto my slipway? Hold still while I fetch the oakum."*
* **When buying a Hull Upgrade:** *"Double-seasoned ironwood planks. Even the Crab King'll chip a claw trying to pinch through that."*
* **When buying a Sail Upgrade:** *"Stitched from storm-canvas and greased with tallow. Catch a quarter-knot of breeze and you'll outrun a cannonball."*
* **When waking up at Port after Sinking:** *"Fished you out of the kelp with half your pockets empty, skipper. The sea always takes her salvage fee—count yourself lucky she left your boots."*