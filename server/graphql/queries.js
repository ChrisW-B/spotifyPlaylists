const {
  GraphQLObjectType,
  GraphQLString,
  GraphQLList
} = require('graphql/type');
const { getProjection } = require('./utils');
const { Member } = require('../mongoose/schema');
const memberType = require('./types/memberType');

const queries = new GraphQLObjectType({
  name: 'RootQueryType',
  description: 'Everything we can look up',
  fields: () => ({
    member: {
      type: memberType,
      args: {
        spotifyId: {
          name: 'spotifyId',
          type: GraphQLString
        }
      },
      resolve: async (root, { spotifyId }, source, fieldASTs) => {
        // allow admin and dev environments to view specific members
        const id = (spotifyId && (process.env.NODE_ENV !== 'production' || source.user.id === process.env.ADMIN))
          ? spotifyId
          : source.user.id;
        return Member.findOne({ spotifyId: id }, getProjection(fieldASTs)).exec();
      }
    },
    members: {
      type: new GraphQLList(memberType),
      resolve: async (root, _, source, fieldASTs) => {
        // don't allow non admins to view full member list
        if (process.env.NODE_ENV === 'production' && source.user.id !== process.env.ADMIN) return {};
        return Member.find({}, getProjection(fieldASTs)).exec();
      }
    }
  })
});

module.exports = queries;