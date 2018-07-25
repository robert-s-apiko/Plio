import { batchActions } from 'redux-batched-actions';
import { Tracker } from 'meteor/tracker';

import { BackgroundSubs } from '/imports/startup/client/subsmanagers';
import { Departments } from '/imports/share/collections/departments';
import { Files } from '/imports/share/collections/files';
import { NonConformities } from '/imports/share/collections/non-conformities';
import { Risks } from '/imports/share/collections/risks';
import { Actions } from '/imports/share/collections/actions';
import { WorkItems } from '/imports/share/collections/work-items';
import { LessonsLearned } from '/imports/share/collections/lessons';
import { Standards } from '/imports/share/collections/standards';
import { RiskTypes } from '../../../../share/collections/risk-types';

import {
  setDepartments,
  setFiles,
  setNCs,
  setRisks,
  setActions,
  setWorkItems,
  setLessons,
  setStandards,
  setRiskTypes,
} from '../../../../client/store/actions/collectionsActions';
import { setDepsReady } from '../../../../client/store/actions/standardsActions';

export default function loadDeps({ dispatch, organizationId, initializing }, onData) {
  const subscription = BackgroundSubs.subscribe('standardsDeps', organizationId);
  if (subscription.ready()) {
    const query = { organizationId };
    const pOptions = { sort: { serialNumber: 1 } };
    const departments = Departments.find(query, { sort: { name: 1 } }).fetch();
    const files = Files.find(query, { sort: { updatedAt: -1 } }).fetch();
    const ncs = NonConformities.find(query, pOptions).fetch();
    const risks = Risks.find(query, pOptions).fetch();
    const actions = Actions.find(query, pOptions).fetch();
    const lessons = LessonsLearned.find(query, pOptions).fetch();
    const workItems = WorkItems.find(query).fetch();
    const riskTypes = RiskTypes.find(query).fetch();
    let reduxActions = [
      setDepartments(departments),
      setFiles(files),
      setNCs(ncs),
      setRisks(risks),
      setActions(actions),
      setWorkItems(workItems),
      setLessons(lessons),
      setRiskTypes(riskTypes),
      setDepsReady(true),
    ];

    if (initializing) {
      // set standards only when initializing because
      // later observers will be running
      const standards = Tracker.nonreactive(() =>
        Standards.find(query, { sort: { title: 1 } }).fetch());

      reduxActions = reduxActions.concat(setStandards(standards));
    }

    dispatch(batchActions(reduxActions));
  }

  onData(null, {});

  return () => typeof subscription === 'function' && subscription.stop();
}
