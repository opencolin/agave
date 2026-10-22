// SoundCloud players on the Music page.
// Only one set plays at a time. On iPhone/iPad, SoundCloud covers its widget with a
// "Play on SoundCloud" screen, so we lay our own play/pause control over it and drive
// the widget through its API. If playback doesn't start, the cover is removed and
// SoundCloud's own "Listen in browser" option is still there.
(() => {
  if (!window.SC) return;
  const E = SC.Widget.Events;
  const iOS =
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

  const players = [...document.querySelectorAll(".track .player")];
  const widgets = players.map((p) => SC.Widget(p.querySelector("iframe")));

  widgets.forEach((w) =>
    w.bind(E.PLAY, () => widgets.forEach((other) => other !== w && other.pause()))
  );

  if (!iOS) return;

  const fmt = (ms) => {
    const s = Math.floor(ms / 1000);
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const pad = (n) => String(n).padStart(2, "0");
    return h ? `${h}:${pad(m)}:${pad(s % 60)}` : `${m}:${pad(s % 60)}`;
  };

  players.forEach((player, i) => {
    const w = widgets[i];
    const cover = document.createElement("div");
    cover.className = "sc-cover";
    cover.innerHTML = `
      <button class="sc-play" aria-label="Play">▶</button>
      <div class="sc-info">
        <div class="sc-bar"><span></span></div>
        <div class="sc-time">Tap to play</div>
      </div>`;
    player.append(cover);

    const btn = cover.querySelector(".sc-play");
    const fill = cover.querySelector(".sc-bar span");
    const time = cover.querySelector(".sc-time");
    let playing = false;
    let started = false;
    let duration = 0;

    w.bind(E.READY, () => w.getDuration((d) => (duration = d)));

    btn.addEventListener("click", () => {
      if (playing) return w.pause();
      w.play();
      time.textContent = "Loading…";
      if (!started) {
        setTimeout(() => {
          if (!started) cover.remove();
        }, 4000);
      }
    });

    w.bind(E.PLAY, () => {
      started = playing = true;
      btn.textContent = "❚❚";
      btn.setAttribute("aria-label", "Pause");
    });
    const stop = () => {
      playing = false;
      btn.textContent = "▶";
      btn.setAttribute("aria-label", "Play");
    };
    w.bind(E.PAUSE, stop);
    w.bind(E.FINISH, stop);
    w.bind(E.PLAY_PROGRESS, (e) => {
      const total = duration || e.currentPosition / (e.relativePosition || 1);
      fill.style.width = `${(e.relativePosition * 100).toFixed(2)}%`;
      time.textContent = `${fmt(e.currentPosition)} / ${fmt(total)}`;
    });
  });
})();
