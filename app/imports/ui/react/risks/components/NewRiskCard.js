import PropTypes from 'prop-types';
import React from 'react';
import { pluck } from 'ramda';
import { renameKeys } from 'plio-util';

import {
  SwitchViewField,
  CardBlock,
  FormField,
  SelectInputField,
  LinkedEntityInput,
} from '../../components';
import RiskSelectInputContainer from '../containers/RiskSelectInputContainer';
import RiskForm from './RiskForm';

const NewRiskCard = ({
  organizationId,
  risks = [],
  linkedTo,
  ...props
}) => (
  <SwitchViewField
    name="active"
    buttons={[
      <span key="new">New</span>,
      <span key="existing">Existing</span>,
    ]}
  >
    <RiskForm {...{ ...props, organizationId }}>
      <FormField>
        Linked to
        <LinkedEntityInput disabled {...renameKeys({ title: 'value' }, linkedTo)} />
      </FormField>
    </RiskForm>
    <CardBlock>
      <FormField>
        Existing risk
        <RiskSelectInputContainer
          name="risk"
          component={SelectInputField}
          placeholder="Existing risk"
          without={pluck('_id', risks)}
          {...{ organizationId }}
        />
      </FormField>
    </CardBlock>
  </SwitchViewField>
);

NewRiskCard.propTypes = {
  organizationId: PropTypes.string.isRequired,
  risks: PropTypes.arrayOf(PropTypes.object),
  linkedTo: PropTypes.object,
};

export default NewRiskCard;
