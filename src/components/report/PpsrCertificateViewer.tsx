"use client";

import { useEffect, useState } from "react";

type PpsrCertificateViewerProps = {
  proxyUrl: string;
};

export function PpsrCertificateViewer({ proxyUrl }: PpsrCertificateViewerProps) {
  const [pageImages, setPageImages] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
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

        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
          const page = await pdf.getPage(pageNum);
          const viewport = page.getViewport({ scale: 1.75 });
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

  if (loading) {
    return (
      <p className="px-4 py-10 text-center text-sm text-slate-500">
        Loading PPSR certificate…
      </p>
    );
  }

  if (error || pageImages.length === 0) {
    return (
      <>
        <iframe
          src={proxyUrl}
          title="PPSR search certificate"
          className="report-ppsr-iframe report-ppsr-iframe-fallback block h-[1200px] w-full bg-slate-100"
        />
        {error ? (
          <p className="report-no-print mt-2 text-xs text-amber-700">{error}</p>
        ) : null}
      </>
    );
  }

  return (
    <div className="report-ppsr-rendered">
      {pageImages.map((src, index) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={`ppsr-page-${index}`}
          src={src}
          alt={`PPSR certificate page ${index + 1}`}
          className="report-ppsr-full-image mx-auto block h-auto w-full max-w-full object-contain object-top"
        />
      ))}
    </div>
  );
}
