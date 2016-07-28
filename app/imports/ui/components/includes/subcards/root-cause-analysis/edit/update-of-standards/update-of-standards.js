import { Template } from 'meteor/templating';

Template.NC_UpdateOfStandards_Edit.viewmodel({
  autorun() {
    this.load(this.updateOfStandards());
  },
  label: 'Update of standard(s)',
  updateOfStandards: '',
  executor: '',
  defaultTargetDate: '',
  targetDate: '',
  status: '',
  completedAt: '',
  completedBy: '',
  update(...args) {
    this.parent().update(...args);
  },
  onStandardsExecutorUpdated() {
    return this.parent().updateStandardsExecutor.bind(this);
  },
  onStandardsDateUpdated() {
    return this.parent().updateStandardsDate.bind(this);
  },
  onStandardsUpdated() {
    return this.parent().updateStandards.bind(this);
  },
  onStandardsUpdateUndone() {
    return this.parent().undoStandardsUpdate.bind(this);
  }
});
