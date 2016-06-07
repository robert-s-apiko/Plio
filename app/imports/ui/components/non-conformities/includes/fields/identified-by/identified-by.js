import { Template } from 'meteor/templating';
import { Meteor } from 'meteor/meteor';

Template.NCIdentifiedBy.viewmodel({
  mixin: ['search', 'user'],
  identifiedBy: '',
  owner() {
    const child = this.child('OwnerField');
    return child && child.owner();
  },
  members() {
    const query = this.searchObject('owner', [{ name: 'profile.firstName' }, { name: 'profile.lastName' }, { name: 'emails.0.address' }]);
    const options = { sort: { 'profile.firstName': 1 } };

    return Meteor.users.find(query, options).map(({ _id, ...args }) => ({ title: this.userFullNameOrEmail(_id), _id, ...args }) );
  },
  onUpdateCb() {
    return this.update.bind(this);
  },
  update(viewmodel) {
    const { selected:identifiedBy } = viewmodel.getData();

    this.identifiedBy(identifiedBy);

    if (!this._id) return;

    return this.parent().update({ identifiedBy });
  },
  getData() {
    const { identifiedBy } = this.data();
    return { identifiedBy };
  }
});
