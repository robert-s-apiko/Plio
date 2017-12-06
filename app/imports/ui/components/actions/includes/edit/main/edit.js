import { Template } from 'meteor/templating';

import { ActionPlanOptions, WorkflowTypes } from '/imports/share/constants.js';
import { updateViewedBy } from '/imports/api/actions/methods';
import { isViewed } from '/imports/api/checkers.js';


Template.Actions_Card_Edit_Main.viewmodel({
  mixin: ['utils', 'getChildrenData'],
  onRendered(templateInstance) {
    const action = templateInstance.data.action;
    const userId = Meteor.userId();

    if (action && !isViewed(action, userId)) {
      Meteor.defer(() => updateViewedBy.call({ _id: action._id }));
    }
  },
  autorun() {
    const action = this.action && this.action();
    action && this.load(action);
  },
  isCompletionEditable({ isVerified }) {
    return !isVerified;
  },
  update({ ...args }) {
    this.parent().update({ ...args });
  },
  onComplete() {
    return this.completeFn;
  },
  onVerify() {
    return this.verifyFn;
  },
  onUndoCompletion() {
    return this.undoCompletionFn;
  },
  onUndoVerification() {
    return this.undoVerificationFn;
  },
  onLinkStandard() {
    return this.linkStandardFn;
  },
  onUnlinkStandard() {
    return this.unlinkStandardFn;
  },
  onLinkDocument() {
    return this.linkDocumentFn;
  },
  onUnlinkDocument() {
    return this.unlinkDocumentFn;
  },
  onUpdateCompletionDate() {
    return this.updateCompletionDateFn;
  },
  onUpdateCompletionExecutor() {
    return this.updateCompletionExecutorFn;
  },
  onUpdateVerificationDate() {
    return this.updateVerificationDateFn;
  },
  onUpdateVerificationExecutor() {
    return this.updateVerificationExecutorFn;
  },
  showVerification() {
    const action = this.action && this.action();
    return action && action.getWorkflowType() === WorkflowTypes.SIX_STEP;
  },
  getData() {
    return this.getChildrenData();
  },
});
