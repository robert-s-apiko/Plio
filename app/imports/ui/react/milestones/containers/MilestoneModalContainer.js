/* eslint-disable react/prop-types */

import React from 'react';
import connectUI from 'redux-ui';
import { connect } from 'react-redux';

import { namedCompose } from '../../helpers';
import MilestoneAddModalContainer from './MilestoneAddModalContainer';
import MilestoneEditModalContainer from './MilestoneEditModalContainer';

const enhance = namedCompose('MilestoneModalContainer')(
  connect(),
  connectUI(),
);

export default enhance(({
  ui: { activeGoal, activeMilestone },
  isOpen,
  toggle,
  organizationId,
}) => {
  if (!activeGoal) return null;

  if (!activeMilestone) {
    return (
      <MilestoneAddModalContainer
        {...{ isOpen, toggle, organizationId }}
        goalId={activeGoal}
      />
    );
  }

  return (
    <MilestoneEditModalContainer
      {...{ isOpen, toggle, organizationId }}
      goalId={activeGoal}
      milestoneId={activeMilestone}
    />
  );
});
