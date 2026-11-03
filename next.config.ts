import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingIncludes: {
    "/api/report/*/pdf": [
      "./node_modules/geist/dist/fonts/geist-sans/*.ttf",
    ],
    "/api/sample-report/pdf": [
      "./node_modules/geist/dist/fonts/geist-sans/*.ttf",
    ],
    "/api/webhooks/stripe": [
      "./node_modules/geist/dist/fonts/geist-sans/*.ttf",
    ],
  },
  experimental: {
    // Inspection photo uploads pass through proxy; default 10MB can truncate multipart bodies.
    proxyClientMaxBodySize: "15mb",
  },
  async redirects() {
    return [
      {
        source: "/vehicleinspection",
        destination: "/vehicleinspections",
        permanent: true,
      },
      {
        source: "/vehicle-inspection",
        destination: "/vehicleinspections",
        permanent: true,
      },
      {
        source: "/vehicle-inspections",
        destination: "/vehicleinspections",
        permanent: true,
      },
      {
        source: "/solutions",
        destination: "/?solutions=consumer",
        permanent: true,
      },
      {
        source: "/solutions/consumer",
        destination: "/?solutions=consumer",
        permanent: true,
      },
      {
        source: "/solutions/business",
        destination: "/?solutions=business",
        permanent: true,
      },
      {
        source: "/solutions/integrations",
        destination: "/?solutions=integrations",
        permanent: true,
      },
      {
        source: "/solutions/dealers",
        destination: "/?solutions=business",
        permanent: true,
      },
      {
        source: "/solutions/government",
        destination: "/?solutions=business",
        permanent: true,
      },
      {
        source: "/solutions/audit",
        destination: "/?solutions=business",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
