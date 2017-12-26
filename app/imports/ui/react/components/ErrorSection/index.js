import PropTypes from 'prop-types';
import React from 'react';

import Collapse from '../Collapse';
import Icon from '../Icons/Icon';

const ErrorSection = ({ errorText, size = '4' }) => (
  <Collapse className="modal-error-section" isOpen={errorText}>
    <div className="card-block">
      <Icon {...{ size }} name="exclamation-circle" aria-hidden="true" />
      {errorText}
    </div>
  </Collapse>
);

ErrorSection.propTypes = {
  errorText: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  size: PropTypes.string,
};

export default ErrorSection;
