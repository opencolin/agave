#!/bin/bash
# Rebuilds gallery.html from the web-ready files in assets/gallery.
# Photos and videos are merged into one story sequence, sorted by file name
# (so IMG_ files stay in shooting order).
#
# To add media: put originals in media/ (kept out of git), then run
#   scripts/encode-media.sh && scripts/build-gallery.sh
set -eu
cd "$(dirname "$0")/.."
DIR=assets/gallery

tiles=""
n=0
for f in $( (ls "$DIR"/*.jpg | grep -v -e '-thumb\.jpg$' -e '-poster\.jpg$'; ls "$DIR"/*.mp4) | sort -t/ -k3); do
  b=$(basename "${f%.*}")
  if [[ "$f" == *.mp4 ]]; then
    tiles+="        <a class=\"story-tile is-video\" href=\"$f\" data-type=\"video\"><img src=\"$DIR/$b-poster.jpg\" alt=\"Video from Agave Lounge\" loading=\"lazy\"></a>
"
  else
    tiles+="        <a class=\"story-tile\" href=\"$f\" data-type=\"photo\"><img src=\"$DIR/$b-thumb.jpg\" alt=\"Photo from Agave Lounge\" loading=\"lazy\"></a>
"
  fi
  n=$((n+1))
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
    <div>
      <h1>Gallery</h1>
      <p><button class="button play-all" type="button">▶ Watch all</button></p>
    </div>
  </section>

  <section class="section">
    <div class="wrap">
      <p class="gallery-hint">Tap any photo or video to watch. Tap the right side for next, left for back, hold to pause.</p>
      <div class="story-grid">
${tiles}      </div>
    </div>
  </section>

  <script src="site.js"></script>
  <script src="gallery.js"></script>
</body>
</html>
HTML

echo "gallery.html: $n stories ($(grep -c 'data-type="photo"' gallery.html) photos, $(grep -c 'data-type="video"' gallery.html) videos)"
