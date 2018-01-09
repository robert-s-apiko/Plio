/* eslint-disable no-console */

// import { Migrations } from 'meteor/percolate:migrations';
//
// import { NonConformities } from '/imports/share/collections/non-conformities.js';
// import { Risks } from '/imports/share/collections/risks.js';
// import { WorkItems } from '/imports/share/collections/work-items.js';
// import { Standards } from '/imports/share/collections/standards.js';
// import { Actions } from '/imports/share/collections/actions.js';
//
// const workItems = WorkItems.find({});
// workItems.forEach((workItem) => {
//   const linkedDocInfo = workItem.linkedDoc || {};
//   let linkedDoc;
//   if (linkedDocInfo.type === 'non-conformity') {
//     linkedDoc = NonConformities.findOne({ _id: linkedDocInfo._id });
//   } else if (linkedDocInfo.type === 'risk') {
//     linkedDoc = Risks.findOne({ _id: linkedDocInfo._id });
//   } else if (linkedDocInfo.type === 'standard') {
//     linkedDoc = Standards.findOne({ _id: linkedDocInfo._id });
//   } else if (linkedDocInfo.type === 'action') {
//     linkedDoc = Actions.findOne({ _id: linkedDocInfo._id });
//   }
//
//   if (!linkedDoc) {
//     WorkItems.remove({ _id: workItem._id });
//     console.log(`Work item ${workItem._id} has been removed`);
//   }
// });

import { Meteor } from 'meteor/meteor';
import { Migrations } from 'meteor/percolate:migrations';

import { AuditLogs } from '/imports/share/collections/audit-logs';
import { Organizations } from '/imports/share/collections/organizations';
import { Discussions } from '/imports/share/collections/discussions';
import DiscussionsService from '/imports/api/discussions/discussions-service';
import { Risks } from '/imports/share/collections/risks';
import { NonConformities } from '/imports/share/collections/non-conformities';
import { WorkItems } from '/imports/share/collections/work-items';
import curry from 'lodash.curry';
import {
  DocumentTypes,
  CollectionNames,
  SystemName,
  CustomerTypes,
  OrganizationDefaults,
} from '/imports/share/constants';

import './9-add-complete-actions-role';

Migrations.add({
  version: 1,
  name: 'Adds log entry about org creation for orgs with no logs',
  up() {
    Organizations.find({}).forEach((org) => {
      const orgLogsCount = AuditLogs.find({ documentId: org._id }).count();

      if (!orgLogsCount) {
        AuditLogs.insert({
          organizationId: org._id,
          date: new Date(),
          executor: SystemName,
          collection: CollectionNames.ORGANIZATIONS,
          documentId: org._id,
          message: 'Organization created',
        });
      }
    });
  },
  down() { },
});

Migrations.add({
  version: 2,
  name: 'Adds discussions to documents with no discussions',
  up() {
    Risks.find({}).forEach((risk) => {
      if (!Discussions.findOne({ linkedTo: risk._id })) {
        DiscussionsService.insert({
          organizationId: risk.organizationId,
          documentType: DocumentTypes.RISK,
          linkedTo: risk._id,
          isPrimary: true,
        });

        console.log(`Discussion for ${risk._id} risk is created!`);
      }
    });

    NonConformities.find({}).forEach((nc) => {
      if (!Discussions.findOne({ linkedTo: nc._id })) {
        DiscussionsService.insert({
          organizationId: nc.organizationId,
          documentType: DocumentTypes.NON_CONFORMITY,
          linkedTo: nc._id,
          isPrimary: true,
        });

        console.log(`Discussion for ${nc._id} nonconformity is created!`);
      }
    });
  },
  down() { },
});

Migrations.add({
  version: 3,
  name: 'Add default screen titles to organizations',
  up() {
    Organizations.update(
      { homeScreenTitles: null },
      {
        $set: {
          homeScreenTitles: {
            standards: 'Standards',
            risks: 'Risk register',
            nonConformities: 'Non-conformities',
            workInbox: 'Work inbox',
          },
        },
      },
      { multi: true },
    );

    console.log('Default screen titles was be added to all organization');
  },
  down() {
    Organizations.update({}, { $unset: { homeScreenTitles: '' } }, { multi: true });

    console.log('Default screen titles was be removed from all organization');
  },
});

Migrations.add({
  version: 4,
  name: 'Add default customer type to organizations without it',
  up() {
    const query = { customerType: null };
    const modifier = {
      $set: {
        customerType: CustomerTypes.FREE_TRIAL,
      },
    };
    const options = { multi: true };

    Organizations.update(query, modifier, options);

    console.log('Default customer type was added to all organizations that did not have it');
  },
  down() {
    const query = {};
    const modifier = { $unset: { customerType: '' } };
    const options = { multi: true };

    Organizations.update(query, modifier, options);

    console.log('Customer type was removed from all organizations');
  },
});

Migrations.add({
  version: 5,
  name: 'Adds default value for \'areEmailNotificationsEnabled\' to user preferences',
  up() {
    const query = { 'preferences.areEmailNotificationsEnabled': null };
    const modifier = {
      $set: {
        'preferences.areEmailNotificationsEnabled': true,
      },
    };
    const options = { multi: true };

    Meteor.users.update(query, modifier, options);

    console.log('Default value for \'areEmailNotificationsEnabled\' was set for all users without it');
  },
  down() {
    const query = {};
    const modifier = { $unset: { 'preferences.areEmailNotificationsEnabled': '' } };
    const options = { multi: true };

    Meteor.users.update(query, modifier, options);
  },
});

Migrations.add({
  version: 6,
  name: 'Add review settings to organizations',
  up() {
    const organizations = Organizations.find({
      review: { $exists: false },
    });

    organizations.forEach((org) => {
      const reviewerId = org.createdBy;
      const annualDate = org.createdAt;
      const query = { _id: org._id };
      const modifier = {
        $set: {
          review: {
            risks: {
              reviewerId,
              annualDate,
              ...OrganizationDefaults.review.risks,
            },
            standards: {
              reviewerId,
              annualDate,
              ...OrganizationDefaults.review.standards,
            },
          },
        },
      };

      Organizations.update(query, modifier);
    });

    console.log('Review settings were added to organizations');
  },
  down() {
    Organizations.update({}, {
      $unset: { review: '' },
    }, {
      multi: true,
    });

    console.log('Review settings were removed from organizations');
  },
});

Migrations.add({
  version: 7,
  name: 'Migrate createdBy to owner for NC and RK',
  up() {
    const query = {
      $or: [
        { ownerId: { $exists: false } },
        { originatorId: { $exists: false } },
      ],
    };

    const createOriginator = curry((collection, { _id, createdBy }) => {
      collection.update({ _id }, {
        $set: {
          ownerId: createdBy,
          originatorId: createdBy,
        },
      });
    });

    Risks
      .find(query)
      .forEach(createOriginator(Risks));

    NonConformities
      .find(query)
      .forEach(createOriginator(NonConformities));

    console.log('Fields ownerId and originatorId was created');
  },
  down() {
    const query = [{
      $or: [
        { ownerId: { $exists: true } },
        { originatorId: { $exists: true } },
      ],
    }, {
      $unset: { ownerId: '', originatorId: '' },
    }, {
      multi: true,
    }];

    Risks.update(...query);
    NonConformities.update(...query);

    console.log('Fields ownerId and originatorId was removed');
  },
});

Migrations.add({
  version: 8,
  name: 'Migrate work item "complete update of documents" type to "complete approval"',
  up() {
    const query = {
      type: 'complete update of documents',
    };

    WorkItems.update(query, {
      $set: {
        type: 'complete approval',
      },
    }, {
      multi: true,
    });

    console.log('Work item "complete update of documents" types were migrated to "complete approval"');
  },
  down() {
    const query = {
      type: 'complete approval',
    };

    WorkItems.update(query, {
      $set: {
        type: 'complete update of documents',
      },
    });

    console.log('Work item "complete update of documents" types were restored');
  },
});

Meteor.startup(() => {
  Migrations.migrateTo('latest');
});
