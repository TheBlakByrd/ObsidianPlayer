import { Artist, Album, Track, Genre, SubsonicServerConfig, MusicFolder } from '../types/music';
import { DEMO_ARTISTS, DEMO_ALBUMS, DEMO_TRACKS, DEMO_GENRES, DEMO_MUSIC_FOLDERS } from '../data/demoLibrary';

// Lightweight MD5 implementation for Subsonic token auth without heavy external dependencies
function md5(string: string): string {
  function rotateLeft(lValue: number, iShiftBits: number) {
    return (lValue << iShiftBits) | (lValue >>> (32 - iShiftBits));
  }
  function addUnsigned(lX: number, lY: number) {
    const lX8 = lX & 0x80000000;
    const lY8 = lY & 0x80000000;
    const lX4 = lX & 0x40000000;
    const lY4 = lY & 0x40000000;
    const lResult = (lX & 0x3fffffff) + (lY & 0x3fffffff);
    if (lX4 & lY4) return lResult ^ 0x80000000 ^ lX8 ^ lY8;
    if (lX4 | lY4) {
      if (lResult & 0x40000000) return lResult ^ 0xc0000000 ^ lX8 ^ lY8;
      else return lResult ^ 0x40000000 ^ lX8 ^ lY8;
    } else {
      return lResult ^ lX8 ^ lY8;
    }
  }
  function F(x: number, y: number, z: number) { return (x & y) | (~x & z); }
  function G(x: number, y: number, z: number) { return (x & z) | (y & ~z); }
  function H(x: number, y: number, z: number) { return x ^ y ^ z; }
  function I(x: number, y: number, z: number) { return y ^ (x | ~z); }
  function FF(a: number, b: number, c: number, d: number, x: number, s: number, ac: number) {
    a = addUnsigned(a, addUnsigned(addUnsigned(F(b, c, d), x), ac));
    return addUnsigned(rotateLeft(a, s), b);
  }
  function GG(a: number, b: number, c: number, d: number, x: number, s: number, ac: number) {
    a = addUnsigned(a, addUnsigned(addUnsigned(G(b, c, d), x), ac));
    return addUnsigned(rotateLeft(a, s), b);
  }
  function HH(a: number, b: number, c: number, d: number, x: number, s: number, ac: number) {
    a = addUnsigned(a, addUnsigned(addUnsigned(H(b, c, d), x), ac));
    return addUnsigned(rotateLeft(a, s), b);
  }
  function II(a: number, b: number, c: number, d: number, x: number, s: number, ac: number) {
    a = addUnsigned(a, addUnsigned(addUnsigned(I(b, c, d), x), ac));
    return addUnsigned(rotateLeft(a, s), b);
  }

  function convertToWordArray(str: string) {
    let lWordCount;
    const lMessageLength = str.length;
    const lNumberOfWords_temp1 = lMessageLength + 8;
    const lNumberOfWords_temp2 = (lNumberOfWords_temp1 - (lNumberOfWords_temp1 % 64)) / 64;
    const lNumberOfWords = (lNumberOfWords_temp2 + 1) * 16;
    const lWordArray = Array(lNumberOfWords - 1);
    let lBytePosition = 0;
    let lByteCount = 0;
    while (lByteCount < lMessageLength) {
      lWordCount = (lByteCount - (lByteCount % 4)) / 4;
      lBytePosition = (lByteCount % 4) * 8;
      lWordArray[lWordCount] = (lWordArray[lWordCount] | (str.charCodeAt(lByteCount) << lBytePosition));
      lByteCount++;
    }
    lWordCount = (lByteCount - (lByteCount % 4)) / 4;
    lBytePosition = (lByteCount % 4) * 8;
    lWordArray[lWordCount] = lWordArray[lWordCount] | (0x80 << lBytePosition);
    lWordArray[lNumberOfWords - 2] = lMessageLength << 3;
    lWordArray[lNumberOfWords - 1] = lMessageLength >>> 29;
    return lWordArray;
  }

  function wordToHex(lValue: number) {
    let WordToHexValue = '', WordToHexValue_temp = '', lByte, lCount;
    for (lCount = 0; lCount <= 3; lCount++) {
      lByte = (lValue >>> (lCount * 8)) & 255;
      WordToHexValue_temp = '0' + lByte.toString(16);
      WordToHexValue = WordToHexValue + WordToHexValue_temp.substr(WordToHexValue_temp.length - 2, 2);
    }
    return WordToHexValue;
  }

  const x = convertToWordArray(string);
  let a = 0x67452301, b = 0xefcdab89, c = 0x98badcfe, d = 0x10325476;
  const S11 = 7, S12 = 12, S13 = 17, S14 = 22;
  const S21 = 5, S22 = 9, S23 = 14, S24 = 20;
  const S31 = 4, S32 = 11, S33 = 16, S34 = 23;
  const S41 = 6, S42 = 10, S43 = 15, S44 = 21;

  for (let k = 0; k < x.length; k += 16) {
    const AA = a, BB = b, CC = c, DD = d;
    a = FF(a, b, c, d, x[k + 0], S11, 0xd76aa478);
    d = FF(d, a, b, c, x[k + 1], S12, 0xe8c7b756);
    c = FF(c, d, a, b, x[k + 2], S13, 0x242070db);
    b = FF(b, c, d, a, x[k + 3], S14, 0xc1bdceee);
    a = FF(a, b, c, d, x[k + 4], S11, 0xf57c0faf);
    d = FF(d, a, b, c, x[k + 5], S12, 0x4787c62a);
    c = FF(c, d, a, b, x[k + 6], S13, 0xa8304613);
    b = FF(b, c, d, a, x[k + 7], S14, 0xfd469501);
    a = FF(a, b, c, d, x[k + 8], S11, 0x698098d8);
    d = FF(d, a, b, c, x[k + 9], S12, 0x8b44f7af);
    c = FF(c, d, a, b, x[k + 10], S13, 0xffff5bb1);
    b = FF(b, c, d, a, x[k + 11], S14, 0x895cd7be);
    a = FF(a, b, c, d, x[k + 12], S11, 0x6b901122);
    d = FF(d, a, b, c, x[k + 13], S12, 0xfd987193);
    c = FF(c, d, a, b, x[k + 14], S13, 0xa679438e);
    b = FF(b, c, d, a, x[k + 15], S14, 0x49b40821);

    a = GG(a, b, c, d, x[k + 1], S21, 0xf61e2562);
    d = GG(d, a, b, c, x[k + 6], S22, 0xc040b340);
    c = GG(c, d, a, b, x[k + 11], S23, 0x265e5a51);
    b = GG(b, c, d, a, x[k + 0], S24, 0xe9b6c7aa);
    a = GG(a, b, c, d, x[k + 5], S21, 0xd62f105d);
    d = GG(d, a, b, c, x[k + 10], S22, 0x2441453);
    c = GG(c, d, a, b, x[k + 15], S23, 0xd8a1e681);
    b = GG(b, c, d, a, x[k + 4], S24, 0xe7d3fbc8);
    a = GG(a, b, c, d, x[k + 9], S21, 0x21e1cde6);
    d = GG(d, a, b, c, x[k + 14], S22, 0xc33707d6);
    c = GG(c, d, a, b, x[k + 3], S23, 0xf4d50d87);
    b = GG(b, c, d, a, x[k + 8], S24, 0x455a14ed);
    a = GG(a, b, c, d, x[k + 13], S21, 0xa9e3e905);
    d = GG(d, a, b, c, x[k + 2], S22, 0xfcefa3f8);
    c = GG(c, d, a, b, x[k + 7], S23, 0x676f02d9);
    b = GG(b, c, d, a, x[k + 12], S24, 0x8d2a4c8a);

    a = HH(a, b, c, d, x[k + 5], S31, 0xfffa3942);
    d = HH(d, a, b, c, x[k + 8], S32, 0x8771f681);
    c = HH(c, d, a, b, x[k + 11], S33, 0x6d9d6122);
    b = HH(b, c, d, a, x[k + 14], S34, 0xfde5380c);
    a = HH(a, b, c, d, x[k + 1], S31, 0xa4beea44);
    d = HH(d, a, b, c, x[k + 4], S32, 0x4bdecfa9);
    c = HH(c, d, a, b, x[k + 7], S33, 0xf6bb4b60);
    b = HH(b, c, d, a, x[k + 10], S34, 0xbebfbc70);
    a = HH(a, b, c, d, x[k + 13], S31, 0x289b7ec6);
    d = HH(d, a, b, c, x[k + 0], S32, 0xeaa127fa);
    c = HH(c, d, a, b, x[k + 3], S33, 0xd4ef3085);
    b = HH(b, c, d, a, x[k + 6], S34, 0x4881d05);
    a = HH(a, b, c, d, x[k + 9], S31, 0xd9d4d039);
    d = HH(d, a, b, c, x[k + 12], S32, 0xe6db99e5);
    c = HH(c, d, a, b, x[k + 15], S33, 0x1fa27cf8);
    b = HH(b, c, d, a, x[k + 2], S34, 0xc4ac5665);

    a = II(a, b, c, d, x[k + 0], S41, 0xf4292244);
    d = II(d, a, b, c, x[k + 7], S42, 0x432aff97);
    c = II(c, d, a, b, x[k + 14], S43, 0xab9423a7);
    b = II(b, c, d, a, x[k + 5], S44, 0xfc93a039);
    a = II(a, b, c, d, x[k + 12], S41, 0x655b59c3);
    d = II(d, a, b, c, x[k + 3], S42, 0x8f0ccc92);
    c = II(c, d, a, b, x[k + 10], S43, 0xffeff47d);
    b = II(b, c, d, a, x[k + 1], S44, 0x85845dd1);
    a = II(a, b, c, d, x[k + 8], S41, 0x6fa87e4f);
    d = II(d, a, b, c, x[k + 15], S42, 0xfe2ce6e0);
    c = II(c, d, a, b, x[k + 6], S43, 0xa3014314);
    b = II(b, c, d, a, x[k + 13], S44, 0x4e0811a1);
    a = II(a, b, c, d, x[k + 4], S41, 0xf7537e82);
    d = II(d, a, b, c, x[k + 11], S42, 0xbd3af235);
    c = II(c, d, a, b, x[k + 2], S43, 0x2ad7d2bb);
    b = II(b, c, d, a, x[k + 9], S44, 0xeb86d391);

    a = addUnsigned(a, AA);
    b = addUnsigned(b, BB);
    c = addUnsigned(c, CC);
    d = addUnsigned(d, DD);
  }
  return (wordToHex(a) + wordToHex(b) + wordToHex(c) + wordToHex(d)).toLowerCase();
}

class SubsonicService {
  private config: SubsonicServerConfig;
  private readonly STORAGE_KEY = 'obsidian_subsonic_config';
  private albumCoverCache = new Map<string, string>();

  public getCoverArtForAlbum(albumId?: string, albumName?: string): string {
    if (albumId && this.albumCoverCache.has(albumId)) {
      return this.albumCoverCache.get(albumId)!;
    }
    if (albumName && this.albumCoverCache.has(albumName.toLowerCase())) {
      return this.albumCoverCache.get(albumName.toLowerCase())!;
    }
    if (albumId && this.isConnectedToServer()) {
      return this.buildUrl('getCoverArt', { id: albumId, size: 600 });
    }
    return '';
  }

  constructor() {
    this.config = this.loadConfig();
  }

  private loadConfig(): SubsonicServerConfig {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(this.STORAGE_KEY);
        if (stored) {
          return JSON.parse(stored);
        }
      } catch {
        // ignore
      }
    }
    return {
      url: '',
      username: '',
      password: '',
      useTokenAuth: true,
      clientName: 'ObsidianSubsonic',
      isConnected: false,
    };
  }

  public saveConfig(newConfig: Partial<SubsonicServerConfig>) {
    this.config = { ...this.config, ...newConfig };
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.config));
    }
  }

  public getConfig(): SubsonicServerConfig {
    return { ...this.config };
  }

  public isConnectedToServer(): boolean {
    return !!this.config.isConnected && !!this.config.url;
  }

  public setDemoMode() {
    this.saveConfig({ isConnected: false });
  }

  private generateAuthParams(): Record<string, string> {
    const params: Record<string, string> = {
      u: this.config.username,
      v: '1.16.1',
      c: this.config.clientName || 'ObsidianSubsonic',
      f: 'json',
    };

    if (this.config.useTokenAuth && this.config.password) {
      const salt = Math.random().toString(36).substring(2, 10);
      const token = md5(this.config.password + salt);
      params.t = token;
      params.s = salt;
    } else if (this.config.password) {
      params.p = this.config.password;
    }

    return params;
  }

  private buildUrl(endpoint: string, extraParams: Record<string, string | number> = {}): string {
    let baseUrl = this.config.url.trim().replace(/\/+$/, '');
    if (!baseUrl.startsWith('http://') && !baseUrl.startsWith('https://')) {
      baseUrl = 'http://' + baseUrl;
    }

    const authParams = this.generateAuthParams();
    const allParams = { ...authParams, ...extraParams };
    const query = Object.entries(allParams)
      .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
      .join('&');

    return `${baseUrl}/rest/${endpoint}.view?${query}`;
  }

  // Ping test
  public async testConnection(serverUrl: string, username: string, password?: string, useTokenAuth = true): Promise<{ success: boolean; version?: string; error?: string }> {
    try {
      let baseUrl = serverUrl.trim().replace(/\/+$/, '');
      if (!baseUrl.startsWith('http://') && !baseUrl.startsWith('https://')) {
        baseUrl = 'http://' + baseUrl;
      }

      const params: Record<string, string> = {
        u: username,
        v: '1.16.1',
        c: 'ObsidianSubsonic',
        f: 'json',
      };

      if (useTokenAuth && password) {
        const salt = Math.random().toString(36).substring(2, 10);
        params.t = md5(password + salt);
        params.s = salt;
      } else if (password) {
        params.p = password;
      }

      const query = Object.entries(params)
        .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
        .join('&');

      const url = `${baseUrl}/rest/ping.view?${query}`;
      const res = await fetch(url, { method: 'GET' });
      if (!res.ok) {
        return { success: false, error: `HTTP ${res.status}: ${res.statusText}` };
      }

      const data = await res.json();
      const subRes = data['subsonic-response'];
      if (subRes && subRes.status === 'ok') {
        return { success: true, version: subRes.version || '1.16.1' };
      } else {
        const errorMsg = subRes?.error?.message || 'Authentication or server error';
        return { success: false, error: errorMsg };
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Network error or CORS issue connecting to server';
      return { success: false, error: msg };
    }
  }

  public async getMusicFolders(): Promise<MusicFolder[]> {
    if (!this.isConnectedToServer()) {
      return [...DEMO_MUSIC_FOLDERS];
    }

    try {
      const url = this.buildUrl('getMusicFolders');
      const res = await fetch(url);
      const data = await res.json();
      const subRes = data['subsonic-response'];
      if (subRes?.status === 'ok' && subRes.musicFolders?.musicFolder) {
        const raw = subRes.musicFolders.musicFolder;
        const list = Array.isArray(raw) ? raw : [raw];
        const folders: MusicFolder[] = list.map((f: any) => ({
          id: String(f.id),
          name: f.name || `Library ${f.id}`,
        }));
        return [{ id: 'all', name: 'All Libraries' }, ...folders];
      }
    } catch (err) {
      console.warn('Failed to fetch music folders:', err);
    }

    return [{ id: 'all', name: 'All Libraries' }];
  }

  public async getArtists(musicFolderId?: string): Promise<Artist[]> {
    if (!this.isConnectedToServer()) {
      if (!musicFolderId || musicFolderId === 'all') {
        return [...DEMO_ARTISTS];
      }
      if (musicFolderId === 'folder-hires') {
        return DEMO_ARTISTS.filter(a => ['art-astral', 'art-nordic', 'art-amber', 'art-deep', 'art-zero'].includes(a.id));
      }
      if (musicFolderId === 'folder-soundtracks') {
        return DEMO_ARTISTS.filter(a => ['art-astral', 'art-nordic', 'art-echoes', 'art-koto'].includes(a.id));
      }
      return DEMO_ARTISTS.filter(a => ['art-synthesian', 'art-amber', 'art-chronos', 'art-helios', 'art-midnight', 'art-velvet'].includes(a.id));
    }

    try {
      const extraParams: Record<string, string | number> = {};
      if (musicFolderId && musicFolderId !== 'all') {
        extraParams.musicFolderId = musicFolderId;
      }
      const url = this.buildUrl('getArtists', extraParams);
      const res = await fetch(url);
      const data = await res.json();
      const subRes = data['subsonic-response'];
      if (subRes?.status === 'ok' && subRes.artists?.index) {
        const parsedArtists: Artist[] = [];
        for (const indexGroup of subRes.artists.index) {
          if (Array.isArray(indexGroup.artist)) {
            for (const a of indexGroup.artist) {
              parsedArtists.push({
                id: a.id,
                name: a.name,
                coverArt: a.coverArt ? this.buildUrl('getCoverArt', { id: a.coverArt, size: 500 }) : a.artistImageUrl || '/default_artist.jpg',
                albumCount: a.albumCount || 1,
                trackCount: (a.albumCount || 1) * 8,
                genres: [],
              });
            }
          }
        }
        return parsedArtists;
      }
    } catch (err) {
      console.warn('Failed to fetch artists from Subsonic server, using demo library:', err);
    }

    return [...DEMO_ARTISTS];
  }

  public async getArtist(artistId: string): Promise<Artist | null> {
    if (!this.isConnectedToServer() || artistId.startsWith('art-')) {
      const found = DEMO_ARTISTS.find(a => a.id === artistId);
      return found || null;
    }

    try {
      const url = this.buildUrl('getArtist', { id: artistId });
      const res = await fetch(url);
      const data = await res.json();
      const subRes = data['subsonic-response'];
      if (subRes?.status === 'ok' && subRes.artist) {
        const rawArtist = subRes.artist;
        const albums: Album[] = (rawArtist.album || []).map((alb: any) => ({
          id: alb.id,
          title: alb.title || alb.name,
          artistId: rawArtist.id,
          artist: rawArtist.name,
          coverArt: alb.coverArt ? this.buildUrl('getCoverArt', { id: alb.coverArt, size: 500 }) : '',
          songCount: alb.songCount || 0,
          duration: alb.duration || 0,
          year: alb.year || 2024,
          genre: alb.genre || 'Music',
        }));

        return {
          id: rawArtist.id,
          name: rawArtist.name,
          coverArt: rawArtist.coverArt ? this.buildUrl('getCoverArt', { id: rawArtist.coverArt, size: 600 }) : '',
          albumCount: rawArtist.albumCount || albums.length,
          trackCount: albums.reduce((acc, a) => acc + (a.songCount || 0), 0),
          genres: [],
          albums,
        };
      }
    } catch (err) {
      console.warn('Failed to get artist:', err);
    }

    return DEMO_ARTISTS.find(a => a.id === artistId) || null;
  }

  public async getAlbum(albumId: string): Promise<Album | null> {
    if (!this.isConnectedToServer() || albumId.startsWith('alb-')) {
      return DEMO_ALBUMS.find(a => a.id === albumId) || null;
    }

    try {
      const url = this.buildUrl('getAlbum', { id: albumId });
      const res = await fetch(url);
      const data = await res.json();
      const subRes = data['subsonic-response'];
      if (subRes?.status === 'ok' && subRes.album) {
        const alb = subRes.album;
        const albumCoverId = alb.coverArt || alb.id;
        const coverArtUrl = albumCoverId ? this.buildUrl('getCoverArt', { id: albumCoverId, size: 600 }) : '';
        if (coverArtUrl) {
          this.albumCoverCache.set(alb.id, coverArtUrl);
          if (alb.title || alb.name) {
            this.albumCoverCache.set((alb.title || alb.name).toLowerCase(), coverArtUrl);
          }
        }

        const tracks: Track[] = (alb.song || []).map((s: any, idx: number) => {
          // Primary authoritative artwork is the album cover so song 2+ NEVER loses its artwork!
          const trackCoverId = s.coverArt;
          const trackCoverUrl = trackCoverId ? this.buildUrl('getCoverArt', { id: trackCoverId, size: 600 }) : '';
          const finalCoverArt = coverArtUrl || trackCoverUrl;

          return {
            id: s.id,
            title: s.title,
            artistId: s.artistId || alb.artistId,
            artist: s.artist || alb.artist,
            albumId: alb.id,
            album: alb.title || alb.name,
            duration: s.duration || 180,
            trackNumber: s.track || idx + 1,
            coverArt: finalCoverArt,
            audioUrl: this.buildUrl('stream', { id: s.id }),
            bitRate: s.bitRate,
            format: s.suffix ? `${s.suffix.toUpperCase()} ${s.bitRate ? s.bitRate + 'kbps' : ''}` : 'Audio',
            year: s.year || alb.year,
            genre: s.genre || alb.genre,
          };
        });

        return {
          id: alb.id,
          title: alb.title || alb.name,
          artistId: alb.artistId,
          artist: alb.artist,
          coverArt: coverArtUrl,
          songCount: alb.songCount || tracks.length,
          duration: alb.duration || tracks.reduce((acc, t) => acc + t.duration, 0),
          year: alb.year || 2024,
          genre: alb.genre || 'Music',
          tracks,
        };
      }
    } catch (err) {
      console.warn('Failed to get album:', err);
    }

    return DEMO_ALBUMS.find(a => a.id === albumId) || null;
  }

  public async getGenres(musicFolderId?: string): Promise<Genre[]> {
    if (!this.isConnectedToServer()) {
      if (!musicFolderId || musicFolderId === 'all') {
        return [...DEMO_GENRES];
      }
      if (musicFolderId === 'folder-hires') {
        return DEMO_GENRES.filter(g => ['Ambient Space', 'Modern Classical', 'Noir Jazz'].includes(g.name));
      }
      if (musicFolderId === 'folder-soundtracks') {
        return DEMO_GENRES.filter(g => ['Ambient Space', 'Modern Classical', 'Post-Rock', 'Organic Electronic'].includes(g.name));
      }
      return DEMO_GENRES.filter(g => ['Electronic', 'Noir Jazz', 'Modern Classical', 'Synthwave', 'Lo-Fi Chill'].includes(g.name));
    }

    try {
      const extraParams: Record<string, string | number> = {};
      if (musicFolderId && musicFolderId !== 'all') {
        extraParams.musicFolderId = musicFolderId;
      }
      const url = this.buildUrl('getGenres', extraParams);
      const res = await fetch(url);
      const data = await res.json();
      const subRes = data['subsonic-response'];
      if (subRes?.status === 'ok' && subRes.genres?.genre) {
        const list = Array.isArray(subRes.genres.genre) ? subRes.genres.genre : [subRes.genres.genre];
        return list.map((g: any, i: number) => ({
          name: g.value || g.name,
          songCount: g.songCount || 0,
          albumCount: g.albumCount || 0,
          accentColor: DEMO_GENRES[i % DEMO_GENRES.length]?.accentColor || '#38245e',
        }));
      }
    } catch (err) {
      console.warn('Failed to get genres:', err);
    }

    return [...DEMO_GENRES];
  }

  public async getAllAlbums(musicFolderId?: string): Promise<Album[]> {
    if (!this.isConnectedToServer()) {
      if (!musicFolderId || musicFolderId === 'all') {
        return [...DEMO_ALBUMS];
      }
      if (musicFolderId === 'folder-hires') {
        return DEMO_ALBUMS.filter(a => ['alb-void', 'alb-neoclassica', 'alb-resonance', 'alb-deep', 'alb-zero'].includes(a.id));
      }
      if (musicFolderId === 'folder-soundtracks') {
        return DEMO_ALBUMS.filter(a => ['alb-void', 'alb-neoclassica', 'alb-echoes', 'alb-koto'].includes(a.id));
      }
      return DEMO_ALBUMS.filter(a => ['alb-orbits', 'alb-resonance', 'alb-chronos', 'alb-helios', 'alb-midnight', 'alb-velvet'].includes(a.id));
    }

    try {
      const extraParams: Record<string, string | number> = { type: 'alphabeticalByName', size: 100 };
      if (musicFolderId && musicFolderId !== 'all') {
        extraParams.musicFolderId = musicFolderId;
      }
      const url = this.buildUrl('getAlbumList2', extraParams);
      const res = await fetch(url);
      const data = await res.json();
      const subRes = data['subsonic-response'];
      if (subRes?.status === 'ok' && subRes.albumList2?.album) {
        const list = Array.isArray(subRes.albumList2.album) ? subRes.albumList2.album : [subRes.albumList2.album];
        return list.map((a: any) => {
          const coverId = a.coverArt || a.id;
          const coverUrl = coverId ? this.buildUrl('getCoverArt', { id: coverId, size: 500 }) : '';
          if (coverUrl) {
            this.albumCoverCache.set(a.id, coverUrl);
            if (a.title || a.name) this.albumCoverCache.set((a.title || a.name).toLowerCase(), coverUrl);
          }
          return {
            id: a.id,
            title: a.title || a.name,
            artistId: a.artistId,
            artist: a.artist,
            coverArt: coverUrl,
            songCount: a.songCount || 0,
            duration: a.duration || 0,
            year: a.year || 2024,
            genre: a.genre || 'Music',
          };
        });
      }
    } catch (err) {
      console.warn('Failed to get albums:', err);
    }

    return [...DEMO_ALBUMS];
  }

  public async getAllSongs(musicFolderId?: string): Promise<Track[]> {
    if (!this.isConnectedToServer()) {
      if (!musicFolderId || musicFolderId === 'all') {
        return [...DEMO_TRACKS];
      }
      if (musicFolderId === 'folder-hires') {
        return DEMO_TRACKS.filter(t => ['alb-void', 'alb-neoclassica', 'alb-resonance', 'alb-deep', 'alb-zero'].includes(t.albumId));
      }
      if (musicFolderId === 'folder-soundtracks') {
        return DEMO_TRACKS.filter(t => ['alb-void', 'alb-neoclassica', 'alb-echoes', 'alb-koto'].includes(t.albumId));
      }
      return DEMO_TRACKS.filter(t => ['alb-orbits', 'alb-resonance', 'alb-chronos', 'alb-helios', 'alb-midnight', 'alb-velvet'].includes(t.albumId));
    }

    try {
      const extraParams: Record<string, string | number> = { size: 500 };
      if (musicFolderId && musicFolderId !== 'all') {
        extraParams.musicFolderId = musicFolderId;
      }
      const url = this.buildUrl('getRandomSongs', extraParams);
      const res = await fetch(url);
      const data = await res.json();
      const subRes = data['subsonic-response'];
      if (subRes?.status === 'ok' && subRes.randomSongs?.song) {
        const list = Array.isArray(subRes.randomSongs.song) ? subRes.randomSongs.song : [subRes.randomSongs.song];
        return list.map((s: any, idx: number) => {
          const albumCoverUrl = this.getCoverArtForAlbum(s.albumId, s.album);
          const songCoverUrl = s.coverArt ? this.buildUrl('getCoverArt', { id: s.coverArt, size: 500 }) : '';
          const finalCover = songCoverUrl || albumCoverUrl;

          if (s.albumId && finalCover) {
            this.albumCoverCache.set(s.albumId, finalCover);
          }

          return {
            id: String(s.id),
            title: s.title || s.name || `Track ${idx + 1}`,
            artistId: String(s.artistId || ''),
            artist: s.artist || 'Unknown Artist',
            albumId: String(s.albumId || ''),
            album: s.album || 'Unknown Album',
            duration: s.duration || 180,
            trackNumber: s.track || idx + 1,
            coverArt: finalCover,
            audioUrl: this.buildUrl('stream', { id: s.id }),
            bitRate: s.bitRate,
            format: s.suffix ? `${s.suffix.toUpperCase()} ${s.bitRate ? s.bitRate + 'kbps' : ''}` : 'Audio',
            year: s.year,
            genre: s.genre,
          };
        });
      }
    } catch (err) {
      console.warn('Failed to get songs from server:', err);
    }

    return [...DEMO_TRACKS];
  }

  public async search(query: string): Promise<{ artists: Artist[]; albums: Album[]; tracks: Track[] }> {
    const q = query.trim().toLowerCase();
    if (!q) {
      return { artists: [], albums: [], tracks: [] };
    }

    // In demo mode or offline
    const matchedArtists = DEMO_ARTISTS.filter(a => a.name.toLowerCase().includes(q));
    const matchedAlbums = DEMO_ALBUMS.filter(a => a.title.toLowerCase().includes(q) || a.artist.toLowerCase().includes(q));
    const matchedTracks = DEMO_TRACKS.filter(t => t.title.toLowerCase().includes(q) || t.artist.toLowerCase().includes(q) || t.album.toLowerCase().includes(q));

    return {
      artists: matchedArtists,
      albums: matchedAlbums,
      tracks: matchedTracks,
    };
  }
}

export const subsonicService = new SubsonicService();
