export const SPOTIFY_CLIENT_ID = "4cb8863c3be24b40942bcb88fb45d603";
export const SPOTIFY_REDIRECT_URI = "exp://localhost:19000"; // URI untuk development di Expo
export const SPOTIFY_SCOPES = [
  'streaming',
  'user-read-email',
  'user-read-private',
  'user-read-playback-state',
  'user-modify-playback-state'
].join(' '); 