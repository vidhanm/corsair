import 'dotenv/config';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../corsair/schema';

const connectionString = process.env.DATABASE_URL!;
const client = postgres(connectionString);
const db = drizzle(client, { schema });

async function seed() {
  console.log('🌱 Seeding database...\n');

  // Sample artists
  const artists = [
    {
      id: 'artist-1',
      name: 'Taylor Swift',
      popularity: 95,
      followers: 92000000,
      genres: ['pop', 'country'],
      images: [{ url: 'https://picsum.photos/640/640?1', height: 640, width: 640 }],
      external_urls: { spotify: 'https://open.spotify.com/artist/1' },
      uri: 'spotify:artist:1',
      href: 'https://api.spotify.com/v1/artists/1',
    },
    {
      id: 'artist-2',
      name: 'The Beatles',
      popularity: 88,
      followers: 45000000,
      genres: ['rock', 'pop'],
      images: [{ url: 'https://picsum.photos/640/640?2', height: 640, width: 640 }],
      external_urls: { spotify: 'https://open.spotify.com/artist/2' },
      uri: 'spotify:artist:2',
      href: 'https://api.spotify.com/v1/artists/2',
    },
    {
      id: 'artist-3',
      name: 'Drake',
      popularity: 96,
      followers: 78000000,
      genres: ['hip hop', 'rap'],
      images: [{ url: 'https://picsum.photos/640/640?3', height: 640, width: 640 }],
      external_urls: { spotify: 'https://open.spotify.com/artist/3' },
      uri: 'spotify:artist:3',
      href: 'https://api.spotify.com/v1/artists/3',
    },
    {
      id: 'artist-4',
      name: 'Daft Punk',
      popularity: 82,
      followers: 28000000,
      genres: ['electronic', 'house'],
      images: [{ url: 'https://picsum.photos/640/640?4', height: 640, width: 640 }],
      external_urls: { spotify: 'https://open.spotify.com/artist/4' },
      uri: 'spotify:artist:4',
      href: 'https://api.spotify.com/v1/artists/4',
    },
    {
      id: 'artist-5',
      name: 'Adele',
      popularity: 90,
      followers: 51000000,
      genres: ['pop', 'soul'],
      images: [{ url: 'https://picsum.photos/640/640?5', height: 640, width: 640 }],
      external_urls: { spotify: 'https://open.spotify.com/artist/5' },
      uri: 'spotify:artist:5',
      href: 'https://api.spotify.com/v1/artists/5',
    },
  ];

  // Sample albums
  const albums = [
    {
      id: 'album-1',
      name: '1989',
      album_type: 'album',
      release_date: '2014-10-27',
      release_date_precision: 'day',
      total_tracks: 13,
      images: [{ url: 'https://picsum.photos/640/640?11', height: 640, width: 640 }],
      external_urls: { spotify: 'https://open.spotify.com/album/1' },
      uri: 'spotify:album:1',
      href: 'https://api.spotify.com/v1/albums/1',
    },
    {
      id: 'album-2',
      name: 'Midnights',
      album_type: 'album',
      release_date: '2022-10-21',
      release_date_precision: 'day',
      total_tracks: 13,
      images: [{ url: 'https://picsum.photos/640/640?12', height: 640, width: 640 }],
      external_urls: { spotify: 'https://open.spotify.com/album/2' },
      uri: 'spotify:album:2',
      href: 'https://api.spotify.com/v1/albums/2',
    },
    {
      id: 'album-3',
      name: 'Abbey Road',
      album_type: 'album',
      release_date: '1969-09-26',
      release_date_precision: 'day',
      total_tracks: 17,
      images: [{ url: 'https://picsum.photos/640/640?13', height: 640, width: 640 }],
      external_urls: { spotify: 'https://open.spotify.com/album/3' },
      uri: 'spotify:album:3',
      href: 'https://api.spotify.com/v1/albums/3',
    },
    {
      id: 'album-4',
      name: 'Certified Lover Boy',
      album_type: 'album',
      release_date: '2021-09-03',
      release_date_precision: 'day',
      total_tracks: 21,
      images: [{ url: 'https://picsum.photos/640/640?14', height: 640, width: 640 }],
      external_urls: { spotify: 'https://open.spotify.com/album/4' },
      uri: 'spotify:album:4',
      href: 'https://api.spotify.com/v1/albums/4',
    },
    {
      id: 'album-5',
      name: 'Random Access Memories',
      album_type: 'album',
      release_date: '2013-05-17',
      release_date_precision: 'day',
      total_tracks: 13,
      images: [{ url: 'https://picsum.photos/640/640?15', height: 640, width: 640 }],
      external_urls: { spotify: 'https://open.spotify.com/album/5' },
      uri: 'spotify:album:5',
      href: 'https://api.spotify.com/v1/albums/5',
    },
    {
      id: 'album-6',
      name: '21',
      album_type: 'album',
      release_date: '2011-01-24',
      release_date_precision: 'day',
      total_tracks: 11,
      images: [{ url: 'https://picsum.photos/640/640?16', height: 640, width: 640 }],
      external_urls: { spotify: 'https://open.spotify.com/album/6' },
      uri: 'spotify:album:6',
      href: 'https://api.spotify.com/v1/albums/6',
    },
    {
      id: 'album-7',
      name: '25',
      album_type: 'album',
      release_date: '2015-11-20',
      release_date_precision: 'day',
      total_tracks: 11,
      images: [{ url: 'https://picsum.photos/640/640?17', height: 640, width: 640 }],
      external_urls: { spotify: 'https://open.spotify.com/album/7' },
      uri: 'spotify:album:7',
      href: 'https://api.spotify.com/v1/albums/7',
    },
  ];

  // Sample tracks
  const tracks = [
    { id: 'track-1', name: 'Shake It Off', disc_number: 1, duration_ms: 219200, explicit: false, track_number: 6, preview_url: null, is_local: false, external_urls: { spotify: 'https://open.spotify.com/track/1' }, uri: 'spotify:track:1', href: 'https://api.spotify.com/v1/tracks/1' },
    { id: 'track-2', name: 'Blank Space', disc_number: 1, duration_ms: 231833, explicit: false, track_number: 2, preview_url: null, is_local: false, external_urls: { spotify: 'https://open.spotify.com/track/2' }, uri: 'spotify:track:2', href: 'https://api.spotify.com/v1/tracks/2' },
    { id: 'track-3', name: 'Anti-Hero', disc_number: 1, duration_ms: 200690, explicit: false, track_number: 3, preview_url: null, is_local: false, external_urls: { spotify: 'https://open.spotify.com/track/3' }, uri: 'spotify:track:3', href: 'https://api.spotify.com/v1/tracks/3' },
    { id: 'track-4', name: 'Lavender Haze', disc_number: 1, duration_ms: 202357, explicit: false, track_number: 1, preview_url: null, is_local: false, external_urls: { spotify: 'https://open.spotify.com/track/4' }, uri: 'spotify:track:4', href: 'https://api.spotify.com/v1/tracks/4' },
    { id: 'track-5', name: 'Come Together', disc_number: 1, duration_ms: 259733, explicit: false, track_number: 1, preview_url: null, is_local: false, external_urls: { spotify: 'https://open.spotify.com/track/5' }, uri: 'spotify:track:5', href: 'https://api.spotify.com/v1/tracks/5' },
    { id: 'track-6', name: 'Something', disc_number: 1, duration_ms: 182933, explicit: false, track_number: 2, preview_url: null, is_local: false, external_urls: { spotify: 'https://open.spotify.com/track/6' }, uri: 'spotify:track:6', href: 'https://api.spotify.com/v1/tracks/6' },
    { id: 'track-7', name: 'Here Comes The Sun', disc_number: 1, duration_ms: 185333, explicit: false, track_number: 7, preview_url: null, is_local: false, external_urls: { spotify: 'https://open.spotify.com/track/7' }, uri: 'spotify:track:7', href: 'https://api.spotify.com/v1/tracks/7' },
    { id: 'track-8', name: 'Way 2 Sexy', disc_number: 1, duration_ms: 257933, explicit: true, track_number: 3, preview_url: null, is_local: false, external_urls: { spotify: 'https://open.spotify.com/track/8' }, uri: 'spotify:track:8', href: 'https://api.spotify.com/v1/tracks/8' },
    { id: 'track-9', name: 'Girls Want Girls', disc_number: 1, duration_ms: 243067, explicit: true, track_number: 2, preview_url: null, is_local: false, external_urls: { spotify: 'https://open.spotify.com/track/9' }, uri: 'spotify:track:9', href: 'https://api.spotify.com/v1/tracks/9' },
    { id: 'track-10', name: 'Get Lucky', disc_number: 1, duration_ms: 369000, explicit: false, track_number: 8, preview_url: null, is_local: false, external_urls: { spotify: 'https://open.spotify.com/track/10' }, uri: 'spotify:track:10', href: 'https://api.spotify.com/v1/tracks/10' },
    { id: 'track-11', name: 'Instant Crush', disc_number: 1, duration_ms: 337533, explicit: false, track_number: 5, preview_url: null, is_local: false, external_urls: { spotify: 'https://open.spotify.com/track/11' }, uri: 'spotify:track:11', href: 'https://api.spotify.com/v1/tracks/11' },
    { id: 'track-12', name: 'Rolling in the Deep', disc_number: 1, duration_ms: 228293, explicit: false, track_number: 1, preview_url: null, is_local: false, external_urls: { spotify: 'https://open.spotify.com/track/12' }, uri: 'spotify:track:12', href: 'https://api.spotify.com/v1/tracks/12' },
    { id: 'track-13', name: 'Someone Like You', disc_number: 1, duration_ms: 284827, explicit: false, track_number: 2, preview_url: null, is_local: false, external_urls: { spotify: 'https://open.spotify.com/track/13' }, uri: 'spotify:track:13', href: 'https://api.spotify.com/v1/tracks/13' },
    { id: 'track-14', name: 'Hello', disc_number: 1, duration_ms: 295493, explicit: false, track_number: 1, preview_url: null, is_local: false, external_urls: { spotify: 'https://open.spotify.com/track/14' }, uri: 'spotify:track:14', href: 'https://api.spotify.com/v1/tracks/14' },
    { id: 'track-15', name: 'Send My Love', disc_number: 1, duration_ms: 223506, explicit: false, track_number: 3, preview_url: null, is_local: false, external_urls: { spotify: 'https://open.spotify.com/track/15' }, uri: 'spotify:track:15', href: 'https://api.spotify.com/v1/tracks/15' },
  ];

  try {
    // Insert artists
    console.log('Adding artists...');
    await db.insert(schema.artists).values(artists);
    console.log(`✓ Added ${artists.length} artists`);

    // Insert albums
    console.log('Adding albums...');
    await db.insert(schema.albums).values(albums);
    console.log(`✓ Added ${albums.length} albums`);

    // Insert tracks
    console.log('Adding tracks...');
    await db.insert(schema.tracks).values(tracks);
    console.log(`✓ Added ${tracks.length} tracks`);

    // Link albums to artists
    console.log('Linking albums to artists...');
    const albumArtists = [
      { album_id: 'album-1', artist_id: 'artist-1' }, // 1989 -> Taylor Swift
      { album_id: 'album-2', artist_id: 'artist-1' }, // Midnights -> Taylor Swift
      { album_id: 'album-3', artist_id: 'artist-2' }, // Abbey Road -> The Beatles
      { album_id: 'album-4', artist_id: 'artist-3' }, // Certified Lover Boy -> Drake
      { album_id: 'album-5', artist_id: 'artist-4' }, // Random Access Memories -> Daft Punk
      { album_id: 'album-6', artist_id: 'artist-5' }, // 21 -> Adele
      { album_id: 'album-7', artist_id: 'artist-5' }, // 25 -> Adele
    ];
    await db.insert(schema.album_artists).values(albumArtists);
    console.log(`✓ Linked ${albumArtists.length} album-artist relationships`);

    // Link tracks to artists
    console.log('Linking tracks to artists...');
    const trackArtists = [
      { track_id: 'track-1', artist_id: 'artist-1' },
      { track_id: 'track-2', artist_id: 'artist-1' },
      { track_id: 'track-3', artist_id: 'artist-1' },
      { track_id: 'track-4', artist_id: 'artist-1' },
      { track_id: 'track-5', artist_id: 'artist-2' },
      { track_id: 'track-6', artist_id: 'artist-2' },
      { track_id: 'track-7', artist_id: 'artist-2' },
      { track_id: 'track-8', artist_id: 'artist-3' },
      { track_id: 'track-9', artist_id: 'artist-3' },
      { track_id: 'track-10', artist_id: 'artist-4' },
      { track_id: 'track-11', artist_id: 'artist-4' },
      { track_id: 'track-12', artist_id: 'artist-5' },
      { track_id: 'track-13', artist_id: 'artist-5' },
      { track_id: 'track-14', artist_id: 'artist-5' },
      { track_id: 'track-15', artist_id: 'artist-5' },
    ];
    await db.insert(schema.track_artists).values(trackArtists);
    console.log(`✓ Linked ${trackArtists.length} track-artist relationships`);

    console.log('\n✅ Database seeded successfully!\n');
    console.log('Summary:');
    console.log(`  - ${artists.length} artists`);
    console.log(`  - ${albums.length} albums`);
    console.log(`  - ${tracks.length} tracks`);
    console.log(`  - ${albumArtists.length} album-artist links`);
    console.log(`  - ${trackArtists.length} track-artist links\n`);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

seed();
