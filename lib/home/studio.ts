import * as THREE from "three";

/**
 * A small product-photography environment, baked to a PMREM once: warm key
 * softbox front-left, cool rim strips behind, a big overhead softbox and a
 * faint warm floor bounce, on a near-black cyclorama.
 *
 * Only the hero (chicken + bucket) uses it, via `material.envMap` — the room
 * keeps the neutral scene environment it was authored with.
 */
export function createStudioEnv(gl: THREE.WebGLRenderer) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color("#07080b");

  const panel = (w: number, h: number, color: string, power: number, pos: [number, number, number]) => {
    const mat = new THREE.MeshBasicMaterial({ color: new THREE.Color(color).multiplyScalar(power), side: THREE.DoubleSide });
    mat.toneMapped = false;
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat);
    mesh.position.set(...pos);
    mesh.lookAt(0, 0, 0);
    scene.add(mesh);
    return mesh;
  };

  // camera looks down -Z, so +Z is "in front of the subject"
  panel(4, 5, "#ffc690", 7, [-5, 2.5, 4.5]); // key
  panel(3, 3, "#e3e8ff", 1.2, [5, 1, 4]); // soft fill
  panel(1, 7, "#7f9fff", 9, [4.5, 1.5, -4]); // rim right
  panel(1, 6, "#ffb27a", 5, [-4.5, 1, -4.5]); // rim left (warm kicker)
  panel(7, 7, "#ffffff", 2.2, [0, 7, 0]); // overhead
  panel(10, 10, "#3a2414", 0.5, [0, -6, 0]); // floor bounce

  const pmrem = new THREE.PMREMGenerator(gl);
  const texture = pmrem.fromScene(scene, 0.035).texture;
  pmrem.dispose();
  scene.traverse((o) => {
    const m = o as THREE.Mesh;
    if (!m.isMesh) return;
    m.geometry.dispose();
    (m.material as THREE.Material).dispose();
  });
  return texture;
}
