import type { Metadata } from "next";
import { cookies, headers } from "next/headers";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ConditionalSiteChrome } from "@/components/ConditionalSiteChrome";
import { shouldShowComingSoonPage } from "@/lib/site-mode";
import { hasPreviewAccess, PREVIEW_COOKIE_NAME } from "@/lib/site-preview";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default:
      "Auto Verifi — Car History Check, PPSR & AI Vehicle Reports Australia",
    template: "%s | Auto Verifi",
  },
  description:
    "Instant car history checks for Australia. PPSR, finance owing, write-off and stolen checks plus live market valuation and AI-powered future value insights. Enter a rego, pay securely, get your report.",
  keywords: [
    "car history check",
    "PPSR check",
    "car facts",
    "vehicle history report",
    "rego check",
    "car valuation",
    "finance owing check",
    "write-off check",
    "stolen car check",
    "Australia",
  ],
  openGraph: {
    type: "website",
    siteName: "Auto Verifi",
    title: "Auto Verifi — Car History Check & AI Vehicle Reports",
    description:
      "Past history, current market value and AI future insights in one vehicle report. Enter a rego and get your report in minutes.",
    url: baseUrl,
    images: [{ url: "/logo/logo-blue-on-white.png", width: 3600, height: 2401, alt: "Auto Verifi" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Auto Verifi — Car History Check & AI Vehicle Reports",
    description:
      "Past history, current market value and AI future insights in one vehicle report.",
    images: ["/logo/logo-blue-on-white.png"],
  },
  robots: { index: true, follow: true },
  icons: {
    icon: "/logo/icon.png",
    apple: "/logo/icon.png",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const headerStore = await headers();
  const previewToken = cookieStore.get(PREVIEW_COOKIE_NAME)?.value;
  const previewCookie = await hasPreviewAccess(previewToken);
  const host = headerStore.get("host");
  const previewAccess = previewCookie;
  const comingSoonMode = shouldShowComingSoonPage(host, previewCookie);

  return (
    <html
      lang="en-AU"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem("autoverifi-theme");if(t==="dark")document.documentElement.classList.add("dark");}catch(e){}})();`,
          }}
        />
      </head>
      <body className="flex min-h-screen flex-col" suppressHydrationWarning>
        <ConditionalSiteChrome
          previewAccess={previewAccess}
          comingSoonMode={comingSoonMode}
        >
          {children}
        </ConditionalSiteChrome>
      </body>
    </html>
  );
}
