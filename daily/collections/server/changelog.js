import { Mongo } from 'meteor/mongo';

import { CollectionNames } from '../../constants.js';
import { ChangelogSchema } from '../../schemas/server/changelog-schema.js';


const Changelog = new Mongo.Collection(CollectionNames.CHANGELOG);
Changelog.attachSchema(ChangelogSchema);

export { Changelog };
