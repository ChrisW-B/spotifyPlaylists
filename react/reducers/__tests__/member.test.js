import member from '../member';
import { MEMBER_INFO, LOGOUT, DELETE_ACCOUNT, TOGGLE_RECENT } from '../../actionTypes';

const initialState = {
  spotifyId: '',
  photo: '',
  isAdmin: false
};

describe('member reducer', () => {
  it('should return the initial state', () =>
    expect(member(undefined, {type: 'ABC_GARBAGE'})).toEqual(initialState)
  )

  it('should populate the member\'s info', () =>
    expect(member(initialState, {
      type: `${MEMBER_INFO}_SUCCESS`,
      member: {
        ...initialState,
        spotifyId: 'aperson',
        photo: 'https://photo.url',
        isAdmin: false
      }
    })).toEqual({
      ...initialState,
      spotifyId: 'aperson',
      photo: 'https://photo.url',
      isAdmin: false
    })
  )

  it('should reset to initial state on delete account', () =>
    expect(member({
      ...initialState,
      spotifyId: 'aperson',
      photo: 'https://photo.url',
      isAdmin: false
    }, { type: `${DELETE_ACCOUNT}_SUCCESS` })).toEqual(initialState)
  )

  it('should reset to initial state on logout', () =>
    expect(member({
      ...initialState,
      spotifyId: 'aperson',
      photo: 'https://photo.url',
      isAdmin: false
    }, { type: `${LOGOUT}_SUCCESS` })).toEqual(initialState)
  )

  it('should not affect the member state', () =>
    expect(member({
      ...initialState,
      spotifyId: 'aperson',
      photo: 'https://photo.url',
      isAdmin: false
    }, {
      type: `${TOGGLE_RECENT}_SUCCESS`,
      info: { garbage: 'hi' }
    })).toEqual({
      ...initialState,
      spotifyId: 'aperson',
      photo: 'https://photo.url',
      isAdmin: false
    })
  )

  it('should do nothing if type is unrelated', () =>
    expect(member(initialState, { type: 'ABC_GARBAGE' })).toEqual(initialState)
  )

  it('should do nothing if action is undefined', () =>
    expect(member(initialState, undefined)).toEqual(initialState)
  )
})