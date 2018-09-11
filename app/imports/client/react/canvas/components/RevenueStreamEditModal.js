import PropTypes from 'prop-types';
import React, { Fragment } from 'react';
import { Query, Mutation } from 'react-apollo';
import { getUserOptions, lenses, noop } from 'plio-util';
import { compose, pick, over, pathOr, repeat } from 'ramda';
import { pure } from 'recompose';
import diff from 'deep-diff';

import { swal } from '../../../util';
import { AWSDirectives, CanvasSections } from '../../../../share/constants';
import { ApolloFetchPolicies } from '../../../../api/constants';
import { Query as Queries, Mutation as Mutations } from '../../../graphql';
import { validateRevenueStream } from '../../../validation';
import { WithState, Composer } from '../../helpers';
import RevenueStreamForm from './RevenueStreamForm';
import CanvasFilesSubcard from './CanvasFilesSubcard';
import {
  EntityModalNext,
  EntityModalHeader,
  EntityModalBody,
  EntityModalForm,
} from '../../components';

const getRevenueStream = pathOr({}, repeat('revenueStream', 2));
const getInitialValues = compose(
  over(lenses.originator, getUserOptions),
  pick([
    'originator',
    'title',
    'color',
    'percentOfRevenue',
    'percentOfProfit',
    'notes',
  ]),
  getRevenueStream,
);

const RevenueStreamEditModal = ({
  isOpen,
  toggle,
  organizationId,
  _id,
}) => (
  <WithState initialState={{ initialValues: {} }}>
    {({ state: { initialValues }, setState }) => (
      <Composer
        components={[
          /* eslint-disable react/no-children-prop */
          <Query
            query={Queries.REVENUE_STREAM_CARD}
            variables={{ _id }}
            skip={!isOpen}
            onCompleted={data => setState({ initialValues: getInitialValues(data) })}
            fetchPolicy={ApolloFetchPolicies.CACHE_AND_NETWORK}
            children={noop}
          />,
          <Mutation mutation={Mutations.UPDATE_REVENUE_STREAM} children={noop} />,
          <Mutation mutation={Mutations.DELETE_REVENUE_STREAM} children={noop} />,
          /* eslint-disable react/no-children-prop */
        ]}
      >
        {([{ data, ...query }, updateRevenueStream, deleteRevenueStream]) => (
          <EntityModalNext
            {...{ isOpen, toggle }}
            isEditMode
            loading={query.loading}
            error={query.error}
            guidance="Revenue stream"
            onDelete={() => {
              const { title } = getRevenueStream(data);
              swal.promise(
                {
                  text: `The revenue stream "${title}" will be deleted`,
                  confirmButtonText: 'Delete',
                  successTitle: 'Deleted!',
                  successText: `The revenue stream "${title}" was deleted successfully.`,
                },
                () => deleteRevenueStream({
                  variables: { input: { _id } },
                  refetchQueries: [
                    { query: Queries.CANVAS_PAGE, variables: { organizationId } },
                  ],
                }).then(toggle),
              );
            }}
          >
            <EntityModalForm
              {...{ initialValues }}
              validate={validateRevenueStream}
              onSubmit={(values, form) => {
                const currentValues = getInitialValues(data);
                const isDirty = diff(values, currentValues);

                if (!isDirty) return undefined;

                const {
                  title,
                  originator,
                  color,
                  percentOfRevenue,
                  percentOfProfit,
                  notes = '', // final form sends undefined value instead of an empty string
                } = values;

                return updateRevenueStream({
                  variables: {
                    input: {
                      _id,
                      title,
                      notes,
                      color,
                      percentOfRevenue,
                      percentOfProfit,
                      originatorId: originator.value,
                    },
                  },
                }).then(noop).catch((err) => {
                  form.reset(currentValues);
                  throw err;
                });
              }}
            >
              {({ handleSubmit }) => (
                <Fragment>
                  <EntityModalHeader label="Revenue stream" />
                  <EntityModalBody>
                    <RevenueStreamForm {...{ organizationId }} save={handleSubmit} />
                    {_id && (
                      <CanvasFilesSubcard
                        {...{ organizationId }}
                        documentId={_id}
                        onUpdate={updateRevenueStream}
                        slingshotDirective={AWSDirectives.REVENUE_STREAM_FILES}
                        documentType={CanvasSections.REVENUE_STREAMS}
                      />
                    )}
                  </EntityModalBody>
                </Fragment>
              )}
            </EntityModalForm>
          </EntityModalNext>
        )}
      </Composer>
    )}
  </WithState>
);

RevenueStreamEditModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  toggle: PropTypes.func.isRequired,
  organizationId: PropTypes.string.isRequired,
  _id: PropTypes.string,
};

export default pure(RevenueStreamEditModal);
