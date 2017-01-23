import { riskScoreTypes } from '/imports/share/constants';
import { find, some, propEq } from '/imports/api/helpers';

export const getPrimaryScore = (scores) => {
  const propEqScoreTypeId = propEq('scoreTypeId');

  return { ...find(some([
    propEqScoreTypeId(riskScoreTypes.residual.id),
    propEqScoreTypeId(riskScoreTypes.inherent.id),
  ]), scores) };
};

export const getClassByScore = (score) => {
  if (score >= 0 && score < 25) {
    return 'vlow';
  } else if (score >= 25 && score < 50) {
    return 'low';
  } else if (score >= 50 && score < 75) {
    return 'medium';
  }

  return 'high';
};
