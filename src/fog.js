// The curse fog (the Salt-Shroud): a wall of thick pale-grey puffs over every part of the sea that the story hasn't opened yet.
// Only the patch around the ship is drawn, snapped to a grid so the puffs stay put as you sail.
import * as THREE from 'three';
import { toMap } from './map.js';

const GRID = 4; // a puff every this many units
const REACH = 36; // puffs are drawn this far around the ship
const MAX = 400;
const PUFF = new THREE.SphereGeometry(1, 10, 7);

// locked(e, n): is this spot (map coordinates) behind the fog?
export function createFog(scene, locked) {
  const mat = new THREE.MeshBasicMaterial({ color: 0xd5dadd, transparent: true, opacity: 0.88, depthWrite: false });
  mat.userData.outlineParameters = { visible: false };
  const mesh = new THREE.InstancedMesh(PUFF, mat, MAX);
  mesh.frustumCulled = false;
  mesh.count = 0;
  scene.add(mesh);
  let puffs = [], cellX = NaN, cellZ = NaN;
  const m = new THREE.Matrix4(), q = new THREE.Quaternion(), pos = new THREE.Vector3(), size = new THREE.Vector3();

  // Which grid spots near (x, z) are fogged. Only worked out again when the ship reaches a new grid square.
  function gather(x, z) {
    puffs = [];
    const r = Math.ceil(REACH / GRID);
    for (let i = -r; i <= r && puffs.length < MAX; i++) {
      for (let j = -r; j <= r && puffs.length < MAX; j++) {
        const px = (cellX + i) * GRID, pz = (cellZ + j) * GRID;
        if (Math.hypot(px - x, pz - z) > REACH) continue;
        const map = toMap(px, pz);
        if (!locked(map.e, map.n)) continue;
        const h = Math.sin(px * 12.9898 + pz * 78.233) * 43758.5453; // the same "random" size for the same spot
        puffs.push({ x: px, z: pz, s: 2.6 + (h - Math.floor(h)) * 1.6, phase: h });
      }
    }
  }

  function update(x, z, t) {
    const cx = Math.round(x / GRID), cz = Math.round(z / GRID);
    if (cx !== cellX || cz !== cellZ) {
      cellX = cx;
      cellZ = cz;
      gather(x, z);
    }
    puffs.forEach((p, i) => {
      const breathe = 1 + 0.08 * Math.sin(t * 0.8 + p.phase);
      pos.set(p.x, 0.6 + 0.3 * Math.sin(t * 0.5 + p.phase), p.z);
      size.set(p.s * breathe, p.s * 0.7 * breathe, p.s * breathe);
      mesh.setMatrixAt(i, m.compose(pos, q, size));
    });
    mesh.count = puffs.length;
    mesh.instanceMatrix.needsUpdate = true;
  }
  // The story opened a region: work out the fog again on the next frame.
  const refresh = () => { cellX = NaN; };
  return { update, refresh };
}
