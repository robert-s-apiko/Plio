import PropTypes from 'prop-types';
import React, { Fragment } from 'react';
import { Query, Mutation } from 'react-apollo';
import { compose, pick, over, pathOr, repeat, path, defaultTo } from 'ramda';
import {
  getUserOptions,
  lenses,
  noop,
  getValues,
  mapUsersToOptions,
  getIds,
} from 'plio-util';
import { pure } from 'recompose';
import { delayed } from 'libreact/lib/delayed';
import diff from 'deep-diff';

import { swal } from '../../../util';
import { AWSDirectives, CanvasTypes } from '../../../../share/constants';
import { ApolloFetchPolicies } from '../../../../api/constants';
import { Query as Queries, Mutation as Mutations } from '../../../graphql';
import { validateKeyPartner } from '../../../validation';
import {
  EntityModalNext,
  EntityModalHeader,
  EntityModalBody,
  EntityModalForm,
  RenderSwitch,
} from '../../components';
import { WithState, Composer } from '../../helpers';
import activelyManage from '../../forms/decorators/activelyManage';
import KeyPartnerForm from './KeyPartnerForm';
import CanvasModalGuidance from './CanvasModalGuidance';

const keyPartnerPath = repeat('keyPartner', 2);
const getKeyPartner = path(keyPartnerPath);
const getInitialValues = compose(
  over(lenses.originator, getUserOptions),
  over(lenses.notify, mapUsersToOptions),
  over(lenses.risks, getIds),
  over(lenses.goals, getIds),
  over(lenses.standards, getIds),
  over(lenses.nonconformities, getIds),
  over(lenses.potentialGains, getIds),
  over(lenses.lessons, getIds),
  over(lenses.files, defaultTo([])),
  pick([
    'originator',
    'title',
    'color',
    'criticality',
    'levelOfSpend',
    'notes',
    'notify',
    'risks',
    'goals',
    'standards',
    'nonconformities',
    'potentialGains',
    'lessons',
  ]),
  pathOr({}, keyPartnerPath),
);

const DelayedCanvasSubcards = delayed({
  loader: () => import('./CanvasSubcards'),
  idle: true,
  delay: 200,
});

const KeyPartnerEditModal = ({
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
            query={Queries.KEY_PARTNER_CARD}
            variables={{ _id, organizationId }}
            skip={!isOpen}
            onCompleted={data => setState({ initialValues: getInitialValues(data) })}
            fetchPolicy={ApolloFetchPolicies.CACHE_AND_NETWORK}
            children={noop}
          />,
          <Mutation mutation={Mutations.UPDATE_KEY_PARTNER} children={noop} />,
          <Mutation mutation={Mutations.DELETE_KEY_PARTNER} children={noop} />,
          /* eslint-disable react/no-children-prop */
        ]}
      >
        {([{ data, ...query }, updateKeyPartner, deleteKeyPartner]) => {
          const keyPartner = getKeyPartner(data);
          return (
            <EntityModalNext
              {...{ isOpen, toggle }}
              isEditMode
              loading={query.loading}
              error={query.error}
              onDelete={() => {
                const { title } = keyPartner || {};
                swal.promise(
                  {
                    text: `The key partner "${title}" will be deleted`,
                    confirmButtonText: 'Delete',
                    successTitle: 'Deleted!',
                    successText: `The key partner "${title}" was deleted successfully.`,
                  },
                  () => deleteKeyPartner({
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
                validate={validateKeyPartner}
                onSubmit={(values, form) => {
                  const currentValues = getInitialValues(data);
                  const isDirty = diff(values, currentValues);

                  if (!isDirty) return undefined;

                  const {
                    title,
                    originator,
                    color,
                    criticality,
                    levelOfSpend,
                    notes = '', // final form sends undefined value instead of an empty string
                    notify = [],
                    risks: riskIds,
                    goals: goalIds,
                    standards: standardsIds,
                    nonconformities: nonconformityIds,
                    potentialGains: potentialGainIds,
                    files,
                  } = values;

                  return updateKeyPartner({
                    variables: {
                      input: {
                        _id,
                        title,
                        notes,
                        color,
                        criticality,
                        levelOfSpend,
                        riskIds,
                        goalIds,
                        standardsIds,
                        nonconformityIds,
                        potentialGainIds,
                        notify: getValues(notify),
                        fileIds: files,
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
                    <EntityModalHeader label="Key partner" />
                    <EntityModalBody>
                      <CanvasModalGuidance documentType={CanvasTypes.KEY_PARTNER} />
                      <RenderSwitch
                        require={isOpen && keyPartner}
                        errorWhenMissing={noop}
                        loading={query.loading}
                        renderLoading={<KeyPartnerForm {...{ organizationId }} />}
                      >
                        {() => (
                          <Fragment>
                            <KeyPartnerForm {...{ organizationId }} save={handleSubmit} />
                            <DelayedCanvasSubcards
                              {...{ organizationId }}
                              section={keyPartner}
                              onChange={handleSubmit}
                              refetchQuery={Queries.KEY_PARTNER_CARD}
                              documentType={CanvasTypes.KEY_PARTNER}
                              slingshotDirective={AWSDirectives.KEY_PARTNER_FILES}
                              user={data && data.user}
                            />
                          </Fragment>
                        )}
                      </RenderSwitch>
                    </EntityModalBody>
                  </Fragment>
                )}
              </EntityModalForm>
            </EntityModalNext>
          );
        }}
      </Composer>
    )}
  </WithState>
);

KeyPartnerEditModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  toggle: PropTypes.func.isRequired,
  organizationId: PropTypes.string.isRequired,
  _id: PropTypes.string,
};

export default pure(KeyPartnerEditModal);
