import type { Metadata, Viewport } from "next";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#020617",
  interactiveWidget: "resizes-content",
};

export const metadata: Metadata = {
  title: "Vehicle inspection",
  robots: { index: false, follow: false },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Auto Verifi",
  },
  formatDetection: { telephone: false },
};

export default function InspectLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="inspect-capture-shell min-h-[100dvh] bg-ink-950">
      {children}
    </div>
  );
}
