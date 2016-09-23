import { Meteor } from 'meteor/meteor';
import { StandardTypes } from '/imports/share/collections/standard-types.js';
import { isOrgMember } from '../../checkers.js';


Meteor.publish('standard-types', function(organizationId) {
  const userId = this.userId;
  if (!userId || !isOrgMember(userId, organizationId)) {
    return this.ready();
  }

  return StandardTypes.find({ organizationId });
});
