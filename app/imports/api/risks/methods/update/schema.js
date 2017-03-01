import { SimpleSchema } from 'meteor/aldeed:simple-schema';

import { RisksSchema } from '/imports/share/schemas/risks-schema';
import * as schemas from '../../../update-schemas';

const lookup = [
  'title',
  'description',
  'statusComment',
  'identifiedBy',
  'identifiedAt',
  'magnitude',
  'type',
  'improvementPlan',
  'riskEvaluation',
];

const UpdateSchema = schemas.getSchemaFrom(
  RisksSchema,
  schemas.withOptionalIfNotNested,
)(lookup);

export const modifierSchemaDefinition = {
  $set: {
    type: UpdateSchema,
    optional: true,
  },
};

export const ModifierSchema = new SimpleSchema([
  modifierSchemaDefinition,
  schemas.improvementPlan,
  schemas.departmentsIds,
  schemas.notify,
  schemas.standardsIds,
  schemas.fileIds,
]);

export const MongoSchema = new SimpleSchema({
  options: {
    type: ModifierSchema,
    optional: true,
  },
  query: {
    type: Object,
    optional: true,
    blackbox: true,
  },
});

export default new SimpleSchema([UpdateSchema, MongoSchema]);
