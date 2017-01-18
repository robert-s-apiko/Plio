import { Meteor } from 'meteor/meteor';
import { Tracker } from 'meteor/tracker';
import { composeWithTracker } from 'react-komposer';
import { connect } from 'react-redux';
import { batchActions } from 'redux-batched-actions';
import get from 'lodash.get';
import { compose, lifecycle, shouldUpdate } from 'recompose';
import { _ } from 'meteor/underscore';

import MessagesListWrapper from '../../components/MessagesListWrapper';
import PreloaderPage from '/imports/ui/react/components/PreloaderPage';
import { Messages } from '/imports/share/collections/messages';

import {
  setMessages,
  setLoading,
  setLastMessageId,
  setResetCompleted,
  markMessagesAsRead,
} from '/imports/client/store/actions/discussionActions';
import notifications from '/imports/startup/client/mixins/notifications';
import { pickFromDiscussion, pickC, invokeC, notEquals } from '/imports/api/helpers';
import LastDiscussionMessage from '/imports/client/collections/lastDiscussionMessage';
import { MESSAGES_PER_PAGE_LIMIT } from '../../constants';

const initObservers = () => {
  const handle = LastDiscussionMessage.find().observe({
    changed({ createdBy }) {
      if (!Object.is(createdBy, Meteor.userId())) {
        // play new-message sound if the sender is not a current user
        notifications.playNewMessageSound();
      }
    },
  });

  return () => handle.stop();
};

const initInterval = (fn) => {
  const handle = Meteor.setInterval(() => fn(), 3000);

  return () => Meteor.clearInterval(handle);
};

const shouldResubscribe = (props, nextProps) => {
  const pickProps = pickC(['priorLimit', 'followingLimit', 'discussionId', 'sort']);
  return (
    !props.resetCompleted && nextProps.resetCompleted ||
    notEquals(pickProps(props), pickProps(nextProps))
  );
};

const readMessages = (props) => {
  const getLastMessage = () => Object.assign({}, _.last(props.messages));

  props.dispatch(markMessagesAsRead(props.discussion, getLastMessage()));
};

const loadMessagesData = ({
  discussionId,
  dispatch,
  sort = { createdAt: -1 },
  at = null,
  priorLimit = MESSAGES_PER_PAGE_LIMIT,
  followingLimit = MESSAGES_PER_PAGE_LIMIT,
  resetCompleted = false,
}, onData) => {
  dispatch(setLoading(true));

  const subOpts = { sort, at, priorLimit, followingLimit };
  const messagesSubscription = Meteor.subscribe('messages', discussionId, subOpts);
  const lastMessageSubscription = Meteor.subscribe('discussionMessagesLast', discussionId);
  const subscriptions = [messagesSubscription, lastMessageSubscription];

  if (subscriptions.every(invokeC('ready'))) {
    const query = { discussionId };
    const options = { sort: { createdAt: 1 }, fields: { viewedBy: 0 } };
    const messages = Messages.find(query, options).fetch();
    const lastMessageId = Tracker.nonreactive(() =>
      get(LastDiscussionMessage.findOne(), 'lastMessageId'));

    let actions = [
      setLoading(false),
      setLastMessageId(lastMessageId),
      setMessages(messages),
    ];

    if (resetCompleted) {
      actions = actions.concat(setResetCompleted(false));
    }

    dispatch(batchActions(actions));

    onData(null, {});
  }

  return () => subscriptions.map(invokeC('stop'));
};

export default compose(
  connect(pickFromDiscussion([
    'at', 'sort', 'priorLimit', 'followingLimit', 'resetCompleted',
  ])),
  composeWithTracker(loadMessagesData, PreloaderPage, null, { shouldResubscribe }),
  connect(pickFromDiscussion([
    'loading', 'messages', 'priorLimit', 'followingLimit', 'lastMessageId', 'sort', 'discussion',
  ])),
  shouldUpdate(notEquals),
  lifecycle({
    componentWillMount() {
      readMessages(this.props);
      // run observer and interval that returns a cleanup function

      this.intervalCleanup = initInterval(() => readMessages(this.props));

      this.observerCleanup = initObservers();
    },
    componentWillUnmount() {
      readMessages(this.props);

      if (typeof this.observerCleanup === 'function') this.observerCleanup();
      if (typeof this.intervalCleanup === 'function') this.intervalCleanup();
    },
  }),
)(MessagesListWrapper);
