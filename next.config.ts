import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
    ];
  },
};

export default nextConfig;
