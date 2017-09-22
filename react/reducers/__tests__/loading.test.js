import loading from '../loading';

const initialState = {
  loadingState: {},
  loading: false,
  failed: false
};

describe('loading reducer', () => {
  it('should return the initial state', () =>
    expect(loading(undefined, {})).toEqual(initialState)
  )

  it('should return the initial state', () =>
    expect(loading()).toEqual(initialState)
  )

  it('should a loading state', () =>
    expect(loading(undefined, { type: 'ABC_LOADING' })).toEqual({
      ...initialState,
      loadingState: { 'ABC': true },
      loading: true,
    })
  )

  it('should return a not loading state', () =>
    expect(loading({ ...initialState, loadingState: { 'ABC': true }, loading: true }, { type: 'ABC_SUCCESS' })).toEqual(initialState)
  )

  it('should do nothing if there\'s not a loading, success, or fail', () =>
    expect(loading(initialState, { type: 'ABC_GARBAGE' })).toEqual(initialState)
  )

  it('should remove the successful loading state', () =>
    expect(loading({ ...initialState, loadingState: { 'ABC': true, 'DEF': true }, loading: true }, { type: 'ABC_SUCCESS' })).toEqual({
      ...initialState,
      loadingState: { 'DEF': true },
      loading: true,
    })
  )

  it('should mark loading as failed', () =>
    expect(loading({ ...initialState, loadingState: { 'ABC': true }, loading: true }, { type: 'ABC_FAIL' })).toEqual({
      ...initialState,
      failed: true
    })
  )

})