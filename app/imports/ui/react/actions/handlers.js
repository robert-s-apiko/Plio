import { Cache, toDate, mapRejectedEntitiesToOptions } from 'plio-util';
import { FORM_ERROR } from 'final-form';
import { identity } from 'ramda';
import { swal } from '../../../client/util';
import { Mutation, Fragment, Query } from '../../../client/graphql';
import { updateGoalFragment } from '../../../client/apollo/utils';
import { client } from '../../../client/apollo';
import { DocumentTypes, ActionTypes } from '../../../share/constants';
import { handleGQError } from '../../../api/handleGQError';

const {
  DELETE_ACTION,
  CREATE_ACTION,
  LINK_DOC_TO_ACTION,
} = Mutation;

export const createGeneralAction = ({
  organizationId,
  goalId,
  onCreate,
  [CREATE_ACTION.name]: mutate,
  mutateWithState = identity,
}) => async (
  {
    title,
    description,
    completionTargetDate,
    planInPlace,
    owner: { value: ownerId },
    toBeCompletedBy: { value: toBeCompletedBy },
  },
  {
    ownProps: { flush } = {},
  } = {},
) => {
  if (!title) return { [FORM_ERROR]: 'Title is required' };

  try {
    const { data } = await mutateWithState(mutate({
      variables: {
        input: {
          title,
          description,
          ownerId,
          organizationId,
          planInPlace,
          toBeCompletedBy,
          completionTargetDate: toDate(completionTargetDate),
          type: ActionTypes.GENERAL_ACTION,
          linkedTo: [{
            documentId: goalId,
            documentType: DocumentTypes.GOAL,
          }],
        },
      },
      update: (proxy, { data: { [CREATE_ACTION.name]: { action } } }) => updateGoalFragment(
        Cache.addAction(action),
        {
          id: goalId,
          fragment: Fragment.GOAL_CARD,
        },
        proxy,
      ),
    }));

    if (onCreate) onCreate();

    if (flush) {
      const { [CREATE_ACTION.name]: { action } } = data;
      return flush(action);
    }
    return data;
  } catch (error) {
    return { [FORM_ERROR]: handleGQError(error) };
  }
};

export const onDelete = ({ [DELETE_ACTION.name]: mutate, goalId }) =>
  (e, { entity: { _id, title } }) => (
    swal.promise({
      text: `The action "${title}" will be deleted`,
      confirmButtonText: 'Delete',
      successTitle: 'Deleted!',
      successText: `The action "${title}" was deleted successfully.`,
    }, () => mutate({
      variables: {
        input: { _id },
      },
      update: updateGoalFragment(Cache.deleteActionById(_id), {
        id: goalId,
        fragment: Fragment.GOAL_CARD,
      }),
    }))
  );

export const linkGoalToAction = ({
  goalId,
  onCreate,
  [LINK_DOC_TO_ACTION.name]: mutate,
  mutateWithState = identity,
}) => async (
  { action: { value: actionId } = {} },
  {
    ownProps: { flush } = {},
  } = {},
) => {
  if (!actionId) return { [FORM_ERROR]: 'Action is required' };

  try {
    const { data } = await mutateWithState(mutate({
      variables: {
        input: {
          _id: actionId,
          documentId: goalId,
          documentType: DocumentTypes.GOAL,
        },
      },
      update: (proxy, { data: { [LINK_DOC_TO_ACTION.name]: { action } } }) =>
        updateGoalFragment(
          Cache.addAction(action),
          {
            id: goalId,
            fragment: Fragment.GOAL_CARD,
          },
          proxy,
        ),
    }));

    if (onCreate) onCreate();

    if (flush) {
      const { [LINK_DOC_TO_ACTION.name]: { action } } = data;
      return flush(action);
    }
    return data;
  } catch (error) {
    return { [FORM_ERROR]: handleGQError(error) };
  }
};

export const loadActions = ({ organizationId, actions }) => () => client.query({
  query: Query.ACTION_LIST,
  variables: {
    organizationId,
    type: ActionTypes.GENERAL_ACTION,
  },
}).then(({ data: { actions: { actions: resultActions } } }) => ({
  options: mapRejectedEntitiesToOptions(actions, resultActions),
}));
