import type { MetadataRoute } from "next";
import { isComingSoonMode } from "@/lib/site-mode";

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";

export default function robots(): MetadataRoute.Robots {
  if (isComingSoonMode()) {
    return {
      rules: {
        userAgent: "*",
        allow: ["/vehicleinspections"],
        disallow: ["/"],
      },
      sitemap: `${baseUrl}/sitemap.xml`,
    };
  }

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/report/", "/checkout/"],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
