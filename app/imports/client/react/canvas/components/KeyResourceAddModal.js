import PropTypes from 'prop-types';
import React from 'react';
import { Query, Mutation } from 'react-apollo';
import { getUserOptions } from 'plio-util';

import { KeyResourceColors } from '../../../../share/constants';
import { Query as Queries, Mutation as Mutations } from '../../../graphql';
import { EntityModal } from '../../components';
import KeyResourceForm from './KeyResourceForm';
import { ApolloFetchPolicies } from '../../../../api/constants';

const KeyActivitiesAddModal = ({
  isOpen,
  toggle,
  organizationId,
}) => (
  <Query query={Queries.CURRENT_USER_FULL_NAME} fetchPolicy={ApolloFetchPolicies.CACHE_ONLY}>
    {({ data: { user } }) => (
      <Mutation mutation={Mutations.CREATE_KEY_RESOURCE}>
        {createKeyResource => (
          <EntityModal
            {...{ isOpen, toggle }}
            title="Key resource"
            initialValues={{
              originator: getUserOptions(user),
              title: '',
              color: KeyResourceColors.INDIGO,
              notes: '',
            }}
            onSave={({
              title,
              originator: { value: originatorId },
              color,
              notes,
            }) => {
              if (!title) throw new Error('title is required');

              return createKeyResource({
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
            <KeyResourceForm {...{ organizationId }} />
          </EntityModal>
        )}
      </Mutation>
    )}
  </Query>
);

KeyActivitiesAddModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  toggle: PropTypes.func.isRequired,
  organizationId: PropTypes.string.isRequired,
};

export default KeyActivitiesAddModal;
