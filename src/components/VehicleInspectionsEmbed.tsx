"use client";

import { useState } from "react";
import { ExternalLink } from "lucide-react";

type VehicleInspectionsEmbedProps = {
  src: string;
  showPreviewNotice: boolean;
};

export function VehicleInspectionsEmbed({
  src,
  showPreviewNotice,
}: VehicleInspectionsEmbedProps) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className="relative flex min-h-[calc(100vh-76px)] flex-col bg-ink-950 sm:min-h-[calc(100vh-80px)]">
      {showPreviewNotice && (
        <div className="border-b border-amber-500/25 bg-amber-500/10 px-4 py-3 text-center text-sm text-amber-100 sm:px-6">
          Publish the Base44 app and set{" "}
          <code className="rounded bg-black/30 px-1.5 py-0.5 text-xs">
            NEXT_PUBLIC_BASE44_VEHICLE_INSPECTIONS_URL
          </code>{" "}
          to your public{" "}
          <span className="font-semibold">*.base44.app</span> URL in Vercel for
          public tender access.
          <a
            href={src}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-2 inline-flex items-center gap-1 font-semibold text-amber-200 underline-offset-2 hover:underline"
          >
            Open Base44 app
            <ExternalLink className="h-3.5 w-3.5" aria-hidden />
          </a>
        </div>
      )}

      {!loaded && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-accent-500 border-t-transparent" />
        </div>
      )}

      <iframe
        title="Auto Verifi Vehicle Inspections"
        src={src}
        className={`min-h-[calc(100vh-76px)] w-full flex-1 border-0 bg-white sm:min-h-[calc(100vh-80px)] ${
          loaded ? "opacity-100" : "opacity-0"
        }`}
        allow="clipboard-read; clipboard-write; fullscreen"
        onLoad={() => setLoaded(true)}
      />
    </div>
  );
}
