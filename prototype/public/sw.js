// Offline shell.
//
// The app must work with no network once it has been opened once
// (FINALITY_PROMPT §5 "service-worker offline"). Two tiers:
//
//   shell   — precached on install, so the app starts at all.
//   corpus  — the files every surface needs (the ayah text, the alignment
//             table, the index, and the derived occurrence/walk indices) are
//             warmed in the background right after activation, so a reader
//             who opens the app once and then loses the network can still
//             reach any page, any word, any root.
//
// Everything else, the 114 per-surah word streams above all, is cached as it
// is fetched: warming 6 MB of word streams on first load would cost more than
// it buys, and a word stream is only ever needed for a surah the reader has
// actually opened.
const CACHE = "qran-sacred-v1";

const SHELL = ["/", "/index.html", "/manifest.webmanifest", "/icons/icon.svg"];

const CORPUS = [
  "/data/quran/surahs.json",
  "/data/quran/ayat.json",
  "/data/quran/align.json",
  "/data/fehres/fehres.json",
  "/data/index/word-occ.json",
  "/data/index/root-occ.json",
  "/data/index/paths.json",
  "/data/index/ayah-paths.json",
  "/data/addressals/addressals.json",
  "/data/markers/markers.json",
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(SHELL)).catch(() => {}));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
      .then(() =>
        caches.open(CACHE).then((cache) =>
          Promise.all([
            // The hashed bundle. The page requests it before this worker takes
            // control, so it is never seen by the fetch handler on a first
            // visit — and without it the app cannot start offline at all. The
            // names are read out of index.html rather than injected at build
            // time, so the worker stays independent of the bundler.
            fetch("/index.html")
              .then((response) => response.text())
              .then((html) => {
                const assets = new Set();
                for (const [, url] of html.matchAll(/(?:src|href)="(\/assets\/[^"]+)"/g)) assets.add(url);
                return Promise.all([...assets].map((url) => cache.add(url).catch(() => {})));
              })
              .catch(() => {}),
            // Background warm: individually, so one failure does not sink the set.
            ...CORPUS.map((url) => cache.add(url).catch(() => {})),
          ])
        )
      )
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET" || new URL(request.url).origin !== self.location.origin) return;

  event.respondWith(
    caches.match(request).then((cached) => {
      const network = fetch(request)
        .then((response) => {
          if (response.ok) {
            const copy = response.clone();
            caches.open(CACHE).then((cache) => cache.put(request, copy));
          }
          return response;
        })
        .catch(() => cached);
      return cached || network;
    })
  );
});
