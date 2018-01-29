import { MiddlewareMethod } from '../../method';
import { IdSchema } from '../../../share/schemas/schemas';
import {
  checkDocExistanceById,
  checkOrgMembershipByDocument,
} from '../../middleware';
import { Actions } from '../../../share/collections';
import { ActionService } from '../../../share/services';
import { ensureCanUndoCompletion } from '../middleware';
import { checkLoggedIn } from '../../../share/middleware';

export default new MiddlewareMethod({
  name: 'Actions.undoCompletion',
  validate: IdSchema.validator(),
  middleware: [
    checkLoggedIn(),
    checkDocExistanceById(Actions),
    checkOrgMembershipByDocument(),
    ensureCanUndoCompletion(),
  ],
  run: ActionService.undoCompletion.bind(ActionService),
});
