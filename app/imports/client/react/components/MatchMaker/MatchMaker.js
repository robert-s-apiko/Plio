import PropTypes from 'prop-types';
import React, { createContext } from 'react';
import styled from 'styled-components';
import { StyledMixins } from 'plio-util';

import { WithState } from '../../helpers';

const Wrapper = styled.div`
  ${StyledMixins.media.notMobile`
    position: relative;
    min-height: 300px;
    margin: 0 -1.25rem;
    padding: 0 1.25rem;
  `}
`;

export const OpenTabState = {
  NONE: null,
  LEFT: 1,
  RIGHT: 2,
};

const { Provider, Consumer } = createContext({});

const MatchMaker = ({ children }) => (
  <WithState initialState={{ activeTab: OpenTabState.NONE }}>
    {({ state, setState }) => (
      <Provider value={{ state, setState }}>
        <Wrapper>
          {children({ ...state, setState })}
        </Wrapper>
      </Provider>
    )}
  </WithState>
);

MatchMaker.propTypes = {
  children: PropTypes.func.isRequired,
};

export { Consumer };

export default MatchMaker;
