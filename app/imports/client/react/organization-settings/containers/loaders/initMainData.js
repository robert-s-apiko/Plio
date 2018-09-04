import { FlowRouter } from 'meteor/kadira:flow-router';
import { batchActions } from 'redux-batched-actions';
import {
  setOrg,
  setOrgId,
  setOrgSerialNumber,
} from '/imports/client/store/actions/organizationsActions';
import { setOrganizations } from '/imports/client/store/actions/collectionsActions';
import { Organizations } from '/imports/share/collections/organizations';

import { getId } from '/imports/api/helpers';

export default function initMainData({ store }, onData) {
  const querySerialNumberParam = FlowRouter.getParam('orgSerialNumber');
  const serialNumber = parseInt(querySerialNumberParam, 10);
  const organization = Organizations.findOne({ serialNumber });

  let actions = [
    setOrgSerialNumber(serialNumber),
  ];

  if (organization) {
    actions = actions.concat([
      setOrg(organization),
      setOrgId(getId(organization)),
      setOrganizations([organization]),
    ]);
  }

  store.dispatch(batchActions(actions));

  onData(null, {});
}
