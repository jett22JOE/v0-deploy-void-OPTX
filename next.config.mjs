/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },

  // 301 Redirects for SEO - fixing 404 errors reported in Google Search Console
  async redirects() {
    return [
      // Legacy/dead URLs - redirect to home
      {
        source: '/%24', // URL-encoded $ character (https://jettoptics.ai/$)
        destination: '/',
        permanent: true,
      },
      {
        source: '/lander',
        destination: '/',
        permanent: true,
      },
      {
        source: '/platform-domains',
        destination: '/',
        permanent: true,
      },
      // Auth redirect - /login to actual sign-in page
      {
        source: '/login',
        destination: '/sign-in',
        permanent: true,
      },
      // Common variations
      {
        source: '/signin',
        destination: '/sign-in',
        permanent: true,
      },
      {
        source: '/signup',
        destination: '/loading',
        permanent: true,
      },
      {
        source: '/sign-up',
        destination: '/loading',
        permanent: true,
      },
      {
        source: '/waitlist',
        destination: '/loading',
        permanent: true,
      },
      {
        source: '/join',
        destination: '/loading',
        permanent: true,
      },
    ]
  },
}

export default nextConfig
