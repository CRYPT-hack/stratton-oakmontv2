/** @type {import('next').NextConfig} */
const nextConfig = {
    transpilePackages: ['three', '@react-three/fiber', '@react-three/drei', 'troika-three-text'],
    // Disable ESLint and Type checking during build for speed (optional)
    eslint: {
        ignoreDuringBuilds: true,
    },
    typescript: {
        ignoreBuildErrors: true,
    },
};

module.exports = nextConfig;
