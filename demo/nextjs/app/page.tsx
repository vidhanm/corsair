// Server Component - fetches data on the server
import { ArtistsAlbumsView } from "@/components/artists-albums-view";
import { corsairQuery } from "@/corsair/server";

export default async function Home() {
  // Server-side data fetching using our query layer
  // Initial data is fetched on the server for fast first paint
  // Detailed data (tracks, etc.) is fetched on the client when needed
  const artists = await corsairQuery("get all artists", {});
  const albums = await corsairQuery("get all albums with artists", {});
  const popularArtists = await corsairQuery("get artists with popularity greater than 80", {});
  const popularByFollowers = await corsairQuery("get artists with more than 1 million followers", {});

  const sortedArtists = await corsairQuery("get all artists sorted by name", {});
  return (
    <div className="min-h-screen p-8">
      <ArtistsAlbumsView
        initialArtists={artists}
        initialAlbums={albums}
        popularArtists={popularArtists}
        popularByFollowers={popularByFollowers}
        sortedArtists={sortedArtists}
      />
    </div>
  );
}
