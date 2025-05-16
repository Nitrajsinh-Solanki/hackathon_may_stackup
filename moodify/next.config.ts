// hackathon_may_stackup\moodify\next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn-images.dzcdn.net',
      },
      {
        protocol: 'https',
        hostname: 'e-cdns-images.dzcdn.net',
      },
      {
        protocol: 'https',
        hostname: 'api.deezer.com',
      },
      // TheAudioDB domain
      {
        protocol: 'https',
        hostname: 'www.theaudiodb.com',
      },
      {
        protocol: 'https',
        hostname: 'theaudiodb.com',
      },
      {
        protocol: 'http',
        hostname: 'www.theaudiodb.com',
      },
      {
        protocol: 'http',
        hostname: 'theaudiodb.com',
      },
      // adding the cloudinary domain
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
        // adding Jamendo domains
        {
          protocol: 'https',
          hostname: 'usercontent.jamendo.com',
        },
        {
          protocol: 'https',
          hostname: 'mp3l.jamendo.com',
        },
        {
          protocol: 'https',
          hostname: 'mp3d.jamendo.com',
        },
        {
          protocol: 'https',
          hostname: 'www.jamendo.com',
        },
        {
          protocol: 'https',
          hostname: 'storage.jamendo.com',
        },
    ],
  },
};

export default nextConfig;
