import { receiveData } from '..';

Date.now = jest.fn(() => 1234567890)

const info = {
  bob: 'uncle'
}

describe('receiveData action', () => {
  it('should return the current state and a loading type', () =>
    expect(receiveData('ABC', info)).toEqual({ type: 'ABC_SUCCESS', receivedAt: Date.now(), ...info })
  )

  it('should still return with no state', () =>
    expect(receiveData('DEF')).toEqual({ type: 'DEF_SUCCESS', receivedAt: Date.now() })
  )
})