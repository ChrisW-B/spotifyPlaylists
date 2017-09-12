import { loading } from '..';

const state = {
  bob: 'uncle'
}

describe('loading action', () => {
  it('should return the current state and a loading type', () =>
    expect(loading('ABC', state)).toEqual({ type: 'ABC_LOADING', ...state })
  )

  it('should still return with no state', () =>
    expect(loading('DEF')).toEqual({ type: 'DEF_LOADING' })
  )
})