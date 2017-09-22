const memberType = require('../memberType');
const { GraphQLString, GraphQLInt, GraphQLBoolean } = require('graphql/type');

const mostPlayedType = require('../mostPlayedType');
const recentlyAddedType = require('../recentlyAddedType');

describe('Member Type', () => {
  it('should have a spotifyId field', () =>
    expect(memberType.getFields()).toHaveProperty('spotifyId')
  );

  it('spotifyId field should be of type string', () =>
    expect(memberType.getFields().spotifyId.type).toEqual(GraphQLString)
  );

  it('should have a photo field', () =>
    expect(memberType.getFields()).toHaveProperty('photo')
  );

  it('photo field should be of type string', () =>
    expect(memberType.getFields().photo.type).toEqual(GraphQLString)
  );

  it('should have an isAdmin field', () =>
    expect(memberType.getFields()).toHaveProperty('isAdmin')
  );

  it('isAdmin field should be of type boolean', () =>
    expect(memberType.getFields().isAdmin.type).toEqual(GraphQLBoolean)
  );

  it('should have a visits field', () =>
    expect(memberType.getFields()).toHaveProperty('visits')
  );

  it('visits field should be of type int', () =>
    expect(memberType.getFields().visits.type).toEqual(GraphQLInt)
  );

  it('should have a mostPlayed field', () =>
    expect(memberType.getFields()).toHaveProperty('mostPlayed')
  );

  it('mostPlayed field should be of type mostPlayedType', () =>
    expect(memberType.getFields().mostPlayed.type).toEqual(mostPlayedType)
  );

  it('should have a recentlyAdded field', () =>
    expect(memberType.getFields()).toHaveProperty('recentlyAdded')
  );

  it('recentlyAdded field should be of type recentlyAddedType', () =>
    expect(memberType.getFields().recentlyAdded.type).toEqual(recentlyAddedType)
  );
});