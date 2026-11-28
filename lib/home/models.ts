import { useGLTF } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import type * as THREE from "three";
import { type GLTFLoader, KTX2Loader } from "three-stdlib"; // drei's own loaders
import "./draco";

/**
 * Loading the home page's models.
 *
 * Two compressed sets are built from the sources in models-src/ by scripts/optimize-models.sh: public/models/opt/ for
 * desktops and public/models/m/ for phones, tablets and low-core machines (smaller textures). Their textures are KTX2
 * (Basis): they stay compressed on the GPU, where a WebP or PNG is unpacked to raw RGBA (a 2048 px texture is ~22 MB
 * of video memory either way). The page used to ask for ~1.7 GB of it, which is what hung and reloaded phones.
 *
 * The sources are not served: every model the page uses has to be built (see MODELS in the script).
 */

/** phones / tablets (a touch screen as the main pointer) and low-core machines */
export const LITE =
  typeof window !== "undefined" &&
  (window.matchMedia("(pointer: coarse)").matches || (navigator.hardwareConcurrency ?? 8) <= 4);

/** a model's URL in config (`/models/<name>.glb`) → its built copy for this device */
export function modelUrl(path: string) {
  const name = path.replace(/^\/models\//, "");
  return `/models/${LITE ? "m" : "opt"}/${name}`;
}

// KTX2 needs the renderer to pick the GPU format it transcodes to, so it is set up once the canvas exists
let ktx2: KTX2Loader | null = null;
const queued = new Set<string>();
const extend = (loader: GLTFLoader) => {
  if (ktx2) loader.setKTX2Loader(ktx2);
};

/** call once the renderer exists (Scene's onCreated); starts the preloads asked for before it */
export function initModels(gl: THREE.WebGLRenderer) {
  if (ktx2) return;
  ktx2 = new KTX2Loader().setTranscoderPath("/basis/").detectSupport(gl);
  queued.forEach((p) => useGLTF.preload(modelUrl(p), true, false, extend));
  queued.clear();
}

/** starts loading a model early (before its component mounts) */
export function preloadModel(path: string) {
  if (ktx2) useGLTF.preload(modelUrl(path), true, false, extend);
  else queued.add(path);
}

/** useGLTF for the home page's models: the right set, Draco and KTX2 */
export function useModel(path: string) {
  initModels(useThree((s) => s.gl));
  return useGLTF(modelUrl(path), true, false, extend);
}

export function useModels(paths: string[]) {
  initModels(useThree((s) => s.gl));
  return useGLTF(paths.map(modelUrl), true, false, extend);
}
