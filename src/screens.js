// Screens drawn over the sea: the sea chart, chats with people, the card panel (ports, gear, messages)
// and the title screen.
import { BOUND, REGIONS, PORTS, regionAt } from './map.js';
import { GEAR, gearIcon } from './gear.js';

const $ = (id) => document.getElementById(id);

const ICONS = {
  port: '<circle cx="12" cy="5" r="2"/><path d="M12 7v13M7.5 11h9M5 15a7 6 0 0 0 14 0"/>',
  chart: '<path d="M3 6l6-2 6 2 6-2v14l-6 2-6-2-6 2z"/><path d="M9 4v14M15 6v14"/>',
  gear: '<circle cx="12" cy="12" r="3.5"/><path d="M12 2v4M12 18v4M2 12h4M18 12h4M4.9 4.9l2.8 2.8M16.3 16.3l2.8 2.8M4.9 19.1l2.8-2.8M16.3 7.7l2.8-2.8"/>',
};
export const icon = (name) => `<svg viewBox="0 0 24 24">${ICONS[name]}</svg>`;

// ---------- the sea chart ----------

// The whole ocean as an old map: squares you've sailed near show their region's colour (or the curse fog),
// the rest is blank parchment.
// seen: one character per square, N x N, row by row from the south-west ('1' = seen).
// ports: ids of ports found. ship: { e, n, heading } on the map (heading: radians clockwise from north).
// isOpen(regionId): has the fog lifted there? goals: [{ text, at: [e, n], side }] (the story's, then side stories').
// relics: how many found.
export function showSeaChart({ seen, N, ports, ship, isOpen, goals, relics }, onClose) {
  const px = 6, size = N * px, cell = (2 * BOUND) / N, sub = 3;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const g = canvas.getContext('2d');
  g.fillStyle = '#e9d6ac';
  g.fillRect(0, 0, size, size);
  const shown = new Set();
  for (let j = 0; j < N; j++) {
    for (let i = 0; i < N; i++) {
      if (seen[j * N + i] !== '1') continue;
      for (let a = 0; a < sub; a++) {
        for (let b = 0; b < sub; b++) { // a few samples a square, so region borders aren't blocky
          const r = regionAt(-BOUND + (i + (a + 0.5) / sub) * cell, -BOUND + (j + (b + 0.5) / sub) * cell);
          shown.add(r);
          g.fillStyle = isOpen(r) ? '#' + REGIONS[r].sea.toString(16).padStart(6, '0') : '#d5dadd';
          g.fillRect(i * px + (a * px) / sub, (N - 1 - j) * px + ((sub - 1 - b) * px) / sub, px / sub + 0.5, px / sub + 0.5);
        }
      }
    }
  }
  // Map (e, n) -> chart (x, y) in a 2000 x 2000 box, north up.
  const at = (e, n) => [e + BOUND, BOUND - n];
  let svg = '';
  for (const [id, r] of Object.entries(REGIONS)) {
    if (!shown.has(id) || !isOpen(id)) continue;
    const [x, y] = at(...r.at);
    svg += `<text class="region" x="${x}" y="${y}">${r.name}</text>`;
  }
  for (const id of ports) {
    const [x, y] = at(...PORTS[id].at);
    svg += `<g class="node done" transform="translate(${x} ${y}) scale(3.6)"><circle r="26"/>
      <g transform="translate(-15 -15) scale(1.25)">${ICONS.port}</g><text class="name" x="34" y="7">${PORTS[id].name}</text></g>`;
  }
  for (const g of goals) {
    const [x, y] = at(...g.at);
    svg += `<g class="goal${g.side ? ' side' : ''}" transform="translate(${x} ${y})"><circle r="60"/><text y="26">${g.side ? '?' : '!'}</text></g>`;
  }
  const [sx, sy] = at(ship.e, ship.n);
  svg += `<path class="you" transform="translate(${sx} ${sy}) rotate(${(ship.heading * 180) / Math.PI})" d="M0 -70L44 50L0 26L-44 50Z"/>`;
  $('chart').innerHTML = `<div class="sea"><svg viewBox="0 0 ${2 * BOUND} ${2 * BOUND}">${svg}</svg></div>
    <div class="side"><h2>Sea chart</h2>${goals.map((g) => `<p class="goal${g.side ? ' side' : ''}">${g.text}</p>`).join('') || '<p>Sail wherever you like!</p>'}<p>Relics found: <b>${relics} / 4</b></p>
    <button class="go">Back to sea</button></div>`;
  $('chart').querySelector('.sea').prepend(canvas);
  $('chart').querySelector('.go').onclick = onClose;
  $('chart').classList.add('on');
}

export const hideChart = () => $('chart').classList.remove('on');

// ---------- chats ----------

// A portrait drawn from a person's face settings (story.js PEOPLE). No face: a rolled-up scroll (a ship's log).
const hex = (n) => '#' + n.toString(16).padStart(6, '0');
const SCROLL = `<svg viewBox="0 0 100 100" stroke="#143b45" stroke-width="4" stroke-linejoin="round">
  <rect x="22" y="22" width="56" height="58" rx="4" fill="#f3e2bf"/><rect x="16" y="14" width="68" height="12" rx="6" fill="#d9c49a"/>
  <rect x="16" y="76" width="68" height="12" rx="6" fill="#d9c49a"/><path d="M32 40h36M32 50h36M32 60h24" fill="none"/></svg>`;
function portrait(f) {
  if (!f) return SCROLL;
  const ink = '#143b45', hat = hex(f.hatColor), hair = hex(f.hair), eye = f.eyes ? hex(f.eyes) : ink;
  const hats = {
    cap: `<path d="M20 42 Q50 8 80 42 Z" fill="${hat}"/><rect x="14" y="38" width="72" height="9" rx="4.5" fill="${hat}"/>`,
    straw: `<ellipse cx="50" cy="40" rx="46" ry="9" fill="${hat}"/><path d="M28 40 Q50 4 72 40 Z" fill="${hat}"/>`,
    bandana: `<path d="M20 46 Q50 10 80 46 Z" fill="${hat}"/><path d="M78 42 l16 6 l-14 7 z" fill="${hat}"/>`,
    fur: `<path d="M14 92 Q8 22 50 16 Q92 22 86 92 L76 92 Q80 42 50 38 Q20 42 24 92 Z" fill="${hat}"/>`,
    hood: `<path d="M14 92 Q10 24 50 18 Q90 24 86 92 L74 92 Q78 40 50 36 Q22 40 26 92 Z" fill="${hat}"/>`,
    none: `<path d="M24 46 Q50 18 76 46 Q64 36 50 36 Q36 36 24 46Z" fill="${hair}"/>`, // hair on top
    bald: '',
    tricorn: `<path d="M10 40 Q50 20 90 40 L76 46 Q50 36 24 46Z" fill="${hat}"/><path d="M26 42 Q50 4 74 42Z" fill="${hat}"/>`,
    bandage: `<path d="M22 44 Q50 30 78 44 L78 52 Q50 40 22 52Z" fill="${hat}"/><path d="M60 40 l6 8" stroke="#c84a3a" stroke-width="3"/>`,
  };
  const eyes = f.patch
    ? `<circle cx="40" cy="58" r="4.5" fill="${eye}"/><path d="M22 44 L78 70" stroke="#143b45" stroke-width="3"/><ellipse cx="61" cy="58" rx="8" ry="7" fill="#143b45"/>`
    : `<circle cx="40" cy="58" r="4.5" fill="${eye}"/><circle cx="60" cy="58" r="4.5" fill="${eye}"/>`;
  const extras = [
    f.freckles && '<g fill="#c9785a" stroke="none"><circle cx="31" cy="63" r="1.5"/><circle cx="35" cy="66" r="1.5"/><circle cx="65" cy="66" r="1.5"/><circle cx="69" cy="63" r="1.5"/></g>',
    f.marks && `<path d="M30 64 l8 3M30 69 l8 2M70 64 l-8 3M70 69 l-8 2" stroke="${hex(f.marks)}" stroke-width="2.5" stroke-linecap="round"/>`,
    f.moustache && `<path d="M34 70 Q42 64 50 69 Q58 64 66 70 Q58 74 50 71 Q42 74 34 70Z" fill="${hair}"/>`,
    f.earrings && '<circle cx="21" cy="66" r="4" fill="none" stroke="#f2c230" stroke-width="2.5"/><circle cx="79" cy="66" r="4" fill="none" stroke="#f2c230" stroke-width="2.5"/>',
    f.goggles && '<rect x="30" y="38" width="16" height="9" rx="4" fill="#f2a52b" stroke="#143b45" stroke-width="2.5"/><rect x="54" y="38" width="16" height="9" rx="4" fill="#f2a52b" stroke="#143b45" stroke-width="2.5"/>',
  ].filter(Boolean).join('');
  return `<svg viewBox="0 0 100 100" stroke="${ink}" stroke-width="4" stroke-linejoin="round" ${f.ghost ? 'opacity="0.8"' : ''}>
    ${f.collar ? `<path d="M16 100 Q20 80 36 84 L50 92 L64 84 Q80 80 84 100Z" fill="${hex(f.collar)}"/>` : ''}
    ${f.hat === 'bald' ? '' : `<path d="M23 52 q-8 16 4 26M77 52 q8 16 -4 26" fill="none" stroke="${hair}" stroke-width="9" stroke-linecap="round"/>`}
    <circle cx="50" cy="60" r="29" fill="${hex(f.skin)}"/>
    ${f.beard ? `<path d="M24 66 Q50 104 76 66 Q50 84 24 66Z" fill="${hair}"/>` : ''}
    <g stroke="none">${eyes}</g>${extras}
    <path d="M41 72 Q50 79 59 72" fill="none"/>
    ${hats[f.hat]}</svg>`;
}

// A chat, one line at a time; tap (or Enter) for the next, then done().
// people: everyone who might speak (story.js PEOPLE). who: who speaks unless a line says otherwise.
// A line is a string, { who, text }, or { choice: [[button, reply], [button, reply]] } (see story.js).
// A person can also be given directly as { name, face } (face null: a ship's log).
export function showTalk(people, who, lines, done) {
  const queue = [...lines], talk = $('talk');
  const personOf = (id) => (typeof id === 'string' ? people[id] : id);
  const draw = (line) => {
    const person = personOf(line.who ?? who), last = !queue.length;
    const choice = line.choice
      ? `<div class="choices">${line.choice.map(([label], k) => `<button class="go quiet" data-k="${k}">${label}</button>`).join('')}</div>`
      : `<small>${last ? 'Tap to finish' : 'Tap to carry on'}</small>`;
    talk.innerHTML = `<div class="box${person.face?.ghost ? ' ghost' : ''}"><div class="face">${portrait(person.face)}</div>
      <div class="words"><b>${person.name}</b>${line.choice ? '' : `<p>${line.text ?? line}</p>`}${choice}</div></div>`;
    talk.querySelectorAll('[data-k]').forEach((b) => b.addEventListener('click', (e) => {
      e.stopPropagation();
      queue.unshift({ who: line.who ?? who, text: line.choice[+b.dataset.k][1] }); // their answer comes next
      next();
    }));
    talk.dataset.choosing = line.choice ? '1' : '';
  };
  const next = () => {
    if (!queue.length) {
      talk.classList.remove('on');
      talk.onclick = null;
      return done();
    }
    draw(queue.shift());
  };
  talk.onclick = () => { if (!talk.dataset.choosing) next(); };
  next();
  talk.classList.add('on');
}

// ---------- the card panel ----------

// title, text (may hold <b>), buttons: [{ label, onClick, quiet }],
// tiles: [{ icon, name, text, price, level (shows dots out of 5), disabled, onClick }].
export function showPanel({ title, text = '', tiles = [], buttons = [], tone = '' }) {
  const panel = $('panel');
  panel.className = tone + (panel.classList.contains('on') ? ' on' : ''); // redraw in place, no flicker
  panel.querySelector('.card').innerHTML = `<h1>${title}</h1><p>${text}</p>
    ${tiles.length ? '<div class="tiles"></div>' : ''}<div class="buttons"></div>`;
  for (const t of tiles) {
    const b = document.createElement('button');
    b.className = 'tile';
    b.disabled = !!t.disabled;
    const dots = t.level != null ? `<i class="dots">${'<s class="on"></s>'.repeat(t.level)}${'<s></s>'.repeat(5 - t.level)}</i>` : '';
    b.innerHTML = `${t.icon}<b>${t.name}</b><span>${t.text}</span>${dots}${t.price != null ? `<em>${t.price}</em>` : ''}`;
    b.onclick = t.onClick;
    panel.querySelector('.tiles').append(b);
  }
  for (const [i, btn] of buttons.entries()) {
    const b = document.createElement('button');
    b.className = btn.quiet ? 'go quiet' : 'go';
    b.textContent = btn.label;
    b.onclick = btn.onClick;
    panel.querySelector('.buttons').append(b);
    if (i === 0 && !tiles.length) setTimeout(() => b.focus(), 50); // Enter or Space works on a keyboard
  }
  requestAnimationFrame(() => panel.classList.add('on'));
}

export const hidePanel = () => $('panel').classList.remove('on');

// A gear piece as a tile. price: a number of gold (shown as "N gold"), or words such as "In your hold".
export const gearTile = (id, { price, ...extra } = {}) =>
  ({ icon: gearIcon(id), name: GEAR[id].name, text: GEAR[id].text, price: typeof price === 'number' ? `${price} gold` : price, ...extra });

// ---------- the title screen ----------

// started: there's a saved voyage to carry on. on: { sail, help }.
export function showTitle(started, on) {
  $('title').innerHTML = `
    <h1>Saltwind</h1>
    <p>One wide ocean, one old curse and one very big squid</p>
    <div class="buttons">
      <button class="go" data-on="sail">${started ? 'Carry on' : 'Set sail'}</button>
      <button class="go quiet" data-on="help">How to play</button>
    </div>`;
  $('title').querySelectorAll('[data-on]').forEach((b) => b.addEventListener('click', on[b.dataset.on]));
  $('title').classList.add('on');
  document.body.classList.add('home');
}

export function hideTitle() {
  $('title').classList.remove('on');
  document.body.classList.remove('home');
}

// Little gear icons next to the gold.
export function showGear(owned) {
  $('gear').innerHTML = [...owned].map((id) => `<i title="${GEAR[id].name}">${gearIcon(id)}</i>`).join('');
}
