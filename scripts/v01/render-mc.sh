#!/usr/bin/env bash
# Capa 2 (Motion Canvas) del video 01: render headless + PNG → webm (VP9 + alfa).
# Los PNG de Motion Canvas ya vienen con alfa NO premultiplicado.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
OUT="$ROOT/layers/remotion/public/layers/v01"
mkdir -p "$OUT"
node "$ROOT/scripts/mc-render.mjs" v01_motor
ffmpeg -loglevel error -y -framerate 30 \
  -i "$ROOT/layers/motion-canvas/output/v01_motor/%06d.png" \
  -c:v libvpx-vp9 -pix_fmt yuva420p -crf 16 -b:v 0 \
  -deadline good -cpu-used 4 -row-mt 1 -auto-alt-ref 0 \
  "$OUT/MC.webm"
echo "✅ MC.webm ($(du -h "$OUT/MC.webm" | cut -f1))"
