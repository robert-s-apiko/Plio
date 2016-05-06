import { Template } from 'meteor/templating';

import { Standards } from '/imports/api/standards/standards.js';
import { update, remove } from '/imports/api/standards/methods.js';

Template.EditStandard.viewmodel({
  share: 'standard',
  mixin: 'modal',
  standard() {
    const _id = this._id && this._id();
    return Standards.findOne({ _id });
  },
  update({ ...args }, options = {}, cb) {
    if (_.isFunction(options)) {
      cb = options;
      options = {};
    }
    const _id = this._id && this._id();
    const query = _.extend(args, { _id, options });
    console.log(query);
    this.modal().callMethod(update, query, cb);
  },
  remove() {
    const _id = this.standard()._id;
    if (!confirm('Are you sure you want to delete this standard?')) return;
    this.modal().callMethod(remove, { _id }, () => {
      this.selectedStandardId('');
      this.modal().close();
    });
  }
});
