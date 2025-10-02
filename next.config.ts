/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'tse4.mm.bing.net',
      },
      {
        protocol: 'https', 
        hostname: 'covers.openlibrary.org',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com', // Para avatares do Google
      },
     
    ],
    domains: ['tse4.mm.bing.net', 'covers.openlibrary.org', 'lh3.googleusercontent.com'],
  },
}

module.exports = nextConfig