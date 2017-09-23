// db/graphql/types/__tests__/updatePlaylistType.js

const updatePlaylist = require('../updatePlaylistType');
const { GraphQLString, GraphQLBoolean, GraphQLInt } = require('graphql/type');

describe('Update Playlist Type', () => {
  it('should have a period field', () =>
    expect(updatePlaylist.getFields()).toHaveProperty('period')
  );

  it('period field should be of type string', () =>
    expect(updatePlaylist.getFields().period.type).toEqual(GraphQLString)
  );

  it('should have a lastfm field', () =>
    expect(updatePlaylist.getFields()).toHaveProperty('lastfm')
  );

  it('lastfm field should be of type string', () =>
    expect(updatePlaylist.getFields().lastfm.type).toEqual(GraphQLString)
  );

  it('should have an length field', () =>
    expect(updatePlaylist.getFields()).toHaveProperty('length')
  );

  it('length field should be of type boolean', () =>
    expect(updatePlaylist.getFields().length.type).toEqual(GraphQLInt)
  );

  it('should have a enabled field', () =>
    expect(updatePlaylist.getFields()).toHaveProperty('enabled')
  );

  it('enabled field should be of type int', () =>
    expect(updatePlaylist.getFields().enabled.type).toEqual(GraphQLBoolean)
  );
});