import { Template } from 'meteor/templating';
import moment from 'moment-timezone';
import invoke from 'lodash.invoke';

import {
  update,
  remove,
} from '/imports/api/non-conformities/methods';
import { getTzTargetDate } from '/imports/share/helpers';
import { ALERT_AUTOHIDE_TIME } from '/imports/api/constants';

Template.NC_Card_Edit.viewmodel({
  mixin: ['organization', 'nonconformity', 'modal', 'callWithFocusCheck', 'router', 'collapsing'],
  NC() {
    return this._getNCByQuery({ _id: this._id() });
  },
  slingshotDirective: 'nonConformityFiles',
  uploaderMetaContext() {
    return {
      organizationId: this.organizationId(),
      nonConformityId: this._id(),
    };
  },
  onUpdateNotifyUserCb() {
    return this.onUpdateNotifyUser.bind(this);
  },
  onUpdateNotifyUser({ query, options }, cb) {
    return this.update({ query, options }, cb);
  },
  onUpdateCb() {
    return this.update.bind(this);
  },
  update({
    query = {}, options = {}, e = {}, withFocusCheck = false, ...args
  }, cb = () => {}) {
    const _id = this._id();

    if ((_.keys(query).length > 0) && (!('_id' in query))) {
      query = { _id, ...query };
    }

    const allArgs = {
      ...args, _id, options, query,
    };

    const updateFn = () => this.modal().callMethod(update, allArgs, cb);

    if (withFocusCheck) {
      this.callWithFocusCheck(e, updateFn);
    } else {
      updateFn();
    }
  },
  remove() {
    const { title } = this.NC();
    const _id = this._id();

    swal({
      title: 'Are you sure?',
      text: `The nonconformity "${title}" will be removed.`,
      type: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Remove',
      closeOnConfirm: false,
    }, () => {
      this.modal().callMethod(remove, { _id }, (err) => {
        if (err) {
          swal.close();
          return;
        }

        swal({
          title: 'Removed!',
          text: `The nonconformity "${title}" was removed successfully.`,
          type: 'success',
          timer: ALERT_AUTOHIDE_TIME,
          showConfirmButton: false,
        });

        this.modal().close();

        this.redirect();
      });
    });
  },
  redirect() {
    const list = Object.assign({}, ViewModel.findOne('NC_List'));

    if (list) {
      const { first } = Object.assign({}, invoke(list, '_findNCForFilter'));

      if (first) {
        const { _id } = first;

        Meteor.setTimeout(() => {
          this.goToNC(_id);
          this.expandCollapsed(_id);
        }, 0);
      }
    }
  },
});
