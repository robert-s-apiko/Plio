import { graphql } from 'react-apollo';
import { flattenProp, withHandlers, branch, onlyUpdateForKeys } from 'recompose';
import { lenses, getTargetValue, toDate, updateInput } from 'plio-util';
import { view, curry, compose, objOf, toUpper, prop } from 'ramda';
import connectUI from 'redux-ui';

import { namedCompose } from '../../helpers';
import GoalEdit from '../components/GoalEdit';
import { Fragment, Mutation } from '../../../../client/graphql';
import { ALERT_AUTOHIDE_TIME } from '../../../../api/constants';

const update = name => (proxy, { data: { [name]: { goal: { _id, ...goal } } } }) => {
  const id = `Goal:${_id}`;
  const fragment = Fragment.GOAL_CARD;
  const fragmentName = 'GoalCard';
  const data = proxy.readFragment({ id, fragment, fragmentName });

  return proxy.writeFragment({
    id,
    fragment,
    fragmentName,
    data: {
      ...data,
      ...goal,
    },
  });
};

/*
  props(
    getInputArgs: (...args: ...any) => Object,
    options: {
      handler: String,
      mutation: String,
    }: Object
  ) => Object
*/
const props = curry((getInputArgs, {
  handler,
  mutation,
}) => ({
  mutate,
  ownProps,
}) => {
  const {
    goal,
    organizationId,
    updateUI,
  } = ownProps;

  return {
    goal,
    organizationId,
    [handler]: (...args) => {
      const inputArgs = getInputArgs(...args, ownProps);

      updateUI({ loading: true });

      return mutate({
        update: update(mutation),
        variables: {
          input: {
            _id: goal._id,
            ...inputArgs,
          },
        },
      }).then((res) => {
        updateUI({ loading: false });
        return res;
      }).catch((error) => {
        updateUI({ loading: false, error: error.message });

        setTimeout(() => {
          updateUI({ error: null });
        }, ALERT_AUTOHIDE_TIME);

        return error;
      });
    },
  };
});

const getUpdateTitleInputArgs = compose(objOf('title'), getTargetValue);
const getUpdateDescriptionInputArgs = compose(objOf('description'), getTargetValue);
const getUpdateOwnerInputArgs = compose(objOf('ownerId'), (_, { value }) => value);
const getUpdateStartDateInputArgs = compose(objOf('startDate'), toDate);
const getUpdateEndDateInputArgs = compose(objOf('endDate'), toDate);
const getUpdatePriorityInputArgs = compose(objOf('priority'), getTargetValue);
const getUpdateColorInputArgs = compose(objOf('color'), toUpper, view(lenses.hex));
const getUpdateStatusCommentInputArgs = compose(objOf('statusComment'), getTargetValue);
const getCompleteGoalInputArgs = compose(
  objOf('completionComment'),
  (_, { ui: { completionComment } }) => completionComment,
);
const getUpdateCompletionCommentInputArgs = compose(objOf('completionComment'), getTargetValue);
const getUpdateCompletedAtInputArgs = compose(objOf('completedAt'), toDate);
const getUpdateCompletedByInputArgs = compose(objOf('completedBy'), (_, { value }) => value);

export default namedCompose('GoalEditContainer')(
  connectUI({
    state: {
      completionComment: '',
    },
  }),
  onlyUpdateForKeys(['organizationId', 'goal', 'completionComment']),
  flattenProp('goal'),
  graphql(Mutation.UPDATE_GOAL_TITLE, {
    props: props(getUpdateTitleInputArgs, {
      handler: 'onChangeTitle',
      mutation: 'updateGoalTitle',
    }),
  }),
  graphql(Mutation.UPDATE_GOAL_DESCRIPTION, {
    props: props(getUpdateDescriptionInputArgs, {
      handler: 'onChangeDescription',
      mutation: 'updateGoalDescription',
    }),
  }),
  graphql(Mutation.UPDATE_GOAL_OWNER, {
    props: props(getUpdateOwnerInputArgs, {
      handler: 'onChangeOwnerId',
      mutation: 'updateGoalOwner',
    }),
  }),
  graphql(Mutation.UPDATE_GOAL_START_DATE, {
    props: props(getUpdateStartDateInputArgs, {
      handler: 'onChangeStartDate',
      mutation: 'updateGoalStartDate',
    }),
  }),
  graphql(Mutation.UPDATE_GOAL_END_DATE, {
    props: props(getUpdateEndDateInputArgs, {
      handler: 'onChangeEndDate',
      mutation: 'updateGoalEndDate',
    }),
  }),
  graphql(Mutation.UPDATE_GOAL_PRIORITY, {
    props: props(getUpdatePriorityInputArgs, {
      handler: 'onChangePriority',
      mutation: 'updateGoalPriority',
    }),
  }),
  graphql(Mutation.UPDATE_GOAL_COLOR, {
    props: props(getUpdateColorInputArgs, {
      handler: 'onChangeColor',
      mutation: 'updateGoalColor',
    }),
  }),
  graphql(Mutation.UPDATE_GOAL_STATUS_COMMENT, {
    props: props(getUpdateStatusCommentInputArgs, {
      handler: 'onChangeStatusComment',
      mutation: 'updateGoalStatusComment',
    }),
  }),
  branch(
    prop('isCompleted'),
    compose(
      graphql(Mutation.UPDATE_GOAL_COMPLETION_COMMENT, {
        props: props(getUpdateCompletionCommentInputArgs, {
          handler: 'onChangeCompletionComment',
          mutation: 'updateGoalCompletionComment',
        }),
      }),
      graphql(Mutation.UPDATE_GOAL_COMPLETED_AT, {
        props: props(getUpdateCompletedAtInputArgs, {
          handler: 'onChangeCompletedAt',
          mutation: 'updateGoalCompletedAt',
        }),
      }),
      graphql(Mutation.UPDATE_GOAL_COMPLETED_BY, {
        props: props(getUpdateCompletedByInputArgs, {
          handler: 'onChangeCompletedBy',
          mutation: 'updateGoalCompletedBy',
        }),
      }),
      graphql(Mutation.UNDO_GOAL_COMPLETION, {
        props: props(e => e.stopPropagation(), {
          handler: 'onUndoCompletion',
          mutation: 'undoGoalCompletion',
        }),
      }),
    ),
    compose(
      graphql(Mutation.COMPLETE_GOAL, {
        props: props(getCompleteGoalInputArgs, {
          handler: 'onComplete',
          mutation: 'completeGoal',
        }),
      }),
      withHandlers({
        onChangeCompletionComment: updateInput('completionComment'),
      }),
    ),
  ),
)(GoalEdit);
