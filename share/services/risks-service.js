import { Meteor } from 'meteor/meteor';
import { Random } from 'meteor/random';

import { Risks } from '../collections';
import { ProblemTypes } from '../constants';
import BaseEntityService from './base-entity-service';
import ProblemsService from './problems-service';
import GoalService from './goal-service';

if (Meteor.isServer) {
  // import RiskWorkflow from '/imports/core/workflow/server/RiskWorkflow.js';
}


export default Object.assign({}, ProblemsService, {
  collection: Risks,

  _service: new BaseEntityService(Risks),

  _getDocType: () => ProblemTypes.RISK,

  _getAbbr: () => 'RK',

  async insert({
    organizationId,
    title,
    description,
    originatorId,
    ownerId,
    magnitude,
    typeId,
    standardsIds,
    goalId,
  }) {
    const args = {
      organizationId,
      title,
      description,
      originatorId,
      ownerId,
      magnitude,
      typeId,
    };

    if (goalId) {
      Object.assign(args, { goalId });
    } else if (standardsIds) {
      Object.assign(args, { standardsIds });
    }

    const _id = await ProblemsService.insert.call(this, args);

    if (goalId) await GoalService.linkRisk({ _id: goalId, riskId: _id });

    return _id;
  },

  update(args, context) {
    const {
      _id,
      title,
      description,
      statusComment,
      standardsIds,
      departmentsIds,
      originatorId,
      ownerId,
      typeId,
      analysis: {
        executor,
        targetDate,
        completedBy,
        completedAt,
        completionComments,
      },
    } = args;
    const { collections } = context;
    const query = { _id };
    const modifier = {
      $set: {
        title,
        description,
        statusComment,
        standardsIds,
        departmentsIds,
        originatorId,
        ownerId,
        typeId,
        'analysis.executor': executor,
        'analysis.targetDate': targetDate,
        'analysis.completedBy': completedBy,
        'analysis.completedAt': completedAt,
        'analysis.completionComments': completionComments,
      },
    };

    return collections.Risks.update(query, modifier);
  },

  'scores.insert': function ({ _id, ...args }) {
    const id = Random.id();
    const query = { _id };
    const options = {
      $addToSet: {
        scores: { _id: id, ...args },
      },
    };

    this.collection.update(query, options);

    return id;
  },

  'scores.remove': function ({ _id, score }) {
    const query = { _id };
    const options = {
      $pull: {
        scores: score,
      },
    };

    return this.collection.update(query, options);
  },

  _getDoc(_id) {
    const risk = this.collection.findOne({ _id });
    if (!risk) {
      throw new Meteor.Error(400, 'Risk does not exist');
    }
    return risk;
  },

  _refreshStatus() {
    /* Meteor.isServer && Meteor.defer(() => {
      new RiskWorkflow(_id).refreshStatus();
    }); */
  },
});
