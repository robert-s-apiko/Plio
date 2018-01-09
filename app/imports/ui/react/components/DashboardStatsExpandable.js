import PropTypes from 'prop-types';
import React from 'react';
import { branch } from 'recompose';
import { converge, gt, prop, identity, map, splitEvery } from 'ramda';
import styled from 'styled-components';

import { DashboardStats, Collapse, ToggleAngleIcon } from './';
import { withStateToggle } from '../helpers';
import { getItemsLength } from '../../../client/util';

const StyledDashboardTitle = styled(({ toggle, ...rest }) => <DashboardStats.Title {...rest} />)`
  cursor: ${({ toggle }) => toggle ? 'pointer' : 'auto'};
  text-decoration: none;
`;

StyledDashboardTitle.displayName = 'DashboardStatsTitle';

const itemsExceedLimit = converge(gt, [
  getItemsLength,
  prop('itemsPerRow'),
]);

export const enhance = branch(
  prop('toggle'),
  identity,
  branch(
    itemsExceedLimit,
    withStateToggle(false, 'isOpen', 'toggle'),
    identity,
  ),
);

export const DashboardStatsExpandable = ({
  items,
  isOpen,
  toggle,
  itemsPerRow,
  render,
  renderIcon = ToggleAngleIcon,
  children,
}) => !!items.length && (
  <DashboardStats>
    <StyledDashboardTitle onClick={toggle} {...{ toggle }}>
      {children}
      {' '}
      {!!toggle && renderIcon({ isOpen, toggle })}
    </StyledDashboardTitle>
    {render({ items: items.slice(0, itemsPerRow) })}

    {!!toggle && (
      <Collapse {...{ isOpen }}>
        {map(
          splitItems => render({ items: splitItems }),
          splitEvery(itemsPerRow, items.slice(itemsPerRow)),
        )}
      </Collapse>
    )}
  </DashboardStats>
);

DashboardStatsExpandable.propTypes = {
  items: PropTypes.arrayOf(PropTypes.object).isRequired,
  itemsPerRow: PropTypes.number.isRequired,
  render: PropTypes.func.isRequired,
  children: PropTypes.node,
  isOpen: PropTypes.bool,
  toggle: PropTypes.func,
};

export default enhance(DashboardStatsExpandable);
