import { z } from "corsair";
import { procedure } from "../trpc/procedures";
import { drizzle } from "corsair/db/types";

export const createNewAlbumWithTitleAndReleaseDate = procedure
  .input(
    z.object({
      name: z.string().min(1, "Album name is required"),
      releaseDate: z.string().min(1, "Release date is required"),
      artistIds: z.array(z.string()).min(1, "At least one artist is required"),
    }),
  )
  .mutation(async ({ input, ctx }) => {
    const { name, releaseDate, artistIds } = input;

    // Start transaction to ensure data consistency
    return await ctx.db.transaction(async (tx) => {
      // Insert the new album
      const [newAlbum] = await tx
        .insert(ctx.schema.albums)
        .values({
          name,
          release_date: releaseDate,
          album_type: "album", // Default album type
          total_tracks: 0, // Will be updated when tracks are added
          images: [],
          external_urls: {},
          uri: `spotify:album:${Math.random().toString(36).substr(2, 9)}`, // Mock URI
          href: `https://api.spotify.com/v1/albums/${Math.random().toString(36).substr(2, 9)}`, // Mock href
        })
        .returning();

      if (!newAlbum) {
        throw new Error("Failed to create album");
      }

      // Create album-artist relationships
      const albumArtistPromises = artistIds.map((artistId) =>
        tx.insert(ctx.schema.album_artists).values({
          album_id: newAlbum.id,
          artist_id: artistId,
        }),
      );

      await Promise.all(albumArtistPromises);

      // Return the created album with artist count
      return {
        id: newAlbum.id,
        name: newAlbum.name,
        releaseDate: newAlbum.release_date,
        artistCount: artistIds.length,
      };
    });
  });
