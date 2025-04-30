/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['utfs.io',"i.ibb.co"],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'utfs.io',
        port: ''
      }
    ]
  }
}

module.exports = nextConfig
