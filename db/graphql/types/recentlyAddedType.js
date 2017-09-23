// db/graphql/types/recentlyAddedType.js

const { GraphQLBoolean, GraphQLInt, GraphQLObjectType } = require('graphql/type');

const recentlyAddedType = new GraphQLObjectType({
  name: 'recentlyadded',
  description: 'an object containing info about the recently added playlist settings',
  fields: () => ({
    length: { type: (GraphQLInt), description: 'the playlist length' },
    enabled: { type: (GraphQLBoolean), description: 'whether the playlist is enabled' }
  })
});

module.exports = recentlyAddedType;