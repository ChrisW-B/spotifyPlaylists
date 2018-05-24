// db/graphql/types/__tests__/mostPlayedType.test.js

const mostPlayedType = require('../mostPlayedType');
const { GraphQLString, GraphQLBoolean, GraphQLInt } = require('graphql/type');

describe('Most Played Type', () => {
  it('should have a period field', () =>
    expect(mostPlayedType.getFields()).toHaveProperty('period'));

  it('period field should be of type string', () =>
    expect(mostPlayedType.getFields().period.type).toEqual(GraphQLString));

  it('should have a lastfm field', () =>
    expect(mostPlayedType.getFields()).toHaveProperty('lastfm'));

  it('lastfm field should be of type string', () =>
    expect(mostPlayedType.getFields().lastfm.type).toEqual(GraphQLString));

  it('should have an length field', () =>
    expect(mostPlayedType.getFields()).toHaveProperty('length'));

  it('length field should be of type boolean', () =>
    expect(mostPlayedType.getFields().length.type).toEqual(GraphQLInt));

  it('should have a enabled field', () =>
    expect(mostPlayedType.getFields()).toHaveProperty('enabled'));

  it('enabled field should be of type int', () =>
    expect(mostPlayedType.getFields().enabled.type).toEqual(GraphQLBoolean));
});