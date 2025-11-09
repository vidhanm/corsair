import { z } from "corsair";
import { procedure } from "../trpc/procedures";
import { drizzle } from "corsair/db/types";

export const getAllArtistsSortedByName = procedure
  .input(z.object({}))
  .query(async (input, ctx) => {
    const artists = await ctx.db
      .select()
      .from(ctx.schema.artists)
      .orderBy(ctx.schema.artists.name);

    return artists;
  });
