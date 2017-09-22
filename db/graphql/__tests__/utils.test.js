const { getProjection, validMember } = require('../utils');

const fieldASTs = {
  fieldNodes: [{
    selectionSet: {
      selections: [{
        name: { kind: 'Name', value: 'mostPlayed' }
      }, {
        name: { kind: 'Name', value: 'recentlyAdded' }
      }]
    }
  }]
};

describe('Backend Action Type', () => {

  process.env.NODE_ENV = 'development';
  it('should register as valid member if in dev mode', () =>
    expect(validMember({ id: 'bob' }, 'rob')).toBe(true)
  );
  process.env.NODE_ENV = 'production';
  process.env.ADMIN = 'bob';
  it('should register as valid member if is admin', () =>
    expect(validMember({ id: 'bob' }, 'rob')).toBe(true)
  );

  it('should register as valid member if accessing self', () =>
    expect(validMember({ id: 'rob' }, 'rob')).toBe(true)
  );

  it('should register as invalid member if trying to access someone else in production', () =>
    expect(validMember({ id: 'rob' }, 'bob')).toBe(false)
  );

  it('should register as invalid member if trying to access someone else in production while not logged in', () =>
    expect(validMember({}, 'bob')).toBe(false)
  );

  it('should allow admin in without a spotify id', () =>
    expect(validMember({ id: 'bob' })).toBe(true)
  );

  it('should block non-admins without a spotify id', () =>
    expect(validMember({ id: 'rob' })).toBe(false)
  );

  it('should block non-logged in people without a spotify id', () =>
    expect(validMember({})).toBe(false)
  );

  it('should create a mongoose projection', () =>
    expect(getProjection(fieldASTs)).toEqual({ mostPlayed: true, recentlyAdded: true })
  );
});