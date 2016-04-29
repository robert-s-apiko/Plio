import { Template } from 'meteor/templating';

import { Standards } from '/imports/api/standards/standards.js';

Template.ListItem.viewmodel({
  share: 'standard',
  mixin: 'collapse',
  closeAllOnCollapse: true,
  standards() {
    const query = { sectionId: this._id() };
    const options = { sort: { title: 1 } };
    return Standards.find(query, options);
  }
});
