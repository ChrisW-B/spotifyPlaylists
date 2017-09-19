const { GraphQLString, GraphQLInt, GraphQLObjectType } = require('graphql/type');
const mostPlayedType = require('./mostPlayedType');
const recentlyAddedType = require('./recentlyAddedType');

const memberType = new GraphQLObjectType({
  name: 'member',
  description: 'a member',
  fields: () => ({
    spotifyId: { type: (GraphQLString), description: 'The spotify id of the member' },
    visits: { type: (GraphQLInt), description: 'The number of times a person has visited' },
    // refreshToken: { type: (GraphQLString), description: 'The spotify refresh token' },
    // accessToken: { type: (GraphQLString), description: 'The spotify access token' },
    mostPlayed: { type: (mostPlayedType), description: 'The member\'s most played playlist info' },
    recentlyAdded: { type: (recentlyAddedType), description: 'The member\'s recently added playlist info' }
  })
});

module.exports = memberType;