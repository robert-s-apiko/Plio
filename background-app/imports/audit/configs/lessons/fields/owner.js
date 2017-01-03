import { ChangesKinds } from '../../../utils/changes-kinds.js';
import { getUserFullNameOrEmail } from '../../../utils/helpers.js';
import { getLogData } from '../helpers.js';


export default {
  field: 'owner',
  logs: [
    {
      message: {
        [ChangesKinds.FIELD_ADDED]: 'lessons.fields.owner.added',
        [ChangesKinds.FIELD_CHANGED]: 'lessons.fields.owner.changed',
        [ChangesKinds.FIELD_REMOVED]: 'lessons.fields.owner.removed',
      },
      logData: getLogData
    }
  ],
  notifications: [],
  data({ diffs: { owner }, newDoc }) {
    const auditConfig = this;
    const { newValue, oldValue } = owner;

    return {
      docName: () => auditConfig.docName(newDoc),
      newValue: () => getUserFullNameOrEmail(newValue),
      oldValue: () => getUserFullNameOrEmail(oldValue)
    };
  }
};
