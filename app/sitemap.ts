import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://jettoptics.ai'

  // Only include content pages that should be indexed by search engines
  // Excludes: /loading (waitlist page), /sign-in, /sso-callback, /oauth-callback (auth pages)
  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${baseUrl}/optical-spatial-encryption`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.9,
    },
  ]
}
