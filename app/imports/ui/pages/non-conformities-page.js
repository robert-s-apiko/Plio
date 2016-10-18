import { Template } from 'meteor/templating';

import { extractIds } from '/imports/api/helpers';
import { NonConformities } from '/imports/api/non-conformities/non-conformities';
import { DocumentCardSubs, BackgroundSubs } from '/imports/startup/client/subsmanagers';

Template.NC_Page.viewmodel({
  mixin: ['nonconformity', 'organization'],
  _subHandlers: [],
  isReady: false,
  autorun: [
    function() {
      const organizationId = this.organizationId();
      const NCId = this.NCId();

      if (!organizationId || !NCId) return;
      const p1 = performance.now();

      const _subHandlers = [
        DocumentCardSubs.subscribe('nonConformityCard', { organizationId, _id: NCId }, {
          onReady() {
            BackgroundSubs.subscribe('nonConformitiesDeps', organizationId);
          }
        })
      ];

      this._subHandlers(_subHandlers);
    },
    function() {
      this.isReady(this._subHandlers().every(handle => handle.ready()));
    }
  ],
  listArgs() {
    return {
      collection: NonConformities,
      template: 'NC_List'
    };
  }
});
