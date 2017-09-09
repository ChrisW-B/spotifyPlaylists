# Spotify AutoPlaylists by Chris Barry
[![Build Status](https://travis-ci.org/ChrisW-B/spotifyPlaylists.svg)](https://travis-ci.org/ChrisW-B/spotifyPlaylists)


A nodejs/express based web app that contains a website and 2 backend services

Available [here](http://spotifyapps.chriswbarry.com/ "SpotifyApps")

To use this, you need to have [redis](http://redis.io/topics/quickstart) installed

## ./server

### ./routes
Handle the API

## ./server/Playlists
### mostPlayed.js
Updates a Spotify playlist based on the most played Last.FM tracks


### recentlyAdded.js
Updates a Spotify playlist based on recently added Spotify tracks

### Playlist.js
The playlist parent class, contains everything the app needs for making/editing/clearing/updating spotify playlists


## Config

The app is configured though environment variables. A sample .env file might look like

```
SPOTIFY_SCOPES=user-read-private,playlist-read-private,playlist-modify-private,playlist-modify-public,user-library-read
SPOTIFY_ID=YOUR_SPOTIFY_APP_ID
SPOTIFY_SECRET=YOUR_SPOTIFY_SECRET_ID
SPOTIFY_REDIRECT=//localhost:5621/member/setup/
LASTFM_TOKEN=YOUR_LASTFM_TOKEN
LASTFM_SECRET=YOUR_LASTFM_SECRET
LASTFM_USERNAME=YOUR_LASTFM_USERNAME
LASTFM_PASS=YOUR_LASTFM_PASSWORD
SECRET=A_SECRET_KEY
ADMIN=YOUR_SPOTIFY_ID
GITHUB_SECRET=YOUR_GITHUB_SECRET
```