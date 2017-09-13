import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk';
import fetchMock from 'fetch-mock'
import { reloadMost, reloadRecent } from '../admin';
import { ADMIN_MOST, ADMIN_RECENT } from '../../actionTypes';

Date.now = jest.fn(() => 1234567890)

const middlewares = [thunk]
const mockStore = configureMockStore(middlewares);

describe('admin methods', () => {
  fetchMock
    .postOnce('/admin/forceMost', { success: true })
    .postOnce('/admin/forceRecent', { success: true })
    .mock('*', 404)

  it('should use get request', async() => {
    const store = mockStore({});
    await store.dispatch(reloadMost())
    return expect(store.getActions()).toEqual([
      { type: `${ADMIN_MOST}_LOADING` },
      { type: `${ADMIN_MOST}_SUCCESS`, info: { success: true }, receivedAt: Date.now() }
    ])
  })

  it('should fail gracefully', async() => {
    const store = mockStore({});
    await store.dispatch(reloadMost())
    return expect(store.getActions()).toEqual([
      { type: `${ADMIN_MOST}_LOADING` },
      { type: `${ADMIN_MOST}_FAIL`, error: expect.any(Error) }
    ])
  })

  it('should use get request', async() => {
    const store = mockStore({});
    await store.dispatch(reloadRecent())
    return expect(store.getActions()).toEqual([
      { type: `${ADMIN_RECENT}_LOADING` },
      { type: `${ADMIN_RECENT}_SUCCESS`, info: { success: true }, receivedAt: Date.now() }
    ])
  })

  it('should use get request', async() => {
    const store = mockStore({});
    await store.dispatch(reloadRecent())
    return expect(store.getActions()).toEqual([
      { type: `${ADMIN_RECENT}_LOADING` },
      { type: `${ADMIN_RECENT}_FAIL`, error: expect.any(Error) }
    ])
  })

})