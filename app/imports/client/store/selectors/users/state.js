import { view } from 'ramda';

import { lenses } from '../../../../client/util';

export const getUsersByIds = view(lenses.collections.usersByIds);

export const getUsers = view(lenses.collections.users);
