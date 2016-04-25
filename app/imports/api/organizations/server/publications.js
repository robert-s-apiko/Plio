import { Meteor } from 'meteor/meteor';
import { Organizations } from '../organizations.js';
import { Departments } from '../../departments/departments.js';
import { StandardsTypes } from '../../standards-types/standards-types.js';
import {
  StandardsBookSections
} from '../../standards-book-sections/standards-book-sections.js';


Meteor.publishComposite('currentUserOrganizations', {
  find: function() {
    return Organizations.find({ 'users.userId': this.userId });
  },
  children: [{
    find: function(org) {
      return Departments.find({
        organizationId: org._id
      });
    }
  }, {
    find: function(org) {
      return StandardsTypes.find({
        organizationId: org._id
      });
    }
  }, {
    find: function(org) {
      return StandardsBookSections.find({
        organizationId: org._id
      });
    }
  }]
});
