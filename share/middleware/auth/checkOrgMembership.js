import invariant from 'invariant';

import Errors from '../../errors';
import { createOrgQueryWhereUserIsMember } from '../../mongo';

export default (config = () => ({})) => async (next, root, args, context) => {
  let error = Errors.USER_NOT_ORG_MEMBER;
  // eslint-disable-next-line prefer-const
  let { organizationId, userId, serialNumber } = await config(root, args, context);
  const { collections: { Organizations } } = context;

  if (!organizationId) ({ organizationId } = args);
  if (!userId) {
    ({ userId } = context);
    error = Errors.NOT_ORG_MEMBER;
  }

  invariant(serialNumber || organizationId, 'organizationId or serialNumber is required');

  const organization = await Organizations.findOne({
    $or: [
      { serialNumber },
      { _id: organizationId },
    ],
    ...createOrgQueryWhereUserIsMember(userId),
  });

  invariant(organization, error);

  return next(root, args, { ...context, organization });
};
