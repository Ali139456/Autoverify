"use client";

import { usePpsrCertificateImages } from "./usePpsrCertificateImages";

type PpsrCertificateViewerProps = {
  proxyUrl: string;
  /** When set, only render this zero-based PDF page (used internally). */
  pageIndex?: number;
};

export function PpsrCertificateViewer({
  proxyUrl,
  pageIndex,
}: PpsrCertificateViewerProps) {
  const { pageImages, error, loading } = usePpsrCertificateImages(proxyUrl);

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

  const images =
    pageIndex != null ? pageImages.slice(pageIndex, pageIndex + 1) : pageImages;

  return (
    <div className="report-ppsr-rendered min-w-0 max-w-full">
      {images.map((src, index) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={`ppsr-page-${pageIndex ?? index}-${index}`}
          src={src}
          alt={`PPSR certificate page ${(pageIndex ?? index) + 1}`}
          className="report-ppsr-full-image mx-auto block h-auto w-full max-w-full object-contain object-top [max-width:100%]"
          style={{ width: "100%", height: "auto" }}
        />
      ))}
    </div>
  );
}
