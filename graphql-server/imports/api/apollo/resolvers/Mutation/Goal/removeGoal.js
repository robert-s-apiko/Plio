import { applyMiddleware } from 'plio-util';
import {
  checkLoggedIn,
  checkGoalAccess,
  flattenInput,
  ensureCanChangeGoals,
} from '../../../../../share/middleware';

export const resolver = async (root, args, context) => {
  const { doc, services: { GoalService } } = context;
  return GoalService.remove(args, { ...context, goal: doc });
};

export default applyMiddleware(
  flattenInput(),
  checkLoggedIn(),
  checkGoalAccess(),
  ensureCanChangeGoals(),
  async (next, root, args, context) => {
    const { _id } = args;
    const { collections: { Goals } } = context;
    const goal = Goals.findOne({ _id });

    await next(root, args, context);

    return { goal };
  },
)(resolver);
