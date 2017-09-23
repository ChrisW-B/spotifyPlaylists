// db/graphql/types/updatePlaylistType.js

const { GraphQLInputObjectType, GraphQLString, GraphQLBoolean, GraphQLInt } = require('graphql/type');

const updatePlaylistType = new GraphQLInputObjectType({
  name: 'updatePlaylistType',
  description: 'an object containing info about changes to a playlist',
  fields: () => ({
    length: { type: (GraphQLInt), description: 'the playlist length' },
    period: { type: (GraphQLString), description: 'the time period to play songs from' },
    lastfm: { type: (GraphQLString), description: 'the last fm id to pick most played songs from' },
    enabled: { type: (GraphQLBoolean), description: 'whether the playlist is enabled' }
  })
});

module.exports = updatePlaylistType;