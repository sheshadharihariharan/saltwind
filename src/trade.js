// Trading (Part Two): each big port makes one good cheaply and buys the others, paying more the further
// they've come. Prices shift a little each time you come into port, and selling a lot in one place
// drives its price down for a while. Cargo rides in the hold (save.cargo: { good: { n, paid } }).
import { PORTS } from './map.js';

// port: where it's made (and the only place to buy it). base: its price there.
export const GOODS = {
  fish: { name: 'Salt fish', port: 'home', base: 12, icon: '<path d="M3 12c4-5 10-5 14 0-4 5-10 5-14 0z"/><path d="M17 12l4-3v6z"/><circle cx="8" cy="11" r="1"/>' },
  pearls: { name: 'Pearls', port: 'reef', base: 22, icon: '<circle cx="8" cy="14" r="3.5"/><circle cx="15.5" cy="13" r="3"/><circle cx="12" cy="7.5" r="2.5"/>' },
  canvas: { name: 'Storm-canvas', port: 'storm', base: 18, icon: '<path d="M5 4h14v14l-3-2-4 3-4-3-3 2z"/><path d="M8 8h8M8 12h8"/>' },
  furs: { name: 'Furs', port: 'frozen', base: 20, icon: '<path d="M4 16c0-6 4-10 8-10s8 4 8 10c-3-2-5 0-8-2-3 2-5 0-8 2z"/>' },
  oil: { name: 'Lantern oil', port: 'abyss', base: 16, icon: '<path d="M9 4h6M10 4v3M14 4v3"/><path d="M7 9h10l-1 11H8z"/><path d="M12 12c1.5 2 1.5 4 0 5-1.5-1-1.5-3 0-5z"/>' },
  rum: { name: 'Spiced rum', port: 'smuggler', base: 15, icon: '<path d="M10 3h4v4l2 3v10H8V10l2-3z"/><path d="M8 13h8"/>' },
};
export const MARKETS = [...new Set(Object.values(GOODS).map((g) => g.port))]; // ports with a market
export const HOLD = 12; // crates the hold carries
export const CRATE_ICON = '<path d="M4 8l8-4 8 4v9l-8 4-8-4z"/><path d="M4 8l8 4 8-4M12 12v9"/>';
const MARKUP = 1.4 / 1000; // a good fetches its price × (1 + distance it's come × this)
const HOME_SALE = 0.75; // selling a good back where it's made
const DRIFT = 0.12; // prices wander this much either way, new each visit
const GLUT = { per: 0.025, floor: 0.6, recover: 0.003 }; // each crate sold knocks this off the price; it recovers per second

const drift = {}; // 'port:good' -> this visit's price factor
const glut = {}; // 'port:good' -> 1, or less after selling a lot there
const key = (port, good) => `${port}:${good}`;
const far = (a, b) => Math.hypot(PORTS[a].at[0] - PORTS[b].at[0], PORTS[a].at[1] - PORTS[b].at[1]);

// New prices for this port, once per visit (cleared when you set sail).
const rolled = new Set();
export function arrive(port) {
  if (rolled.has(port)) return;
  rolled.add(port);
  for (const g of Object.keys(GOODS)) drift[key(port, g)] = 1 + (Math.random() * 2 - 1) * DRIFT;
}
export const setSail = () => rolled.clear();

// Gluts wear off as time goes by.
export function update(dt) {
  for (const k of Object.keys(glut)) glut[k] = Math.min(1, glut[k] + GLUT.recover * dt);
}

// What a crate costs here (null if it isn't made here), and what one fetches here.
export function buyPrice(port, good) {
  const g = GOODS[good];
  return g.port === port ? Math.round(g.base * (drift[key(port, good)] ?? 1)) : null;
}
export function sellPrice(port, good) {
  const g = GOODS[good], k = key(port, good);
  const worth = g.port === port ? HOME_SALE : 1 + far(g.port, port) * MARKUP;
  return Math.max(1, Math.round(g.base * worth * (drift[k] ?? 1) * (glut[k] ?? 1)));
}

export const carried = (cargo) => Object.values(cargo).reduce((n, c) => n + c.n, 0);

// Buy `n` crates (as many as fit and you can afford). Returns the gold spent.
export function buy(cargo, port, good, n, gold) {
  const price = buyPrice(port, good);
  n = Math.min(n, HOLD - carried(cargo), Math.floor(gold / price));
  if (n <= 0) return 0;
  const c = (cargo[good] ??= { n: 0, paid: 0 });
  c.n += n;
  c.paid += n * price;
  return n * price;
}

// Sell `n` crates here, one at a time (each knocks the price down). Returns the gold made.
export function sell(cargo, port, good, n) {
  const c = cargo[good];
  if (!c) return 0;
  n = Math.min(n, c.n);
  let made = 0;
  for (let i = 0; i < n; i++) {
    made += sellPrice(port, good);
    const k = key(port, good);
    glut[k] = Math.max(GLUT.floor, (glut[k] ?? 1) - GLUT.per);
  }
  c.paid -= Math.round((c.paid / c.n) * n); // what's left keeps its average cost
  c.n -= n;
  if (!c.n) delete cargo[good];
  return made;
}
