import { Roles } from 'meteor/alanning:roles';
import { UserRoles } from '../../constants';

export default (organizationId, userId) => Roles.userIsInRole(
  userId,
  UserRoles.CREATE_UPDATE_DELETE_GOALS,
  organizationId,
);
