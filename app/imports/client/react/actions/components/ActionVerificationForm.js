import PropTypes from 'prop-types';
import React, { Fragment } from 'react';
import { Field, FormSpy } from 'react-final-form';
import { FormGroup, Button } from 'reactstrap';

import {
  FormField,
  ToggleComplete,
  TextareaAdapter,
  FieldCondition,
  UndoTime,
  Pull,
  StyledFlexFormGroup,
  CardBlock,
  DatePickerField,
} from '../../components';
import { WorkflowTypes, StringLimits } from '../../../../share/constants';
import { UserSelectInput } from '../../forms/components';

const ActionVerificationForm = ({
  save,
  organizationId,
  userId,
  canCompleteAnyAction,
}) => (
  <FieldCondition when="isCompleted" is>
    <FieldCondition when="workflowType" is={WorkflowTypes.SIX_STEP}>
      <Field name="isVerified" subscription={{ value: true }}>
        {({ input: { value: isVerified } = {} }) => {
          const toBeVerifiedBy = (
            <UserSelectInput
              name="toBeVerifiedBy"
              placeholder="To be verified by"
              onChange={save}
              {...{ organizationId }}
            />
          );
          const verifiedBy = (
            <UserSelectInput
              name="verifiedBy"
              placeholder="Verified by"
              onChange={save}
              {...{ organizationId }}
            />
          );
          const comments = (
            <Field
              name="verificationComments"
              placeholder="Enter any verification comments"
              component={TextareaAdapter}
              onBlur={e => isVerified && save(e)}
              maxLength={StringLimits.comments.max}
            />
          );

          return (
            <CardBlock>
              <FormField>
                Verification - target date
                <DatePickerField
                  name="verificationTargetDate"
                  placeholderText="Verification - target date"
                  onChange={save}
                  disabled={!!isVerified}
                />
              </FormField>
              {isVerified ? (
                <Fragment>
                  <FormField>
                    <Field name="isVerifiedAsEffective" subscription={{ value: true }}>
                      {({ input: { value: isVerifiedAsEffective } = {} }) => isVerifiedAsEffective ?
                        'Verified as effective on' : 'Assessed as ineffective on'}
                    </Field>
                    <DatePickerField
                      name="verifiedAt"
                      placeholderText="Verified on"
                      onChange={save}
                    />
                  </FormField>
                  <FormField>
                    Verified by
                    <Field
                      name="verifiedAt"
                      subscription={{ value: true }}
                    >
                      {({ input }) => (
                        <UndoTime date={input.value}>
                          {({ passed, left, isOverdue }) => (
                            <FieldCondition
                              when="verifiedBy"
                              is={({ value }) =>
                                !isOverdue && value && (value === userId || canCompleteAnyAction)}
                              otherwise={verifiedBy}
                            >
                              <StyledFlexFormGroup>
                                {verifiedBy}
                                <FormSpy subscription={{ submitting: true }}>
                                  {({ submitting, form }) => (
                                    <Button
                                      color="link"
                                      disabled={submitting}
                                      onClick={() => {
                                        form.change('isVerified', false);
                                        save();
                                      }}
                                    >
                                      Undo
                                    </Button>
                                  )}
                                </FormSpy>
                              </StyledFlexFormGroup>
                              <span>
                                Verified {passed}, {left} left to undo
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
                  To be Verified by
                  <FieldCondition
                    when="toBeVerifiedBy"
                    is={({ value }) => value && (value === userId || canCompleteAnyAction)}
                    otherwise={toBeVerifiedBy}
                  >
                    <ToggleComplete input={toBeVerifiedBy} completeButtonContent="Verify">
                      <FormGroup className="margin-top">
                        {comments}
                      </FormGroup>
                      <FormSpy subscription={{ submitting: true }}>
                        {({ submitting, form }) => (
                          <Fragment>
                            <Pull left>
                              <Button
                                color="success"
                                disabled={submitting}
                                onClick={() => {
                                  form.change('isVerified', true);
                                  form.change('isVerifiedAsEffective', true);
                                  save();
                                }}
                              >
                                Verified as effective
                              </Button>
                            </Pull>
                            <Pull left>
                              <Button
                                color="danger"
                                disabled={submitting}
                                onClick={() => {
                                  form.change('isVerified', true);
                                  form.change('isVerifiedAsEffective', false);
                                  save();
                                }}
                              >
                                Assessed as ineffective
                              </Button>
                            </Pull>
                          </Fragment>
                        )}
                      </FormSpy>
                    </ToggleComplete>
                  </FieldCondition>
                </FormField>
              )}
            </CardBlock>
          );
        }}
      </Field>
    </FieldCondition>
  </FieldCondition>
);

ActionVerificationForm.propTypes = {
  organizationId: PropTypes.string.isRequired,
  userId: PropTypes.string,
  canCompleteAnyAction: PropTypes.bool,
  save: PropTypes.func,
};

export default ActionVerificationForm;
