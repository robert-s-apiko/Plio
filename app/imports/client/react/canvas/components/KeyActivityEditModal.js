import PropTypes from 'prop-types';
import React, { Fragment } from 'react';
import diff from 'deep-diff';
import { Query, Mutation } from 'react-apollo';
import {
  getUserOptions,
  lenses,
  noop,
  mapUsersToOptions,
  getValues,
  getIds,
} from 'plio-util';
import { compose, pick, over, pathOr, repeat } from 'ramda';
import { pure } from 'recompose';

import { swal } from '../../../util';
import { AWSDirectives, CanvasTypes } from '../../../../share/constants';
import { ApolloFetchPolicies } from '../../../../api/constants';
import { Query as Queries, Mutation as Mutations } from '../../../graphql';
import { validateKeyActivity } from '../../../validation';
import { WithState, Composer } from '../../helpers';
import CanvasForm from './CanvasForm';
import CanvasFilesSubcard from './CanvasFilesSubcard';
import CanvasModalGuidance from './CanvasModalGuidance';
import {
  EntityModalNext,
  EntityModalHeader,
  EntityModalBody,
  EntityModalForm,
  RenderSwitch,
} from '../../components';
import CanvasSubcards from './CanvasSubcards';
import activelyManage from '../../forms/decorators/activelyManage';

const getKeyActivity = pathOr({}, repeat('keyActivity', 2));
const getInitialValues = compose(
  over(lenses.originator, getUserOptions),
  over(lenses.notify, mapUsersToOptions),
  over(lenses.risks, getIds),
  over(lenses.goals, getIds),
  over(lenses.standards, getIds),
  over(lenses.nonconformities, getIds),
  over(lenses.potentialGains, getIds),
  over(lenses.lessons, getIds),
  pick([
    'originator',
    'title',
    'color',
    'notes',
    'notify',
    'risks',
    'goals',
    'standards',
    'nonconformities',
    'potentialGains',
    'lessons',
  ]),
  getKeyActivity,
);

const KeyActivityEditModal = ({
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
            query={Queries.KEY_ACTIVITY_CARD}
            variables={{ _id, organizationId }}
            skip={!isOpen}
            onCompleted={data => setState({ initialValues: getInitialValues(data) })}
            fetchPolicy={ApolloFetchPolicies.CACHE_AND_NETWORK}
            children={noop}
          />,
          <Mutation mutation={Mutations.UPDATE_KEY_ACTIVITY} children={noop} />,
          <Mutation mutation={Mutations.DELETE_KEY_ACTIVITY} children={noop} />,
          /* eslint-disable react/no-children-prop */
        ]}
      >
        {([{ data, ...query }, updateKeyActivity, deleteKeyActivity]) => (
          <EntityModalNext
            {...{ isOpen, toggle }}
            isEditMode
            loading={query.loading}
            error={query.error}
            onDelete={() => {
              const { title } = getKeyActivity(data);
              swal.promise(
                {
                  text: `The key activity "${title}" will be deleted`,
                  confirmButtonText: 'Delete',
                  successTitle: 'Deleted!',
                  successText: `The key activity "${title}" was deleted successfully.`,
                },
                () => deleteKeyActivity({
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
              decorators={[activelyManage]}
              validate={validateKeyActivity}
              onSubmit={(values, form) => {
                const currentValues = getInitialValues(data);
                const isDirty = diff(values, currentValues);

                if (!isDirty) return undefined;

                const {
                  title,
                  originator,
                  color,
                  notes = '',
                  notify = [],
                  risks: riskIds,
                  goals: goalIds,
                  standards: standardsIds,
                  nonconformities: nonconformityIds,
                  potentialGains: potentialGainIds,
                } = values;

                return updateKeyActivity({
                  variables: {
                    input: {
                      _id,
                      title,
                      notes,
                      color,
                      riskIds,
                      goalIds,
                      standardsIds,
                      nonconformityIds,
                      potentialGainIds,
                      notify: getValues(notify),
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
                  <EntityModalHeader label="Key activity" />
                  <EntityModalBody>
                    <CanvasModalGuidance documentType={CanvasTypes.KEY_ACTIVITY} />
                    <RenderSwitch
                      require={isOpen && data.keyActivity && data.keyActivity.keyActivity}
                      errorWhenMissing={noop}
                      loading={query.loading}
                      renderLoading={<CanvasForm {...{ organizationId }} />}
                    >
                      {keyActivity => (
                        <Fragment>
                          <CanvasForm {...{ organizationId }} save={handleSubmit} />
                          <CanvasSubcards
                            {...{ organizationId }}
                            section={keyActivity}
                            onChange={handleSubmit}
                            refetchQuery={Queries.KEY_ACTIVITY_CARD}
                            documentType={CanvasTypes.KEY_ACTIVITY}
                            user={data && data.user}
                          />
                          {/*
                            TODO Move CanvasFilesSubcard into CanvasSubcards
                            when it will be refactored
                           */}
                          <CanvasFilesSubcard
                            {...{ organizationId }}
                            documentId={keyActivity._id}
                            onUpdate={updateKeyActivity}
                            slingshotDirective={AWSDirectives.KEY_ACTIVITY_FILES}
                            documentType={CanvasTypes.KEY_ACTIVITY}
                          />
                        </Fragment>
                      )}
                    </RenderSwitch>
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

KeyActivityEditModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  toggle: PropTypes.func.isRequired,
  organizationId: PropTypes.string.isRequired,
  _id: PropTypes.string,
};

export default pure(KeyActivityEditModal);
