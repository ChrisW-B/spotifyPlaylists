const getProjection = fieldASTs =>
  fieldASTs.fieldNodes[0].selectionSet.selections.reduce((projections, selection) => {
    const newProjections = projections;
    newProjections[selection.name.value] = true;
    return newProjections;
  }, {});

const validMember = (user, spotifyId = '') => !!(process.env.NODE_ENV !== 'production'
  || (user && user.id && (user.id === spotifyId || user.id === process.env.ADMIN)));

module.exports = { getProjection, validMember };