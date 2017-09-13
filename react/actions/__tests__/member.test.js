import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk';
import fetchMock from 'fetch-mock'
import { getMemberInfo, logout, deleteAccount } from '../member';
import { MEMBER_INFO, LOGOUT, DELETE_ACCOUNT } from '../../actionTypes';

Date.now = jest.fn(() => 1234567890)

const middlewares = [thunk]
const mockStore = configureMockStore(middlewares);

describe('member methods', () => {
  fetchMock.getOnce('/member', { success: true })
    .getOnce('/member/logout', { success: true })
    .deleteOnce('/member', { success: true })
    .mock('*', 404)

  it('should get info about the current member', async() => {
    const store = mockStore({});
    await store.dispatch(getMemberInfo())
    return expect(store.getActions()).toEqual([
      { type: `${MEMBER_INFO}_LOADING` },
      { type: `${MEMBER_INFO}_SUCCESS`, info: { success: true }, receivedAt: Date.now() }
    ])
  })

  it('should use get to log out', async() => {
    const store = mockStore({});
    await store.dispatch(logout())
    return expect(store.getActions()).toEqual([
      { type: `${LOGOUT}_LOADING` },
      { type: `${LOGOUT}_SUCCESS`, info: { success: true }, receivedAt: Date.now() }
    ])
  })

  it('should use delete to delete account', async() => {
    const store = mockStore({});
    await store.dispatch(deleteAccount())
    return expect(store.getActions()).toEqual([
      { type: `${DELETE_ACCOUNT}_LOADING` },
      { type: `${DELETE_ACCOUNT}_SUCCESS`, info: {}, receivedAt: Date.now() }
    ])
  })

  it('should fail gracefully if current member isn\'t avalible', async() => {
    const store = mockStore({});
    await store.dispatch(getMemberInfo())
    return expect(store.getActions()).toEqual([
      { type: `${MEMBER_INFO}_LOADING` },
      { type: `${MEMBER_INFO}_FAIL`, error: expect.any(Error) }
    ])
  })

  it('should fail gracefully if logout isn\'t avalible', async() => {
    const store = mockStore({});
    await store.dispatch(logout())
    return expect(store.getActions()).toEqual([
      { type: `${LOGOUT}_LOADING` },
      { type: `${LOGOUT}_FAIL`, error: expect.any(Error) }
    ])
  })

  it('should fail gracefully if delete account isn\'t avalible', async() => {
    const store = mockStore({});
    await store.dispatch(deleteAccount())
    return expect(store.getActions()).toEqual([
      { type: `${DELETE_ACCOUNT}_LOADING` },
      { type: `${DELETE_ACCOUNT}_FAIL`, error: expect.any(Error) }
    ])
  })
})