"use client";

import { useState } from "react";
import { ArtistCard } from "@/components/artist-card";
import { AlbumCard } from "@/components/album-card";
import { ArtistDetailsSheet } from "@/components/artist-details-sheet";
import { AlbumDetailsSheet } from "@/components/album-details-sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useCorsairMutation,
  useCorsairQuery,
  type QueryOutputs,
} from "@/corsair/client";

interface ArtistsAlbumsViewProps {
  initialArtists: QueryOutputs["get all artists"];
  initialAlbums: QueryOutputs["get all albums"];
  popularArtists: QueryOutputs["get artists with popularity greater than 80"];
  popularByFollowers: QueryOutputs["get artists with more than 1 million followers"];
  sortedArtists: QueryOutputs["get all artists sorted by name"];
}

export function ArtistsAlbumsView({
  initialArtists,
  initialAlbums,
  popularArtists,
  popularByFollowers,
  sortedArtists,
}: ArtistsAlbumsViewProps) {
  const res = useCorsairMutation("link album to artist", {});
  const res2 = useCorsairMutation("link artist to album", {});

  // Test mutation auto-generation - CRUD operations
  const incrementPopularity = useCorsairMutation("increment artist popularity by 10", {});
  const createArtist = useCorsairMutation("create artist", {});
  const createAlbum = useCorsairMutation("create new album with title and release date", {});
  const deleteArtist = useCorsairMutation("delete artist by id", {});


  const grids = useCorsairQuery(
    "get grids by id. give me the top 50 grids sort by most recently used",
    { id: "123" }
  );

  const [view, setView] = useState<"all" | "artists" | "albums" | "popular" | "followers" | "sorted">("all");
  const [selectedArtist, setSelectedArtist] = useState<
    QueryOutputs["get all artists"][number] | null
  >(null);
  const [selectedAlbum, setSelectedAlbum] = useState<
    QueryOutputs["get all albums"][number] | null
  >(null);
  const [artistSheetOpen, setArtistSheetOpen] = useState(false);
  const [albumSheetOpen, setAlbumSheetOpen] = useState(false);

  const handleArtistClick = (
    artist: QueryOutputs["get all artists"][number]
  ) => {
    setSelectedArtist(artist as QueryOutputs["get all artists"][number]);
    setArtistSheetOpen(true);
  };

  const handleAlbumClick = (album: QueryOutputs["get all albums"][number]) => {
    setSelectedAlbum(album as QueryOutputs["get all albums"][number]);
    setAlbumSheetOpen(true);
  };

  return (
    <>
      <div className="max-w-7xl mx-auto space-y-8">
        <header className="space-y-4">
          <h1 className="text-4xl font-bold">Spotify Music Database</h1>
          <p className="text-muted-foreground">
            Explore artists, albums, and tracks with sorting and filtering
          </p>

          <div className="flex flex-wrap gap-3">
            <Select value={view} onValueChange={(v) => setView(v as typeof view)}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select view" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="artists">Artists Only</SelectItem>
                <SelectItem value="albums">Albums Only</SelectItem>
                <SelectItem value="popular">Popular Artists (&gt;80)</SelectItem>
                <SelectItem value="followers">Artists with &gt;1M Followers</SelectItem>
                <SelectItem value="sorted">Artists Sorted by Name</SelectItem>
              </SelectContent>
            </Select>

            {/* Test mutation buttons */}
            <div className="flex gap-2 ml-auto">
              <button
                onClick={() => createArtist.mutate({
                  id: `artist_${Date.now()}`,
                  name: `Test Artist ${Date.now()}`,
                  genres: ["Rock", "Pop"],
                })}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded text-sm font-medium transition-colors"
              >
                Create Artist
              </button>
              <button
                onClick={() => createAlbum.mutate({
                  name: `Test Album ${Date.now()}`,
                  releaseDate: new Date().toISOString(),
                  artistIds: initialArtists.slice(0, 1).map(a => a.id),
                })}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded text-sm font-medium transition-colors"
              >
                Create Album
              </button>
            </div>
          </div>
        </header>

        {(view === "all" || view === "artists") && (
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">Artists</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {initialArtists.map((artist) => (
                <ArtistCard
                  key={artist.id}
                  artist={artist}
                  onClick={handleArtistClick}
                />
              ))}
            </div>
          </section>
        )}

        {(view === "all" || view === "albums") && (
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">Albums</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {initialAlbums.map((album) => (
                <AlbumCard
                  key={album.id}
                  album={album}
                  onClick={handleAlbumClick}
                />
              ))}
            </div>
          </section>
        )}

        {view === "popular" && (
          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-semibold">Popular Artists (Popularity &gt; 80)</h2>
              <span className="bg-purple-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                {popularArtists.length} artists
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              🤖 Auto-generated query using Cerebras AI
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {popularArtists.map((artist) => (
                <ArtistCard
                  key={artist.id}
                  artist={artist}
                  onClick={handleArtistClick}
                />
              ))}
            </div>
          </section>
        )}

        {view === "followers" && (
          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-semibold">Artists with &gt;1M Followers</h2>
              <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                {popularByFollowers.length} artists
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              🤖 Auto-generated query using Cerebras AI
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {popularByFollowers.map((artist) => (
                <ArtistCard
                  key={artist.id}
                  artist={artist}
                  onClick={handleArtistClick}
                />
              ))}
            </div>
          </section>
        )}

        {view === "sorted" && (
          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-semibold">Artists Sorted by Name</h2>
              <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                {sortedArtists.length} artists
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              🤖 Auto-generated query using Cerebras AI
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sortedArtists.map((artist) => (
                <ArtistCard
                  key={artist.id}
                  artist={artist}
                  onClick={handleArtistClick}
                />
              ))}
            </div>
          </section>
        )}
      </div>

      <ArtistDetailsSheet
        artist={selectedArtist}
        open={artistSheetOpen}
        onOpenChange={setArtistSheetOpen}
      />

      <AlbumDetailsSheet
        album={selectedAlbum}
        open={albumSheetOpen}
        onOpenChange={setAlbumSheetOpen}
      />
    </>
  );
}
