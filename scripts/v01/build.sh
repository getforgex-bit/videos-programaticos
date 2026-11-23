#!/usr/bin/env bash
# Video 01 — "El motor invisible" · estilo pizarra. Pipeline completo:
#
#   1. Manim          → layers/remotion/public/layers/v01/M1|M2|M3.webm + events
#   2. Motion Canvas  → layers/remotion/public/layers/v01/MC.webm
#   3. Timeline+audio → timeline.json + audio.wav (sincronizados a eventos reales)
#   4. Remotion       → output/v01-motor-invisible-pizarra.mp4
#
# Variables opcionales:
#   SKIP_MANIM=1  SKIP_MC=1   reutiliza capas ya renderizadas
#   QUALITY=l|m|h             calidad de Manim (por defecto h)
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$ROOT"

mkdir -p layers/remotion/public/fonts output
cp assets/fonts/Kalam-*.ttf layers/remotion/public/fonts/

[[ "${SKIP_MANIM:-0}" == 1 ]] || scripts/v01/render-manim.sh
[[ "${SKIP_MC:-0}" == 1 ]] || scripts/v01/render-mc.sh

layers/manim/.venv/bin/python scripts/v01/build_timeline_audio.py

cd layers/remotion
npx remotion render src/index.ts V01-MotorInvisible-Pizarra \
  "$ROOT/output/v01-motor-invisible-pizarra.mp4" \
  --codec h264 --crf 18 --audio-codec aac --audio-bitrate 192k \
  --concurrency "${CONCURRENCY:-3}"
echo "🎬 output/v01-motor-invisible-pizarra.mp4"
