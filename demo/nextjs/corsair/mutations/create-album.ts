import { z } from 'corsair'
import { drizzle } from 'corsair/db/types'

export default {
  input: z.object({
    name: z.string().min(1, "Album name is required"),
    releaseDate: z.string().min(1, "Release date is required"),
    artistIds: z.array(z.string()).min(1, "At least one artist is required"),
  }),

  execute: async (corsair, data) => {
    const { name, releaseDate, artistIds } = data

    // Start transaction to ensure data consistency
    return await corsair.db.transaction(async (tx) => {
      // Insert the new album
      const [newAlbum] = await tx
        .insert(corsair.schema.albums)
        .values({
          name,
          release_date: releaseDate,
          album_type: "album",
          total_tracks: 0,
          images: [],
          external_urls: {},
          uri: `spotify:album:${Math.random().toString(36).substr(2, 9)}`,
          href: `https://api.spotify.com/v1/albums/${Math.random().toString(36).substr(2, 9)}`,
        })
        .returning()

      if (!newAlbum) {
        throw new Error("Failed to create album")
      }

      // Create album-artist relationships
      const albumArtistPromises = artistIds.map((artistId) =>
        tx.insert(corsair.schema.album_artists).values({
          album_id: newAlbum.id,
          artist_id: artistId,
        }),
      )

      await Promise.all(albumArtistPromises)

      // Return the created album with artist count
      return {
        id: newAlbum.id,
        name: newAlbum.name,
        releaseDate: newAlbum.release_date,
        artistCount: artistIds.length,
      }
    })
  },

  optimistic: (corsair, data) => ({
    id: `temp_${Date.now()}`,
    name: data.name,
    releaseDate: data.releaseDate,
    artistCount: data.artistIds.length,
    album_type: "album",
    total_tracks: 0,
    images: [],
    external_urls: {},
    uri: '',
    href: '',
  }),

  validate: async (corsair, data) => {
    // Add permission checks here when auth is implemented
    // if (!corsair.currentUser) throw new Error('Authentication required')

    // Validate required fields
    if (!data.name) throw new Error('Album name is required')
    if (!data.releaseDate) throw new Error('Release date is required')
    if (!data.artistIds || data.artistIds.length === 0) {
      throw new Error('At least one artist is required')
    }
  }
}
