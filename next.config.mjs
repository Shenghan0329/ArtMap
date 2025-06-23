/** @type {import('next').NextConfig} */
const nextConfig = {
    env: {
        GOOGLE_MAP_API_KEY: process.env.GOOGLE_MAP_API_KEY,
    },
};

export default nextConfig;
