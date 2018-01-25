import { applyMiddleware } from 'plio-util';
import { checkLoggedIn, checkOrgMembership } from '../../../../../share/middleware';

export const resolver = async (
  root,
  {
    organizationId,
    limit,
    withDeleted,
  },
  {
    collections: {
      Goals,
    },
  },
) => {
  const query = { organizationId, isDeleted: false };
  const options = { limit };
  const totalCount = await Goals.find(query).count();

  if (withDeleted) delete query.isDeleted;

  const goals = await Goals.find(query, options).fetch();

  return {
    totalCount,
    goals,
  };
};

export default applyMiddleware(
  checkLoggedIn(),
  checkOrgMembership(),
)(resolver);
