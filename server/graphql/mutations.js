const {
  GraphQLObjectType,
  GraphQLString,
  GraphQLNonNull
} = require('graphql/type');
const { getProjection } = require('./utils');
const { Member } = require('../mongoose/schema');
const memberType = require('./types/memberType');
const updatePlaylistType = require('./types/updatePlaylistType');

const mutations = new GraphQLObjectType({
  name: 'RootMutationType',
  description: 'Everything we can change',
  fields: {
    updatePlaylist: {
      type: memberType,
      name: 'updatePlaylist',
      description: 'updates a playlist object',
      args: {
        spotifyId: {
          name: 'spotifyId',
          type: new GraphQLNonNull(GraphQLString)
        },
        playlistKind: {
          name: 'playlistKind',
          type: new GraphQLNonNull(GraphQLString)
        },
        patch: {
          name: 'playlistInfo',
          type: new GraphQLNonNull(updatePlaylistType)
        }
      },
      resolve: async (root, { spotifyId, playlistKind, patch }, source, fieldASTs) => {
        if (process.env.NODE_ENV === 'production' && (source.user.id !== spotifyId && source.user.id !== process.env.ADMIN)) return {};
        const safePatch = { ...patch };
        const foundItem = await Member.findOne({ spotifyId }, getProjection(fieldASTs)).exec();
        if (playlistKind === 'most') foundItem.mostPlayed = { ...foundItem.mostPlayed, ...safePatch };
        else if (playlistKind === 'recent') {
          delete safePatch.period;
          delete safePatch.lastfm;
          foundItem.recentlyAdded = { ...foundItem.recentlyAdded, ...safePatch };
        }
        await foundItem.save();
        return foundItem;
      }
    }
  }

});

module.exports = mutations;