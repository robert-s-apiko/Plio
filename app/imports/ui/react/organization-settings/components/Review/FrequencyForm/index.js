import React, { PropTypes } from 'react';
import { withProps } from 'recompose';

import Form from '/imports/ui/react/forms/components/Form';
import ReviewFrequencySelect from '../FrequencySelect';
import { getFormProps } from '../helpers';

const enhance = withProps(getFormProps);

const ReviewFrequencyForm = enhance(props => (
  <Form
    autosave
    initialFormData={props.initialFormData}
    onFormChange={props.onFrequencyChanged}
  >
    <ReviewFrequencySelect
      fieldName={props.fieldNames.frequency}
    />
  </Form>
));

ReviewFrequencyForm.propTypes = {
  data: PropTypes.object,
  documentKey: PropTypes.string,
  onFrequencyChanged: PropTypes.func,
};

export default ReviewFrequencyForm;
