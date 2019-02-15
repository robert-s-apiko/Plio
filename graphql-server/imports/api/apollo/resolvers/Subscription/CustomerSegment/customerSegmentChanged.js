import { Subscriptions } from '../../../../../share/subscriptions/constants';
import resolveEntityChanged from '../util/resolveEntityChanged';

export default {
  subscribe: resolveEntityChanged(Subscriptions.CUSTOMER_SEGMENT_CHANGED),
};
