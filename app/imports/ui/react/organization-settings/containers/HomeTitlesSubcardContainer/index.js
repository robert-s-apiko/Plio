import { changeTitle } from '/imports/api/organizations/methods';
import { connect } from 'react-redux';
import { compose, withHandlers, withProps } from 'recompose';

import { pickDeep, getId } from '/imports/api/helpers';
import store from '/imports/client/store';
import HomeTitlesSubcard from '../../components/HomeTitlesSubcard';
import initMainData from '../loaders/initMainData';
import { composeWithTracker } from '../../../../../client/util';


const enhance = compose(
  withProps({ store }),
  connect(),
  composeWithTracker(initMainData),
  connect(pickDeep(['organizations.organization'])),
  withHandlers({
    onSelectTitle: ({ organization }) => (e, { text, value }, callback) =>
      changeTitle.call({
        fieldName: `${value}`.replace(/\(.*\)/, ''),
        fieldValue: text,
        organizationId: getId(organization),
      }, callback),
  }),
);

export default enhance(HomeTitlesSubcard);
