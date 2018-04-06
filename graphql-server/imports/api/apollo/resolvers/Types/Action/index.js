import {
  loadUserById,
  loadUsersById,
  loadOrganizationById,
  lenses,
  filterBy,
} from 'plio-util';
import { view, flatten } from 'ramda';

import { DocumentTypes } from '../../../../../share/constants';

const {
  createdBy,
  updatedBy,
  completedBy,
  completionAssignedBy,
  verificationAssignedBy,
  deletedBy,
  toBeCompletedBy,
  toBeVerifiedBy,
  verifiedBy,
  notify,
  organizationId,
  ownerId,
} = lenses;

export default {
  Action: {
    createdBy: loadUserById(view(createdBy)),
    updatedBy: loadUserById(view(updatedBy)),
    completedBy: loadUserById(view(completedBy)),
    completionAssignedBy: loadUserById(view(completionAssignedBy)),
    verificationAssignedBy: loadUserById(view(verificationAssignedBy)),
    deletedBy: loadUserById(view(deletedBy)),
    toBeCompletedBy: loadUserById(view(toBeCompletedBy)),
    toBeVerifiedBy: loadUserById(view(toBeVerifiedBy)),
    verifiedBy: loadUserById(view(verifiedBy)),
    notify: loadUsersById(view(notify)),
    organization: loadOrganizationById(view(organizationId)),
    owner: loadUserById(view(ownerId)),
    goals: async (root, args, context) => {
      const { linkedTo } = root;
      const { isDeleted = false } = args;
      const { loaders: { Goal: { byQuery } } } = context;
      const linkedGoals = filterBy('documentType', [DocumentTypes.GOAL], linkedTo);
      const queries = linkedGoals.map(({ documentId }) => ({ _id: documentId, isDeleted }));

      return byQuery.loadMany(queries).then(flatten);
    },
  },
};
