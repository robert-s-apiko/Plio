import { NonConformities } from '/imports/share/collections/non-conformities.js';
import NonConformityService from './non-conformities-service';
import FilesService from '../files/files-service.js';
import WorkItemService from '../work-items/work-item-service';

import get from 'lodash.get';

NonConformities.after.remove((userId, doc) => {
  let fileIds = doc.fileIds || [];

  const improvementPlanFileIds = get(doc, 'improvementPlan.fileIds');
  if (!!improvementPlanFileIds) {
    fileIds = fileIds.concat(improvementPlanFileIds);
  }

  const rcaFileIds = get(doc, 'rootCauseAnalysis.fileIds');
  if (!!rcaFileIds) {
    fileIds = fileIds.concat(rcaFileIds);
  }

  FilesService.bulkRemove({ fileIds });

  NonConformityService.unlinkActions({ _id: doc._id });

  WorkItemService.removePermanently({ query: { 'linkedDoc._id': doc._id } });
});
