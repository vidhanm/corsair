import { z } from 'corsair'
import { procedure } from '../trpc/procedures'
import { drizzle } from 'corsair/db/types'

export const getAllAlbumsWithArtists = procedure
  .input(z.object({}))
  .query(async ({ ctx }) => {
    const albumsWithArtists = await ctx.db
      .select({
        albumId: ctx.schema.albums.id,
        albumName: ctx.schema.albums.name,
        album_type: ctx.schema.albums.album_type,
        release_date: ctx.schema.albums.release_date,
        release_date_precision: ctx.schema.albums.release_date_precision,
        total_tracks: ctx.schema.albums.total_tracks,
        albumImages: ctx.schema.albums.images,
        external_urls: ctx.schema.albums.external_urls,
        uri: ctx.schema.albums.uri,
        href: ctx.schema.albums.href,
        artist: {
          id: ctx.schema.artists.id,
          name: ctx.schema.artists.name,
          popularity: ctx.schema.artists.popularity,
          followers: ctx.schema.artists.followers,
          genres: ctx.schema.artists.genres,
          images: ctx.schema.artists.images,
          external_urls: ctx.schema.artists.external_urls,
          uri: ctx.schema.artists.uri,
          href: ctx.schema.artists.href,
        },
      })
      .from(ctx.schema.albums)
      .leftJoin(
        ctx.schema.album_artists,
        drizzle.eq(ctx.schema.albums.id, ctx.schema.album_artists.album_id)
      )
      .leftJoin(
        ctx.schema.artists,
        drizzle.eq(ctx.schema.album_artists.artist_id, ctx.schema.artists.id)
      )

    // Group albums by ID and collect their artists
    const albumsMap = new Map()

    for (const row of albumsWithArtists) {
      if (!albumsMap.has(row.albumId)) {
        albumsMap.set(row.albumId, {
          id: row.albumId,
          name: row.albumName,
          album_type: row.album_type,
          release_date: row.release_date,
          release_date_precision: row.release_date_precision,
          total_tracks: row.total_tracks,
          images: row.albumImages,
          external_urls: row.external_urls,
          uri: row.uri,
          href: row.href,
          artists: [],
        })
      }

      if (row.artist.id) albumsMap.get(row.albumId).artists.push(row.artist)
    }

    return Array.from(albumsMap.values())
  })
