import { Meteor } from 'meteor/meteor';

import { NonConformities } from './non-conformities.js';
import ProblemsService from '../problems/problems-service.js';
import { ProblemTypes } from '../constants.js';

if (Meteor.isServer) {
  import NCWorkflow from '/imports/core/workflow/server/NCWorkflow.js';
}


export default _.extend({}, ProblemsService, {
  collection: NonConformities,

  _abbr: 'NC',

  _docType: ProblemTypes.NC,

  _getDoc(_id) {
    const NC = this.collection.findOne({ _id });
    if (!NC) {
      throw new Meteor.Error(400, 'Non-conformity does not exist');
    }
    return NC;
  },

  _refreshStatus(_id) {
    Meteor.isServer && Meteor.defer(() => {
      new NCWorkflow(_id).refreshStatus();
    });
  }
});
