// The Harbour Brazier on Home Harbour's beach, beside the dock: a stone pillar and an iron bowl with
// five flames, one lit for each relic brought home (the four around the edge) and the Heart of the Sea
// (the big one in the middle).
import * as THREE from 'three';
import { toon } from './stage.js';

const COLORS = [0x3fe0d0, 0xa070ff, 0xffb030, 0xe8f0ff, 0x3a8bff]; // Conch, Lodestone, Sun-Amber, Soul-Bell, Heart
const PILLAR = new THREE.CylinderGeometry(0.7, 0.9, 1.4, 10);
const BOWL = new THREE.CylinderGeometry(1.3, 0.8, 0.5, 14);
const FLAME = new THREE.ConeGeometry(0.28, 1, 7);
const stone = toon(0x9a948b), iron = toon(0x2a2e33);

// (x, z): where it stands in the world.
export function createBrazier(scene, x, z) {
  const g = new THREE.Group();
  const pillar = new THREE.Mesh(PILLAR, stone), bowl = new THREE.Mesh(BOWL, iron);
  pillar.position.y = 1.1;
  bowl.position.y = 2;
  g.add(pillar, bowl);
  const flames = COLORS.map((color, i) => {
    const mat = new THREE.MeshBasicMaterial({ color });
    mat.userData.outlineParameters = { visible: false };
    const f = new THREE.Mesh(FLAME, mat);
    const a = (i / 4) * Math.PI * 2;
    f.position.set(i < 4 ? Math.cos(a) * 0.8 : 0, 2.6, i < 4 ? Math.sin(a) * 0.8 : 0);
    f.userData.size = i < 4 ? 1 : 1.8;
    g.add(f);
    return f;
  });
  g.position.set(x, 0, z);
  scene.add(g);

  // lit: how many flames burn (0..5). Each one flickers.
  function update(t, lit) {
    flames.forEach((f, i) => {
      f.visible = i < lit;
      const flick = 1 + 0.18 * Math.sin(t * 11 + i * 2) + 0.08 * Math.sin(t * 23 + i);
      f.scale.set(f.userData.size * (1.1 - 0.1 * flick), f.userData.size * flick, f.userData.size * (1.1 - 0.1 * flick));
      f.position.y = 2.25 + f.userData.size * flick * 0.5;
    });
  }
  // A flame just lit: its colour (for a burst of sparks).
  const color = (i) => COLORS[i];
  return { update, color, x, z };
}
