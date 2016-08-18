import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { LoggedInMixin } from 'meteor/tunifight:loggedin-mixin';
import curry from 'lodash.curry';

import { UNAUTHORIZED } from './errors.js';
import { checkDocAndMembershipAndMore } from './checkers.js';

export default class Method extends ValidatedMethod {
  constructor(props) {
    props.mixins = Object.assign([], props.mixins).concat(LoggedInMixin);
    props.checkLoggedInError = {
      error: '403',
      reason: UNAUTHORIZED.reason
    };

    super(props);
  }
}

export class CheckedMethod extends Method {
  constructor(props) {
    if (!props.check) throw new Error('checker method is required');

    const { run } = props;

    props.run = function({ ...args }) {
      const userId = this.userId;

      const res = props.check((collection) => {
        return (checker, err) => {
          return checkDocAndMembershipAndMore(collection, args._id, userId)(curry(checker)({ ...args, userId }), err);
        };
      });

      return run.call(this, { ...args }, res);
    }

    super(props);
  }
}
