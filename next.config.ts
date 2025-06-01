import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: process.env.NEXT_PUBLIC_UPLOADTHING_URL_HOSTNAME as string,
        pathname: "/f/**",
      },
    ],
  },
};

export default nextConfig;
