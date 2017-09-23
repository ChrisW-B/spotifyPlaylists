import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk';
import fetchMock from 'fetch-mock'
import { updatePlaylistStatus, toggleMostPlayed, toggleRecentlyAdded, updateMostPlayed, updateRecentlyAdded } from '../playlists';
import { UPDATE_PLAYLISTS, TOGGLE_MOST, TOGGLE_RECENT, UPDATE_MOST, UPDATE_RECENT } from '../../actionTypes';

Date.now = jest.fn(() => 1234567890)

const middlewares = [thunk]
const mockStore = configureMockStore(middlewares);

describe('playlist methods', () => {

  fetchMock
    .post({ matcher: '/graphql', times: 5, response: { success: true } })
    .mock('*', 404)

  it('should get status of playlists', async() => {
    const store = mockStore({});
    await store.dispatch(updatePlaylistStatus())
    return expect(store.getActions()).toEqual([
      { type: `${UPDATE_PLAYLISTS}_LOADING` },
      { type: `${UPDATE_PLAYLISTS}_SUCCESS`, receivedAt: Date.now() }
    ])
  })

  it('should toggle the most played playlist', async() => {
    const store = mockStore({});
    await store.dispatch(toggleMostPlayed(false))
    return expect(store.getActions()).toEqual([
      { type: `${TOGGLE_MOST}_LOADING` },
      { type: `${TOGGLE_MOST}_SUCCESS`, receivedAt: Date.now() }
    ])
  })

  it('should toggle the recently added playlist', async() => {
    const store = mockStore({});
    await store.dispatch(toggleRecentlyAdded(true))
    return expect(store.getActions()).toEqual([
      { type: `${TOGGLE_RECENT}_LOADING` },
      { type: `${TOGGLE_RECENT}_SUCCESS`, receivedAt: Date.now() }
    ])
  })

  it('should update the most played playlist', async() => {
    const store = mockStore({});
    await store.dispatch(updateMostPlayed({ enable: true, length: 10, lastfm: 'christo27' }))
    return expect(store.getActions()).toEqual([
      { type: `${UPDATE_MOST}_LOADING` },
      { type: `${UPDATE_MOST}_SUCCESS`, receivedAt: Date.now() }
    ])
  })

  it('should update the recently added playlist', async() => {
    const store = mockStore({});
    await store.dispatch(updateRecentlyAdded({ enable: true, length: 10 }))
    return expect(store.getActions()).toEqual([
      { type: `${UPDATE_RECENT}_LOADING` },
      { type: `${UPDATE_RECENT}_SUCCESS`, receivedAt: Date.now() }
    ])
  })

  it('updatePlaylistStatus should fail gracefully', async() => {
    const store = mockStore({});
    await store.dispatch(updatePlaylistStatus())
    return expect(store.getActions()).toEqual([
      { type: `${UPDATE_PLAYLISTS}_LOADING` },
      { type: `${UPDATE_PLAYLISTS}_FAIL`, error: expect.any(Error) }
    ])
  })

  it('toggleMostPlayed should fail gracefully', async() => {
    const store = mockStore({});
    await store.dispatch(toggleMostPlayed(true))
    return expect(store.getActions()).toEqual([
      { type: `${TOGGLE_MOST}_LOADING` },
      { type: `${TOGGLE_MOST}_FAIL`, error: expect.any(Error) }
    ])
  })

  it('toggleRecentlyAdded should fail gracefully', async() => {
    const store = mockStore({});
    await store.dispatch(toggleRecentlyAdded(false))
    return expect(store.getActions()).toEqual([
      { type: `${TOGGLE_RECENT}_LOADING` },
      { type: `${TOGGLE_RECENT}_FAIL`, error: expect.any(Error) }
    ])
  })

  it('updateMostPlayed should fail gracefully', async() => {
    const store = mockStore({});
    await store.dispatch(updateMostPlayed({ enable: true, length: 10, lastfm: 'christo27' }))
    return expect(store.getActions()).toEqual([
      { type: `${UPDATE_MOST}_LOADING` },
      { type: `${UPDATE_MOST}_FAIL`, error: expect.any(Error) }
    ])
  })

  it('updateRecentlyAdded should fail gracefully', async() => {
    const store = mockStore({});
    await store.dispatch(updateRecentlyAdded({ enable: true, length: 10 }))
    return expect(store.getActions()).toEqual([
      { type: `${UPDATE_RECENT}_LOADING` },
      { type: `${UPDATE_RECENT}_FAIL`, error: expect.any(Error) }
    ])
  })

})