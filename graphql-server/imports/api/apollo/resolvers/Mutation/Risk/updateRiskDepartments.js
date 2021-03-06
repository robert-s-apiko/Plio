import { applyMiddleware } from 'plio-util';
import {
  checkLoggedIn,
  flattenInput,
  checkRiskAccess,
  checkDocsAccess,
  riskUpdateAfterware,
} from '../../../../../share/middleware';

export const resolver = async (root, args, { services: { RiskService } }) =>
  RiskService.set(args);

export default applyMiddleware(
  checkLoggedIn(),
  flattenInput(),
  checkRiskAccess(),
  checkDocsAccess({
    getIds: (root, args) => args.departmentsIds,
    getCollection: (root, args, { collections: { Departments } }) => Departments,
  }),
  riskUpdateAfterware(),
)(resolver);
