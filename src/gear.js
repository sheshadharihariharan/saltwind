// Ship gear, bought in port or won in side stories (reward: never sold). The ship has 3 gear slots;
// gear stays fitted until you swap it, and swapped-out gear waits in the hold.
// Some gear changes the ship right away (apply); the rest is checked where it matters
// (cannon hits, ramming, sandbars and stings, ghost ships).

export const GEAR = {
  double: { name: 'Double shot', text: 'Each cannon fires two balls',
    icon: '<circle cx="8" cy="12" r="4"/><circle cx="16.5" cy="12" r="4"/>' },
  chain: { name: 'Chain shot', text: 'Hits slow enemies down',
    icon: '<rect x="2" y="8.5" width="11" height="7" rx="3.5"/><rect x="11" y="8.5" width="11" height="7" rx="3.5"/>' },
  fire: { name: 'Fire shot', text: 'Hits set enemies burning',
    icon: '<path d="M12 3c1 4 6 6 6 11a6 6 0 0 1-12 0c0-3 2-4.5 3-6.5 1 2 2 3 3 3 0-3-1-5 0-7.5z"/>' },
  cannon: { name: 'Extra cannon', text: 'One more cannon each side',
    icon: '<path d="M3 11l14-5 2 6-14 4z"/><circle cx="8" cy="17" r="3"/>', apply: ({ ship }) => ship.addCannon() },
  ram: { name: 'Ram spikes', text: 'Sail into enemies to hurt them',
    icon: '<path d="M3 5l18 7-18 7 5-7z"/>', apply: ({ ship }) => ship.addSpikes() },
  sails: { name: 'Better sails', text: 'Sail and turn faster',
    icon: '<path d="M10 3v16M10 4c7 3 9 9 8 13h-8"/><path d="M4 21h16"/>',
    apply: ({ ship }) => { ship.stats.maxSpeed *= 1.2; ship.stats.turn *= 1.15; } },
  patch: { name: 'Hull patch', text: '+30 hull',
    icon: '<rect x="3" y="3" width="18" height="18" rx="4"/><path d="M12 7.5v9M7.5 12h9"/>',
    apply: ({ ship }) => { ship.stats.hp += 30; ship.state.maxHp += 30; } },
  magnet: { name: 'Gold magnet', text: 'Gold flies to you from afar',
    icon: '<path d="M6 4v8a6 6 0 0 0 12 0V4"/><path d="M6 8h4M14 8h4"/>', apply: ({ loot }) => loot.setMagnet(9) },

  // Side-story rewards.
  spyglass: { name: "Lookout's Spyglass", text: 'Spot treasure chests from twice as far', reward: true,
    icon: '<path d="M3 15l12-6 2 4-12 6z"/><path d="M15 9l4-2 2 4-4 2"/>', apply: ({ loot }) => loot.setSpotting(110) },
  sheathing: { name: 'Coral-Fused Sheathing', text: 'Sandbars and stings slow you less', reward: true,
    icon: '<path d="M4 6h16v8a8 6 0 0 1-16 0z"/><path d="M8 9v4M12 9v5M16 9v4"/>' },
  ramrod: { name: "Powder-Monkey's Ramrod", text: 'Cannons reload 20% faster', reward: true,
    icon: '<path d="M4 20L18 6"/><rect x="16" y="2" width="6" height="6" rx="2"/>', apply: ({ ship }) => { ship.stats.reload *= 0.8; } },
  quoin: { name: "Gunner's Quoin", text: 'Cannonballs hit 15% harder', reward: true,
    icon: '<path d="M3 18h18L21 10z"/><circle cx="8" cy="9" r="3"/>' },
  plow: { name: 'Iron Ice-Plow', text: "Raiders' rams do half damage", reward: true,
    icon: '<path d="M3 12l9-8 9 8-9 8z"/><path d="M12 4v16"/>' },
  lantern: { name: 'Abyssal Lantern', text: 'See ghost ships even when they fade', reward: true,
    icon: '<rect x="7" y="7" width="10" height="12" rx="2"/><path d="M9 7V4h6v3M12 11v4"/>' },
  figurehead: { name: 'Figurehead of the Saltwind', text: '+15% speed, hull and reload', reward: true,
    icon: '<path d="M12 3c4 0 6 3 6 7 0 5-6 11-6 11S6 15 6 10c0-4 2-7 6-7z"/><circle cx="12" cy="9" r="2"/>',
    apply: ({ ship }) => {
      ship.stats.maxSpeed *= 1.15;
      ship.stats.turn *= 1.1;
      ship.stats.reload *= 0.87;
      ship.stats.hp = Math.round(ship.stats.hp * 1.15);
      ship.state.maxHp = ship.stats.hp;
    } },
};

// Up to n gear ids for sale that you don't have yet (fitted or in the hold), in random order.
export function gearChoices(owned, n) {
  return Object.keys(GEAR).filter((id) => !GEAR[id].reward && !owned.has(id)).sort(() => Math.random() - 0.5).slice(0, n);
}

export const gearIcon = (id) => `<svg viewBox="0 0 24 24">${GEAR[id].icon}</svg>`;
