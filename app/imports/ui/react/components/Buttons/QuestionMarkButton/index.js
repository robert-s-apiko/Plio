import PropTypes from 'prop-types';
import React from 'react';

import Button from '../Button';
import Icon from '../../Icons/Icon';

const QuestionMarkButton = ({ onClick, className }) => (
  <Button
    {...{ className, onClick }}
    component="button"
    color="link collapse"
  >
    <Icon name="question-circle" />
  </Button>
);

QuestionMarkButton.propTypes = {
  className: PropTypes.string,
  onClick: PropTypes.func,
};

export default QuestionMarkButton;
