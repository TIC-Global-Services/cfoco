import * as THREE from "three";

const MAPS = ["map", "emissiveMap", "normalMap", "roughnessMap", "metalnessMap", "aoMap", "alphaMap"] as const;

/**
 * Full anisotropic filtering on every texture under `root`: printed text (the kiosk and vending logos, the kitchen's
 * screens) stays sharp on surfaces seen at an angle instead of smearing. Cheap: one sampler setting per texture.
 */
export function sharpen(root: THREE.Object3D, gl: THREE.WebGLRenderer) {
  const max = gl.capabilities.getMaxAnisotropy();
  root.traverse((o) => {
    const m = (o as THREE.Mesh).material;
    if (!m) return;
    for (const mat of Array.isArray(m) ? m : [m]) {
      for (const k of MAPS) {
        const t = (mat as unknown as Record<string, THREE.Texture | null | undefined>)[k];
        if (t?.isTexture && t.anisotropy !== max) {
          t.anisotropy = max;
          t.needsUpdate = true;
        }
      }
    }
  });
}
