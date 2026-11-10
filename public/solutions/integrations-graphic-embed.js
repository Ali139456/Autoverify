/** Denise embed tweaks — hide duplicate headings; legend at bottom of canvas. */
(function () {
  const LEGEND = [
    {
      label: "Buy and sell",
      left: 268,
      width: 220,
      lineX1: 260,
      lineX2: 400,
      matchLineX: 72,
    },
    {
      label: "Finance and risk",
      left: 488,
      width: 230,
      lineX1: 520,
      lineX2: 680,
      matchLineX: 300,
    },
    {
      label: "Mobility and fleet",
      left: 808,
      width: 280,
      lineX1: 780,
      lineX2: 1040,
      matchLineX: 560,
    },
  ];
  /** Below bottom-row copy (titles 1014px, body from 1040px, ~2 lines). */
  const LEGEND_TOP = 1104;
  const LINE_Y = 1094;

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

    document.querySelectorAll("p").forEach((p) => {
      const style = p.getAttribute("style") || "";
      if (!style.includes("top: 1040px")) return;
      const text = (p.textContent || "").trim();
      if (text.length < 24) return;
      p.style.top = "1032px";
      p.style.lineHeight = "1.28";
      p.style.maxWidth = "206px";
    });

    let legendMoved = 0;
    for (const cfg of LEGEND) {
      for (const p of document.querySelectorAll("p")) {
        if ((p.textContent || "").trim() !== cfg.label) continue;
        p.style.position = "absolute";
        p.style.left = `${cfg.left}px`;
        p.style.top = `${LEGEND_TOP}px`;
        p.style.margin = "0";
        p.style.zIndex = "4";
        p.style.textAlign = "center";
        if (cfg.width) {
          p.style.width = `${cfg.width}px`;
        }
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
      canvas.style.transform = "translateY(-108px)";
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
