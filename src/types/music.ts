export interface Track {
  id: string;
  title: string;
  artistId: string;
  artist: string;
  albumId: string;
  album: string;
  duration: number; // in seconds
  trackNumber: number;
  coverArt: string;
  audioUrl: string;
  bitRate?: number;
  format?: string;
  year?: number;
  genre?: string;
  dominantColor?: string;
}

export interface Album {
  id: string;
  title: string;
  artistId: string;
  artist: string;
  coverArt: string;
  songCount: number;
  duration: number;
  year: number;
  genre: string;
  tracks?: Track[];
}

export interface Artist {
  id: string;
  name: string;
  coverArt: string;
  albumCount: number;
  trackCount: number;
  genres: string[];
  bio?: string;
  albums?: Album[];
}

export interface Genre {
  name: string;
  songCount: number;
  albumCount: number;
  accentColor: string;
  coverArt?: string;
}

export interface SubsonicServerConfig {
  url: string;
  username: string;
  password?: string;
  salt?: string;
  token?: string;
  useTokenAuth: boolean;
  clientName: string;
  isConnected: boolean;
  serverVersion?: string;
  serverName?: string;
}

export interface MusicFolder {
  id: string;
  name: string;
}

export interface AlbumShare {
  id: string;
  url: string;
  description?: string;
  expires?: string;
  visitCount?: number;
}

export type RepeatMode = 'off' | 'all' | 'one';
