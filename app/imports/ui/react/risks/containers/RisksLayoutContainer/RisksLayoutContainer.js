import { Meteor } from 'meteor/meteor';
import {
  compose,
  defaultProps,
  withHandlers,
  lifecycle,
  branch,
  renderComponent,
  shouldUpdate,
} from 'recompose';
import { connect } from 'react-redux';
import { compose as kompose } from '@storybook/react-komposer';
import { setInitializing } from '/imports/client/store/actions/risksActions';
import { mapC, invokeStop, identity } from '/imports/api/helpers';
import { RiskFilters, RiskFilterIndexes } from '/imports/api/constants';
import { DocumentLayoutSubs } from '/imports/startup/client/subsmanagers';
import RisksLayout from '../../components/RisksLayout';
import onHandleFilterChange from '../../../handlers/onHandleFilterChange';
import onHandleReturn from '../../../handlers/onHandleReturn';
import loadDeps from '../../loaders/loadDeps';
import loadCardData from '../../loaders/loadCardData';
import loadMainData from '../../loaders/loadMainData';
import loadLayoutData from '../../../loaders/loadLayoutData';
import loadInitialData from '../../../loaders/loadInitialData';
import loadUsersData from '../../../loaders/loadUsersData';
import loadIsDiscussionOpened from '../../../loaders/loadIsDiscussionOpened';
import { observeRisks, observeRiskTypes } from '../../observers';
import {
  getFilter,
  getUrlItemId,
  getDataLoading,
} from '../../../../../client/store/selectors/global';
import {
  getOrganizationId,
  getOrgSerialNumber,
  getOrganization,
} from '../../../../../client/store/selectors/organizations';
import {
  getRisksInitializing,
  getRisksAreDepsReady,
  getSelectedRisk,
} from '../../../../../client/store/selectors/risks';
import { getIsDiscussionOpened } from '../../../../../client/store/selectors/discussion';
import { getWindowWidth } from '../../../../../client/store/selectors/window';
import { getMobileShowCard } from '../../../../../client/store/selectors/mobile';
import { composeWithTracker } from '../../../../../client/util';

const getLayoutData = () => loadLayoutData(({ filter, orgSerialNumber }) => {
  const isDeleted = filter === RiskFilterIndexes.DELETED;

  return DocumentLayoutSubs.subscribe('risksLayout', orgSerialNumber, isDeleted);
});


const enhance = compose(
  connect(),
  defaultProps({ filters: RiskFilters }),
  kompose(loadIsDiscussionOpened),
  composeWithTracker(loadInitialData, null, null, {
    shouldResubscribe: false,
  }),
  connect(state => ({
    filter: getFilter(state),
    orgSerialNumber: getOrgSerialNumber(state),
  })),
  composeWithTracker(
    getLayoutData(),
    null,
    null,
    {
      shouldResubscribe: (props, nextProps) =>
        props.orgSerialNumber !== nextProps.orgSerialNumber || props.filter !== nextProps.filter,
    },
  ),
  branch(
    props => props.loading,
    renderComponent(RisksLayout),
    identity,
  ),
  composeWithTracker(loadUsersData),
  connect(state => ({
    organizationId: getOrganizationId(state),
  })),
  lifecycle({
    componentWillMount() {
      loadMainData(this.props, () => null);
    },
  }),
  connect(state => ({
    organizationId: getOrganizationId(state),
    urlItemId: getUrlItemId(state),
  })),
  composeWithTracker(loadCardData, null, null, {
    shouldResubscribe: (props, nextProps) =>
      Boolean(props.organizationId !== nextProps.organizationId ||
        props.urlItemId !== nextProps.urlItemId),
  }),
  connect(state => ({
    organizationId: getOrganizationId(state),
    initializing: getRisksInitializing(state),
  })),
  composeWithTracker(loadDeps, null, null, {
    shouldResubscribe: (props, nextProps) =>
      props.organizationId !== nextProps.organizationId ||
    props.initializing !== nextProps.initializing,
  }),
  connect(state => ({
    dataLoading: getDataLoading(state),
    areDepsReady: getRisksAreDepsReady(state),
    initializing: getRisksInitializing(state),
  })),
  lifecycle({
    componentWillReceiveProps(nextProps) {
      if (!nextProps.dataLoading && nextProps.initializing && nextProps.areDepsReady) {
        const { dispatch, organizationId } = nextProps;

        Meteor.defer(() => {
          const args = [dispatch, { organizationId }];
          this.observers = [
            observeRisks(...args),
            observeRiskTypes(...args),
          ];
        });

        dispatch(setInitializing(false));
      }
    },
    componentWillUnmount() {
      const result = this.observers && mapC(invokeStop, this.observers);

      this.props.dispatch(setInitializing(true));

      return result;
    },
  }),
  connect(state => ({
    risk: getSelectedRisk(state),
    organization: getOrganization(state),
    orgSerialNumber: getOrgSerialNumber(state),
    isDiscussionOpened: getIsDiscussionOpened(state),
    urlItemId: getUrlItemId(state),
    filter: getFilter(state),
  })),
  shouldUpdate((props, nextProps) =>
    Boolean(props.isDiscussionOpened !== nextProps.isDiscussionOpened ||
      props.loading !== nextProps.loading ||
      typeof props.organization !== typeof nextProps.organization ||
      props.orgSerialNumber !== nextProps.orgSerialNumber ||
      props.filter !== nextProps.filter)),
  connect(state => ({
    width: getWindowWidth(state),
    showCard: getMobileShowCard(state),
  })),
  withHandlers({
    onHandleFilterChange,
    onHandleReturn,
  }),
);

export default enhance(RisksLayout);
