import { connect } from 'react-redux';
import {
  compose,
  withHandlers,
  withProps,
  withState,
  mapProps,
  branch,
  renderNothing,
} from 'recompose';
import { composeWithTracker } from '@storybook/react-komposer';
import property from 'lodash.property';

import store from '/imports/client/store';
import ReviewSubcard from '../../components/Review/Subcard';
import initMainData from '../loaders/initMainData';
import loadUsersData from '../../../loaders/loadUsersData';
import { pickDeep, getId, identity } from '/imports/api/helpers';
import {
  onFrequencyChanged,
  onAnnualDateChanged,
  onReminderChanged,
  onReviewerChanged,
} from './handlers';

const enhance = compose(
  withProps({ store }),
  connect(),
  withState('collapsed', 'setCollapsed', true),
  composeWithTracker(initMainData),
  composeWithTracker(loadUsersData),
  connect(pickDeep(['organizations.organization', 'collections.usersByOrgIds'])),
  branch(
    property('organization'),
    identity,
    renderNothing,
  ),
  mapProps(({ usersByOrgIds, organization, ...props }) => ({
    ...props,
    organization,
    users: usersByOrgIds[getId(organization)],
  })),
  withHandlers({
    onFrequencyChanged,
    onAnnualDateChanged,
    onReminderChanged,
    onReviewerChanged,
  }),
);

export default enhance(ReviewSubcard);
