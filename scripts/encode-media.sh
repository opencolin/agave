#!/bin/bash
# Makes web-ready copies of media/ in assets/gallery: photos resized with
# thumbnails, videos as H.264 MP4 (max 1280px) with a poster frame.
# Usage: scripts/encode-media.sh [media dir] [out dir]
set -u
cd "$(dirname "$0")/.."
SRC="${1:-media}"; OUT="${2:-assets/gallery}"; mkdir -p "$OUT"
n=0
for f in "$SRC"/*.jpg "$SRC"/*.jpeg "$SRC"/*.JPG "$SRC"/*.JPEG; do
  [ -f "$f" ] || continue
  b=$(basename "${f%.*}")
  sips -s format jpeg -s formatOptions 80 -Z 1800 "$f" --out "$OUT/$b.jpg" >/dev/null 2>&1
  sips -s format jpeg -s formatOptions 75 -Z 700 "$f" --out "$OUT/$b-thumb.jpg" >/dev/null 2>&1
  n=$((n+1))
done
echo "photos: $n"
v=0
for f in "$SRC"/*.mov "$SRC"/*.MOV "$SRC"/*.mp4; do
  [ -f "$f" ] || continue
  b=$(basename "${f%.*}")
  ffmpeg -nostdin -loglevel error -y -i "$f" -vf "scale='if(gt(iw,ih),min(1280,iw),-2)':'if(gt(iw,ih),-2,min(1280,ih))'" \
    -c:v libx264 -preset slow -crf 27 -pix_fmt yuv420p -profile:v high -movflags +faststart \
    -c:a aac -b:a 96k "$OUT/$b.mp4" || echo "FAILED $f"
  # Poster frame at 0.5s; very short clips fall back to the first frame.
  for t in 0.5 0; do
    ffmpeg -nostdin -loglevel error -y -ss $t -i "$OUT/$b.mp4" -frames:v 1 -vf "scale='if(gt(iw,ih),700,-2)':'if(gt(iw,ih),-2,700)'" -q:v 4 "$OUT/$b-poster.jpg" 2>/dev/null && break
  done
  [ -s "$OUT/$b-poster.jpg" ] || echo "POSTER FAILED $f"
  v=$((v+1))
done
echo "videos: $v"
du -sh "$OUT"
