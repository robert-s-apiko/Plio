import PropTypes from 'prop-types';
import React, { useCallback, useState, memo } from 'react';
import { Meteor } from 'meteor/meteor';
import {
  pick,
  compose,
  over,
  unless,
  isNil,
  pathOr,
  repeat,
  map,
} from 'ramda';
import { Query, Mutation } from 'react-apollo';
import {
  getUserOptions,
  getEntityOptions,
  lenses,
  noop,
  mapEntitiesToOptions,
  getValues,
  mapUsersToOptions,
} from 'plio-util';
import diff from 'deep-diff';

import { ApolloFetchPolicies } from '../../../../api/constants';
import { DocumentTypes } from '../../../../share/constants';
import { composeWithTracker, swal } from '../../../util';
import { Composer, renderComponent } from '../../helpers';
import { Query as Queries, Mutation as Mutations } from '../../../graphql';

const getSourceInitialValue = unless(isNil, pick(['type', 'fileId', 'url']));
const getStandard = pathOr({}, repeat('standard', 2));

const getImprovementPlanInitialValue = compose(
  over(lenses.reviewDates, map(pick(['date']))),
  over(lenses.owner, getUserOptions),
  pick([
    'desiredOutcome',
    'targetDate',
    'reviewDates',
    'owner',
  ]),
);

const getInitialValues = compose(
  over(lenses.projects, mapEntitiesToOptions),
  over(lenses.departments, mapEntitiesToOptions),
  over(lenses.owner, getUserOptions),
  over(lenses.section, getEntityOptions),
  over(lenses.type, getEntityOptions),
  over(lenses.source1, getSourceInitialValue),
  over(lenses.source2, getSourceInitialValue),
  over(lenses.notify, mapUsersToOptions),
  over(lenses.improvementPlan, getImprovementPlanInitialValue),
  pick([
    'title',
    'owner',
    'status',
    'section',
    'type',
    'source1',
    'source2',
    'description',
    'issueNumber',
    'uniqueNumber',
    'departments',
    'projects',
    'notify',
    'improvementPlan',
  ]),
);

const enhance = composeWithTracker(
  ({ standard, standardId, isOpen }, onData) => {
    if (isOpen) {
      Meteor.subscribe(
        'sourceFilesByDocument',
        { _id: standard && standard._id || standardId, documentType: DocumentTypes.STANDARD },
        { onStop: error => error && swal.error(error, 'Files subscription error') },
      );
    }
    onData(null, {});
  },
  { propsToWatch: ['isOpen'] },
);

const StandardEditContainer = ({
  standard: _standard = null,
  standardId = _standard && _standard._id,
  organizationId,
  isOpen,
  toggle,
  onDelete,
  fetchPolicy = ApolloFetchPolicies.CACHE_AND_NETWORK,
  ...props
}) => {
  const [standard, setStandard] = useState(_standard);
  const [initialValues, setInitialValues] = useState(unless(isNil, getInitialValues, _standard));
  const refetchQueries = useCallback(() => [{
    query: Queries.STANDARD_CARD,
    variables: { _id: standardId },
  }], [standardId]);
  return (
    <Composer
      components={[
        /* eslint-disable react/no-children-prop */
        <Query
          {...{ fetchPolicy }}
          query={Queries.STANDARD_CARD}
          variables={{ _id: standardId }}
          skip={!isOpen || !!_standard}
          onCompleted={(data) => {
            const newStandard = getStandard(data);
            setInitialValues(getInitialValues(newStandard));
            setStandard(newStandard);
          }}
          children={noop}
        />,
        <Mutation
          mutation={Mutations.UPDATE_STANDARD}
          onCompleted={({ updateStandard }) => setStandard(updateStandard)}
          children={noop}
        />,
        <Mutation
          mutation={Mutations.DELETE_STANDARD}
          refetchQueries={() => [
            { query: Queries.STANDARD_LIST, variables: { organizationId } },
            { query: Queries.CANVAS_PAGE, variables: { organizationId } },
          ]}
          children={noop}
        />,
        /* eslint-enable react/no-children-prop */
      ]}
    >
      {([
        { loading, error },
        updateStandard,
        deleteStandard,
      ]) => renderComponent({
        ...props,
        loading,
        error,
        organizationId,
        isOpen,
        toggle,
        standard,
        initialValues,
        refetchQueries,
        onSubmit: async (values, form) => {
          const currentValues = getInitialValues(standard);
          const difference = diff(values, currentValues);

          if (!difference) return undefined;

          const {
            title,
            status,
            description = '',
            issueNumber,
            uniqueNumber,
            source1,
            source2,
            departments,
            projects,
            notify = [],
            section: { value: sectionId } = {},
            type: { value: typeId } = {},
            owner: { value: owner } = {},
            improvementPlan: {
              desiredOutcome,
              targetDate,
              reviewDates,
              owner: { value: improvementPlanOwner } = {},
            },
          } = values;

          return updateStandard({
            variables: {
              input: {
                _id: standard._id,
                departmentsIds: getValues(departments),
                projectIds: getValues(projects),
                notify: getValues(notify),
                improvementPlan: {
                  desiredOutcome,
                  targetDate,
                  reviewDates,
                  owner: improvementPlanOwner,
                },
                source1,
                source2,
                title,
                status,
                sectionId,
                typeId,
                owner,
                description,
                issueNumber,
                uniqueNumber,
              },
            },
          }).then(noop).catch((err) => {
            form.reset(currentValues);
            throw err;
          });
        },
        onDelete: () => {
          if (onDelete) return onDelete();
          return swal.promise({
            text: `The standard "${standard.title}" will be deleted`,
            confirmButtonText: 'Delete',
            successTitle: 'Deleted!',
            successText: `The standard "${standard.title}" was deleted successfully.`,
          }, () => deleteStandard({
            variables: {
              input: {
                _id: standard._id,
              },
            },
          }).then(toggle));
        },
      })}
    </Composer>
  );
};

StandardEditContainer.propTypes = {
  organizationId: PropTypes.string.isRequired,
  isOpen: PropTypes.bool.isRequired,
  toggle: PropTypes.func.isRequired,
  standard: PropTypes.object,
  onDelete: PropTypes.func,
  standardId: PropTypes.string,
  fetchPolicy: PropTypes.string,
};

export default memo(enhance(StandardEditContainer));
