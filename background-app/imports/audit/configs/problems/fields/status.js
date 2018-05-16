import { ProblemsStatuses } from '/imports/share/constants';
import { capitalize } from '/imports/share/helpers';
import { ChangesKinds } from '../../../utils/changes-kinds';


export default {
  field: 'status',
  logs: [
    {
      message: {
        [ChangesKinds.FIELD_ADDED]:
          'Status set to "{{{newValue}}}"',
        [ChangesKinds.FIELD_CHANGED]:
          'Status changed from "{{{oldValue}}}" to "{{{newValue}}}"',
        [ChangesKinds.FIELD_REMOVED]:
          'Status removed',
      },
    },
  ],
  notifications: [
    {
      shouldSendNotification({ diffs: { status: { newValue } } }) {
        // 19 - Closed - action(s) completed
        // 20 - Closed - action(s) verified, standard(s) reviewed
        return (newValue === 19) || (newValue === 20);
      },
      text: 'Status of {{{docDesc}}} {{{docName}}} was changed to "{{{newValue}}}"',
      title: '{{{docDescCapitalized}}} {{{docName}}} closed',
      data({ diffs: { status }, newDoc, auditConfig }) {
        return {
          docDescCapitalized: capitalize(auditConfig.docDescription(newDoc)),
          newValue: ProblemsStatuses[status.newValue],
        };
      },
      emailTemplateData({ newDoc, auditConfig }) {
        return {
          button: {
            label: 'View document',
            url: auditConfig.docUrl(newDoc),
          },
        };
      },
      receivers({ newDoc }) {
        return [newDoc.originatorId];
      },
    },
  ],
  data({ diffs: { status } }) {
    const { newValue, oldValue } = status;

    return {
      newValue: ProblemsStatuses[newValue],
      oldValue: ProblemsStatuses[oldValue],
    };
  },
};
