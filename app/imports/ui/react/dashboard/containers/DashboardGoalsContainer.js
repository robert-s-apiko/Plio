import { graphql } from 'react-apollo';
import gql from 'graphql-tag';
import {
  withContext,
  renameProps,
  withState,
  flattenProp,
  setPropTypes,
  onlyUpdateForKeys,
  branch,
  renderNothing,
} from 'recompose';
import PropTypes from 'prop-types';
import { getGoalsLength } from 'plio-util';

import { namedCompose, withHr } from '../../helpers';
import { DashboardGoals } from '../components';
import {
  WORKSPACE_DEFAULTS,
  WorkspaceDefaultsTypes,
  WorkspaceDefaults,
} from '../../../../share/constants';
import { client } from '../../../../client/apollo';
import { DASHBOARD_GOALS_QUERY } from '../../../../api/graphql/query';

export default namedCompose('DashboardGoalsContainer')(
  setPropTypes({
    organization: PropTypes.shape({
      _id: PropTypes.string.isRequired,
      serialNumber: PropTypes.number.isRequired,
      [WORKSPACE_DEFAULTS]: PropTypes.shape({
        [WorkspaceDefaultsTypes.DISPLAY_GOALS]: PropTypes.number,
      }).isRequired,
    }).isRequired,
  }),
  withContext({ client: PropTypes.object }, () => ({ client })),
  flattenProp('organization'),
  flattenProp(WORKSPACE_DEFAULTS),
  renameProps({
    _id: 'organizationId',
    [WORKSPACE_DEFAULTS.DISPLAY_GOALS]: 'goalsPerRow',
  }),
  onlyUpdateForKeys(['organizationId', 'serialNumber', 'goalsPerRow']),
  withState('isLimitEnabled', 'setIsLimitEnabled', true),
  graphql(gql`${DASHBOARD_GOALS_QUERY}`, {
    props: ({ data: { loading, goals } }) => ({
      loading,
      goals,
    }),
    options: ({
      organizationId,
      goalsPerRow = WorkspaceDefaults[WorkspaceDefaultsTypes.DISPLAY_GOALS],
    }) => ({
      variables: {
        organizationId,
        limit: goalsPerRow,
      },
    }),
  }),
  branch(
    getGoalsLength,
    withHr,
    renderNothing,
  ),
)(DashboardGoals);
