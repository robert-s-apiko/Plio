import PropTypes from 'prop-types';
import React from 'react';

import Button from '../Button';
import Icon from '../../Icons/Icon';

const AddButton = ({ onClick, children }) => (
  <Button
    color="primary"
    onClick={onClick}
  >
    <Icon name="plus" className="margin-right" />
    {children}
  </Button>
);

AddButton.propTypes = {
  onClick: PropTypes.func,
  children: PropTypes.node,
};

export default AddButton;
