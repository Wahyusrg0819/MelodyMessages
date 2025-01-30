import { SPOTIFY_CLIENT_ID, SPOTIFY_REDIRECT_URI, SPOTIFY_SCOPES } from '../config/spotify';
import { makeRedirectUri, useAuthRequest } from 'expo-auth-session';
import { encode as base64Encode } from 'base-64';
import Constants from 'expo-constants';

let spotifyAccessToken = null;

export const getSpotifyAuthToken = async () => {
  if (spotifyAccessToken) return spotifyAccessToken;

  const clientId = SPOTIFY_CLIENT_ID;
  const clientSecret = Constants.expoConfig?.extra?.spotifyClientSecret;

  const basic = base64Encode(`${clientId}:${clientSecret}`);
  
  try {
    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${basic}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials'
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    if (!data.access_token) {
      throw new Error('No access token received from Spotify');
    }

    spotifyAccessToken = data.access_token;
    return spotifyAccessToken;
  } catch (error) {
    console.error('Error getting Spotify token:', error);
    throw error;
  }
};

export const searchTracks = async (query) => {
  try {
    const token = await getSpotifyAuthToken();
    console.log('Search query:', query);
    
    const searchUrl = `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=10`;
    console.log('Search URL:', searchUrl);
    
    const response = await fetch(searchUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Spotify API error:', errorData);
      throw new Error(`Spotify API error: ${response.status} - ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    console.log('Spotify response:', data);

    if (!data.tracks || !data.tracks.items) {
      console.error('Invalid response format:', data);
      throw new Error('Invalid response format from Spotify API - tracks or items not found');
    }

    return data.tracks.items;
  } catch (error) {
    console.error('Error searching tracks:', error);
    throw error;
  }
};

export const getTrackDetails = async (trackId) => {
  try {
    const token = await getSpotifyAuthToken();
    const response = await fetch(
      `https://api.spotify.com/v1/tracks/${trackId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return await response.json();
  } catch (error) {
    console.error('Error getting track details:', error);
    throw error;
  }
}; 