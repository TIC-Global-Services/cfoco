#!/usr/bin/env bash
# Builds the compressed copies of the home page's 3D models (loaded through lib/home/models.ts):
#   public/models/opt/  desktop
#   public/models/m/    phones / tablets / low-core machines
# from the full-size sources in models-src/ (not served: only the built copies are).
# Textures become KTX2 (Basis), which stays compressed on the GPU (about 8x less video memory than the same picture as
# WebP / PNG, which is unpacked to raw RGBA); geometry is Draco.
#   uastc: close-up pieces (the chickens, the bucket, the kiosks): near-lossless, about 4x bigger than etc1s
#   etc1s: everything seen from a distance (the room, the kitchen): much smaller, a little softer
# Normal maps are always UASTC (etc1s smears them) and have their own size cap: on the room and the kitchen's big
# surfaces they are half the colour maps' size (the grain is not seen at that size, and one 2048 px normal map is
# ~4.6 MB); on the close-up pieces they are as big as the colour.
#
# Usage: scripts/optimize-models.sh [model.glb ...]     (no arguments: every model)
# Needs: Node, and the `ktx` tool from KTX-Software 4.x or later on the PATH, built for this machine's processor
# (https://github.com/KhronosGroup/KTX-Software/releases).
# The sources in models-src/ stay as they are; re-run this after replacing one. A new model has to be added to MODELS
# below, and its URL in the code stays `/models/<name>.glb` (lib/home/models.ts picks the built copy).
# Only resize / png / ktx / draco are applied: `optimize` would join and rename nodes, and the scene code finds parts by name.
set -euo pipefail
cd "$(dirname "$0")/.."

ktx --version >/dev/null 2>&1 || {
  echo "ktx (KTX-Software) is missing or cannot run here (machine: $(uname -m); a build for the other architecture shows as 'bad CPU type')" >&2
  exit 1
}
# gentle on the machine: lowest priority and only a couple of encoders at once (each `ktx` is itself multi-threaded;
# one per core made the load average reach 250 on a 12-core Mac and froze the desktop). Slower, but the machine stays usable.
GT="nice -n 19 npx --yes @gltf-transform/cli@4.5.1"
SRC=models-src
OUT=public/models
TMP=$(mktemp -d)
trap 'rm -rf "$TMP"' EXIT
JOBS=${JOBS:-2}

# model                            colour px      normal px     textures  etc1s quality   colour textures kept uastc
#                                  desk  mobile   desk  mobile            desk  mobile    desk  mobile  (glob on the name; - = none)
# etc1s turns smooth dark gradients into visible coloured 4 px blocks, whatever its quality (the room's baked floor
# shadows did, even at 255), so the room's floor colour textures are uastc (on the phone set: its 1024 px textures are
# stretched the most there).
MODELS=(
  "final_kitchen.glb                2048  1024     1024  512    etc1s     192   192     -     -"
  "interior_environment_new.glb     2048  1024     1024  512    etc1s     192   192     *floor*  *floor*"
  "ordering_machine_final.glb       2048  1024     2048  1024   uastc     0     0     -     -"
  "bucket_drop_new.glb              2048  1024     2048  1024   uastc     0     0     -     -"
  "new_raw_chicken_photoreal_v2.glb 2048  1024     2048  1024   uastc     0     0     -     -"
  "new_fried_chicken.glb            2048  1024     2048  1024   uastc     0     0     -     -"
  "serve_robot.glb                  1024  512      1024  512    etc1s     192   192     -     -"
  "fries.glb                        1024  512      1024  512    etc1s     192   192     -     -"
  "coke.glb                         1024  512      1024  512    etc1s     192   192     -     -"
)

build() { # in out colour_px normal_px mode etc1s_quality uastc_colour_pattern
  $GT resize "$1" "$TMP/r.glb" --width "$3" --height "$3"
  # the sources are WebP, which `ktx` cannot read (it skips them without a word): PNG first
  $GT png "$TMP/r.glb" "$TMP/p.glb" --formats "*"
  # normal maps first, UASTC at their own cap (a cap only: nothing is enlarged)
  $GT uastc "$TMP/p.glb" "$TMP/n.glb" --slots "normalTexture" --resize "$4" --level 2 --zstd 18 --jobs "$JOBS"
  # then the rest (textures already KTX2 are left alone)
  if [ "$5" = uastc ]; then
    $GT uastc "$TMP/n.glb" "$TMP/k.glb" --level 2 --rdo --zstd 18 --jobs "$JOBS"
  else
    if [ "$7" != "-" ]; then
      $GT uastc "$TMP/n.glb" "$TMP/u.glb" --pattern "$7" --slots "baseColorTexture" --level 2 --rdo --zstd 18 --jobs "$JOBS"
      mv "$TMP/u.glb" "$TMP/n.glb"
    fi
    $GT etc1s "$TMP/n.glb" "$TMP/k.glb" --quality "$6" --jobs "$JOBS"
  fi
  $GT draco "$TMP/k.glb" "$2"
}

mkdir -p "$OUT/opt" "$OUT/m"
for row in "${MODELS[@]}"; do
  read -r name cd cm nd nm mode qd qm patd patm <<<"$row"
  if [ $# -gt 0 ] && ! printf '%s\n' "$@" | grep -qx "$name"; then continue; fi
  echo "== $name ($mode)"
  build "$SRC/$name" "$OUT/opt/$name" "$cd" "$nd" "$mode" "$qd" "$patd"
  build "$SRC/$name" "$OUT/m/$name" "$cm" "$nm" "$mode" "$qm" "$patm"
done
ls -lh "$OUT/opt" "$OUT/m"
