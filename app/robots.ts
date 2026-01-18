import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/_next/',
          '/sign-in/',
          '/sign-up/',
          '/sso-callback/',
          '/oauth-callback/',
          '/loading/',
        ],
      },
    ],
    sitemap: 'https://jettoptics.ai/sitemap.xml',
  }
}
