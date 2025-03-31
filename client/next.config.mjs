/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "s3-inventorymanagement.s3.us-east-2.amazonaws.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "http", // Localhost uses http
        hostname: "localhost", // Add localhost as the allowed domain
        port: "8000", // Specify the port if images are served from localhost:8000
        pathname: "/uploads/**", // Match the path for your images
      },
    ],
  },
};

export default nextConfig;
