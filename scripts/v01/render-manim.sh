#!/usr/bin/env bash
# Capa 1 (Manim) del video 01: renderiza escenas y las deja listas para Remotion.
#
#   scripts/v01/render-manim.sh            # todas las escenas, calidad alta
#   QUALITY=l scripts/v01/render-manim.sh V01_M2_Fisica
#
# Salida en layers/remotion/public/layers/v01/:
#   M1.webm, M2.webm, M3.webm      (VP9 + alfa, colores NO premultiplicados)
#   M1.events.json ...             (marcas, sonidos, rotulador, canales)
#
# Nota: Manim escribe el alfa premultiplicado. Se renderiza a .mov (qtrle, sin
# pérdida) y ffmpeg lo des-premultiplica antes de codificar a VP9; si no, los
# bordes y los trazos semitransparentes salen oscurecidos en Remotion.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
OUT="$ROOT/layers/remotion/public/layers/v01"
QUALITY="${QUALITY:-h}"
SCENES=("$@")
[[ ${#SCENES[@]} -eq 0 ]] && SCENES=(V01_M1_Revelacion V01_M2_Fisica V01_M3_Reconstruccion)
mkdir -p "$OUT"
cd "$ROOT/layers/manim"

render_one() {
  local sc="$1"
  local short="${sc:4:2}"   # V01_M1_... -> M1
  local media="media/v01_$short"
  echo "▶ Manim $sc (q=$QUALITY)"
  # -qh implica 60 fps: se fuerza 30 fps (la línea de tiempo del video es 30)
  EVENTS_DIR="$OUT" .venv/bin/manim -q"$QUALITY" --frame_rate 30 -t --format mov \
    --media_dir "$media" --progress_bar none \
    scenes/v01_motor/scenes.py "$sc" > "$OUT/$short.manim.log" 2>&1
  local mov
  mov="$(find "$media/videos" -name "$sc.mov" -not -path "*partial*" | head -1)"
  ffmpeg -loglevel error -y -i "$mov" \
    -vf "format=rgba,unpremultiply=inplace=1" \
    -c:v libvpx-vp9 -pix_fmt yuva420p -crf 16 -b:v 0 \
    -deadline good -cpu-used 4 -row-mt 1 -auto-alt-ref 0 \
    "$OUT/$short.webm"
  echo "✅ $short.webm ($(du -h "$OUT/$short.webm" | cut -f1))"
}

pids=()
for sc in "${SCENES[@]}"; do
  render_one "$sc" &
  pids+=($!)
done
fail=0
for p in "${pids[@]}"; do wait "$p" || fail=1; done
exit $fail
