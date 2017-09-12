import playlists from '../playlists';

import { UPDATE_PLAYLISTS, UPDATE_MOST, TOGGLE_MOST, TOGGLE_RECENT, UPDATE_RECENT, LOGOUT, DELETE_ACCOUNT } from '../../actionTypes';

const initialState = {
  mostPlayed: { enabled: false },
  recentlyAdded: { enabled: false }
};

const mostPlayedSample = {
  enabled: true,
  length: 20,
  lastfm: 'alastfmname',
  period: '1month'
};

const recentlyAddedSample = {
  enabled: true,
  length: 50
}

describe('playlists reducer', () => {

  it('should set the initial state if no state is given', () =>
    expect(playlists(undefined, { type: 'ABC_GARBAGE' })).toEqual(initialState)
  )

  it('should do nothing if type is unrelated', () =>
    expect(playlists(initialState, { type: 'ABC_GARBAGE' })).toEqual(initialState)
  )

  it('should do nothing if action is undefined', () =>
    expect(playlists(initialState, undefined)).toEqual(initialState)
  )

  it('should populate the playlists state', () =>
    expect(playlists(initialState, {
      type: `${UPDATE_PLAYLISTS}_SUCCESS`,
      info: {
        mostPlayed: mostPlayedSample,
        recentlyAdded: recentlyAddedSample
      }
    })).toEqual({
      mostPlayed: mostPlayedSample,
      recentlyAdded: recentlyAddedSample
    })
  )

  it('should update only the most played enabled status', () =>
    expect(playlists(initialState, {
      type: `${TOGGLE_MOST}_SUCCESS`,
      info: mostPlayedSample

    })).toEqual({
      ...initialState,
      mostPlayed: { enabled: true },
    })
  )

  it('should modify the most played state', () =>
    expect(playlists(initialState, {
      type: `${UPDATE_MOST}_SUCCESS`,
      info: mostPlayedSample
    })).toEqual({
      ...initialState,
      mostPlayed: mostPlayedSample,
    })
  )

  it('should update only the recently added enabled status', () =>
    expect(playlists(initialState, {
      type: `${TOGGLE_RECENT}_SUCCESS`,
      info: recentlyAddedSample

    })).toEqual({
      ...initialState,
      recentlyAdded: { enabled: true },
    })
  )

  it('should modify the recently added state', () =>
    expect(playlists(initialState, {
      type: `${UPDATE_RECENT}_SUCCESS`,
      info: recentlyAddedSample
    })).toEqual({
      ...initialState,
      recentlyAdded: recentlyAddedSample,
    })
  )

  it('should reset to initial state on delete account', () =>
    expect(playlists({
      ...initialState,
      recentlyAdded: recentlyAddedSample,
      mostPlayed: mostPlayedSample
    }, { type: `${DELETE_ACCOUNT}_SUCCESS` })).toEqual(initialState)
  )

  it('should reset to initial state on logout', () =>
    expect(playlists({
      ...initialState,
      recentlyAdded: recentlyAddedSample,
      mostPlayed: mostPlayedSample
    }, { type: `${LOGOUT}_SUCCESS` })).toEqual(initialState)
  )

})