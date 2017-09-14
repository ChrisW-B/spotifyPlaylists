const sinon = require('sinon');
const utils = require('../');
const MostPlayed = require('../../Playlists/mostPlayed');
const RecentlyAdded = require('../../Playlists/recentlyAdded');
const winston = require('winston');

describe('server utils', () => {
  beforeEach(() => {
    process.env.SPOTIFY_SCOPES = 'user-read-private,playlist-read-private,playlist-modify-private,playlist-modify-public,user-library-read';
    process.env.SPOTIFY_ID = 'AAAAAAAAAAAAAAA';
    process.env.SPOTIFY_SECRET = 'BBBBBBBBBBBBBBB';
    process.env.SPOTIFY_REDIRECT = '//localhost:5621/member/setup/';
    process.env.LASTFM_TOKEN = 'CCCCCCCCCCCCCCC';
    process.env.LASTFM_SECRET = 'DDDDDDDDDDDDDDD';
    process.env.LASTFM_USERNAME = 'A_USER';
    process.env.LASTFM_PASS = 'A_PASSWORD';
    process.env.SECRET = 'A_SECRET';
    process.env.ADMIN = 'anAdmin';
    process.env.GITHUB_SECRET = 'GITHUB_SECRET';
  });

  it('should call next() once if the user is isAuthenticated', () => {
    const nextSpy = sinon.spy();
    let status = null;
    utils.ensureAuthenticated({
      isAuthenticated: () => true
    }, {
      sendStatus: (info) => { status = info; }
    }, nextSpy);
    expect(nextSpy.calledOnce).toEqual(true);
    expect(status).toBe(null);
  });

  it('should send a 401 error if user is not authenticated', () => {
    const nextSpy = sinon.spy();
    let status = null;
    utils.ensureAuthenticated({
      isAuthenticated: () => false
    }, {
      sendStatus: (info) => { status = info; }
    }, nextSpy);
    expect(status).toEqual(401);
    expect(nextSpy.calledOnce).toEqual(false);
  });

  it('should call next() once if the user is isAuthenticated', () => {
    const nextSpy = sinon.spy();
    let status = null;
    utils.ensureAdmin({ user: { id: 'anAdmin' } }, { sendStatus: (info) => { status = info; } }, nextSpy);
    expect(nextSpy.calledOnce).toEqual(true);
    expect(status).toBe(null);
  });

  it('should send a 401 error if user is not authenticated', () => {
    const nextSpy = sinon.spy();
    let status = null;
    utils.ensureAdmin({ user: { id: 'abcd' } }, { sendStatus: (info) => { status = info; } }, nextSpy);
    expect(status).toEqual(403);
    expect(nextSpy.calledOnce).toEqual(false);
  });

  it('should send a 301 redirect if user is not github', () => {
    const nextSpy = sinon.spy();
    let status = null;
    utils.ensureGithub({ get: () => 'hello', headers: { 'user-agent': 'Moz' }, body: { hi: 'hello' } }, { redirect: (info) => { status = info; } }, nextSpy);
    expect(status).toEqual(301);
    expect(nextSpy.calledOnce).toEqual(false);
  });

  it('should be an instance of most played', () =>
    expect(utils.mostPlayed).toBeInstanceOf(MostPlayed)
  );

  it('should be an instance of recently added', () =>
    expect(utils.recentlyAdded).toBeInstanceOf(RecentlyAdded)
  );

  it('should be an instance of winston logger', () =>
    expect(utils.logger).toBeInstanceOf(winston.Logger)
  );

});