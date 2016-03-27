# Spotify AutoPlaylists by Chris Barry
A nodejs/express based web app that contains a website and 2 backend services

Available [here](http://spotifyapps.chriswbarry.com/ "SpotifyApps")

## Website Folder
This contains the website itself, where users can register for access. It saves authenticated user info in data/[playlisttype].json
It also allows user info to be deleted by authenticated users

## recentlyAdded Folder
Contains a node.js script that finds the most recently added songs in a spotify account and makes a playlist out of them

## mostPlayed Folder
Contains a node.js script that uses the Last.fm ID provided to create a playlist of the top 50 most played songs in the last month
If it cannot find the song on Spotify, it ignores it and does not add it to the playlist


