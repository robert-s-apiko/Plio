import PropTypes from 'prop-types';
import React from 'react';
import { Query, Mutation } from 'react-apollo';
import { getUserOptions } from 'plio-util';

import { CanvasColors } from '../../../../share/constants';
import { Query as Queries, Mutation as Mutations } from '../../../graphql';
import { EntityModal } from '../../components';
import CanvasForm from './CanvasForm';
import { ApolloFetchPolicies } from '../../../../api/constants';

const ChannelAddModal = ({
  isOpen,
  toggle,
  organizationId,
}) => (
  <Query query={Queries.CURRENT_USER_FULL_NAME} fetchPolicy={ApolloFetchPolicies.CACHE_ONLY}>
    {({ data: { user } }) => (
      <Mutation mutation={Mutations.CREATE_CHANNEL}>
        {createChannel => (
          <EntityModal
            {...{ isOpen, toggle }}
            title="Channel"
            initialValues={{
              originator: getUserOptions(user),
              title: '',
              color: CanvasColors.INDIGO,
              notes: '',
            }}
            onSave={({
              title,
              originator: { value: originatorId },
              color,
              notes,
            }) => {
              if (!title) throw new Error('title is required');

              return createChannel({
                variables: {
                  input: {
                    organizationId,
                    title,
                    originatorId,
                    color,
                    notes,
                  },
                },
              }).then(toggle);
            }}
            // TODO: update cache
          >
            <CanvasForm {...{ organizationId }} />
          </EntityModal>
        )}
      </Mutation>
    )}
  </Query>
);

ChannelAddModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  toggle: PropTypes.func.isRequired,
  organizationId: PropTypes.string.isRequired,
};

export default ChannelAddModal;
