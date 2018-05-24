// db/graphql/types/backendActionType.js

const { GraphQLObjectType, GraphQLBoolean } = require('graphql/type');

const backendActionType = new GraphQLObjectType({
  name: 'backendAction',
  description: 'did the server do what we wanted?',
  fields: () => ({
    success: { type: (GraphQLBoolean), description: 'whether it did what we wanted' },
  }),
});

module.exports = backendActionType;