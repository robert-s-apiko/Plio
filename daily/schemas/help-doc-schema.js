import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { _ } from 'meteor/underscore';

import {
  BaseEntitySchema,
  ownerIdSchema,
  standardStatusSchema,
  issueNumberSchema,
  getNotifySchema,
} from './schemas';
import { SourceTypes } from '../constants';


const sourceSchema = new SimpleSchema({
  fileId: {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
    optional: true,
  },
  type: {
    type: String,
    allowedValues: _(SourceTypes).values(),
  },
  url: {
    type: String,
    regEx: SimpleSchema.RegEx.Url,
    optional: true,
  },
  htmlUrl: {
    type: String,
    regEx: SimpleSchema.RegEx.Url,
    optional: true,
  },
});

export const HelpDocSchema = new SimpleSchema([
  BaseEntitySchema,
  ownerIdSchema,
  standardStatusSchema,
  issueNumberSchema,
  getNotifySchema('ownerId'),
  {
    title: {
      type: String,
    },
    sectionId: {
      type: String,
      regEx: SimpleSchema.RegEx.Id,
    },
    source: {
      type: sourceSchema,
      optional: true,
    },
  },
]);
