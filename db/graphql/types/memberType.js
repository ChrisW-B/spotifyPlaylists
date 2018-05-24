// db/graphql/types/memberType.js

const {
  GraphQLString, GraphQLInt, GraphQLObjectType, GraphQLBoolean,
} = require('graphql/type');
const mostPlayedType = require('./mostPlayedType');
const recentlyAddedType = require('./recentlyAddedType');

const memberType = new GraphQLObjectType({
  name: 'member',
  description: 'a member',
  fields: () => ({
    spotifyId: { type: (GraphQLString), description: 'The spotify id of the member' },
    photo: { type: (GraphQLString), description: 'a photo of the member' },
    isAdmin: { type: (GraphQLBoolean), description: 'whether the member is an admin' },
    visits: { type: (GraphQLInt), description: 'The number of times a person has visited' },
    mostPlayed: { type: (mostPlayedType), description: 'The member\'s most played playlist info' },
    recentlyAdded: { type: (recentlyAddedType), description: 'The member\'s recently added playlist info' },
  }),
});

module.exports = memberType;