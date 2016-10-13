# Spotify AutoPlaylists by Chris Barry
A nodejs/express based web app that contains a website and 2 backend services

Available [here](http://spotifyapps.chriswbarry.com/ "SpotifyApps")

To use this, you need to have [redis](http://redis.io/topics/quickstart) installed 

## Website Folder
This contains the website itself, where users can register for access. It saves authenticated user info in data/[playlisttype].json
It also allows user info to be deleted by authenticated users

## recentlyAdded Folder
Contains a node.js script that finds the most recently added songs in a spotify account and makes a playlist out of them

## mostPlayed Folder
Contains a node.js script that uses the Last.fm ID provided to create a playlist of the top 50 most played songs in the last month
If it cannot find the song on Spotify, it ignores it and does not add it to the playlist

## Config File
Your config files should look similar to the following

### For Website
```javascript

var config = {};
config.mostPlayed = {};
config.recentlyAdded = {};

config.mostPlayed = {
    scopes: ['playlist-read-private', 'playlist-modify-private', 'playlist-modify-public'],
    clientId: 'XXX',
    clientSecret: 'XXX',
    redirectUri: 'http://[your website here]/mostplayed/callback',
    cancelUri: 'http://[your website here]/stop/mostPlayed/callback',
};

config.recentlyAdded = {
    scopes: ['user-read-private', 'playlist-read-private', 'playlist-modify-private', 'playlist-modify-public', 'user-library-read'],
    clientId: 'YYY',
    clientSecret: 'YYY',
    redirectUri: 'http://[your website here]/recentlyAdded/callback',
    cancelUri: 'http://[your website here]/stop/recentlyAdded/callback',
};

module.exports = config;

```

### For mostPlayed
```javascript

var config = {};
config.spotify = {};
config.lastfm = {};

config.spotify = {
    token: 'XXX',
    secret: 'XXX',
}

config.lastfm = {
    token: 'ZZZ',
    secret: 'ZZZ',
    username: 'lastfmuser',
    password: 'lastfmpass'
}

module.exports = config;

```

### For recentlyAdded
```javascript

var config = {
    clientId: 'YYY',
    clientSecret: 'YYY'
};

module.exports = config;

```
