#!/bin/bash
# Rebuilds gallery.html from the web-ready files in assets/gallery.
#
# To add media: put originals in media/ (kept out of git), then run
#   scripts/encode-media.sh && scripts/build-gallery.sh
set -eu
cd "$(dirname "$0")/.."
DIR=assets/gallery

photos=""
for f in $(ls "$DIR"/*.jpg | grep -v -e '-thumb\.jpg$' -e '-poster\.jpg$' | sort); do
  b=$(basename "$f" .jpg)
  thumb="$DIR/$b-thumb.jpg"
  w=$(sips -g pixelWidth "$thumb" | awk '/pixelWidth/{print $2}')
  h=$(sips -g pixelHeight "$thumb" | awk '/pixelHeight/{print $2}')
  photos+="        <a href=\"$f\"><img src=\"$thumb\" width=\"$w\" height=\"$h\" alt=\"Agave Lounge\" loading=\"lazy\"></a>
"
done

videos=""
for f in $(ls "$DIR"/*.mp4 | sort); do
  b=$(basename "$f" .mp4)
  dims=$(ffprobe -v error -select_streams v:0 -show_entries stream=width,height -of csv=p=0 "$f")
  w=${dims%,*}; h=${dims#*,}
  cls=""; [ "$w" -gt "$h" ] && cls=' class="landscape"'
  videos+="        <video$cls src=\"$f\" poster=\"$DIR/$b-poster.jpg\" controls playsinline preload=\"none\"></video>
"
done

cat > gallery.html <<HTML
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Gallery · Agave Lounge</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <section class="hero" style="background-image:url(assets/about-11.jpg)">
    <h1>Gallery</h1>
  </section>

  <section class="section">
    <div class="wrap">
      <h2>Photos</h2>
      <div class="gallery-photos">
${photos}      </div>
    </div>
  </section>

  <section class="section band">
    <div class="wrap">
      <h2>Videos</h2>
      <div class="gallery-videos">
${videos}      </div>
    </div>
  </section>

  <script src="site.js"></script>
  <script src="gallery.js"></script>
</body>
</html>
HTML

echo "gallery.html: $(grep -c '<a href=' gallery.html) photos, $(grep -c '<video' gallery.html) videos"
