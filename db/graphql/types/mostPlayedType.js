const { GraphQLString, GraphQLBoolean, GraphQLInt, GraphQLObjectType } = require('graphql/type');

const mostPlayedType = new GraphQLObjectType({
  name: 'mostplayed',
  description: 'an object containing info about the most played playlist settings',
  fields: () => ({
    period: { type: (GraphQLString), description: 'the time period to play songs from' },
    lastfm: { type: (GraphQLString), description: 'the last fm id to pick most played songs from' },
    length: { type: (GraphQLInt), description: 'the playlist length' },
    enabled: { type: (GraphQLBoolean), description: 'whether the playlist is enabled' }
  })
});

module.exports = mostPlayedType;