// Stories page: Instagram-stories-style viewer.
// Tap right/left to go forward/back, hold to pause, swipe down or ✕ to close.
// Photos show for PHOTO_MS; videos autoplay and advance when they end.
(() => {
  const PHOTO_MS = 5000;
  const tiles = [...document.querySelectorAll(".story-tile")];
  if (!tiles.length) return;
  const items = tiles.map((a) => ({ type: a.dataset.type, src: a.getAttribute("href") }));

  const root = document.createElement("div");
  root.className = "stories";
  root.hidden = true;
  root.innerHTML = `
    <div class="st-bars">${items.map(() => "<span><i></i></span>").join("")}</div>
    <div class="st-top">
      <span class="st-count"></span>
      <button class="st-sound" type="button" aria-label="Turn sound off">🔊</button>
      <button class="st-close" type="button" aria-label="Close">✕</button>
    </div>
    <div class="st-stage">
      <img class="st-img" alt="">
      <video class="st-video" playsinline preload="auto"></video>
      <div class="st-loading" hidden></div>
    </div>
    <button class="st-prev" type="button" aria-label="Previous"></button>
    <button class="st-next" type="button" aria-label="Next"></button>`;
  document.body.append(root);

  const bars = [...root.querySelectorAll(".st-bars i")];
  const img = root.querySelector(".st-img");
  const video = root.querySelector(".st-video");
  const count = root.querySelector(".st-count");
  const sound = root.querySelector(".st-sound");
  const loading = root.querySelector(".st-loading");

  let i = 0;
  let paused = false;
  let started = 0; // when the current photo timer started
  let elapsed = 0; // photo time already shown before a pause
  let raf = 0;
  let timer = 0; // advances photos; the progress bar is only drawn per frame
  // Sound starts on. Opening the viewer is a tap, which lets browsers play with
  // sound; if one still refuses, show() falls back to muted.
  let muted = false;

  const setBar = (n, frac) => (bars[n].style.width = `${Math.min(100, frac * 100)}%`);

  const tick = () => {
    const item = items[i];
    let frac = 0;
    if (item.type === "photo") {
      const t = elapsed + (paused ? 0 : performance.now() - started);
      frac = t / PHOTO_MS;
    } else if (video.duration) {
      frac = video.currentTime / video.duration;
    }
    setBar(i, frac);
    raf = requestAnimationFrame(tick);
  };

  const preload = (n) => {
    const it = items[n];
    if (it && it.type === "photo") new Image().src = it.src;
  };

  const show = (n) => {
    if (n < 0) n = 0;
    if (n >= items.length) return close();
    cancelAnimationFrame(raf);
    clearTimeout(timer);
    i = n;
    bars.forEach((b, k) => setBar(k, k < i ? 1 : 0));
    count.textContent = `${i + 1} / ${items.length}`;
    paused = false;
    root.classList.remove("is-paused");
    elapsed = 0;

    const item = items[i];
    root.classList.toggle("is-video", item.type === "video");
    if (item.type === "photo") {
      video.pause();
      video.removeAttribute("src");
      img.src = item.src;
      loading.hidden = true;
      started = performance.now();
      timer = setTimeout(next, PHOTO_MS);
    } else {
      img.removeAttribute("src");
      loading.hidden = false;
      video.muted = muted;
      video.src = item.src;
      video.play().catch(() => {
        // Autoplay with sound refused: retry muted.
        muted = video.muted = true;
        updateSound();
        video.play().catch(() => {});
      });
    }
    preload(i + 1);
    raf = requestAnimationFrame(tick);
  };

  const next = () => show(i + 1);
  const prev = () => show(i - 1);

  const pause = () => {
    if (paused) return;
    paused = true;
    root.classList.add("is-paused");
    if (items[i].type === "photo") {
      clearTimeout(timer);
      elapsed += performance.now() - started;
    } else video.pause();
  };
  const resume = () => {
    if (!paused) return;
    paused = false;
    root.classList.remove("is-paused");
    if (items[i].type === "photo") {
      started = performance.now();
      timer = setTimeout(next, Math.max(0, PHOTO_MS - elapsed));
    } else video.play().catch(() => {});
  };

  const updateSound = () => {
    sound.textContent = muted ? "🔇" : "🔊";
    sound.setAttribute("aria-label", muted ? "Turn sound on" : "Turn sound off");
  };

  const open = (n) => {
    root.hidden = false;
    document.body.classList.add("menu-open"); // reuse scroll lock
    show(n);
  };
  const close = () => {
    cancelAnimationFrame(raf);
    clearTimeout(timer);
    video.pause();
    video.removeAttribute("src");
    root.hidden = true;
    document.body.classList.remove("menu-open");
    // The page opens straight into the viewer, so closing leaves the page:
    // back to where the visitor came from on this site, otherwise About.
    const fromSite = document.referrer && new URL(document.referrer).origin === location.origin;
    if (fromSite && history.length > 1) history.back();
    else location.href = "index.html";
  };

  video.addEventListener("playing", () => (loading.hidden = true));
  video.addEventListener("waiting", () => (loading.hidden = false));
  video.addEventListener("ended", next);
  video.addEventListener("error", next);

  tiles.forEach((a, n) =>
    a.addEventListener("click", (e) => {
      e.preventDefault();
      open(n);
    })
  );
  document.querySelector(".play-all")?.addEventListener("click", () => open(0));

  root.querySelector(".st-close").addEventListener("click", close);
  sound.addEventListener("click", () => {
    muted = !muted;
    video.muted = muted;
    updateSound();
  });

  // Tap zones: a quick tap navigates, a press-and-hold pauses.
  let downAt = 0;
  let downY = 0;
  let holdTimer = 0;
  let held = false;
  ["st-prev", "st-next"].forEach((cls) => {
    const zone = root.querySelector(`.${cls}`);
    zone.addEventListener("pointerdown", (e) => {
      downAt = performance.now();
      downY = e.clientY;
      held = false;
      holdTimer = setTimeout(() => {
        held = true;
        pause();
      }, 200);
    });
    zone.addEventListener("pointerup", (e) => {
      clearTimeout(holdTimer);
      if (e.clientY - downY > 80) return close(); // swipe down
      if (held) return resume();
      if (performance.now() - downAt < 500) cls === "st-next" ? next() : prev();
    });
    zone.addEventListener("pointercancel", () => {
      clearTimeout(holdTimer);
      resume();
    });
    zone.addEventListener("contextmenu", (e) => e.preventDefault());
    // Keyboard activation (Enter/Space) fires a click with no pointer events.
    zone.addEventListener("click", (e) => e.detail === 0 && (cls === "st-next" ? next() : prev()));
  });

  addEventListener("keydown", (e) => {
    if (root.hidden) return;
    if (e.key === "Escape") close();
    if (e.key === "ArrowRight") next();
    if (e.key === "ArrowLeft") prev();
    if (e.key === " ") {
      e.preventDefault();
      paused ? resume() : pause();
    }
  });

  // Pause while the tab or app is in the background, and pick up again on return.
  let pausedByHide = false;
  // Skip the tile grid and go straight into the stories. The grid stays in
  // the page as a fallback if scripts don't run.
  open(0);

  document.addEventListener("visibilitychange", () => {
    if (root.hidden) return;
    if (document.hidden && !paused) {
      pausedByHide = true;
      pause();
    } else if (!document.hidden && pausedByHide) {
      pausedByHide = false;
      resume();
    }
  });
})();
