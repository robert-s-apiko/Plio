import React from 'react';
import connectUI from 'redux-ui';
import moment from 'moment';
import { map, concat, sort, over } from 'ramda';
import { withHandlers, compose, mapProps } from 'recompose';
import { byDate, lenses, toDate } from 'plio-util';
import GoalsChart from '../components/GoalsChart';
import MilestoneChartActionsContainer from '../containers/MilestoneChartActionsContainer';
import ActionsPopoverContainer from '../containers/ActionsPopoverContainer';
import { TimelineSymbols } from '../../../../api/constants';
import { getMilestonePointColor } from '../../../../api/milestone/helpers';
import { getActionPointColor } from '../../../../api/actions/helpers';
import { MilestoneStatuses, ActionIndexes } from '../../../../share/constants';
import { getFormattedDate } from '../../../../share/helpers';

const getMilestonePoints = ({ _id: goalId, milestones, color }) => (
  map((milestone) => {
    const {
      _id,
      completionTargetDate,
      status,
      title,
    } = milestone;
    return {
      title,
      id: _id,
      date: toDate(moment(completionTargetDate).startOf('day')),
      label: `Milestone: ${title} - ${getFormattedDate(completionTargetDate)}`,
      fill: getMilestonePointColor(status, color),
      symbol: TimelineSymbols.MILESTONE,
      isCompleted: status === MilestoneStatuses.COMPLETE,
      renderPopover: props =>
        <MilestoneChartActionsContainer {...{ ...props, ...milestone, goalId }} />,
    };
  }, milestones)
);

const getActionPoints = ({ _id: goalId, actions, color }) => (
  map((action) => {
    const {
      _id,
      status,
      title,
      toBeCompletedBy,
      completionTargetDate = { profile: {} },
    } = action;
    return {
      title,
      id: _id,
      date: toDate(moment(completionTargetDate).startOf('day')),
      userName: toBeCompletedBy.profile.fullName,
      label: `Action: ${title} - ${getFormattedDate(completionTargetDate)}`,
      fill: getActionPointColor(status, color),
      symbol: TimelineSymbols.ACTION,
      isCompleted: status === ActionIndexes.COMPLETED,
      renderPopover: props =>
        <ActionsPopoverContainer {...{ ...props, ...action, goalId }} />,
    };
  }, actions)
);

const addPointsDataToGoals = map((goal) => {
  const milestonePoints = getMilestonePoints(goal);
  const actionPoints = getActionPoints(goal);

  return {
    ...goal,
    points: sort(byDate, concat(milestonePoints, actionPoints)),
  };
});

const enhance = compose(
  connectUI(),
  withHandlers({
    onEdit: ({ updateUI }) => goalId => (
      updateUI({
        isEditModalOpen: true,
        activeGoal: goalId,
      })
    ),
  }),
  mapProps(over(lenses.goals, addPointsDataToGoals)),
);

export default enhance(GoalsChart);
