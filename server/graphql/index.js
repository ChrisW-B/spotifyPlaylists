const {
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLString,
  GraphQLInt,
  GraphQLBoolean,
  GraphQLList,
  GraphQLNonNull
} = require('graphql/type');

const { Member } = require('../mongoose/schema');
const memberType = require('./memberType');

const getProjection = fieldASTs =>
  fieldASTs.fieldNodes[0].selectionSet.selections.reduce((projections, selection) => {
    const newProjections = projections;
    newProjections[selection.name.value] = true;
    return newProjections;
  }, {});

const schema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: 'RootQueryType',
    fields: {
      member: {
        type: memberType,
        args: {
          spotifyId: {
            name: 'spotifyId',
            type: new GraphQLNonNull(GraphQLString)
          }
        },
        resolve: async(root, { spotifyId }, source, fieldASTs) => {
          console.log(source.user.id);
          if (source.user.id !== spotifyId && source.user.id !== process.env.ADMIN) return {};
          const projections = getProjection(fieldASTs);
          const foundItems = await Member.findOne({ spotifyId }, projections).exec();
          return foundItems;
        }
      }
    }
  })
});

module.exports = schema;