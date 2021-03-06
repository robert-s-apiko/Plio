import { applyMiddleware } from 'plio-util';
import {
  checkLoggedIn,
  flattenInput,
  checkGoalAccess,
  checkUserOrgMembership,
  goalUpdateAfterware,
} from '../../../../../share/middleware';

export const resolver = async (root, args, { services: { GoalService } }) =>
  GoalService.removeFromNotify(args);

export default applyMiddleware(
  checkLoggedIn(),
  flattenInput(),
  checkGoalAccess(),
  checkUserOrgMembership({
    getUserId: (root, args) => args.userId,
  }),
  goalUpdateAfterware(),
)(resolver);
