import PropTypes from 'prop-types';
import React, { Fragment } from 'react';

import { ProblemsStatuses } from '../../../../share/constants';
import { getClassByStatus } from '../../../../api/problems/helpers';
import RiskForm from './RiskForm';
import {
  FormField,
  Status,
  TextareaField,
  SelectInputField,
  CardBlock,
  AnalysisForm,
} from '../../components';
import { StandardsSelectInputContainer } from '../../standards';
import { DepartmentsSelectInputContainer } from '../../containers';

const RiskEditForm = ({
  status,
  organizationId,
  guidelines,
  analysis = {},
  user = {},
  onChangeStatusComment,
  onChangeStandards,
  onChangeDepartments,
  onAddDepartment,
  onChangeTargetDate,
  onChangeExecutor,
  onChangeCompletionComments,
  onChangeCompletedAt,
  onChangeCompletedBy,
  onComplete,
  onUndoCompletion,
  onChangeTitle,
  onChangeDescription,
  onChangeOriginator,
  onChangeOwner,
  onChangeMagnitude,
  onChangeType,
}) => (
  <Fragment>
    <RiskForm
      {...{
        onChangeTitle,
        onChangeDescription,
        onChangeOriginator,
        onChangeOwner,
        onChangeMagnitude,
        onChangeType,
        organizationId,
        guidelines,
      }}
    >
      <FormField>
        Status
        <Status color={getClassByStatus(status)}>
          {ProblemsStatuses[status]}
        </Status>
      </FormField>
      <FormField>
        Status comment
        <TextareaField
          name="statusComment"
          placeholder="Status comment"
          onBlur={onChangeStatusComment}
        />
      </FormField>
      <FormField>
        Standard(s)
        <StandardsSelectInputContainer
          multi
          name="standards"
          placeholder="Standard(s)"
          component={SelectInputField}
          onChange={onChangeStandards}
          organizationId={organizationId}
        />
      </FormField>
      <FormField>
        Department/sector(s)
        <DepartmentsSelectInputContainer
          name="departments"
          placeholder="Department/sector(s)"
          organizationId={organizationId}
          component={SelectInputField}
          onChange={onChangeDepartments}
          onNewOptionClick={onAddDepartment}
        />
      </FormField>
    </RiskForm>
    <CardBlock>
      <FormField>
        Initial risk analysis
        {null}
      </FormField>
      <AnalysisForm
        status={analysis.status}
        userId={user._id}
        organizationId={organizationId}
        {...{
          onChangeTargetDate,
          onChangeCompletedAt,
          onChangeExecutor,
          onChangeCompletedBy,
          onChangeCompletionComments,
          onComplete,
          onUndoCompletion,
        }}
      />
    </CardBlock>
  </Fragment>
);

RiskEditForm.propTypes = {
  status: PropTypes.number,
  analysis: PropTypes.shape({
    status: PropTypes.number,
  }),
  organizationId: PropTypes.string.isRequired,
  user: PropTypes.object,
  onChangeStatusComment: PropTypes.func,
  onChangeStandards: PropTypes.func,
  onChangeDepartments: PropTypes.func,
  onAddDepartment: PropTypes.func,
  onChangeTargetDate: PropTypes.func,
  onChangeExecutor: PropTypes.func,
  onChangeCompletionComments: PropTypes.func,
  onChangeCompletedAt: PropTypes.func,
  onChangeCompletedBy: PropTypes.func,
  onComplete: PropTypes.func,
  onUndoCompletion: PropTypes.func,
  ...RiskForm.propTypes,
};

export default RiskEditForm;
