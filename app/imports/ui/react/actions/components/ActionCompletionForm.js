import PropTypes from 'prop-types';
import React, { Fragment } from 'react';
import { Field } from 'react-final-form';
import { FormGroup, Button } from 'reactstrap';

import {
  FormField,
  SelectInputField,
  DatePickerAdapter,
  ToggleComplete,
  TextareaAdapter,
  FieldCondition,
  UndoTime,
  StyledFlexFormGroup,
} from '../../components';
import { OrgUsersSelectInputContainer } from '../../containers';

const ActionCompletionForm = ({
  organizationId,
  userId,
  isCompleted,
  isVerified,
  canCompleteAnyAction,
  onChangeCompletionTargetDate,
  onChangeToBeCompletedBy,
  onComplete,
  onUndoCompletion,
  onChangeCompletionComments,
  onChangeCompletedAt,
  onChangeCompletedBy,
}) => {
  const toBeCompletedBy = (
    <OrgUsersSelectInputContainer
      name="toBeCompletedBy"
      placeholder="To be completed by"
      onChange={onChangeToBeCompletedBy}
      component={SelectInputField}
      {...{ organizationId }}
    />
  );
  const completedBy = (
    <OrgUsersSelectInputContainer
      name="completedBy"
      placeholder="Completed by"
      onChange={onChangeCompletedBy}
      component={SelectInputField}
      disabled={isVerified}
      {...{ organizationId }}
    />
  );
  const comments = (
    <Field
      name="completionComments"
      placeholder="Enter any completion comments"
      component={TextareaAdapter}
      onBlur={e => isCompleted && onChangeCompletionComments(e)}
      disabled={isVerified}
    />
  );

  return (
    <Fragment>
      <FormField>
        Completion - target date
        <Field
          name="completionTargetDate"
          placeholderText="Completion - target date"
          onChange={onChangeCompletionTargetDate}
          render={DatePickerAdapter}
          disabled={isCompleted}
        />
      </FormField>
      {isCompleted ? (
        <Fragment>
          <FormField>
            Completed on
            <Field
              name="completedAt"
              onChange={onChangeCompletedAt}
              placeholderText="Completed on"
              render={DatePickerAdapter}
              disabled={isVerified}
            />
          </FormField>
          <FormField>
            Completed by
            <Field
              name="completedAt"
              subscription={{ value: true }}
            >
              {({ input }) => (
                <UndoTime date={input.value}>
                  {({ passed, left, isOverdue }) => (
                    <FieldCondition
                      when="completedBy"
                      is={({ value }) => !isOverdue && (value === userId || canCompleteAnyAction)}
                      otherwise={completedBy}
                    >
                      <StyledFlexFormGroup>
                        {completedBy}
                        <Button color="link" onClick={onUndoCompletion}>
                          Undo
                        </Button>
                      </StyledFlexFormGroup>
                      <span>
                        Completed {passed}, {left} left to undo
                      </span>
                    </FieldCondition>
                  )}
                </UndoTime>
              )}
            </Field>
          </FormField>
          <FormField>
            Comments
            {comments}
          </FormField>
        </Fragment>
      ) : (
        <FormField>
          To be completed by
          <FieldCondition
            when="toBeCompletedBy"
            is={({ value }) => value && (value === userId || canCompleteAnyAction)}
            otherwise={toBeCompletedBy}
          >
            <Field name="completionComments" subscription={{ value: true }}>
              {({ input }) => (
                <ToggleComplete input={toBeCompletedBy}>
                  <FormGroup className="margin-top">
                    {comments}
                  </FormGroup>
                  <Button
                    color="success"
                    onClick={() => onComplete({ completionComments: input.value })}
                  >
                    Complete
                  </Button>
                </ToggleComplete>
              )}
            </Field>
          </FieldCondition>
        </FormField>
      )}
    </Fragment>
  );
};

ActionCompletionForm.propTypes = {
  organizationId: PropTypes.string.isRequired,
  userId: PropTypes.string,
  isCompleted: PropTypes.bool,
  isVerified: PropTypes.bool,
  canCompleteAnyAction: PropTypes.bool,
  onChangeCompletionTargetDate: PropTypes.func,
  onChangeToBeCompletedBy: PropTypes.func,
  onComplete: PropTypes.func,
  onUndoCompletion: PropTypes.func,
  onChangeCompletionComments: PropTypes.func,
  onChangeCompletedAt: PropTypes.func,
  onChangeCompletedBy: PropTypes.func,
};

export default ActionCompletionForm;
