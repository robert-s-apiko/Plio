import { graphql } from 'react-apollo';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { lifecycle } from 'recompose';
import moment from 'moment';

import { Query, Mutation } from '../../../../client/graphql';
import { namedCompose, withApollo, withStore } from '../../helpers';
import DashboardPage from '../components/DashboardPage';
import { getMetrics, getRouteName, getIconName, getMetricText } from '../helpers';

export default namedCompose('DashboardPageContainer')(
  withApollo,
  withStore,
  graphql(Query.COUNTS, {
    options: ({ organization: { _id: organizationId } = {} }) => ({
      variables: { organizationId },
      pollInterval: 60000,
    }),
    props: ({
      data: {
        counts: {
          __typename,
          ...counts
        } = {},
      },
      ownProps: {
        organization: {
          serialNumber: orgSerialNumber,
          homeScreenTitles = {},
        } = {},
      },
    }) => ({
      items: Object.keys(counts).map((key) => {
        const { totalCount, notViewedCount } = counts[key];

        return {
          title: homeScreenTitles[key],
          href: FlowRouter.path(getRouteName(key), { orgSerialNumber }),
          icon: getIconName(key),
          text: getMetrics(getMetricText(key), totalCount),
          label: notViewedCount ? `${notViewedCount} new` : '',
        };
      }),
    }),
  }),
  graphql(Mutation.UPDATE_ORGANIZATION_LAST_ACCESSED_DATE),
  lifecycle({
    componentDidMount() {
      const {
        mutate,
        organization: { _id, lastAccessedDate },
      } = this.props;

      // limit to once a day
      if (!lastAccessedDate || !moment().isSame(lastAccessedDate, 'day')) {
        mutate({ variables: { input: { _id } } });
      }
    },
  }),
)(DashboardPage);
