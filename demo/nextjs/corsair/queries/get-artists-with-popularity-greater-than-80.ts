import { z } from "corsair";
import { procedure } from "../trpc/procedures";
import { drizzle } from "corsair/db/types";

export const getArtistsWithPopularityGreaterThan80 = procedure
  .input(z.object({}))
  .query(async (input, ctx) => {
    const highPopularityArtists = await ctx.db
      .select()
      .from(ctx.schema.artists)
      .where(drizzle.gt(ctx.schema.artists.popularity, 80));

    return highPopularityArtists;
  });
