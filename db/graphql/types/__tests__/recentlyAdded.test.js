// db/graphql/types/__tests__/recentlyAdded.test.js

const recentlyAddedType = require('../recentlyAddedType');
const { GraphQLBoolean, GraphQLInt } = require('graphql/type');

describe('Recently Added Type', () => {
  it('should have an length field', () =>
    expect(recentlyAddedType.getFields()).toHaveProperty('length')
  );

  it('length field should be of type boolean', () =>
    expect(recentlyAddedType.getFields().length.type).toEqual(GraphQLInt)
  );

  it('should have a enabled field', () =>
    expect(recentlyAddedType.getFields()).toHaveProperty('enabled')
  );

  it('enabled field should be of type int', () =>
    expect(recentlyAddedType.getFields().enabled.type).toEqual(GraphQLBoolean)
  );
});