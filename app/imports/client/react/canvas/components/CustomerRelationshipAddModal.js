import PropTypes from 'prop-types';
import React from 'react';
import { Query, Mutation } from 'react-apollo';
import { getUserOptions } from 'plio-util';

import { CanvasColors } from '../../../../share/constants';
import { Query as Queries, Mutation as Mutations } from '../../../graphql';
import { EntityModal } from '../../components';
import CustomerRelationshipForm from './CustomerRelationshipForm';
import { ApolloFetchPolicies } from '../../../../api/constants';

const CustomerRelationshipAddModal = ({
  isOpen,
  toggle,
  organizationId,
}) => (
  <Query query={Queries.CURRENT_USER_FULL_NAME} fetchPolicy={ApolloFetchPolicies.CACHE_ONLY}>
    {({ data: { user } }) => (
      <Mutation mutation={Mutations.CREATE_CUSTOMER_RELATIONSHIP}>
        {createCustomerRelationship => (
          <EntityModal
            {...{ isOpen, toggle }}
            title="Customer relationship"
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

              return createCustomerRelationship({
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
            <CustomerRelationshipForm {...{ organizationId }} />
          </EntityModal>
        )}
      </Mutation>
    )}
  </Query>
);

CustomerRelationshipAddModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  toggle: PropTypes.func.isRequired,
  organizationId: PropTypes.string.isRequired,
};

export default CustomerRelationshipAddModal;
