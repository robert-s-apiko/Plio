import { Template } from 'meteor/templating';

import { StandardsTypes } from '/imports/api/standards-types/standards-types.js';

Template.ESType.viewmodel({
  mixin: 'modal',
  typeId: '',
  types() {
    return [{ _id: '', name: '' }].concat(StandardsTypes.find({}).fetch()); // add empty option
  },
  update() {
    const { typeId } = this.getData();
    if (!typeId) {
      this.modal().error('Type is required!');
    }
    this.parent().update({ typeId });
  },
  getData() {
    const { typeId } = this.data();
    return { typeId };
  }
});
