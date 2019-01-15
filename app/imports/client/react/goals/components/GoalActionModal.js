import React from 'react';
import connectUI from 'redux-ui';
import { connect } from 'react-redux';
import { withHandlers } from 'recompose';
import { find, propEq } from 'ramda';
import { getIds } from 'plio-util';

import { ActionTypes, DocumentTypes, UserRoles } from '../../../../share/constants';
import { Query as Queries } from '../../../graphql';
import { namedCompose } from '../../helpers';
import ActionModalContainer from '../../actions/containers/ActionModalContainer';

const enhance = namedCompose('GoalActionModal')(
  connect(),
  connectUI(),
  withHandlers({
    refetchQueries: ({ ui: { activeGoal } }) => () => activeGoal ? [
      {
        query: Queries.DASHBOARD_GOAL,
        variables: { _id: activeGoal },
      },
    ] : [],
  }),
);

export default enhance(({
  ui: {
    activeGoal: goalId,
    activeAction: actionId,
  },
  user: { roles } = {},
  isOpen,
  toggle,
  organizationId,
  refetchQueries,
  goals,
}) => {
  if (!goalId) return null;
  const goal = find(propEq('_id', goalId), goals);
  return (
    <ActionModalContainer
      {...{
        isOpen,
        toggle,
        organizationId,
        refetchQueries,
        actionId,
      }}
      canCompleteAnyAction={roles && roles.includes(UserRoles.COMPLETE_ANY_ACTION)}
      actionIds={getIds(goal.actions)}
      type={ActionTypes.GENERAL_ACTION}
      linkedTo={{
        documentId: goalId,
        documentType: DocumentTypes.GOAL,
      }}
      linkedToField={{
        _id: goal._id,
        title: goal.title,
        sequentialId: goal.sequentialId,
      }}
    />
  );
});
