"use client";

import { useEffect, useState } from "react";

export function usePpsrCertificateImages(proxyUrl: string) {
  const [pageImages, setPageImages] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      setPageImages([]);

      try {
        const pdfjs = await import("pdfjs-dist");
        pdfjs.GlobalWorkerOptions.workerSrc = new URL(
          "pdfjs-dist/build/pdf.worker.min.mjs",
          import.meta.url,
        ).toString();

        const res = await fetch(proxyUrl);
        if (!res.ok) {
          throw new Error("Could not load certificate.");
        }
        const data = await res.arrayBuffer();
        const pdf = await pdfjs.getDocument({ data }).promise;
        const images: string[] = [];

        const maxCssWidth =
          typeof window !== "undefined"
            ? Math.min(window.innerWidth, 960) - 48
            : 720;

        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
          const page = await pdf.getPage(pageNum);
          const base = page.getViewport({ scale: 1 });
          const scale = Math.min(
            1.75,
            Math.max(1, maxCssWidth / base.width),
          );
          const viewport = page.getViewport({ scale });
          const canvas = document.createElement("canvas");
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          const ctx = canvas.getContext("2d");
          if (!ctx) continue;
          await page.render({ canvasContext: ctx, viewport }).promise;
          images.push(canvas.toDataURL("image/png"));
        }

        if (!cancelled) {
          setPageImages(images);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Could not render certificate.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [proxyUrl]);

  return { pageImages, error, loading };
}
