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

const config = {};
config.mostPlayed = {};
config.recentlyAdded = {};
config.lastfm = {};

config.mostPlayed = {
    scopes: ['playlist-read-private', 'playlist-modify-private', 'playlist-modify-public'],
    clientId: 'XXX',
    clientSecret: 'YYY',
    redirectUri: 'http://localhost:5621/setup/mostplayed',
    cancelUri: 'http://localhost:5621/stop/mostplayed/callback'
};

config.recentlyAdded = {
    scopes: ['user-read-private', 'playlist-read-private', 'playlist-modify-private', 'playlist-modify-public', 'user-library-read'],
    clientId: 'ZZZ',
    clientSecret: 'AAA',
    redirectUri: 'http://localhost:5621/setup/recentlyadded',
    cancelUri: 'http://localhost:5621/stop/recentlyadded/callback'
};

config.lastfm = {
    token: 'BBB',
    secret: 'ZZZ',
    username: 'name',
    password: 'pass'
};

module.exports = config;

```

