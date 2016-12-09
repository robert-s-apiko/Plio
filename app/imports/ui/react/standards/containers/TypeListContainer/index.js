import { compose, lifecycle, mapProps } from 'recompose';
import { connect } from 'react-redux';
import { Meteor } from 'meteor/meteor';

import TypeList from '../../components/TypeList';
import { TYPE_UNCATEGORIZED } from '../../constants';
import {
  lengthStandards,
  propEq,
  propEqId,
  getC,
} from '/imports/api/helpers';
import { getState } from '/client/redux/store';
import { STANDARD_FILTER_MAP } from '/imports/api/constants';
import {
  openStandardByFilter,
  getSelectedAndDefaultStandardByFilter,
} from '../../helpers';

const mapStateToProps = (state) => ({
  standardTypes: state.collections.standardTypes,
  isSelectedStandardDeleted: getC(
    'isDeleted',
    state.collections.standardsByIds[state.global.urlItemId]
  ),
});

const openType = (props) => setTimeout(() => {
  const urlItemId = getState('global.urlItemId');
  const {
    containedIn,
    defaultContainedIn,
    selectedStandard,
  } = getSelectedAndDefaultStandardByFilter({
    urlItemId,
    types: props.types,
    filter: STANDARD_FILTER_MAP.TYPE,
  });

  // if a type contains selected standard open that type otherwise open default type collapse
  openStandardByFilter({
    selectedStandard,
    containedIn,
    defaultContainedIn,
    dispatch: props.dispatch,
    filter: STANDARD_FILTER_MAP.TYPE,
  });
}, 0);

export default compose(
  connect(mapStateToProps),
  mapProps(({ standardTypes, standards, ...props }) => {
    let types = standardTypes;
    const uncategorized = {
      _id: TYPE_UNCATEGORIZED,
      title: 'Uncategorized',
      standards: standards.filter(standard => !types.find(propEqId(standard.typeId))),
    };

    // add own standards to each type
    types = types.map(type => ({
      ...type,
      standards: standards.filter(propEq('typeId', type._id)),
    }));

    // add uncategorized type
    types = types.concat(uncategorized);

    types = types.filter(lengthStandards);

    return { ...props, types };
  }),
  lifecycle({
    componentWillMount() {
      openType(this.props);
    },
    // if selected standard is deleted open the default type
    componentWillReceiveProps(nextProps) {
      if (!this.props.isSelectedStandardDeleted && nextProps.isSelectedStandardDeleted) {
        openType(nextProps);
      }
    },
  }),
)(TypeList);
