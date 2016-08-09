import { Meteor } from 'meteor/meteor';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { isEqual, isEmpty } from 'lodash';

import OccurrencesService from './occurrences-service.js';
import { RequiredSchema } from './occurrences-schema.js';
import { Occurrences } from './occurrences.js';
import { NonConformities } from '../non-conformities/non-conformities.js';
import { IdSchema } from '../schemas.js';

export const updateViewedBy = new ValidatedMethod({
  name: 'Occurrences.updateViewedBy',

  validate: IdSchema.validator(),

  run({ _id }) {
    if (!this.userId) {
      throw new Meteor.Error(
        403, 'Unauthorized user cannot update occurrences'
      );
    }
    if (!Occurrences.findOne({ _id })) {
      throw new Meteor.Error(
        400, 'Occurrence does not exist'
      );
    }

    if (!!Occurrences.findOne({ _id, viewedBy: this.userId })) {
      throw new Meteor.Error(
        400, 'You have been already added to the viewedBy list of this occurrence'
      );
    }

    return OccurrencesService.updateViewedBy({ _id, userId: this.userId });
  }
});

export const insert = new ValidatedMethod({
  name: 'Occurrences.insert',

  validate: RequiredSchema.validator(),

  run({ ...args, nonConformityId }) {
    if (!this.userId) {
      throw new Meteor.Error(403, 'Unauthorized user cannot create an occurrence');
    }

    if (!NonConformities.findOne({ _id: nonConformityId })) {
      throw new Meteor.Error(400, 'Non-conformity with that ID does not exist');
    }

    return OccurrencesService.insert({ ...args, nonConformityId });
  }
});

export const update = new ValidatedMethod({
  name: 'Occurrences.update',

  validate(doc) {
    const validationContext = new SimpleSchema([IdSchema, {
      description: {
        type: String
      },
      date: {
        type: Date
      }
    }]).newContext();

    for (let key in doc) {
      if (isEqual(key, 'description') && isEmpty(doc[key])) {
        doc[key] = undefined;
      }

      if (!validationContext.validateOne(doc, key)) {
        const errors = validationContext.invalidKeys();
        const message = validationContext.keyErrorMessage(errors[0].name);
        throw new ValidationError(errors, message);
      }
    }
  },

  run({_id, ...args}) {
    if (!this.userId) {
      throw new Meteor.Error(403, 'Unauthorized user cannot update an occurrence');
    }

    return OccurrencesService.update({ _id, ...args });
  }
});

export const remove = new ValidatedMethod({
  name: 'Occurrences.remove',

  validate: IdSchema.validator(),

  run({ _id }) {
    if (!this.userId) {
      throw new Meteor.Error(403, 'Unauthorized user cannot remove occurrences');
    }

    return OccurrencesService.remove({ _id });
  }
});
