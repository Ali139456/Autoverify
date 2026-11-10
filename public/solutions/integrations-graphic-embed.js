/** Denise embed tweaks — hide duplicate headings; legend at bottom of canvas. */
(function () {
  const LEGEND = [
    { label: "Buy and sell", left: 200, lineX1: 154, lineX2: 188, matchLineX: 72 },
    { label: "Finance and risk", left: 520, lineX1: 474, lineX2: 508, matchLineX: 300 },
    { label: "Mobility and fleet", left: 840, lineX1: 794, lineX2: 828, matchLineX: 560 },
  ];
  const LEGEND_TOP = 1080;
  const LINE_Y = 1073;

  function apply() {
    const h1 = document.querySelector("h1");
    if (!h1 || !/integrations/i.test(h1.textContent || "")) {
      return false;
    }
    h1.remove();

    document.querySelectorAll("p").forEach((p) => {
      const t = (p.textContent || "").trim();
      if (t.startsWith("One vehicle intelligence layer")) {
        p.remove();
      }
    });

    let legendMoved = 0;
    for (const cfg of LEGEND) {
      for (const p of document.querySelectorAll("p")) {
        if ((p.textContent || "").trim() !== cfg.label) continue;
        p.style.left = `${cfg.left}px`;
        p.style.top = `${LEGEND_TOP}px`;
        legendMoved += 1;
      }
      for (const line of document.querySelectorAll("line")) {
        const x1 = parseFloat(line.getAttribute("x1") || "0");
        if (Math.abs(x1 - cfg.matchLineX) > 25) continue;
        line.setAttribute("y1", String(LINE_Y));
        line.setAttribute("y2", String(LINE_Y));
        line.setAttribute("x1", String(cfg.lineX1));
        line.setAttribute("x2", String(cfg.lineX2));
      }
    }

    const canvas = document.querySelector("[data-canvas-width]");
    if (canvas instanceof HTMLElement) {
      canvas.style.transform = "translateY(-120px)";
    }

    return legendMoved === 3;
  }

  function start() {
    if (apply()) return;
    const observer = new MutationObserver(() => {
      if (apply()) observer.disconnect();
    });
    observer.observe(document.body, { childList: true, subtree: true });
    let attempts = 0;
    const timer = setInterval(() => {
      if (apply() || ++attempts > 80) {
        clearInterval(timer);
        observer.disconnect();
      }
    }, 150);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})();
