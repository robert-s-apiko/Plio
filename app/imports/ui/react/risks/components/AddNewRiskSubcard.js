import React, { PropTypes } from 'react';
import { CardBlock } from 'reactstrap';

import { FormInput, FormField, SelectInput } from '../../components';

const AddNewRiskSubcard = ({
  title,
  description,
  originatorId,
  ownerId,
  onChangeTitle,
  onChangeDescription,
  onChangeOriginatorId,
  onChangeOwnerId,
  users,
}) => (
  <CardBlock>
    <FormField>
      Risk name
      <FormInput
        onChange={onChangeTitle}
        value={title}
        placeholder="Risk name"
      />
    </FormField>
    <FormField>
      Description
      <FormInput
        element="textarea"
        onChange={onChangeDescription}
        value={description}
        placeholder="Description"
      />
    </FormField>
    <FormField>
      Originator
      <SelectInput
        uncontrolled
        caret
        hint
        input={{ placeholder: 'Originator' }}
        selected={originatorId}
        items={users}
        onSelect={onChangeOriginatorId}
      />
    </FormField>
    <FormField>
      Owner
      <SelectInput
        uncontrolled
        caret
        hint
        input={{ placeholder: 'Owner' }}
        selected={ownerId}
        items={users}
        onSelect={onChangeOwnerId}
      />
    </FormField>
  </CardBlock>
);

AddNewRiskSubcard.propTypes = {
  users: PropTypes.arrayOf(PropTypes.object).isRequired,
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  originatorId: PropTypes.string.isRequired,
  ownerId: PropTypes.string.isRequired,
  onChangeTitle: PropTypes.func.isRequired,
  onChangeDescription: PropTypes.func.isRequired,
  onChangeOriginatorId: PropTypes.func.isRequired,
  onChangeOwnerId: PropTypes.func.isRequired,
};

export default AddNewRiskSubcard;
