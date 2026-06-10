/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export', // 必须保留
  trailingSlash: true,
  images: { unoptimized: true },
};
export default nextConfig;