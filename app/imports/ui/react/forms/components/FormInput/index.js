import PropTypes from 'prop-types';
import React from 'react';
import { withHandlers } from 'recompose';
import cx from 'classnames';
import { Input } from 'reactstrap';

import ClearField from '../../../fields/read/components/ClearField';
import { onHandleBlur, onHandleClear } from './handlers';

const enhance = withHandlers({ onHandleBlur, onHandleClear });

const FormInput = enhance(({
  value,
  className,
  children,
  onHandleBlur: onBlur,
  onHandleClear: onClear,
  onChange,
  innerRef,
  containerClassName,
  inputGroup,
  ...other
}) => {
  let textInput;

  return (
    <ClearField
      className={cx(containerClassName, { 'input-group': inputGroup })}
      onClick={e => onClear(e, textInput)}
    >
      {children}
      <Input
        innerRef={(input) => {
          textInput = input;
          return innerRef && innerRef(input);
        }}
        {...{
          className,
          value,
          onChange,
          onBlur,
          ...other,
        }}
      />
    </ClearField>
  );
});

FormInput.propTypes = {
  className: PropTypes.string,
  onBlur: PropTypes.func,
  onChange: PropTypes.func,
  value: PropTypes.string,
  innerRef: PropTypes.func,
  children: PropTypes.node,
  inputGroup: PropTypes.bool,
};

export default FormInput;
