const {
  GraphQLObjectType,
  GraphQLString,
  GraphQLList
} = require('graphql/type');
const { getProjection, validMember } = require('./utils');
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
      resolve: async (_, { spotifyId }, { user }, fieldASTs) => {
        // allow admin and dev environments to view specific members
        if (!validMember(user, spotifyId)) return {};
        const id = (spotifyId && (process.env.NODE_ENV !== 'production' || user.id === process.env.ADMIN))
          ? spotifyId
          : user.id;
        return Member.findOne({ spotifyId: id }, getProjection(fieldASTs)).exec();
      }
    },
    members: {
      type: new GraphQLList(memberType),
      resolve: async (_, __, { user }, fieldASTs) => {
        // don't allow non admins to view full member list
        if (process.env.NODE_ENV === 'production' && user.id !== process.env.ADMIN) return {};
        return Member.find({}, getProjection(fieldASTs)).exec();
      }
    }
  })
});

module.exports = queries;