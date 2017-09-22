const {
  GraphQLObjectType,
  GraphQLString,
  GraphQLNonNull,
  GraphQLEnumType
} = require('graphql/type');
const { getProjection, validMember } = require('./utils');
const { Member } = require('../mongoose/schema');
const memberType = require('./types/memberType');
const updatePlaylistType = require('./types/updatePlaylistType');
const backendActionType = require('./types/backendActionType');

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
          description: 'The current member\'s id',
          type: GraphQLString
        },
        playlistKind: {
          name: 'playlistKind',
          description: 'The kind of playlist, either mostPlayed or recentlyAdded',
          type: new GraphQLEnumType({
            name: 'playlistType',
            values: {
              mostPlayed: { value: 'most' },
              recentlyAdded: { value: 'recent' }
            }
          })
        },
        patch: {
          name: 'playlistInfo',
          description: 'Everything we want to change',
          type: new GraphQLNonNull(updatePlaylistType)
        }
      },
      resolve: async (_, { spotifyId, playlistKind, patch }, { user }, fieldASTs) => {
        if (!validMember(user, spotifyId)) return {};
        const id = (spotifyId && (process.env.NODE_ENV !== 'production' || user.id === process.env.ADMIN))
          ? spotifyId
          : user.id;
        const safePatch = { ...patch };
        const projection = getProjection(fieldASTs);
        const foundItem = await Member.findOne({ spotifyId: id }, projection).exec();
        if (playlistKind === 'most') foundItem.mostPlayed = { ...foundItem.mostPlayed, ...safePatch };
        else if (playlistKind === 'recent') {
          delete safePatch.period;
          delete safePatch.lastfm;
          foundItem.recentlyAdded = { ...foundItem.recentlyAdded, ...safePatch };
        }
        await foundItem.save();
        return foundItem;
      }
    },
    deleteAccount: {
      type: backendActionType,
      name: 'deleteAccount',
      description: 'removes a member and logs them out',
      resolve: async (_, __, source) => {
        if (!source.user || !source.user.id) return { success: false };
        await Member.remove({ spotifyId: source.user.id }).exec();
        source.logout();
        source.session.destroy(() => {});
        return { success: true };
      }
    },
    logout: {
      type: backendActionType,
      name: 'logout',
      description: 'logs a person out',
      resolve: async (_, __, source) => {
        if (!source.user || !source.user.id) return { success: false };
        source.logout();
        source.session.destroy(() => {});
        return { success: true };
      }
    }
  }
});

module.exports = mutations;