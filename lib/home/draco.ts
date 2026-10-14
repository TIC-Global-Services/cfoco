import { useGLTF } from "@react-three/drei";

// Serve the Draco decoder from /public/draco instead of the gstatic CDN.
useGLTF.setDecoderPath("/draco/");
