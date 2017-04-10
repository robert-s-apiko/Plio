import { Meteor } from 'meteor/meteor';
import { _ } from 'meteor/underscore';

import { SystemName } from '/imports/share/constants';

export default class BaseEntityService {
  constructor(collection) {
    if (!collection) {
      throw new Error('collection is undefined');
    }

    this.collection = collection;
  }

  insert(args) {
    return this.collection.insert(args);
  }

  update({ _id, query = {}, options = {}, ...args }) {
    if (!Object.keys(query).length) {
      Object.assign(query, { _id });
    }

    if (!Object.keys(options).length) {
      Object.assign(options, { $set: args });
    }

    return this.collection.update(query, options);
  }

  updateViewedBy({ _id, viewedBy }) {
    const query = { _id };
    const options = { $addToSet: { viewedBy } };

    return this.collection.update(query, options);
  }

  remove({ _id, deletedBy, onSoftDelete, onPermanentDelete }) {
    const query = { _id };

    const { isDeleted } = this.collection.findOne({ _id });

    if (isDeleted) {
      const result = this.collection.remove(query);

      if (Meteor.isServer && _(onPermanentDelete).isFunction()) {
        Meteor.defer(onPermanentDelete);
      }

      return result;
    } else {
      const modifier = {
        $set: {
          deletedBy,
          isDeleted: true,
          deletedAt: new Date(),
        },
      };

      const ret = this.collection.update(query, modifier);

      if (Meteor.isServer && _(onSoftDelete).isFunction()) {
        Meteor.defer(onSoftDelete);
      }

      return ret;
    }
  }

  restore({ _id, query={}, onRestore }) {
    if (_(query).isEmpty()) {
      query = { _id };
    }

    const options = {
      $set: {
        isDeleted: false
      },
      $unset: {
        deletedBy: '',
        deletedAt: ''
      }
    };

    const ret = this.collection.update(query, options, { multi: true });

    if (Meteor.isServer && _(onRestore).isFunction()) {
      Meteor.defer(onRestore);
    }

    return ret;
  }

  removePermanently({ _id, query={} }) {
    if (_(query).isEmpty()) {
      query = { _id };
    }

    return this.collection.remove(query);
  }

  removeSoftly({ _id, deletedBy, query={} }) {
    if (_(query).isEmpty()) {
      query = { _id };
    }

    const options = {
      $set: {
        isDeleted: true,
        deletedBy: deletedBy || SystemName,
        deletedAt: new Date()
      }
    };

    return this.collection.update(query, options, { multi: true });
  }
}
