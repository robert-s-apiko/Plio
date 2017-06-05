import { _ } from 'meteor/underscore';
import { getProblemName } from '/imports/helpers/description';
import onCreated from './on-created';
import onRemoved from './on-removed';

import analysisCompletedAt from './fields/analysis.completedAt';
import analysisCompletedBy from './fields/analysis.completedBy';
import analysisCompletionComments from './fields/analysis.completionComments';
import analysisExecutor from './fields/analysis.executor';
import analysisStatus from './fields/analysis.status';
import analysisTargetDate from './fields/analysis.targetDate';
import departmentsIds from './fields/departmentsIds';
import description from './fields/description';
import fileIds from './fields/fileIds';
import identifiedAt from './fields/identifiedAt';
import identifiedBy from './fields/identifiedBy';
import isDeleted from './fields/isDeleted';
import magnitude from './fields/magnitude';
import notify from './fields/notify';
import ownerId from './fields/ownerId';
import standardsIds from './fields/standardsIds';
import status from './fields/status';
import title from './fields/title';
import updateOfStandardsCompletedAt from './fields/updateOfStandards.completedAt';
import updateOfStandardsCompletedBy from './fields/updateOfStandards.completedBy';
import updateOfStandardsCompletionComments from './fields/updateOfStandards.completionComments';
import updateOfStandardsExecutor from './fields/updateOfStandards.executor';
import updateOfStandardsStatus from './fields/updateOfStandards.status';
import updateOfStandardsTargetDate from './fields/updateOfStandards.targetDate';

import { propId, propOrganizationId, propNotify, propIdentifiedBy } from '/imports/helpers/props';


export default ProblemAuditConfig = {

  onCreated,

  updateHandlers: [
    analysisCompletedAt,
    analysisCompletedBy,
    analysisCompletionComments,
    analysisExecutor,
    analysisStatus,
    analysisTargetDate,
    departmentsIds,
    description,
    fileIds,
    identifiedAt,
    identifiedBy,
    isDeleted,
    magnitude,
    notify,
    ownerId,
    standardsIds,
    status,
    title,
    updateOfStandardsCompletedAt,
    updateOfStandardsCompletedBy,
    updateOfStandardsCompletionComments,
    updateOfStandardsExecutor,
    updateOfStandardsStatus,
    updateOfStandardsTargetDate,
  ],

  onRemoved,

  docId: propId,

  docName: getProblemName,

  docOrgId: propOrganizationId,

  docNotifyList: propNotify,

  docOwner: propIdentifiedBy,

};
