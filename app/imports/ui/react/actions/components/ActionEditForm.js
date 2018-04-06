import PropTypes from 'prop-types';
import React, { Fragment } from 'react';
import { Field } from 'react-final-form';

import { getClassByStatus, getStatusName } from '../../../../api/actions/helpers';
import ActionForm from './ActionForm';
import ActionVerificationForm from './ActionVerificationForm';
import { FormField, Status, CardBlock, SelectInputAdapter } from '../../components';

const ActionEditForm = ({
  status,
  children,
  loadLinkedDocs,
  onLink,
  onUnlink,
  ...props
}) => (
  <Fragment>
    <ActionForm {...props}>
      <FormField>
        Linked to
        <Field
          multi
          loadOptionsOnFocus
          name="linkedTo"
          placeholder="Linked to"
          component={SelectInputAdapter}
          loadOptions={loadLinkedDocs}
          onChange={onLink}
          onRemoveMultiValue={onUnlink}
        />
      </FormField>
      <FormField>
        Status
        <Status color={getClassByStatus(status)}>
          {getStatusName(status)}
        </Status>
      </FormField>
    </ActionForm>
    {props.isCompleted && (
      <CardBlock>
        <ActionVerificationForm {...props} />
      </CardBlock>
    )}
  </Fragment>
);

ActionEditForm.propTypes = {
  status: PropTypes.number,
  isCompleted: PropTypes.bool,
  children: PropTypes.node,
  loadLinkedDocs: PropTypes.func,
  onLink: PropTypes.func,
  onUnlink: PropTypes.func,
};

export default ActionEditForm;
