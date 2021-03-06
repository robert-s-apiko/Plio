import { MiddlewareMethod } from '../../method';
import { IdSchema } from '../../../share/schemas/schemas';
import {
  checkDocExistanceById,
  checkOrgMembershipByDocument,
} from '../../middleware';
import { Actions } from '../../../share/collections';
import { ActionService } from '../../../share/services';
import { checkLoggedIn, ensureCanUndoActionVerification } from '../../../share/middleware';

export default new MiddlewareMethod({
  name: 'Actions.undoVerification',
  validate: IdSchema.validator(),
  middleware: [
    checkLoggedIn(),
    checkDocExistanceById(Actions),
    checkOrgMembershipByDocument(),
    ensureCanUndoActionVerification(),
  ],
  run: ActionService.undoVerification.bind(ActionService),
});
