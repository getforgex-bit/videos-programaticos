#!/usr/bin/env bash
# Video 01 · v2 — Capa 1 (Manim): escenas sepia → webm (VP9 + alfa) + events.
#   scripts/v01/render-manim-v2.sh [V01v2_M1 V01v2_M2 V01v2_M3]
# Mismo flujo que v1: .mov sin pérdida → ffmpeg unpremultiply → VP9.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
OUT="$ROOT/layers/remotion/public/layers/v01v2"
QUALITY="${QUALITY:-h}"
SCENES=("$@")
[[ ${#SCENES[@]} -eq 0 ]] && SCENES=(V01v2_M1 V01v2_M2 V01v2_M3)
mkdir -p "$OUT"
cd "$ROOT/layers/manim"

render_one() {
  local sc="$1" short="${1##*_}"   # V01v2_M2 -> M2
  local media="media/v01v2_$short"
  echo "▶ Manim $sc (q=$QUALITY)"
  EVENTS_DIR="$OUT" .venv/bin/manim -q"$QUALITY" --frame_rate 30 -t --format mov \
    --media_dir "$media" --progress_bar none \
    scenes/v01_motor/scenes_v2.py "$sc" > "$OUT/$short.manim.log" 2>&1
  local mov
  mov="$(find "$media/videos" -name "$sc.mov" -not -path "*partial*" | head -1)"
  ffmpeg -loglevel error -y -i "$mov" -vf "format=rgba,unpremultiply=inplace=1" \
    -c:v libvpx-vp9 -pix_fmt yuva420p -crf 16 -b:v 0 \
    -deadline good -cpu-used 4 -row-mt 1 -auto-alt-ref 0 "$OUT/$short.webm"
  echo "✅ $short.webm ($(du -h "$OUT/$short.webm" | cut -f1))"
}

pids=()
for sc in "${SCENES[@]}"; do render_one "$sc" & pids+=($!); done
fail=0
for p in "${pids[@]}"; do wait "$p" || fail=1; done
exit $fail
