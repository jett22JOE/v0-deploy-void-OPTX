import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://jettoptics.ai'
  const lastModified = new Date()

  return [
    {
      url: baseUrl,
      lastModified,
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${baseUrl}/optical-spatial-encryption`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.9,
    },
  ]
}
