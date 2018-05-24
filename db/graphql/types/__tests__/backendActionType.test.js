// db/graphql/types/__tests__/backendActionType.test.js
const backendActionType = require('../backendActionType');
const { GraphQLBoolean } = require('graphql/type');

describe('Backend Action Type', () => {
  it('should have a success field', () =>
    expect(backendActionType.getFields()).toHaveProperty('success'));

  it('success field should be of type boolean', () =>
    expect(backendActionType.getFields().success.type).toEqual(GraphQLBoolean));
});