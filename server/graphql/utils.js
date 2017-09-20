const getProjection = fieldASTs =>
  fieldASTs.fieldNodes[0].selectionSet.selections.reduce((projections, selection) => {
    const newProjections = projections;
    newProjections[selection.name.value] = true;
    return newProjections;
  }, {});

module.exports = { getProjection };