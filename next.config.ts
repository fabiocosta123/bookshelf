/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'covers.openlibrary.org',
      'via.placeholder.com',
      'images.unsplash.com'
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'covers.openlibrary.org',
        pathname: '/b/id/**',
      },
      {
        protocol: 'https', 
        hostname: '**.openlibrary.org',
      }
    ],
  },
}

module.exports = nextConfig