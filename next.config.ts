import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
