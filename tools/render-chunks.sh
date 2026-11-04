#!/bin/sh
# Full render in short chunks, one fresh headless Chrome per chunk, then a lossless concat + the usual mux (dh013).
# Why: with the MacBook lid closed (display asleep) headless Chrome logs "CVDisplayLinkCreateWithCGDisplay failed" and its
# tab dies after ~100-140 consecutive frames ("Target closed" / "Execution context was destroyed") — even lt001 did.
# A 2 s chunk (60 frames) survives; a crashed chunk is retried. Same frames as one render.mjs run (t = from + i/fps).
#   sh tools/render-chunks.sh <video> [chunk seconds, default 2]      RESUME=1 keeps finished chunks (after a timeout)
set -e
V="$1"; C="${2:-2}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"; DIR="$ROOT/videos/$V"; OUT="$DIR/out"; CH="$OUT/chunks"
DUR=$(python3 -c "import json;print(json.load(open('$DIR/story.json'))['duration'])")
FF="$ROOT/node_modules/@ffmpeg-installer/darwin-arm64/ffmpeg"; [ -x "$FF" ] || FF=ffmpeg
[ "$RESUME" = 1 ] || rm -rf "$CH"; mkdir -p "$CH"; : > "$CH/list.txt"
N=$(python3 -c "import math;print(math.ceil($DUR/$C - 1e-9))")
i=0
while [ $i -lt $N ]; do
  A=$(python3 -c "print(round($i*$C, 4))"); B=$(python3 -c "print(round(min(($i+1)*$C, $DUR), 4))")
  F=$(printf "%s/c%03d.mp4" "$CH" $i)
  if [ -s "$F" ]; then echo "file '$F'" >> "$CH/list.txt"; i=$((i+1)); continue; fi
  for try in 1 2 3 4; do
    if node "$ROOT/tools/render.mjs" "$V" --from "$A" --to "$B" > "$CH/log.txt" 2>&1 && [ -s "$OUT/silent.mp4" ]; then break; fi
    echo "chunk $A-$B: try $try failed"; rm -f "$OUT/silent.mp4"
    [ $try -eq 4 ] && { tail -5 "$CH/log.txt"; exit 1; }
  done
  mv "$OUT/silent.mp4" "$F"; echo "file '$F'" >> "$CH/list.txt"
  echo "chunk $((i+1))/$N  $A-$B s"
  i=$((i+1))
done
"$FF" -y -loglevel error -f concat -safe 0 -i "$CH/list.txt" -c copy "$OUT/silent.mp4"
node "$ROOT/tools/mux.mjs" "$V"
