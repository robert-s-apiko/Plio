import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { Query, Mutation } from 'react-apollo';
import { noop, getUserOptions, toDate } from 'plio-util';

import { Query as Queries, Mutation as Mutations } from '../../../graphql';
import { ApolloFetchPolicies } from '../../../../api/constants';
import { validateLesson } from '../../../validation';
import { Composer, renderComponent } from '../../helpers';
import { swal } from '../../../util';

const LessonAddContainer = ({
  organizationId,
  isOpen,
  toggle,
  documentId,
  documentType,
  refetchQuery,
  onLink,
  onUnlink,
  ...props
}) => (
  <Composer
    components={[
      /* eslint-disable react/no-children-prop */
      <Query
        query={Queries.CURRENT_USER_FULL_NAME}
        fetchPolicy={ApolloFetchPolicies.CACHE_ONLY}
        children={noop}
      />,
      <Mutation mutation={Mutations.CREATE_LESSON} children={noop} />,
      <Mutation mutation={Mutations.REMOVE_LESSON} children={noop} />,
      /* eslint-enable react/no-children-prop */
    ]}
  >
    {([{ data: { user } }, createLesson, deleteLesson]) => renderComponent({
      ...props,
      isOpen,
      toggle,
      organizationId,
      initialValues: {
        title: '',
        notes: '',
        owner: getUserOptions(user),
        date: moment(),
      },
      onSubmit: (values) => {
        const {
          title,
          date,
          notes,
          owner: { value: owner },
        } = values;

        const errors = validateLesson(values);
        if (errors) return errors;

        return createLesson({
          variables: {
            input: {
              title,
              owner,
              notes,
              organizationId,
              date: toDate(date),
              linkedTo: {
                documentId,
                documentType,
              },
            },
          },
          refetchQueries: [{
            query: refetchQuery,
            variables: { _id: documentId, organizationId },
          }],
        }).then(({ data: { createLesson: { lesson } } }) => onLink(lesson._id))
          .then(toggle || noop);
      },
      // TODO move it into LessonEditContainer when lesson will be refactored
      onDelete: (event, { entity: { _id, title } }) => swal.promise({
        text: `The lesson learned "${title}" will be permanently deleted`,
        confirmButtonText: 'Delete',
        successTitle: 'Deleted!',
        successText: `The lesson learned "${title}" was deleted successfully.`,
      }, () => deleteLesson({
        variables: {
          input: { _id },
        },
        refetchQueries: [{
          query: refetchQuery,
          variables: { _id: documentId, organizationId },
        }],
      })).then(() => onUnlink(_id)),
    })}
  </Composer>
);

LessonAddContainer.propTypes = {
  organizationId: PropTypes.string.isRequired,
  documentId: PropTypes.string.isRequired,
  documentType: PropTypes.string.isRequired,
  refetchQuery: PropTypes.object.isRequired,
  onLink: PropTypes.func.isRequired,
  onUnlink: PropTypes.func.isRequired,
  isOpen: PropTypes.bool,
  toggle: PropTypes.func,
};

export default LessonAddContainer;
