# Spotify AutoPlaylists by Chris Barry
A nodejs/express based web app that contains a website and 2 backend services

Available [here](http://spotifyapps.chriswbarry.com/ "SpotifyApps")

To use this, you need to have [redis](http://redis.io/topics/quickstart) installed 

## app.js
Manages website and signing up/in, also runs mostPlayed and recentlyAdded every 5 hours

## mostPlayed.js
Updates a Spotify playlist based on the most played Last.FM tracks

## recentlyAdded.js
Updates a Spotify playlist based on recently added Spotify tracks

## Config File
Your config file should look similar to the following

### For Website
```javascript
'use strict';

var config = {};
config.spotify = {};
config.lastfm = {};

config.spotify = {
    scopes: ['user-read-private', 'playlist-read-private', 'playlist-modify-private', 'playlist-modify-public', 'user-library-read'],
    clientId: 'XXXX',
    clientSecret: 'YYYY',
    redirectUri: 'http://localhost:5621/setup/',
};

config.lastfm = {
    token: 'AAAA',
    secret: 'BBBBB',
    username: 'User',
    password: 'Pass1'
};

config.secret = 'ZZZZ';
config.admin = 'YOUR_SPOTIFY_ID';

module.exports = config;

```

