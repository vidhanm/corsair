import { z } from "corsair";
import { procedure } from "../trpc/procedures";
import { drizzle } from "corsair/db/types";

export const getArtistsWithMoreThan1MillionFollowers = procedure
  .input(z.object({}))
  .query(async (input, ctx) => {
    const artistsWithHighFollowers = await ctx.db
      .select()
      .from(ctx.schema.artists)
      .where(drizzle.gt(ctx.schema.artists.followers, 1000000));

    return artistsWithHighFollowers;
  });
