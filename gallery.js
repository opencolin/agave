// Gallery page: full-screen photo viewer with prev/next, keyboard and swipe,
// and only one video playing at a time.
(() => {
  const links = [...document.querySelectorAll(".gallery-photos a")];
  if (!links.length) return;

  const box = document.createElement("div");
  box.className = "lightbox";
  box.hidden = true;
  box.innerHTML = `
    <button class="lb-close" aria-label="Close">✕</button>
    <button class="lb-prev" aria-label="Previous photo">‹</button>
    <img alt="">
    <button class="lb-next" aria-label="Next photo">›</button>
    <div class="lb-count"></div>`;
  document.body.append(box);

  const img = box.querySelector("img");
  const count = box.querySelector(".lb-count");
  let i = 0;

  const show = (n) => {
    i = (n + links.length) % links.length;
    img.src = links[i].href;
    img.alt = links[i].querySelector("img").alt;
    count.textContent = `${i + 1} / ${links.length}`;
  };
  const open = (n) => {
    show(n);
    box.hidden = false;
    document.body.style.overflow = "hidden";
  };
  const close = () => {
    box.hidden = true;
    document.body.style.overflow = "";
  };

  links.forEach((a, n) =>
    a.addEventListener("click", (e) => {
      e.preventDefault();
      open(n);
    })
  );
  box.querySelector(".lb-close").onclick = close;
  box.querySelector(".lb-prev").onclick = () => show(i - 1);
  box.querySelector(".lb-next").onclick = () => show(i + 1);
  box.addEventListener("click", (e) => e.target === box && close());

  addEventListener("keydown", (e) => {
    if (box.hidden) return;
    if (e.key === "Escape") close();
    if (e.key === "ArrowLeft") show(i - 1);
    if (e.key === "ArrowRight") show(i + 1);
  });

  let startX = null;
  box.addEventListener("touchstart", (e) => (startX = e.touches[0].clientX), { passive: true });
  box.addEventListener("touchend", (e) => {
    if (startX === null) return;
    const dx = e.changedTouches[0].clientX - startX;
    if (Math.abs(dx) > 50) show(dx < 0 ? i + 1 : i - 1);
    startX = null;
  });

  const videos = [...document.querySelectorAll(".gallery-videos video")];
  videos.forEach((v) =>
    v.addEventListener("play", () => videos.forEach((o) => o !== v && o.pause()))
  );
})();
