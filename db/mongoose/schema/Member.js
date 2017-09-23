// db/mongoose/schema/Member.js

const db = require('../');

const { Mongoose } = db;

const member = new Mongoose.Schema({
  spotifyId: { type: String, default: '', required: true },
  visits: { type: Number, default: 1 },
  isAdmin: { type: Boolean, default: false },
  photo: { type: String, default: '' },
  refreshToken: { type: String, default: '', required: true },
  accessToken: { type: String, default: '', required: true },
  mostPlayed: {
    period: { type: String, default: '3month', enum: ['7day', '1month', '3month', '6month', '12month', 'overall'] },
    lastfm: { type: String, default: '' },
    id: { type: String, default: '' },
    length: { type: Number, default: 10, max: 50, min: 1 },
    enabled: { type: Boolean, default: false, required: true }
  },
  recentlyAdded: {
    id: { type: String, default: '' },
    length: { type: Number, default: 10, max: 50, min: 1 },
    enabled: { type: Boolean, default: false, required: true }
  }
});

const Member = Mongoose.model('Member', member);
module.exports = Member;