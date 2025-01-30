import Constants from 'expo-constants';

export const SPOTIFY_CLIENT_ID = Constants.expoConfig?.extra?.spotifyClientId;
export const SPOTIFY_REDIRECT_URI = Constants.expoConfig?.extra?.spotifyRedirectUri;
export const SPOTIFY_SCOPES = [
  'streaming',
  'user-read-email',
  'user-read-private',
  'user-read-playback-state',
  'user-modify-playback-state'
].join(' '); 