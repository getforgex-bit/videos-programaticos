#!/usr/bin/env bash
# Video 01 · v2 — "El motor invisible", estilo sepia dinámico. Pipeline completo:
#   1. Manim (scenes_v2.py)         → public/layers/v01v2/M1|M2|M3.webm + events
#   2. Motion Canvas (resumen_v2)   → public/layers/v01v2/MC.webm
#   3. build_v2.py                  → timeline.json + audio.wav (100 BPM)
#   4. Remotion                     → output/v01-motor-invisible-v2-sepia.mp4
# Opcional: SKIP_MANIM=1 SKIP_MC=1 QUALITY=l|m|h CONCURRENCY=n
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$ROOT"
OUT="layers/remotion/public/layers/v01v2"
mkdir -p layers/remotion/public/fonts output "$OUT"
cp assets/fonts/Kalam-*.ttf layers/remotion/public/fonts/

[[ "${SKIP_MANIM:-0}" == 1 ]] || scripts/v01/render-manim-v2.sh
if [[ "${SKIP_MC:-0}" != 1 ]]; then
  node scripts/mc-render.mjs v01_motor_v2
  ffmpeg -loglevel error -y -framerate 30 -i layers/motion-canvas/output/v01_motor_v2/%06d.png \
    -c:v libvpx-vp9 -pix_fmt yuva420p -crf 16 -b:v 0 -deadline good -cpu-used 4 -row-mt 1 \
    -auto-alt-ref 0 "$OUT/MC.webm"
fi

layers/manim/.venv/bin/python scripts/v01/build_v2.py

cd layers/remotion
npx remotion render src/index.ts V01v2-MotorInvisible-Sepia \
  "$ROOT/output/v01-motor-invisible-v2-sepia.mp4" \
  --codec h264 --crf 18 --audio-codec aac --audio-bitrate 192k \
  --concurrency "${CONCURRENCY:-4}"
echo "🎬 output/v01-motor-invisible-v2-sepia.mp4"
