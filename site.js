// Shared header, footer tiles and nav behavior for every page.
const PAGES = [
  ["stories.html", "Stories"],
  ["index.html", "About"],
  ["activities.html", "Activities"],
  ["music.html", "Music"],
  ["leave-no-trace.html", "Leave No Trace"],
  ["culture.html", "Culture"],
  ["join.html", "Join"],
  ["https://burningman.chat", "GTA: BRC"],
  ["https://www.instagram.com/agave_lounge/", "Instagram"],
];

// Drawn icons so they line up with the "Menu"/"Close" label (font glyphs sit low).
const ICON_MENU =
  '<svg viewBox="0 0 20 16" width="20" height="16"><path d="M1 2h18M1 8h18M1 14h18" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg>';
const ICON_CLOSE =
  '<svg viewBox="0 0 16 16" width="16" height="16"><path d="M2 2l12 12M14 2L2 14" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg>';

const here = location.pathname.split("/").pop() || "index.html";

document.body.insertAdjacentHTML(
  "afterbegin",
  `<header class="site-header">
    <a class="brand" href="index.html"><img src="assets/agave-mark.png" alt=""><img class="brand-word" src="assets/agaveword.png" alt="Agave Lounge"></a>
    <button class="menu-btn" aria-expanded="false"><span class="menu-icon" aria-hidden="true">${ICON_MENU}</span><span class="menu-label">Menu</span></button>
    <ul class="nav">
      ${PAGES.map(([href, label]) =>
        `<li><a href="${href}"${href === here ? ' aria-current="page"' : ""}${
          href.startsWith("http") ? ' target="_blank" rel="noopener"' : ""
        }>${label}</a></li>`
      ).join("")}
    </ul>
  </header>`
);

document.body.insertAdjacentHTML(
  "beforeend",
  `<nav class="tiles" aria-label="Explore">
    <a class="tile stories-tile" href="stories.html">Stories</a>
    <a class="tile about" href="index.html">About</a>
    <a class="tile music" href="music.html">Music</a>
    <a class="tile activities" href="activities.html">Activities</a>
    <a class="tile lnt" href="leave-no-trace.html">Leaving No Trace</a>
    <a class="tile instagram" href="https://www.instagram.com/agave_lounge/" target="_blank" rel="noopener">Instagram</a>
    <a class="tile join" href="join.html">Camp with us</a>
  </nav>
  <footer class="site-footer">Agave Lounge</footer>`
);

const header = document.querySelector(".site-header");
const onScroll = () => header.classList.toggle("scrolled", scrollY > 40);
addEventListener("scroll", onScroll, { passive: true });
onScroll();

const btn = header.querySelector(".menu-btn");
const nav = header.querySelector(".nav");
const setMenu = (open) => {
  nav.classList.toggle("open", open);
  header.classList.toggle("menu-open", open);
  document.body.classList.toggle("menu-open", open);
  btn.setAttribute("aria-expanded", open);
  btn.querySelector(".menu-icon").innerHTML = open ? ICON_CLOSE : ICON_MENU;
  btn.querySelector(".menu-label").textContent = open ? "Close" : "Menu";
};
btn.addEventListener("click", () => setMenu(!nav.classList.contains("open")));
nav.addEventListener("click", (e) => e.target.closest("a") && setMenu(false));
addEventListener("keydown", (e) => e.key === "Escape" && setMenu(false));
