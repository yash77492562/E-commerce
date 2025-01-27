/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'standalone',
    outputFileTracingRoot: process.env.NEXT_PRIVATE_LOCAL_WEBPACK ? undefined : process.cwd(),
    experimental: {
      workerThreads: false,
      cpus: 1
    },
    typescript: {
      ignoreBuildErrors: false,
    },
    eslint: {
      ignoreDuringBuilds: true,
    }
  };
  
  export default nextConfig;