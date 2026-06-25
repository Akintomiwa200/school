import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@prisma/client", "pg", "@prisma/adapter-pg"],
  async redirects() {
    return [
      {
        source: "/student/online-classes/live/:sessionId",
        destination: "/student/online-classes/:sessionId/live",
        permanent: false,
      },
      {
        source: "/student/online-classes/recording/:sessionId",
        destination: "/student/online-classes/:sessionId/recording",
        permanent: false,
      },
      {
        source: "/shared/online-classes/live/:sessionId",
        destination: "/shared/online-classes/:sessionId/live",
        permanent: false,
      },
      {
        source: "/shared/online-classes/recording/:sessionId",
        destination: "/shared/online-classes/:sessionId/recording",
        permanent: false,
      },
    ];
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
};

export default nextConfig;
