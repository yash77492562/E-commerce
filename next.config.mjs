// module.exports = {
//   };

  /** @type {import('next').NextConfig} */
const nextConfig = {
  crossOrigin:'use-credentials',
  env: {
    ENCRYPTION_KEY: process.env.ENCRYPTION_KEY,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'http', // Assuming your image is served over HTTP
        hostname: 'localhost', // Add your development hostname here
        port: '', // Optional, if port is different from default (80)
      },
      // Add other remote patterns for additional image sources (if needed)
    ],
  },
};
  
export default nextConfig;
