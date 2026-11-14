/** Denise embed — hide duplicate headings; remove bottom category legend. */
(function () {
  const LEGEND_LABELS = [
    "Buy and sell",
    "Finance and risk",
    "Mobility and fleet",
  ];
  /** Original connector lines above category labels. */
  const LEGEND_LINE_X1 = [72, 300, 560];

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

    document.querySelectorAll("p").forEach((p) => {
      const t = (p.textContent || "").trim();
      if (LEGEND_LABELS.includes(t)) {
        p.remove();
      }
    });

    document.querySelectorAll("line").forEach((line) => {
      const x1 = parseFloat(line.getAttribute("x1") || "0");
      const x2 = parseFloat(line.getAttribute("x2") || "0");
      const y1 = parseFloat(line.getAttribute("y1") || "0");
      const y2 = parseFloat(line.getAttribute("y2") || "0");
      const y = Math.max(y1, y2);

      const columnConnector = LEGEND_LINE_X1.some(
        (mx) => Math.abs(x1 - mx) <= 25,
      );
      const bottomLegendRule =
        y >= 1088 &&
        y <= 1110 &&
        x2 - x1 > 80 &&
        x1 >= 200 &&
        x2 <= 1100;

      if (columnConnector || bottomLegendRule) {
        line.remove();
      }
    });

    const canvas = document.querySelector("[data-canvas-width]");
    if (canvas instanceof HTMLElement) {
      canvas.style.transform = "translateY(-108px)";
      canvas.style.height = "1000px";
      canvas.style.maxHeight = "1000px";
      canvas.style.overflow = "hidden";
    }

    return true;
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