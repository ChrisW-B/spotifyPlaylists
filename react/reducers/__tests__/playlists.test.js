import playlists from '../playlists';

const initialState = {
  mostPlayed: { enabled: false },
  recentlyAdded: { enabled: false }
};

describe('playlists reducer', () => {
  it('should do nothing if type is unrelated', () =>
    expect(playlists(initialState, { type: 'ABC_GARBAGE' })).toEqual(initialState)
  )

  it('should do nothing if action is undefined', () =>
    expect(playlists(initialState, undefined)).toEqual(initialState)
  )


})