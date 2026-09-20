/**
 * Field layer — PHASE-01-UI-SYSTEM §2 "Starfield". A light canvas-2D star
 * drift behind the page. Degrades to the static CSS gradient (see
 * layout.css .starfield) under `prefers-reduced-motion` or on a slow frame
 * budget — text never waits on this layer (product-spec/02 performance
 * targets: "no gesture waits on data").
 */
export function mountStarfield(container: HTMLElement): void {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduceMotion) {
    container.dataset.degraded = "1";
    return;
  }

  const canvas = document.createElement("canvas");
  container.appendChild(canvas);
  const ctx = canvas.getContext("2d");
  if (!ctx) { container.dataset.degraded = "1"; return; }

  let w = 0, h = 0, dpr = Math.min(2, window.devicePixelRatio || 1);
  const STAR_COUNT = 90;
  const stars = Array.from({ length: STAR_COUNT }, () => ({
    x: Math.random(),
    y: Math.random(),
    r: Math.random() * 1.1 + 0.3,
    tw: Math.random() * Math.PI * 2,
    speed: 0.15 + Math.random() * 0.25,
  }));

  function resize() {
    w = container.clientWidth;
    h = container.clientHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  resize();
  window.addEventListener("resize", resize, { passive: true });

  let last = 0;
  let degraded = false;
  let slowFrames = 0;

  function frame(t: number) {
    if (degraded) return;
    const dt = last ? t - last : 16;
    last = t;
    if (dt > 42) { // sustained sub-24fps: degrade per perf budget
      slowFrames++;
      if (slowFrames > 30) { degraded = true; container.dataset.degraded = "1"; canvas.remove(); return; }
    } else {
      slowFrames = Math.max(0, slowFrames - 1);
    }

    ctx!.clearRect(0, 0, w, h);
    for (const s of stars) {
      s.tw += dt * 0.001 * s.speed;
      s.y -= dt * 0.000006 * s.speed; // slow drift
      if (s.y < -0.02) s.y = 1.02;
      const alpha = 0.25 + Math.abs(Math.sin(s.tw)) * 0.4;
      ctx!.beginPath();
      ctx!.fillStyle = `rgba(207, 214, 234, ${alpha})`;
      ctx!.arc(s.x * w, s.y * h, s.r, 0, Math.PI * 2);
      ctx!.fill();
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}
