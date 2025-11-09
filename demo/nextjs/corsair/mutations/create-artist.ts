import { z } from 'corsair'
import { drizzle } from 'corsair/db/types'

export default {
  input: z.object({
    id: z.string(),
    name: z.string(),
    popularity: z.number().min(0).max(100).optional(),
    followers: z.number().optional(),
    genres: z.array(z.string()).optional(),
    images: z.any().optional(),
    external_urls: z.any().optional(),
    uri: z.string().optional(),
    href: z.string().optional(),
  }),

  execute: async (corsair, data) => {
    const [artist] = await corsair.db
      .insert(corsair.schema.artists)
      .values({
        id: data.id,
        name: data.name,
        popularity: data.popularity || 0,
        followers: data.followers || 0,
        genres: data.genres,
        images: data.images,
        external_urls: data.external_urls,
        uri: data.uri || '',
        href: data.href || '',
      })
      .returning()

    return artist
  },

  optimistic: (corsair, data) => ({
    ...data,
    id: data.id || `temp_${Date.now()}`,
    popularity: data.popularity || 0,
    followers: data.followers || 0,
    images: data.images || [],
    external_urls: data.external_urls || {},
    uri: data.uri || '',
    href: data.href || '',
  }),

  validate: async (corsair, data) => {
    // Add permission checks here when auth is implemented
    // if (!corsair.currentUser) throw new Error('Authentication required')

    // Validate required fields
    if (!data.name) throw new Error('Artist name is required')
    if (!data.id) throw new Error('Artist ID is required')
  }
}
