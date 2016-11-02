import {
  SET_FILTER
} from '../actions/types';

const initialState = {
  filter: 1
};

export default function(state=initialState, action) {
  switch(action.type) {
    case SET_FILTER:
      return { ...state, filter: action.payload };
    default:
      return state;
      break;
  }
}
