const { GraphQLSchema } = require('graphql/type');
const query = require('./queries');
const mutation = require('./mutations');

module.exports = new GraphQLSchema({ mutation, query });