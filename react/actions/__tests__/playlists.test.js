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
    .getOnce('/playlists', { success: true })
    .postOnce('/playlists/most/toggle', (_, { body }) => ({ body }))
    .postOnce('/playlists/recent/toggle', (_, { body }) => ({ body }))
    .postOnce('/playlists/most/save', (_, { body }) => ({ body }))
    .postOnce('/playlists/recent/save', (_, { body }) => ({ body }))
    .mock('*', 404)

  it('should get status of playlists', async() => {
    const store = mockStore({});
    await store.dispatch(updatePlaylistStatus())
    return expect(store.getActions()).toEqual([
      { type: `${UPDATE_PLAYLISTS}_LOADING` },
      { type: `${UPDATE_PLAYLISTS}_SUCCESS`, info: { success: true }, receivedAt: Date.now() }
    ])
  })

  it('should toggle the most played playlist', async() => {
    const store = mockStore({});
    await store.dispatch(toggleMostPlayed(false))
    return expect(store.getActions()).toEqual([
      { type: `${TOGGLE_MOST}_LOADING`, enable: false },
      { type: `${TOGGLE_MOST}_SUCCESS`, info: { enable: false }, receivedAt: Date.now() }
    ])
  })

  it('should toggle the recently added playlist', async() => {
    const store = mockStore({});
    await store.dispatch(toggleRecentlyAdded(true))
    return expect(store.getActions()).toEqual([
      { type: `${TOGGLE_RECENT}_LOADING`, enable: true },
      { type: `${TOGGLE_RECENT}_SUCCESS`, info: { enable: true }, receivedAt: Date.now() }
    ])
  })

  it('should update the most played playlist', async() => {
    const store = mockStore({});
    await store.dispatch(updateMostPlayed({ enable: true, length: 10, lastfm: 'christo27' }))
    return expect(store.getActions()).toEqual([
      { type: `${UPDATE_MOST}_LOADING`, enable: true, length: 10, lastfm: 'christo27' },
      { type: `${UPDATE_MOST}_SUCCESS`, info: { enable: true, length: 10, lastfm: 'christo27' }, receivedAt: Date.now() }
    ])
  })

  it('should update the recently added playlist', async() => {
    const store = mockStore({});
    await store.dispatch(updateRecentlyAdded({ enable: true, length: 10 }))
    return expect(store.getActions()).toEqual([
      { type: `${UPDATE_RECENT}_LOADING`, enable: true, length: 10 },
      { type: `${UPDATE_RECENT}_SUCCESS`, info: { enable: true, length: 10 }, receivedAt: Date.now() }
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
      { type: `${TOGGLE_MOST}_LOADING`, enable: true },
      { type: `${TOGGLE_MOST}_FAIL`, error: expect.any(Error) }
    ])
  })

  it('toggleRecentlyAdded should fail gracefully', async() => {
    const store = mockStore({});
    await store.dispatch(toggleRecentlyAdded(false))
    return expect(store.getActions()).toEqual([
      { type: `${TOGGLE_RECENT}_LOADING`, enable: false },
      { type: `${TOGGLE_RECENT}_FAIL`, error: expect.any(Error) }
    ])
  })

  it('updateMostPlayed should fail gracefully', async() => {
    const store = mockStore({});
    await store.dispatch(updateMostPlayed({ enable: true, length: 10, lastfm: 'christo27' }))
    return expect(store.getActions()).toEqual([
      { type: `${UPDATE_MOST}_LOADING`, enable: true, length: 10, lastfm: 'christo27' },
      { type: `${UPDATE_MOST}_FAIL`, error: expect.any(Error) }
    ])
  })

  it('updateRecentlyAdded should fail gracefully', async() => {
    const store = mockStore({});
    await store.dispatch(updateRecentlyAdded({ enable: true, length: 10 }))
    return expect(store.getActions()).toEqual([
      { type: `${UPDATE_RECENT}_LOADING`, enable: true, length: 10 },
      { type: `${UPDATE_RECENT}_FAIL`, error: expect.any(Error) }
    ])
  })

})