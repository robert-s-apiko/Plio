import PropTypes from 'prop-types';
import React, { Fragment } from 'react';
import { Field } from 'react-final-form';

import {
  FormField,
  CardBlock,
  TextareaAdapter,
  SelectInputField,
  InputField,
} from '../../components';
import { OrgUsersSelectInputContainer } from '../../containers';
import ActionCompletionForm from './ActionCompletionForm';
import ActionPlan from './ActionPlan';

const ActionForm = ({
  children,
  organizationId,
  onChangeTitle,
  onChangeDescription,
  onChangeOwner,
  onChangePlanInPlace,
  ...props
}) => (
  <Fragment>
    <CardBlock>
      <FormField>
        Title
        <InputField
          name="title"
          onBlur={onChangeTitle}
          placeholder="Title"
        />
      </FormField>
      <FormField>
        Description
        <Field
          name="description"
          onBlur={onChangeDescription}
          placeholder="Description"
          component={TextareaAdapter}
        />
      </FormField>
      {children}
      <FormField>
        Owner
        <OrgUsersSelectInputContainer
          name="owner"
          placeholder="Owner"
          onChange={onChangeOwner}
          component={SelectInputField}
          {...{ organizationId }}
        />
      </FormField>
      <FormField>
        Plan in place?
        <Field
          name="planInPlace"
          onChange={onChangePlanInPlace}
          render={ActionPlan}
        />
      </FormField>
    </CardBlock>
    <CardBlock>
      <ActionCompletionForm {...{ ...props, organizationId }} />
    </CardBlock>
  </Fragment>
);

ActionForm.propTypes = {
  children: PropTypes.node,
  organizationId: PropTypes.string,
  onChangeTitle: PropTypes.func,
  onChangeDescription: PropTypes.func,
  onChangeOwner: PropTypes.func,
  onChangePlanInPlace: PropTypes.func,
  onChangeCompletionTargetDate: PropTypes.func,
  onChangeToBeCompletedBy: PropTypes.func,
};

export default ActionForm;
